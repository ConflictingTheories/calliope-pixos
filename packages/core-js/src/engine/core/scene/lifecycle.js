/**
 * Scene lifecycle — P4-04.
 *
 * Defines the canonical scene lifecycle and owns handle collection so that
 * load/start/pause/unload cycles never leak subscriptions, timers, GPU
 * resources, or audio handles.
 *
 * States: unloaded -> loading -> ready -> running <-> paused -> unloading -> unloaded
 *
 * Usage:
 *   const lc = new SceneLifecycle();
 *   lc.transition('loading');
 *   const timer = lc.trackTimer(setInterval(tick, 16));
 *   const sub = lc.trackSubscription(emitter.on('x', fn)); // { unsubscribe }
 *   lc.trackGpu({ dispose: () => gl.deleteBuffer(buf) });
 *   lc.trackAudio({ stop: () => source.stop(), close: () => ctx.close() });
 *   ...
 *   lc.transition('unloading'); // disposes everything tracked
 */

export const STATES = Object.freeze([
  'unloaded',
  'loading',
  'ready',
  'running',
  'paused',
  'unloading',
]);

const LEGAL = {
  unloaded: ['loading'],
  loading: ['ready', 'unloading'],
  ready: ['running', 'unloading'],
  running: ['paused', 'unloading'],
  paused: ['running', 'unloading'],
  unloading: ['unloaded'],
};

function disposeHandle(handle) {
  const { kind, ref } = handle;
  try {
    switch (kind) {
      case 'subscription':
        if (typeof ref.unsubscribe === 'function') ref.unsubscribe();
        else if (typeof ref.off === 'function') ref.off();
        else if (typeof ref.dispose === 'function') ref.dispose();
        break;
      case 'timer':
        // ref: { id, interval: boolean }
        if (ref.interval) clearInterval(ref.id);
        else clearTimeout(ref.id);
        break;
      case 'gpu':
        if (typeof ref.dispose === 'function') ref.dispose();
        else if (typeof ref.destroy === 'function') ref.destroy();
        else if (typeof ref.delete === 'function') ref.delete();
        break;
      case 'audio':
        if (typeof ref.stop === 'function') ref.stop();
        if (typeof ref.close === 'function') ref.close();
        else if (typeof ref.dispose === 'function') ref.dispose();
        break;
      default:
        if (ref && typeof ref.dispose === 'function') ref.dispose();
    }
  } catch {
    // Disposal must never throw: a failing handle must not prevent the
    // remaining handles from being released.
  }
}

/** Collects heterogeneous handles and disposes them all. */
export class LifecycleTracker {
  constructor() {
    this.handles = new Set();
  }

  /** @returns {number} currently tracked handles */
  count() {
    return this.handles.size;
  }

  track(kind, ref) {
    const handle = { kind, ref };
    this.handles.add(handle);
    return handle;
  }

  untrack(handle) {
    this.handles.delete(handle);
  }

  trackSubscription(sub) {
    return this.track('subscription', sub);
  }

  trackTimer(id, interval = false) {
    return this.track('timer', { id, interval });
  }

  trackGpu(resource) {
    return this.track('gpu', resource);
  }

  trackAudio(resource) {
    return this.track('audio', resource);
  }

  /** Dispose every tracked handle. Returns the number disposed. */
  disposeAll() {
    let n = 0;
    for (const handle of this.handles) {
      disposeHandle(handle);
      n++;
    }
    this.handles.clear();
    return n;
  }
}

/** Canonical scene state machine with handle collection. */
export class SceneLifecycle {
  constructor() {
    this.state = 'unloaded';
    this.tracker = new LifecycleTracker();
    this.listeners = new Set();
  }

  onTransition(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /**
   * Move to a new lifecycle state.
   * @throws {Error} on illegal transitions.
   */
  transition(to) {
    if (!LEGAL[this.state].includes(to)) {
      throw new Error(`Illegal scene lifecycle transition: ${this.state} -> ${to}`);
    }
    const from = this.state;
    if (to === 'unloading') {
      this.tracker.disposeAll();
    }
    this.state = to;
    for (const fn of this.listeners) {
      try {
        fn(from, to);
      } catch {
        /* listener errors must not break the transition */
      }
    }
    return this.state;
  }

  // Convenience wrappers -------------------------------------------------
  load() {
    return this.transition('loading');
  }
  ready() {
    return this.transition('ready');
  }
  start() {
    return this.transition('running');
  }
  pause() {
    return this.transition('paused');
  }
  resume() {
    return this.transition('running');
  }
  unload() {
    this.transition('unloading');
    return this.transition('unloaded');
  }

  get trackedHandles() {
    return this.tracker.count();
  }
}

export default SceneLifecycle;
