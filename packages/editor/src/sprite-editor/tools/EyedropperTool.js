/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Eyedropper Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Picks color from the canvas.
 */

import BaseTool from './BaseTool.js';

export default class EyedropperTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'eyedropper',
      icon: '💧',
      cursor: 'crosshair',
      shortcut: 'i',
      ...options,
    });
    this.onColorPicked = options.onColorPicked || null;
  }

  onStart(x, y, imageData, options) {
    super.onStart(x, y, imageData, options);
    return this._pick(x, y, imageData, options);
  }

  onMove(x, y, imageData, options) {
    if (this.isDrawing) {
      return this._pick(x, y, imageData, options);
    }
    return [];
  }

  _pick(x, y, imageData, options) {
    const { width, height } = options;

    if (x < 0 || x >= width || y < 0 || y >= height) {
      return [];
    }

    const color = this.getPixelColor(imageData, x, y);

    if (this.onColorPicked) {
      this.onColorPicked(color);
    }

    // Return picked color info (no pixel changes)
    return [{ pickedColor: color }];
  }

  getPreview(x, y, options) {
    return [{ x, y, preview: true, eyedropper: true }];
  }

  setOnColorPicked(callback) {
    this.onColorPicked = callback;
  }
}
