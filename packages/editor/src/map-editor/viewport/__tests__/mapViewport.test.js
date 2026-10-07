/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – mapViewport tests (P3-02)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Coordinate/property tests: zoom, pan, resize, DPR.
 */

import { describe, it, expect } from 'vitest';
import { MapViewport, MapSelection, MIN_ZOOM, MAX_ZOOM } from '../mapViewport.js';

const approx = (a, b, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('MapViewport', () => {
  it('round-trips screen<->world coordinates', () => {
    const v = new MapViewport({ tileSize: 32 });
    v.cameraX = 100;
    v.cameraY = 50;
    v.setZoom(2);
    const w = v.screenToWorld(200, 100);
    const s = v.worldToScreen(w.x, w.y);
    approx(s.x, 200);
    approx(s.y, 100);
  });

  it('zooms around the cursor point', () => {
    const v = new MapViewport({ tileSize: 32 });
    const before = v.screenToWorld(160, 120);
    v.zoomAt(160, 120, 2);
    const after = v.screenToWorld(160, 120);
    approx(before.x, after.x);
    approx(before.y, after.y);
    expect(v.zoom).toBe(2);
  });

  it('clamps zoom to [MIN_ZOOM, MAX_ZOOM]', () => {
    const v = new MapViewport();
    v.setZoom(1000);
    expect(v.zoom).toBe(MAX_ZOOM);
    v.setZoom(0.0001);
    expect(v.zoom).toBe(MIN_ZOOM);
  });

  it('pans in screen pixels scaled by zoom', () => {
    const v = new MapViewport();
    v.setZoom(2);
    v.panBy(20, 10);
    expect(v.cameraX).toBe(10);
    expect(v.cameraY).toBe(5);
  });

  it('maps screen points to grid cells (O(1) inverse transform)', () => {
    const v = new MapViewport({ tileSize: 32 });
    // Cell (2,3) spans world [64,96) x [96,128).
    expect(v.screenToCell(70, 100)).toEqual({ x: 2, y: 3 });
    expect(v.screenToCell(95.9, 127.9)).toEqual({ x: 2, y: 3 });
    expect(v.screenToCell(96, 100)).toEqual({ x: 3, y: 3 });
    v.setZoom(2);
    // At 2x, screen 70 -> world 35 -> cell (1,1) for y=70->35.
    expect(v.screenToCell(70, 70)).toEqual({ x: 1, y: 1 });
  });

  it('computes DPR-aware backing sizes', () => {
    const v = new MapViewport();
    v.setDpr(2);
    expect(v.backingSize(400, 300)).toEqual({ width: 800, height: 600 });
    v.setDpr(0.5); // clamped
    expect(v.backingSize(400, 300)).toEqual({ width: 400, height: 300 });
  });

  it('reports the visible world rect for culling', () => {
    const v = new MapViewport();
    v.setZoom(1);
    const r = v.visibleWorldRect(800, 600);
    expect(r).toEqual({ x0: 0, y0: 0, x1: 800, y1: 600 });
  });

  it('snapshots and restores camera state', () => {
    const v = new MapViewport();
    v.panBy(30, 40);
    v.setZoom(3);
    const s = v.snapshot();
    const v2 = new MapViewport();
    v2.restore(s);
    expect(v2.snapshot()).toEqual(s);
  });
});

describe('MapSelection', () => {
  it('selects single cells, rects, and toggles', () => {
    const s = new MapSelection();
    s.setSingle(2, 3);
    expect(s.has(2, 3)).toBe(true);
    expect(s.size).toBe(1);
    s.setRect(0, 0, 2, 1);
    expect(s.size).toBe(6);
    s.toggle(0, 0);
    expect(s.has(0, 0)).toBe(false);
    expect(s.bounds()).toEqual({ x0: 0, y0: 0, x1: 2, y1: 1 });
    s.clear();
    expect(s.size).toBe(0);
    expect(s.bounds()).toBe(null);
  });
});
