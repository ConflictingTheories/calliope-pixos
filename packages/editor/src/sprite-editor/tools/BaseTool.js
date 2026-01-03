/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Sprite Base Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Abstract base class for sprite editing tools.
 * Unlike map tools, sprite tools work on pixel data.
 */

/**
 * Base class for sprite editing tools
 */
export default class BaseTool {
  constructor(options = {}) {
    this.name = options.name || 'base';
    this.icon = options.icon || '🔧';
    this.cursor = options.cursor || 'crosshair';
    this.shortcut = options.shortcut || null;
    this.active = false;
    this.size = options.size || 1;
    
    // Current drawing state
    this.isDrawing = false;
    this.lastX = -1;
    this.lastY = -1;
    
    // For preview
    this.previewPixels = [];
  }

  /**
   * Called when the tool becomes active
   * @param {Object} context - Editor context (canvas, imageData, etc.)
   */
  activate(context) {
    this.active = true;
    this.context = context;
  }

  /**
   * Called when the tool becomes inactive
   */
  deactivate() {
    this.active = false;
    this.previewPixels = [];
    this.context = null;
  }

  /**
   * Handle mouse/touch down event
   * @param {number} x - Pixel X coordinate
   * @param {number} y - Pixel Y coordinate
   * @param {ImageData} imageData - Current image data
   * @param {Object} options - Options (color, etc.)
   * @returns {Array<{x, y, r, g, b, a}>} Pixels to change
   */
  onStart(x, y, imageData, options) {
    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;
    return [];
  }

  /**
   * Handle mouse/touch move event (while pressed)
   */
  onMove(x, y, imageData, options) {
    return [];
  }

  /**
   * Handle mouse/touch up event
   */
  onEnd(x, y, imageData, options) {
    this.isDrawing = false;
    this.lastX = -1;
    this.lastY = -1;
    return [];
  }

  /**
   * Get preview pixels for cursor position
   */
  getPreview(x, y, options) {
    return this.previewPixels;
  }

  /**
   * Set tool size (brush size, etc.)
   * @param {number} size
   */
  setSize(size) {
    this.size = Math.max(1, Math.min(64, size));
  }

  /**
   * Get pixels within brush radius at position
   */
  getBrushPixels(centerX, centerY, width, height) {
    const pixels = [];
    const radius = Math.floor(this.size / 2);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        // Circular brush
        if (this.size > 1) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= radius + 0.5) {
            pixels.push({ x, y });
          }
        } else {
          pixels.push({ x, y });
        }
      }
    }

    return pixels;
  }

  /**
   * Bresenham's line algorithm
   */
  getLinePixels(x0, y0, x1, y1, width, height) {
    const pixels = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      const brushPixels = this.getBrushPixels(x, y, width, height);
      for (const p of brushPixels) {
        if (!pixels.find(ep => ep.x === p.x && ep.y === p.y)) {
          pixels.push(p);
        }
      }

      if (x === x1 && y === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }

    return pixels;
  }

  /**
   * Get pixel color from image data
   */
  getPixelColor(imageData, x, y) {
    const idx = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[idx],
      g: imageData.data[idx + 1],
      b: imageData.data[idx + 2],
      a: imageData.data[idx + 3],
    };
  }

  /**
   * Check if two colors match (with tolerance)
   */
  colorsMatch(c1, c2, tolerance = 0) {
    return Math.abs(c1.r - c2.r) <= tolerance &&
           Math.abs(c1.g - c2.g) <= tolerance &&
           Math.abs(c1.b - c2.b) <= tolerance &&
           Math.abs(c1.a - c2.a) <= tolerance;
  }
}
