/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Ellipse Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Draws ellipses/circles (filled or outline).
 */

import BaseTool from './BaseTool.js';

export default class EllipseTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'ellipse',
      icon: '⭕',
      cursor: 'crosshair',
      shortcut: 'o',
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

    const pixels = this._getEllipsePixels(this.startPoint.x, this.startPoint.y, x, y, options);
    this.startPoint = null;
    super.onEnd(x, y, imageData, options);

    return pixels;
  }

  _getEllipsePixels(x1, y1, x2, y2, options) {
    const { color, width, height } = options;
    const pixels = [];

    // Calculate ellipse parameters
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;

    if (radiusX === 0 || radiusY === 0) {
      return [];
    }

    if (this.filled) {
      // Filled ellipse - scan each row
      for (let y = Math.floor(centerY - radiusY); y <= Math.ceil(centerY + radiusY); y++) {
        if (y < 0 || y >= height) continue;

        // Calculate x range for this y
        const dy = y - centerY;
        const term = 1 - (dy * dy) / (radiusY * radiusY);
        if (term < 0) continue;

        const xRange = radiusX * Math.sqrt(term);
        const startX = Math.max(0, Math.floor(centerX - xRange));
        const endX = Math.min(width - 1, Math.ceil(centerX + xRange));

        for (let x = startX; x <= endX; x++) {
          pixels.push({ x, y, ...color });
        }
      }
    } else {
      // Outline using midpoint ellipse algorithm
      this._midpointEllipse(centerX, centerY, radiusX, radiusY, (x, y) => {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          if (!pixels.find(p => p.x === x && p.y === y)) {
            pixels.push({ x, y, ...color });
          }
        }
      });
    }

    return pixels;
  }

  _midpointEllipse(cx, cy, rx, ry, plotPixel) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    rx = Math.round(rx);
    ry = Math.round(ry);

    let x = 0;
    let y = ry;

    // Region 1
    let d1 = ry * ry - rx * rx * ry + 0.25 * rx * rx;
    let dx = 2 * ry * ry * x;
    let dy = 2 * rx * rx * y;

    while (dx < dy) {
      plotPixel(cx + x, cy + y);
      plotPixel(cx - x, cy + y);
      plotPixel(cx + x, cy - y);
      plotPixel(cx - x, cy - y);

      if (d1 < 0) {
        x++;
        dx += 2 * ry * ry;
        d1 += dx + ry * ry;
      } else {
        x++;
        y--;
        dx += 2 * ry * ry;
        dy -= 2 * rx * rx;
        d1 += dx - dy + ry * ry;
      }
    }

    // Region 2
    let d2 = ry * ry * (x + 0.5) * (x + 0.5) + rx * rx * (y - 1) * (y - 1) - rx * rx * ry * ry;

    while (y >= 0) {
      plotPixel(cx + x, cy + y);
      plotPixel(cx - x, cy + y);
      plotPixel(cx + x, cy - y);
      plotPixel(cx - x, cy - y);

      if (d2 > 0) {
        y--;
        dy -= 2 * rx * rx;
        d2 += rx * rx - dy;
      } else {
        y--;
        x++;
        dx += 2 * ry * ry;
        dy -= 2 * rx * rx;
        d2 += dx - dy + rx * rx;
      }
    }
  }

  getPreview(x, y, options) {
    if (!this.startPoint) {
      const { color } = options;
      return [{ x, y, ...color, preview: true }];
    }

    return this._getEllipsePixels(this.startPoint.x, this.startPoint.y, x, y, options).map(p => ({
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
