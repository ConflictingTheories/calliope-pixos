/*
 * ---------------------------------------------------------------
 *            PixoSpritz – Editor – Picking
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-05) Replaces per-cell picking loops with O(1) inverse
 * transforms.  Grid cells resolve arithmetically from the viewport;
 * map objects / geometry use an optional ID framebuffer pass.
 */

import { MapViewport } from '../viewport/mapViewport.js';

/**
 * Pick a grid cell from a pointer position.  O(1): a single inverse
 * transform, correct at any DPR because the viewport owns the
 * device-pixel math.
 *
 * @param {MapViewport} viewport
 * @param {number} clientX  pointer X in CSS px relative to the canvas
 * @param {number} clientY  pointer Y in CSS px relative to the canvas
 * @param {{width:number, height:number}} [mapSize]  optional clamp
 * @returns {{x:number, y:number, inside:boolean}}
 */
export function pickCell(viewport, clientX, clientY, mapSize = null) {
  const { x, y } = viewport.screenToCell(clientX, clientY);
  let inside = true;
  if (mapSize) {
    inside = x >= 0 && y >= 0 && x < mapSize.width && y < mapSize.height;
  }
  return { x, y, inside };
}

/**
 * Pick along a pointer drag: returns every cell the segment passes
 * through (Bresenham), each resolved via the O(1) transform.
 */
export function pickCellLine(viewport, x0, y0, x1, y1, mapSize = null) {
  const a = viewport.screenToCell(x0, y0);
  const b = viewport.screenToCell(x1, y1);
  const cells = [];
  const dx = Math.abs(b.x - a.x);
  const dy = Math.abs(b.y - a.y);
  const sx = a.x < b.x ? 1 : -1;
  const sy = a.y < b.y ? 1 : -1;
  let err = dx - dy;
  let x = a.x;
  let y = a.y;
  for (;;) {
    const inside = !mapSize || (x >= 0 && y >= 0 && x < mapSize.width && y < mapSize.height);
    cells.push({ x, y, inside });
    if (x === b.x && y === b.y) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  return cells;
}

/**
 * ID framebuffer for object/geometry picking.  Each pickable gets a
 * unique 24-bit id; the id is encoded into the pixel colour during a
 * dedicated render pass and decoded from readPixels.
 *
 * This module owns the encode/decode math only — the render pass
 * itself stays in the map renderer (P3-03/P3-04), which already owns
 * the GL objects.
 */
export function encodePickId(id) {
  if (!Number.isInteger(id) || id < 1 || id > 0xffffff) {
    throw new Error(`pick: id out of range: ${id}`);
  }
  return [(id >> 16) & 0xff, (id >> 8) & 0xff, id & 0xff, 255];
}

export function decodePickId(r, g, b) {
  const id = (r << 16) | (g << 8) | b;
  return id === 0 ? null : id; // 0 = background / no hit
}

/**
 * Bidirectional registry between pick ids and scene objects.
 */
export class PickRegistry {
  constructor() {
    this.nextId = 1;
    /** @type {Map<number, {kind:string, ref:*}>} */
    this.entries = new Map();
  }

  register(kind, ref) {
    const id = this.nextId++;
    if (id > 0xffffff) throw new Error('pick: id space exhausted');
    this.entries.set(id, { kind, ref });
    return id;
  }

  unregister(id) {
    return this.entries.delete(id);
  }

  lookup(id) {
    return this.entries.get(id) || null;
  }

  clear() {
    this.entries.clear();
    this.nextId = 1;
  }
}
