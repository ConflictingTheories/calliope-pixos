/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Fill (Bucket) Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Flood fills contiguous regions with color.
 */

import BaseTool from './BaseTool.js';

export default class FillTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'fill',
      icon: '🪣',
      cursor: 'crosshair',
      shortcut: 'g',
      ...options,
    });
    this.tolerance = options.tolerance ?? 0;
    this.contiguous = options.contiguous ?? true;
    this.maxPixels = options.maxPixels ?? 100000;
  }

  onStart(x, y, imageData, options) {
    super.onStart(x, y, imageData, options);
    return this._fill(x, y, imageData, options);
  }

  onMove() {
    return [];
  }

  onEnd() {
    super.onEnd();
    return [];
  }

  _fill(x, y, imageData, options) {
    const { color, width, height } = options;
    
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return [];
    }

    const targetColor = this.getPixelColor(imageData, x, y);
    
    // Don't fill if target color matches fill color
    if (this.colorsMatch(targetColor, color, 0)) {
      return [];
    }

    if (this.contiguous) {
      return this._floodFill(x, y, imageData, targetColor, color, width, height);
    } else {
      return this._globalFill(imageData, targetColor, color, width, height);
    }
  }

  _floodFill(startX, startY, imageData, targetColor, fillColor, width, height) {
    const pixels = [];
    const visited = new Set();
    const queue = [{ x: startX, y: startY }];

    while (queue.length > 0 && pixels.length < this.maxPixels) {
      const { x, y } = queue.shift();
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const currentColor = this.getPixelColor(imageData, x, y);
      if (!this.colorsMatch(currentColor, targetColor, this.tolerance)) continue;

      visited.add(key);
      pixels.push({ x, y, ...fillColor });

      // Add neighbors
      queue.push({ x: x + 1, y });
      queue.push({ x: x - 1, y });
      queue.push({ x, y: y + 1 });
      queue.push({ x, y: y - 1 });
    }

    return pixels;
  }

  _globalFill(imageData, targetColor, fillColor, width, height) {
    const pixels = [];

    for (let y = 0; y < height && pixels.length < this.maxPixels; y++) {
      for (let x = 0; x < width && pixels.length < this.maxPixels; x++) {
        const currentColor = this.getPixelColor(imageData, x, y);
        if (this.colorsMatch(currentColor, targetColor, this.tolerance)) {
          pixels.push({ x, y, ...fillColor });
        }
      }
    }

    return pixels;
  }

  getPreview(x, y, options) {
    const { color } = options;
    return [{ x, y, ...color, preview: true }];
  }

  setTolerance(tolerance) {
    this.tolerance = Math.max(0, Math.min(255, tolerance));
  }

  setContiguous(contiguous) {
    this.contiguous = contiguous;
  }
}
