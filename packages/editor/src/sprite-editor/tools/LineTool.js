/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Line Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Draws straight lines between two points.
 */

import BaseTool from './BaseTool.js';

export default class LineTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'line',
      icon: '📏',
      cursor: 'crosshair',
      shortcut: 'l',
      ...options,
    });
    this.startPoint = null;
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

    const { color, width, height } = options;
    const linePixels = this.getLinePixels(
      this.startPoint.x,
      this.startPoint.y,
      x,
      y,
      width,
      height
    );

    this.startPoint = null;
    super.onEnd(x, y, imageData, options);

    return linePixels.map(p => ({ x: p.x, y: p.y, ...color }));
  }

  getPreview(x, y, options) {
    if (!this.startPoint) {
      const { color, width, height } = options;
      const brushPixels = this.getBrushPixels(x, y, width, height);
      return brushPixels.map(p => ({ x: p.x, y: p.y, ...color, preview: true }));
    }

    const { color, width, height } = options;
    const linePixels = this.getLinePixels(
      this.startPoint.x,
      this.startPoint.y,
      x,
      y,
      width,
      height
    );
    return linePixels.map(p => ({ x: p.x, y: p.y, ...color, preview: true }));
  }
}
