/**
 * Render resource instrumentation tests — P4-05.
 * RenderStats is standalone (no GL needed); RenderManager owns an instance.
 */
import { describe, it, expect } from 'vitest';
import { RenderStats } from '../src/engine/core/render/stats.js';

describe('RenderStats', () => {
  it('starts at zero and snapshots cleanly', () => {
    const s = new RenderStats();
    expect(s.snapshot()).toEqual({
      programs: 0,
      buffers: 0,
      textures: 0,
      clears: 0,
      cacheHits: 0,
      cacheMisses: 0,
      contextLosses: 0,
      contextRecoveries: 0,
    });
  });

  it('tracks cumulative counters and resets only per-frame ones', () => {
    const s = new RenderStats();
    s.trackProgram();
    s.trackProgram();
    s.trackBuffer();
    s.trackTexture();
    s.trackClear();
    s.trackClear();
    s.trackCacheHit();
    s.trackCacheMiss();
    s.trackContextLost();
    s.trackContextRestored();
    let snap = s.snapshot();
    expect(snap.programs).toBe(2);
    expect(snap.buffers).toBe(1);
    expect(snap.textures).toBe(1);
    expect(snap.clears).toBe(2);
    expect(snap.cacheHits).toBe(1);
    expect(snap.cacheMisses).toBe(1);
    expect(snap.contextLosses).toBe(1);
    expect(snap.contextRecoveries).toBe(1);

    s.resetFrame();
    snap = s.snapshot();
    expect(snap.clears).toBe(0);
    // cumulative counters survive the frame reset
    expect(snap.programs).toBe(2);
    expect(snap.buffers).toBe(1);
  });

  it('snapshot returns a copy', () => {
    const s = new RenderStats();
    s.trackProgram();
    const snap = s.snapshot();
    snap.programs = 999;
    expect(s.snapshot().programs).toBe(1);
  });
});
