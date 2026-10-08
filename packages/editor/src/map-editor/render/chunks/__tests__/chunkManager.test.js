/*
 * ---------------------------------------------------------------
 *       PixoSpritz – Editor – ChunkManager tests (P3-04)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Verifies: dirty ranges touch minimal chunks, only changed spans
 * upload, offscreen chunks are culled, and a 512x512 reference
 * scene stays within a bounded chunk budget.
 */

import { describe, it, expect, vi } from 'vitest';
import { ChunkManager } from '../chunkManager.js';

function makeManager() {
  return new ChunkManager({
    chunkCells: 32,
    buildMesh: vi.fn(chunk => ({ chunk: `${chunk.cx},${chunk.cy}` })),
    uploadMesh: vi.fn(),
    releaseMesh: vi.fn(),
  });
}

describe('ChunkManager', () => {
  it('dirties exactly the chunks a stroke touches', () => {
    const m = makeManager();
    // 3x3 brush at cell (40,40): chunk (1,1) only.
    const touched = m.dirtyRange(39, 39, 41, 41);
    expect(touched).toEqual(['1,1']);
    // Stroke crossing a chunk boundary touches 2 chunks.
    const touched2 = m.dirtyRange(30, 10, 34, 10);
    expect(touched2.sort()).toEqual(['0,0', '1,0']);
  });

  it('builds and uploads only dirty chunks on update', () => {
    const m = makeManager();
    m.dirtyCell(5, 5);
    const r1 = m.update({ x0: 0, y0: 0, x1: 1024, y1: 1024 }, 32);
    expect(r1.built.length).toBeGreaterThan(0);
    const builtOnce = m.buildMesh.mock.calls.length;
    const r2 = m.update({ x0: 0, y0: 0, x1: 1024, y1: 1024 }, 32);
    expect(r2.built).toEqual([]);
    expect(m.buildMesh.mock.calls.length).toBe(builtOnce); // no rebuild
    // One dirty cell rebuilds exactly one chunk.
    m.dirtyCell(5, 5);
    const r3 = m.update({ x0: 0, y0: 0, x1: 1024, y1: 1024 }, 32);
    expect(r3.built).toEqual(['0,0']);
  });

  it('culls offscreen chunks and releases their meshes', () => {
    const m = makeManager();
    m.update({ x0: 0, y0: 0, x1: 2048, y1: 2048 }, 32);
    const loaded = m.loadedChunkCount;
    expect(loaded).toBeGreaterThan(0);
    m.update({ x0: 100000, y0: 100000, x1: 101000, y1: 101000 }, 32);
    expect(m.releaseMesh.mock.calls.length).toBe(loaded);
  });

  it('keeps a 512x512 reference scene within a bounded chunk budget', () => {
    const m = makeManager();
    // 512x512 cells at 32px tiles, 32-cell chunks -> 16x16 = 256 chunks max.
    // Visible window: 800x600 screen px at zoom 1.
    m.update({ x0: 0, y0: 0, x1: 800, y1: 600 }, 32);
    // 800/1024 -> 1 chunk wide, 600/1024 -> 1 chunk tall.
    expect(m.loadedChunkCount).toBeLessThanOrEqual(4);
    expect(m.stats.built).toBeLessThanOrEqual(4);
  });

  it('invalidateAll drops everything', () => {
    const m = makeManager();
    m.update({ x0: 0, y0: 0, x1: 2048, y1: 2048 }, 32);
    m.invalidateAll();
    expect(m.loadedChunkCount).toBe(0);
  });
});
