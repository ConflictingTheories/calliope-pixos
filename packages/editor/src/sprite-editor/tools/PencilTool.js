/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Pencil Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Single-pixel drawing tool with interpolation.
 */

import BaseTool from './BaseTool.js';

export default class PencilTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'pencil',
      icon: '✏️',
      cursor: 'crosshair',
      shortcut: 'p',
      size: 1,
      ...options,
    });
  }

  onStart(x, y, imageData, options) {
    super.onStart(x, y, imageData, options);
    const { color, width, height } = options;
    const brushPixels = this.getBrushPixels(x, y, width, height);
    return brushPixels.map(p => ({ x: p.x, y: p.y, ...color }));
  }

  onMove(x, y, imageData, options) {
    if (!this.isDrawing) return [];

    const { color, width, height } = options;

    // Interpolate from last position
    if (this.lastX !== -1 && this.lastY !== -1) {
      const linePixels = this.getLinePixels(this.lastX, this.lastY, x, y, width, height);
      this.lastX = x;
      this.lastY = y;
      return linePixels.map(p => ({ x: p.x, y: p.y, ...color }));
    }

    this.lastX = x;
    this.lastY = y;
    const brushPixels = this.getBrushPixels(x, y, width, height);
    return brushPixels.map(p => ({ x: p.x, y: p.y, ...color }));
  }

  getPreview(x, y, options) {
    const { color, width, height } = options;
    const brushPixels = this.getBrushPixels(x, y, width, height);
    return brushPixels.map(p => ({ x: p.x, y: p.y, ...color, preview: true }));
  }
}
