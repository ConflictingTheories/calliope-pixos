/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Rectangle Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Draws rectangles (filled or outline).
 */

import BaseTool from './BaseTool.js';

export default class RectangleTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'rectangle',
      icon: '⬜',
      cursor: 'crosshair',
      shortcut: 'u',
      ...options,
    });
    this.startPoint = null;
    this.filled = options.filled ?? true;
  }

  onStart(x, y) {
    this.isDrawing = true;
    this.startPoint = { x, y };
    return [];
  }

  onMove() {
    return [];
  }

  onEnd(x, y, imageData, options) {
    if (!this.startPoint) {
      return super.onEnd(x, y, imageData, options);
    }

    const pixels = this._getRectanglePixels(this.startPoint.x, this.startPoint.y, x, y, options);
    this.startPoint = null;
    super.onEnd(x, y, imageData, options);

    return pixels;
  }

  _getRectanglePixels(x1, y1, x2, y2, options) {
    const { color, width, height } = options;
    const pixels = [];

    const minX = Math.max(0, Math.min(x1, x2));
    const maxX = Math.min(width - 1, Math.max(x1, x2));
    const minY = Math.max(0, Math.min(y1, y2));
    const maxY = Math.min(height - 1, Math.max(y1, y2));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (this.filled || x === minX || x === maxX || y === minY || y === maxY) {
          pixels.push({ x, y, ...color });
        }
      }
    }

    return pixels;
  }

  getPreview(x, y, options) {
    if (!this.startPoint) {
      const { color } = options;
      return [{ x, y, ...color, preview: true }];
    }

    return this._getRectanglePixels(this.startPoint.x, this.startPoint.y, x, y, options).map(p => ({
      ...p,
      preview: true,
    }));
  }

  toggleFilled() {
    this.filled = !this.filled;
  }

  setFilled(filled) {
    this.filled = filled;
  }
}
