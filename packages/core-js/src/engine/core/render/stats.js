/**
 * Render resource instrumentation — P4-05.
 *
 * Standalone counter set owned by RenderManager. programs/buffers/textures
 * and cache/context counters are cumulative for the session; clears is
 * per-frame (reset via resetFrame()). Exposed to the dev HUD through
 * RenderManager.getStats().
 */
export class RenderStats {
  constructor() {
    this.programs = 0;
    this.buffers = 0;
    this.textures = 0;
    this.clears = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.contextLosses = 0;
    this.contextRecoveries = 0;
  }

  trackProgram() {
    this.programs++;
  }
  trackBuffer() {
    this.buffers++;
  }
  trackTexture() {
    this.textures++;
  }
  trackClear() {
    this.clears++;
  }
  trackCacheHit() {
    this.cacheHits++;
  }
  trackCacheMiss() {
    this.cacheMisses++;
  }
  trackContextLost() {
    this.contextLosses++;
  }
  trackContextRestored() {
    this.contextRecoveries++;
  }

  /** Per-frame reset (call once per frame). */
  resetFrame() {
    this.clears = 0;
  }

  /** Copy suitable for HUD display / tests. */
  snapshot() {
    return {
      programs: this.programs,
      buffers: this.buffers,
      textures: this.textures,
      clears: this.clears,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      contextLosses: this.contextLosses,
      contextRecoveries: this.contextRecoveries,
    };
  }
}

export default RenderStats;
