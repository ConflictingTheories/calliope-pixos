/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – GLResourceRegistry
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-03) Central cache for GL programs, buffers, textures and
 * VAOs.  Resources are keyed, reference-counted, explicitly
 * releasable, and rebuilt on context loss — ending the era of
 * orphaned GPU objects after every map reload.
 *
 * The registry never touches a real GL context in a way tests
 * can't fake: all GL calls go through the injected `gl` object.
 */

export const ResourceKind = Object.freeze({
  PROGRAM: 'program',
  BUFFER: 'buffer',
  TEXTURE: 'texture',
  VAO: 'vao',
});

export class GLResourceRegistry {
  /**
   * @param {Object} gl  WebGL(2) context (or a mock in tests)
   */
  constructor(gl) {
    if (!gl) throw new Error('GLResourceRegistry: gl context is required');
    this.gl = gl;
    /** @type {Map<string, {kind:string, handle:*, refs:number, dispose:Function}>} */
    this.resources = new Map();
    this.lost = false;
  }

  _key(kind, name) {
    return `${kind}:${name}`;
  }

  /**
   * Get or create a resource.  `create(gl)` builds it, `dispose(gl, handle)`
   * releases it.  Concurrent requesters share one instance (refcounted).
   */
  acquire(kind, name, create, dispose) {
    const key = this._key(kind, name);
    let entry = this.resources.get(key);
    if (!entry) {
      const handle = create(this.gl);
      entry = { kind, handle, refs: 0, dispose };
      this.resources.set(key, entry);
    }
    entry.refs += 1;
    return entry.handle;
  }

  /** Release one reference; destroys the GL object at zero refs. */
  release(kind, name) {
    const key = this._key(kind, name);
    const entry = this.resources.get(key);
    if (!entry) return false;
    entry.refs -= 1;
    if (entry.refs <= 0) {
      try {
        entry.dispose(this.gl, entry.handle);
      } finally {
        this.resources.delete(key);
      }
    }
    return true;
  }

  /** Number of live cached resources (instrumentation for P3-11). */
  get liveCount() {
    return this.resources.size;
  }

  /** Total outstanding references (instrumentation). */
  get refCount() {
    let n = 0;
    for (const e of this.resources.values()) n += e.refs;
    return n;
  }

  /** Release everything, e.g. on editor teardown. Returns released count. */
  releaseAll() {
    const names = [...this.resources.keys()];
    for (const key of names) {
      const entry = this.resources.get(key);
      try {
        entry.dispose(this.gl, entry.handle);
      } catch {
        /* best-effort */
      }
      this.resources.delete(key);
    }
    return names.length;
  }

  /**
   * Context-loss handling: drop all handles WITHOUT calling dispose
   * (the context is gone), then lazily rebuild on next acquire.
   */
  handleContextLost() {
    this.lost = true;
    this.resources.clear();
  }

  handleContextRestored(gl) {
    this.gl = gl || this.gl;
    this.lost = false;
  }

  /** Debug snapshot: kind -> count. */
  census() {
    const out = {};
    for (const e of this.resources.values()) {
      out[e.kind] = (out[e.kind] || 0) + 1;
    }
    return out;
  }
}
