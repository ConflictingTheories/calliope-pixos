/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Brush Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Variable-size brush with soft edges option.
 */

import BaseTool from './BaseTool.js';

export default class BrushTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'brush',
      icon: '🖌️',
      cursor: 'crosshair',
      shortcut: 'b',
      size: 3,
      ...options,
    });
    this.softEdge = options.softEdge ?? false;
    this.opacity = options.opacity ?? 1;
  }

  onStart(x, y, imageData, options) {
    super.onStart(x, y, imageData, options);
    return this._paint(x, y, options);
  }

  onMove(x, y, imageData, options) {
    if (!this.isDrawing) return [];
    
    const { width, height } = options;
    const allPixels = [];
    
    if (this.lastX !== -1 && this.lastY !== -1) {
      const linePixels = this.getLinePixels(this.lastX, this.lastY, x, y, width, height);
      for (const p of linePixels) {
        allPixels.push(...this._getBrushPixelsWithColor(p.x, p.y, options));
      }
    } else {
      allPixels.push(...this._paint(x, y, options));
    }
    
    this.lastX = x;
    this.lastY = y;
    return allPixels;
  }

  _paint(x, y, options) {
    return this._getBrushPixelsWithColor(x, y, options);
  }

  _getBrushPixelsWithColor(centerX, centerY, options) {
    const { color, width, height } = options;
    const pixels = [];
    const radius = Math.floor(this.size / 2);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius + 0.5) {
          let alpha = color.a;
          
          // Soft edge falloff
          if (this.softEdge && radius > 0) {
            const falloff = 1 - (dist / (radius + 0.5));
            alpha = Math.round(color.a * falloff * this.opacity);
          } else {
            alpha = Math.round(color.a * this.opacity);
          }
          
          pixels.push({ x, y, r: color.r, g: color.g, b: color.b, a: alpha });
        }
      }
    }

    return pixels;
  }

  getPreview(x, y, options) {
    return this._getBrushPixelsWithColor(x, y, options).map(p => ({ ...p, preview: true }));
  }

  setSoftEdge(enabled) {
    this.softEdge = enabled;
  }

  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }
}
