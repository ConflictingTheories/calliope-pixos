/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – TimelineClock
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-09) Deterministic cutscene preview clock, separated from
 * rendering.  The clock owns time: play/pause/seek/stop over a
 * fixed timestep.  Render adapters consume emitted state — they
 * never advance time themselves.  Export remains optional and
 * untouched.
 *
 * Determinism contract: the same sequence of play/seek/replay
 * operations always produces the identical event order.
 */

export const ClockState = Object.freeze({
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  ENDED: 'ended',
});

/** Default per-type durations (seconds) when an event omits one. */
export function eventDuration(event, defaultDuration = 2) {
  if (event.type === 'wait') return event.duration ?? 1;
  if (typeof event.duration === 'number') return event.duration;
  return defaultDuration;
}

export class TimelineClock {
  /**
   * @param {Array} nodes  linear playback order (see linearOrder)
   * @param {{defaultDuration?: number, tickHz?: number}} [options]
   */
  constructor(nodes = [], options = {}) {
    this.defaultDuration = options.defaultDuration ?? 2;
    this.tickHz = options.tickHz ?? 60;
    this.listeners = new Map();
    this.setNodes(nodes);
  }

  setNodes(nodes) {
    this.nodes = [...nodes];
    // Precompute the deterministic schedule: [{node, start, end}].
    let t = 0;
    this.schedule = this.nodes.map(node => {
      const duration = eventDuration(node, this.defaultDuration);
      const slot = { node, start: t, end: t + duration, index: this.schedule?.length ?? 0 };
      t += duration;
      return slot;
    });
    // Fix indices (schedule was empty on first pass).
    this.schedule.forEach((s, i) => { s.index = i; });
    this.totalDuration = t;
    this.reset();
  }

  reset() {
    this.time = 0;
    this.state = ClockState.IDLE;
    this.slotIndex = -1;
    this.accumulator = 0;
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event).delete(fn);
  }

  emit(event, payload) {
    for (const fn of [...(this.listeners.get(event) || [])]) fn(payload);
  }

  play() {
    if (this.state === ClockState.ENDED) this.seek(0);
    if (this.nodes.length === 0) return;
    this.state = ClockState.PLAYING;
    this.emit('state', { state: this.state });
  }

  pause() {
    if (this.state !== ClockState.PLAYING) return;
    this.state = ClockState.PAUSED;
    this.emit('state', { state: this.state });
  }

  stop() {
    this.reset();
    this.emit('state', { state: this.state });
    this.emit('tick', this.frame());
  }

  /**
   * Seek to an absolute time.  Deterministic: recomputes the active
   * slot from the schedule and emits enter/exit as needed.
   */
  seek(time) {
    const clamped = Math.max(0, Math.min(time, this.totalDuration));
    const prevSlot = this.slotIndex;
    this.time = clamped;
    this.slotIndex = this.schedule.findIndex(s => clamped >= s.start && clamped < s.end);
    if (this.slotIndex === -1 && clamped >= this.totalDuration && this.schedule.length > 0) {
      this.slotIndex = this.schedule.length - 1;
    }
    if (prevSlot !== this.slotIndex && prevSlot !== -1) {
      this.emit('exit', { node: this.schedule[prevSlot]?.node, index: prevSlot });
    }
    if (this.slotIndex !== -1 && prevSlot !== this.slotIndex) {
      this.emit('enter', { node: this.schedule[this.slotIndex].node, index: this.slotIndex, time: this.time });
    }
    if (clamped >= this.totalDuration) {
      this.state = ClockState.ENDED;
      this.emit('state', { state: this.state });
      this.emit('ended', { time: this.time });
    } else if (this.state === ClockState.ENDED) {
      this.state = ClockState.PAUSED;
    }
    this.emit('tick', this.frame());
  }

  /**
   * Advance the clock by dt seconds using a fixed timestep
   * accumulator (deterministic regardless of rAF jitter).
   */
  advance(dt) {
    if (this.state !== ClockState.PLAYING) return;
    this.accumulator += dt;
    const step = 1 / this.tickHz;
    let guard = 0;
    while (this.accumulator >= step && guard++ < this.tickHz * 2) {
      this.accumulator -= step;
      this.seek(this.time + step);
      if (this.state !== ClockState.PLAYING) break;
    }
  }

  /** Current render-adapter state snapshot. */
  frame() {
    const slot = this.slotIndex >= 0 ? this.schedule[this.slotIndex] : null;
    return {
      time: this.time,
      state: this.state,
      node: slot ? slot.node : null,
      index: this.slotIndex,
      total: this.schedule.length,
      totalDuration: this.totalDuration,
      slotStart: slot ? slot.start : 0,
      slotEnd: slot ? slot.end : 0,
    };
  }
}
