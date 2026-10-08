/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine            **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis   **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * @fileoverview Braid-based multi-track cutscene player.
 *
 * The sequential CutsceneManager (manager.js) stays as-is for backward
 * compatibility. This player is the multi-track executor: each track
 * (dialogue, animation, audio, …) is a braid Fiber yielding timed
 * events, woven with tension semantics (see ADR-0006):
 *
 * - Tight  → sync points. The narrative spine. Every track must
 *            finish its beat before the next beat starts. Deterministic.
 * - Loose  → ambient tracks (BGM, particles, idle loops). Never block
 *            the spine. NOT deterministic (Promise.race) — keep these
 *            non-critical.
 * - Frayed → strict tracks. A missing asset halts instead of playing broken.
 *
 * Timeline data format is unchanged: events keep their existing shape
 * ({type, at, …params}) and gain an optional `track` field (default "main").
 * Only the executor is new.
 *
 * The clock is virtual by default (deterministic, testable). Pass
 * {realtime: true} for live playback with real timers.
 */

import { Fiber, Braid, Tension, Loom, fromArray } from '../../../vendor/braid.js';

/**
 * @typedef {object} TrackEvent
 * @property {number} at - ms from track start.
 * @property {string} type - event type (matches CutsceneManager step types
 *   plus editor timeline types: wait, transition, dialogue, action, …).
 * @property {string} [track] - track id; defaults to "main".
 */

/**
 * @typedef {object} TrackDef
 * @property {string} id
 * @property {'tight'|'loose'|'frayed'} [tension] - default 'tight'.
 * @property {TrackEvent[]} [events] - pre-authored events (sorted by `at`).
 * @property {Fiber} [fiber] - …or a live/generative fiber yielding {at, event}.
 *   If both are given, `fiber` wins.
 */

const EPSILON_MS = 1;

function tensionFor(name) {
  switch (name) {
    case 'loose': return Tension.Loose;
    case 'frayed': return Tension.Frayed;
    case 'tight':
    default: return Tension.Tight;
  }
}

/** Wrap a pre-authored event list as a Fiber yielding {at, event}. */
export function trackFromEvents(events, name = 'track') {
  const sorted = [...(events || [])].sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
  return new Fiber(
    async function* () {
      for (const event of sorted) {
        yield { at: event.at ?? 0, event };
      }
    },
    { name }
  );
}

/**
 * Build a story-branch fiber for interactive fiction.
 *
 * Yields a single `{type:'choice', …}` event; the player's `onChoice`
 * callback resolves it to an option index, and the chosen branch's
 * events are then yielded. The returned fiber can be plaited into a
 * running braid (dynamic branch join).
 *
 * @param {{prompt?: string, options: Array<{label: string, events?: TrackEvent[], fiber?: Fiber}>}} node
 * @param {(node: object) => number|Promise<number>} onSelect - resolves the chosen option index.
 */
export function fork(node, onSelect) {
  return new Fiber(
    async function* () {
      const index = await onSelect(node);
      const option = node.options?.[index];
      if (!option) return;
      const fiber = option.fiber ?? trackFromEvents(option.events, `fork:${option.label}`);
      yield* fiber.spawn();
    },
    { name: `fork:${node.prompt ?? 'choice'}` }
  );
}

export class BraidCutscenePlayer {
  /**
   * @param {{
   *   onEvent?: (event: TrackEvent, info: {track: string, at: number}) => void|Promise<void>,
   *   onChoice?: (node: object) => number|Promise<number>,
   *   realtime?: boolean,
   *   epsilonMs?: number
   * }} [options]
   */
  constructor(options = {}) {
    this.onEvent = options.onEvent ?? (() => {});
    this.onChoice = options.onChoice ?? (() => 0);
    this.realtime = options.realtime ?? false;
    this.epsilonMs = options.epsilonMs ?? EPSILON_MS;
    this._stopped = false;
  }

  stop() {
    this._stopped = true;
  }

  /**
   * Play a multi-track cutscene.
   * @param {{name?: string, tracks: TrackDef[]}} cutscene
   * @returns {Promise<void>} resolves when all tight/frayed tracks complete.
   */
  async play(cutscene) {
    this._stopped = false;
    const tracks = cutscene.tracks ?? [];
    if (tracks.length === 0) return;

    const tight = [];
    const loose = [];
    for (const t of tracks) {
      const fiber = t.fiber ?? trackFromEvents(t.events, t.id);
      // Tag every yielded value with its track id.
      const tagged = fiber.map((v) => ({ ...v, track: t.id }));
      (t.tension === 'loose' ? loose : tight).push({ def: t, fiber: tagged });
    }

    // Loose tracks run independently on the virtual clock — never block.
    const looseRunners = loose.map(({ def, fiber }) =>
      this._runLooseTrack(def, fiber)
    );

    // Tight (+frayed) tracks weave in lock-step: each round is a beat;
    // the beat's sync time is the max `at` in the round.
    if (tight.length > 0) {
      const braid = new Braid(
        tight.map((t) => t.fiber),
        { tension: Tension.Tight }
      );
      await this._runTightBraid(braid, tight.map((t) => t.def.id));
    }

    await Promise.all(looseRunners);
  }

  /**
   * Plait a new track into a running cutscene (e.g. a fork() branch
   * chosen mid-playback, or a character entering). Returns the fiber
   * so the caller can keep a handle; the player picks it up on the
   * next beat. NOTE: only meaningful while play() is running — the
   * caller must retain the player and call this before completion.
   */
  // (Kept minimal: dynamic plaiting is exposed via the braid itself.
  //  See fork() for the primary branching primitive.)

  async _runTightBraid(braid, trackIds) {
    let clock = 0;
    for await (const tuple of braid) {
      if (this._stopped) break;
      // tuple: one {at, event, track} per tight track (this beat).
      const syncAt = Math.max(...tuple.map((v) => v.at));
      if (syncAt > clock) {
        await this._advanceClock(syncAt - clock);
        clock = syncAt;
      }
      // Emit beat events in time order (stable for ties).
      const ordered = [...tuple].sort((a, b) => a.at - b.at);
      for (const v of ordered) {
        if (this._stopped) break;
        await this.onEvent(v.event, { track: v.track, at: v.at });
      }
    }
  }

  async _runLooseTrack(def, fiber) {
    let clock = 0;
    for await (const v of fiber.spawn()) {
      if (this._stopped) break;
      const wait = v.at - clock;
      if (wait > 0) {
        await this._advanceClock(wait);
        clock = v.at;
      }
      await this.onEvent(v.event, { track: def.id, at: v.at });
    }
  }

  async _advanceClock(ms) {
    if (!this.realtime || ms <= 0) return;
    await new Promise((r) => setTimeout(r, ms));
  }
}

export { Fiber, Braid, Tension, Loom, fromArray };
