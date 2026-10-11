/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – ChunkManager
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-04) The map is divided into fixed-size chunks (default
 * 32x32 cells).  Only chunks intersecting the visible rect get
 * meshes; only dirty chunks re-upload.  A paint stroke dirties
 * exactly the chunks it touches — the rest of the 512x512 scene
 * is never rebuilt.
 */

export const DEFAULT_CHUNK_CELLS = 32;

export class ChunkManager {
  /**
   * @param {{chunkCells?: number, buildMesh?: Function, uploadMesh?: Function, releaseMesh?: Function}} options
   *   buildMesh(chunk) -> mesh descriptor (pure, testable)
   *   uploadMesh(chunk, mesh) -> void (GL upload via GLResourceRegistry)
   *   releaseMesh(chunk) -> void
   */
  constructor(options = {}) {
    this.chunkCells = options.chunkCells ?? DEFAULT_CHUNK_CELLS;
    this.buildMesh = options.buildMesh || (() => ({}));
    this.uploadMesh = options.uploadMesh || (() => {});
    this.releaseMesh = options.releaseMesh || (() => {});
    /** @type {Map<string, {cx:number, cy:number, mesh:*, dirty:boolean, uploaded:boolean}>} */
    this.chunks = new Map();
    this.stats = { built: 0, uploaded: 0, culled: 0, released: 0 };
  }

  static key(cx, cy) {
    return `${cx},${cy}`;
  }

  /** Chunk coords containing a cell. */
  chunkOfCell(x, y) {
    return {
      cx: Math.floor(x / this.chunkCells),
      cy: Math.floor(y / this.chunkCells),
    };
  }

  /** Mark the chunks intersecting a cell range dirty. Returns touched keys. */
  dirtyRange(x0, y0, x1, y1) {
    const a = this.chunkOfCell(Math.min(x0, x1), Math.min(y0, y1));
    const b = this.chunkOfCell(Math.max(x0, x1), Math.max(y0, y1));
    const touched = [];
    for (let cy = a.cy; cy <= b.cy; cy++) {
      for (let cx = a.cx; cx <= b.cx; cx++) {
        const key = ChunkManager.key(cx, cy);
        let chunk = this.chunks.get(key);
        if (!chunk) {
          chunk = { cx, cy, mesh: null, dirty: true, uploaded: false };
          this.chunks.set(key, chunk);
        } else {
          chunk.dirty = true;
        }
        touched.push(key);
      }
    }
    return touched;
  }

  dirtyCell(x, y) {
    return this.dirtyRange(x, y, x, y);
  }

  /**
   * Ensure meshes for chunks intersecting the visible world rect.
   * Builds + uploads only dirty chunks; culls (and releases) chunks
   * fully outside the rect.
   * @param {{x0:number,y0:number,x1:number,y1:number}} visible  world px rect
   * @param {number} tileSize
   * @returns {{visible: string[], built: string[], uploaded: string[]}}
   */
  update(visible, tileSize) {
    const a = this.chunkOfCell(Math.floor(visible.x0 / tileSize), Math.floor(visible.y0 / tileSize));
    const b = this.chunkOfCell(Math.floor(visible.x1 / tileSize), Math.floor(visible.y1 / tileSize));
    const visibleKeys = new Set();
    const built = [];
    const uploaded = [];

    for (let cy = a.cy; cy <= b.cy; cy++) {
      for (let cx = a.cx; cx <= b.cx; cx++) {
        const key = ChunkManager.key(cx, cy);
        visibleKeys.add(key);
        let chunk = this.chunks.get(key);
        if (!chunk) {
          chunk = { cx, cy, mesh: null, dirty: true, uploaded: false };
          this.chunks.set(key, chunk);
        }
        if (chunk.dirty || !chunk.uploaded) {
          chunk.mesh = this.buildMesh(chunk);
          this.stats.built += 1;
          built.push(key);
          this.uploadMesh(chunk, chunk.mesh);
          this.stats.uploaded += 1;
          uploaded.push(key);
          chunk.dirty = false;
          chunk.uploaded = true;
        }
      }
    }

    // Cull offscreen chunks.
    for (const [key, chunk] of [...this.chunks]) {
      if (!visibleKeys.has(key)) {
        this.releaseMesh(chunk);
        this.stats.released += 1;
        this.stats.culled += 1;
        this.chunks.delete(key);
      }
    }

    return { visible: [...visibleKeys], built, uploaded };
  }

  /** Invalidate everything (map resize / tileset swap). */
  invalidateAll() {
    for (const chunk of this.chunks.values()) {
      this.releaseMesh(chunk);
      this.stats.released += 1;
    }
    this.chunks.clear();
  }

  get loadedChunkCount() {
    return this.chunks.size;
  }
}
