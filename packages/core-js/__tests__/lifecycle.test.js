/**
 * Scene lifecycle tests — P4-04.
 * Ten load/unload cycles must leave zero tracked handles.
 */
import { describe, it, expect } from 'vitest';
import { SceneLifecycle, LifecycleTracker, STATES } from '../src/engine/core/scene/lifecycle.js';

describe('SceneLifecycle', () => {
  it('walks the canonical state path', () => {
    const lc = new SceneLifecycle();
    expect(lc.state).toBe('unloaded');
    lc.load();
    lc.ready();
    lc.start();
    lc.pause();
    lc.resume();
    lc.unload();
    expect(lc.state).toBe('unloaded');
  });

  it('rejects illegal transitions', () => {
    const lc = new SceneLifecycle();
    expect(() => lc.start()).toThrow(/Illegal scene lifecycle transition/);
    expect(() => lc.pause()).toThrow();
    lc.load();
    expect(() => lc.resume()).toThrow();
  });

  it('notifies transition listeners', () => {
    const lc = new SceneLifecycle();
    const seen = [];
    const off = lc.onTransition((from, to) => seen.push([from, to]));
    lc.load();
    lc.ready();
    off();
    lc.start();
    expect(seen).toEqual([
      ['unloaded', 'loading'],
      ['loading', 'ready'],
    ]);
  });

  it('ten load/unload cycles leave zero tracked handles', () => {
    for (let cycle = 0; cycle < 10; cycle++) {
      const lc = new SceneLifecycle();
      lc.load();
      // Simulate a loaded scene's heterogeneous handles.
      let unsubscribed = 0;
      lc.tracker.trackSubscription({ unsubscribe: () => unsubscribed++ });
      lc.tracker.trackTimer(12345, true);
      let gpuDisposed = false;
      lc.tracker.trackGpu({ dispose: () => (gpuDisposed = true) });
      let audioStopped = false;
      lc.tracker.trackAudio({ stop: () => (audioStopped = true) });
      expect(lc.trackedHandles).toBe(4);
      lc.ready();
      lc.start();
      lc.unload();
      expect(lc.state).toBe('unloaded');
      expect(lc.trackedHandles).toBe(0);
      expect(unsubscribed).toBe(1);
      expect(gpuDisposed).toBe(true);
      expect(audioStopped).toBe(true);
    }
  });

  it('a failing handle does not prevent disposing the rest', () => {
    const t = new LifecycleTracker();
    let ok = false;
    t.track('gpu', {
      dispose: () => {
        throw new Error('boom');
      },
    });
    t.track('gpu', {
      dispose: () => (ok = true),
    });
    expect(t.disposeAll()).toBe(2);
    expect(ok).toBe(true);
    expect(t.count()).toBe(0);
  });

  it('untrack removes a single handle', () => {
    const t = new LifecycleTracker();
    const h = t.trackTimer(1);
    t.trackTimer(2);
    expect(t.count()).toBe(2);
    t.untrack(h);
    expect(t.count()).toBe(1);
  });

  it('STATES documents the canonical order', () => {
    expect(STATES).toEqual(['unloaded', 'loading', 'ready', 'running', 'paused', 'unloading']);
  });
});
