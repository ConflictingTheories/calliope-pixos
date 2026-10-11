/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – MapViewport
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-02) Testable map camera: world<->screen transforms,
 * pointer-to-grid, zoom/pan, DPR handling, and selection state.
 * Extracted from UnifiedMapEditor.jsx; no React, no GL.
 */

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;

export class MapViewport {
  /**
   * @param {{tileSize?: number, dpr?: number}} [options]
   */
  constructor(options = {}) {
    this.tileSize = options.tileSize ?? 32;
    this.dpr = options.dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    this.cameraX = 0; // world px offset of the viewport origin
    this.cameraY = 0;
    this.zoom = 1;
  }

  setDpr(dpr) {
    this.dpr = Math.max(1, dpr || 1);
  }

  /** Pan by screen pixels. */
  panBy(dxPx, dyPx) {
    this.cameraX += dxPx / this.zoom;
    this.cameraY += dyPx / this.zoom;
  }

  /** Zoom around a screen point (keeps the point under the cursor). */
  zoomAt(screenX, screenY, factor) {
    const before = this.screenToWorld(screenX, screenY);
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoom * factor));
    const after = this.screenToWorld(screenX, screenY);
    this.cameraX += before.x - after.x;
    this.cameraY += before.y - after.y;
  }

  setZoom(z) {
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  }

  /** Screen CSS px -> world px. */
  screenToWorld(sx, sy) {
    return { x: sx / this.zoom + this.cameraX, y: sy / this.zoom + this.cameraY };
  }

  /** World px -> screen CSS px. */
  worldToScreen(wx, wy) {
    return { x: (wx - this.cameraX) * this.zoom, y: (wy - this.cameraY) * this.zoom };
  }

  /** Screen CSS px -> grid cell (P3-05 picking primitive: O(1) inverse transform). */
  screenToCell(sx, sy) {
    const w = this.screenToWorld(sx, sy);
    return {
      x: Math.floor(w.x / this.tileSize),
      y: Math.floor(w.y / this.tileSize),
    };
  }

  /** Grid cell -> world px of the cell origin. */
  cellToWorld(cx, cy) {
    return { x: cx * this.tileSize, y: cy * this.tileSize };
  }

  /** Canvas backing-store size for a CSS size (DPR aware). */
  backingSize(cssWidth, cssHeight) {
    return {
      width: Math.round(cssWidth * this.dpr),
      height: Math.round(cssHeight * this.dpr),
    };
  }

  /** Visible world rect for culling (P3-04). */
  visibleWorldRect(cssWidth, cssHeight) {
    const tl = this.screenToWorld(0, 0);
    const br = this.screenToWorld(cssWidth, cssHeight);
    return { x0: tl.x, y0: tl.y, x1: br.x, y1: br.y };
  }

  snapshot() {
    return { cameraX: this.cameraX, cameraY: this.cameraY, zoom: this.zoom, dpr: this.dpr, tileSize: this.tileSize };
  }

  restore(s) {
    this.cameraX = s.cameraX;
    this.cameraY = s.cameraY;
    this.zoom = s.zoom;
    this.dpr = s.dpr;
    this.tileSize = s.tileSize;
  }
}

/** Rectangular cell selection with union/intersection helpers. */
export class MapSelection {
  constructor() {
    this.cells = new Set(); // "x,y"
    this.anchor = null;
  }

  static key(x, y) {
    return `${x},${y}`;
  }

  setSingle(x, y) {
    this.cells = new Set([MapSelection.key(x, y)]);
    this.anchor = { x, y };
  }

  /** Drag-rectangle from the anchor (or given origin) to (x, y). */
  setRect(x0, y0, x1, y1) {
    const [ax, bx] = x0 <= x1 ? [x0, x1] : [x1, x0];
    const [ay, by] = y0 <= y1 ? [y0, y1] : [y1, y0];
    this.cells = new Set();
    for (let y = ay; y <= by; y++) {
      for (let x = ax; x <= bx; x++) this.cells.add(MapSelection.key(x, y));
    }
    this.anchor = { x: x0, y: y0 };
  }

  toggle(x, y) {
    const k = MapSelection.key(x, y);
    if (this.cells.has(k)) this.cells.delete(k);
    else this.cells.add(k);
  }

  has(x, y) {
    return this.cells.has(MapSelection.key(x, y));
  }

  clear() {
    this.cells.clear();
    this.anchor = null;
  }

  get size() {
    return this.cells.size;
  }

  /** @returns {Array<{x:number,y:number}>} */
  toList() {
    return [...this.cells].map(k => {
      const [x, y] = k.split(',').map(Number);
      return { x, y };
    });
  }

  /** Bounding box or null when empty. */
  bounds() {
    if (this.cells.size === 0) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const { x, y } of this.toList()) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
    return { x0, y0, x1, y1 };
  }
}
