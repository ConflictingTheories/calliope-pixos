/*
 * ---------------------------------------------------------------
 *         PixoSpritz – Editor – picking tests (P3-05)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Pixel-correct hit tests at DPR 1/2; ID encode/decode round-trip.
 */

import { describe, it, expect } from 'vitest';
import { pickCell, pickCellLine, encodePickId, decodePickId, PickRegistry } from '../pick.js';
import { MapViewport } from '../../viewport/mapViewport.js';

describe('pickCell', () => {
  it('is pixel-correct at DPR 1', () => {
    const v = new MapViewport({ tileSize: 32 });
    v.setDpr(1);
    // Cell (2,3): world x in [64,96), y in [96,128).
    expect(pickCell(v, 64, 96, { width: 16, height: 16 })).toEqual({ x: 2, y: 3, inside: true });
    expect(pickCell(v, 95.999, 127.999, { width: 16, height: 16 })).toEqual({ x: 2, y: 3, inside: true });
    expect(pickCell(v, 96, 96, { width: 16, height: 16 })).toEqual({ x: 3, y: 3, inside: true });
  });

  it('is pixel-correct at DPR 2', () => {
    const v = new MapViewport({ tileSize: 32 });
    v.setDpr(2);
    // CSS px are DPR-independent for the transform; verify explicitly.
    expect(pickCell(v, 64, 96, { width: 16, height: 16 })).toEqual({ x: 2, y: 3, inside: true });
    v.setZoom(1.5);
    const c = pickCell(v, 96, 96, { width: 16, height: 16 });
    // world = 96/1.5 = 64 -> cell 2
    expect(c).toEqual({ x: 2, y: 2, inside: true });
  });

  it('reports outside-map hits', () => {
    const v = new MapViewport({ tileSize: 32 });
    expect(pickCell(v, 2000, 2000, { width: 16, height: 16 }).inside).toBe(false);
    expect(pickCell(v, 10, 10, null).inside).toBe(true); // unclamped
  });

  it('runs in O(1) — no per-cell iteration', () => {
    const v = new MapViewport({ tileSize: 32 });
    const t0 = performance.now();
    for (let i = 0; i < 100000; i++) pickCell(v, 123.4, 567.8);
    const dt = performance.now() - t0;
    expect(dt).toBeLessThan(1000); // 100k picks in <1s => no map-size loop
  });
});

describe('pickCellLine', () => {
  it('covers every cell along a drag', () => {
    const v = new MapViewport({ tileSize: 32 });
    const cells = pickCellLine(v, 16, 16, 100, 16, { width: 16, height: 16 });
    const xs = cells.map(c => c.x);
    expect(Math.min(...xs)).toBe(0);
    expect(Math.max(...xs)).toBe(3);
    expect(cells.every(c => c.y === 0)).toBe(true);
  });
});

describe('ID framebuffer', () => {
  it('round-trips ids through RGB encoding', () => {
    for (const id of [1, 255, 256, 65535, 0xffffff]) {
      const [r, g, b] = encodePickId(id);
      expect(decodePickId(r, g, b)).toBe(id);
    }
    expect(decodePickId(0, 0, 0)).toBe(null);
    expect(() => encodePickId(0)).toThrow();
    expect(() => encodePickId(0x1000000)).toThrow();
  });

  it('registers and looks up scene objects', () => {
    const reg = new PickRegistry();
    const ref = { type: 'sprite' };
    const id = reg.register('sprite', ref);
    expect(reg.lookup(id)).toEqual({ kind: 'sprite', ref });
    expect(reg.unregister(id)).toBe(true);
    expect(reg.lookup(id)).toBe(null);
  });
});
