/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Eraser Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Erases pixels (sets to transparent).
 */

import BaseTool from './BaseTool.js';

export default class EraserTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'eraser',
      icon: '🧹',
      cursor: 'crosshair',
      shortcut: 'e',
      size: 3,
      ...options,
    });
  }

  onStart(x, y, imageData, options) {
    super.onStart(x, y, imageData, options);
    return this._erase(x, y, options);
  }

  onMove(x, y, imageData, options) {
    if (!this.isDrawing) return [];

    const { width, height } = options;

    if (this.lastX !== -1 && this.lastY !== -1) {
      const linePixels = this.getLinePixels(this.lastX, this.lastY, x, y, width, height);
      this.lastX = x;
      this.lastY = y;
      return linePixels.map(p => ({ x: p.x, y: p.y, r: 0, g: 0, b: 0, a: 0 }));
    }

    this.lastX = x;
    this.lastY = y;
    return this._erase(x, y, options);
  }

  _erase(x, y, options) {
    const { width, height } = options;
    const brushPixels = this.getBrushPixels(x, y, width, height);
    return brushPixels.map(p => ({ x: p.x, y: p.y, r: 0, g: 0, b: 0, a: 0 }));
  }

  getPreview(x, y, options) {
    const { width, height } = options;
    const brushPixels = this.getBrushPixels(x, y, width, height);
    return brushPixels.map(p => ({
      x: p.x,
      y: p.y,
      r: 255,
      g: 0,
      b: 0,
      a: 100,
      preview: true,
      eraser: true,
    }));
  }
}
