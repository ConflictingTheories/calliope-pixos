# ADR-0006: Braid as the cutscene/narrative concurrency model

**Status:** Accepted (spike validated 2026-10-06)
**Deciders:** Kyle (product direction), engine implementer
**Scope:** `packages/core-js` cutscene execution only. Game loop / fixed-step physics explicitly untouched.

---

## Spike question

Do braid's tension semantics actually fit cutscene needs, or would adoption be
forcing a metaphor?

## Current state (what exists)

- Engine `CutsceneManager` (`core/cutscene/manager.js`): **sequential** step queue
  (wait, transition, load_zone, action, set_backdrop, show_cutout). No parallel tracks.
- Editor `TimelineClock` (`cutscene-tool/player/timelineClock.js`): deterministic
  preview clock over a **linear** node order. `Timeline.jsx` notes:
  "Single track for now - could be expanded to multiple tracks".
- Editor `cutsceneGraph.js`: normalizes linear events **and** branching dialogue
  nodes into one graph (`next: string[]`; choice nodes expose one id per option).

The multi-track model (dialogue / animation / audio in parallel) is the *desired*
direction, not the current implementation. The spike validates braid against that
desired model.

## Mapping: braid concepts → cutscene needs

| Braid concept | Cutscene need | Verdict |
|---|---|---|
| `Fiber` (async strand) | A track: dialogue lines, animation clip, audio cues — each an async generator yielding timed events | **Direct fit** |
| `Tension.Tight` (lock-step) | Sync points: dialogue line + character animation + SFX land on the same beat; advance only when all tracks complete the beat | **Direct fit** — the core multi-track semantic |
| `Tension.Loose` (last-known) | Ambient tracks: BGM, particle ambience, idle loops that must not block narrative progress | **Direct fit** |
| `Tension.Frayed` (fail-fast) | Critical tracks: missing sprite/audio should halt, not play broken | **Direct fit** |
| `plait()` (dynamic fiber) | Mid-cutscene track joins (character enters → their dialogue track joins the running braid) | **Direct fit** |
| `bind()` (braid → fiber) | Cutscene-in-cutscene; a whole cutscene as one track of a larger sequence | **Direct fit** |
| `Loom.run` / `Loom.collect` | Executor; `collect` gives deterministic test capture | **Direct fit** |
| `partition()` | Choice branching primitive | **Partial** — partition splits by predicate, but story choices need *player selection* of the continuing strand. A `fork()` helper is built on Fiber primitives instead. |

## Caveats (real, not hand-waved)

1. **Braid is pull-based async iteration, not time-based.** Cutscenes need a clock.
   The adapter: each Fiber yields `{ at, event }` tuples and a driver advances a
   virtual clock, emitting events in time order. Thin adapter, but it is real work
   — braid does not give you a timeline for free.
2. **Determinism is tension-dependent.** `Tight`/`Frayed` are deterministic
   (lock-step rounds). `Loose` uses `Promise.race` — timing-dependent, **not**
   deterministic. Rule: `Tight` for the narrative spine (deterministic preview
   per the TimelineClock contract), `Loose` only for ambient/non-critical tracks.
3. **No 1:1 replacement.** The sequential `CutsceneManager` stays for backward
   compatibility. Braid powers a *new* multi-track player; the old manager is not
   rewritten.

## Decision

**Adopt.** The semantics fit the desired multi-track model directly, and the
caveats are manageable (clock adapter, tension discipline, additive — not
replacement).

## Integration (this ADR's scope)

- Vendor braid as JS (`src/vendor/braid.js`, MIT attribution kept) — converted
  from the TS source, logic identical.
- New `core/cutscene/braidPlayer.js`: multi-track executor. Timeline data format
  unchanged (events gain an optional `track` field); only the executor is new.
- `fork()` helper for interactive-fiction branching (choice nodes select the
  continuing story fiber).
- Pixoscript coroutine hook: **deferred** — no natural hook exists today without
  contorting the script engine. Revisit when the script boundary work lands.

## Out of scope

- Game loop / fixed-step physics (never).
- Rewriting `CutsceneManager` (stays as the sequential player).
- SVRN server-side scheduling (hub stays boring; noted in product brief).
