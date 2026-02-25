/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Selection Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Selects rectangular regions for copy/paste/move operations.
 */

import BaseTool from './BaseTool.js';

export default class SelectionTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'selection',
      icon: '⬚',
      cursor: 'crosshair',
      shortcut: 'm',
      ...options,
    });
    this.startPoint = null;
    this.selection = null;
    this.clipboard = null;
  }

  onStart(x, y) {
    this.isDrawing = true;
    this.startPoint = { x, y };
    this.selection = null;
    return [];
  }

  onMove() {
    return [];
  }

  onEnd(x, y) {
    if (this.startPoint) {
      const minX = Math.min(this.startPoint.x, x);
      const maxX = Math.max(this.startPoint.x, x);
      const minY = Math.min(this.startPoint.y, y);
      const maxY = Math.max(this.startPoint.y, y);

      this.selection = {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      };
    }

    this.startPoint = null;
    this.isDrawing = false;
    return [];
  }

  getPreview(x, y, options) {
    const previewPixels = [];

    if (this.startPoint) {
      const minX = Math.min(this.startPoint.x, x);
      const maxX = Math.max(this.startPoint.x, x);
      const minY = Math.min(this.startPoint.y, y);
      const maxY = Math.max(this.startPoint.y, y);

      // Draw selection border
      for (let px = minX; px <= maxX; px++) {
        previewPixels.push({ x: px, y: minY, selection: true, preview: true });
        previewPixels.push({ x: px, y: maxY, selection: true, preview: true });
      }
      for (let py = minY; py <= maxY; py++) {
        previewPixels.push({ x: minX, y: py, selection: true, preview: true });
        previewPixels.push({ x: maxX, y: py, selection: true, preview: true });
      }
    } else if (this.selection) {
      // Show current selection
      const { x: sx, y: sy, width, height } = this.selection;
      for (let px = sx; px < sx + width; px++) {
        previewPixels.push({ x: px, y: sy, selection: true, preview: true });
        previewPixels.push({ x: px, y: sy + height - 1, selection: true, preview: true });
      }
      for (let py = sy; py < sy + height; py++) {
        previewPixels.push({ x: sx, y: py, selection: true, preview: true });
        previewPixels.push({ x: sx + width - 1, y: py, selection: true, preview: true });
      }
    }

    return previewPixels;
  }

  /**
   * Get current selection bounds
   */
  getSelection() {
    return this.selection;
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selection = null;
    this.startPoint = null;
  }

  /**
   * Copy selected region from image data
   */
  copy(imageData) {
    if (!this.selection) return null;

    const { x, y, width, height } = this.selection;
    const pixels = [];

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const color = this.getPixelColor(imageData, x + px, y + py);
        pixels.push(color);
      }
    }

    this.clipboard = {
      width,
      height,
      pixels,
    };

    return this.clipboard;
  }

  /**
   * Paste clipboard at position
   */
  paste(targetX, targetY, options) {
    if (!this.clipboard) return [];

    const { width: canvasWidth, height: canvasHeight } = options;
    const changes = [];

    for (let py = 0; py < this.clipboard.height; py++) {
      for (let px = 0; px < this.clipboard.width; px++) {
        const x = targetX + px;
        const y = targetY + py;

        if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
          const color = this.clipboard.pixels[py * this.clipboard.width + px];
          if (color.a > 0) {
            // Only paste non-transparent pixels
            changes.push({ x, y, ...color });
          }
        }
      }
    }

    return changes;
  }

  /**
   * Cut selected region (copy then clear)
   */
  cut(imageData, options) {
    const copied = this.copy(imageData);
    if (!copied) return [];

    // Return pixels to clear
    const { x, y, width, height } = this.selection;
    const clearPixels = [];

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        clearPixels.push({ x: x + px, y: y + py, r: 0, g: 0, b: 0, a: 0 });
      }
    }

    return clearPixels;
  }

  /**
   * Delete selected region
   */
  deleteSelection() {
    if (!this.selection) return [];

    const { x, y, width, height } = this.selection;
    const clearPixels = [];

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        clearPixels.push({ x: x + px, y: y + py, r: 0, g: 0, b: 0, a: 0 });
      }
    }

    return clearPixels;
  }

  /**
   * Fill selection with color
   */
  fillSelection(color) {
    if (!this.selection) return [];

    const { x, y, width, height } = this.selection;
    const pixels = [];

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        pixels.push({ x: x + px, y: y + py, ...color });
      }
    }

    return pixels;
  }

  /**
   * Check if clipboard has content
   */
  hasClipboard() {
    return !!this.clipboard;
  }
}
