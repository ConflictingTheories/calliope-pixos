/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Line Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Draws straight lines between two points using Bresenham's algorithm.
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
    this.startPoint = { x, y };
    return null;
  }

  onMove() {
    return null;
  }

  onEnd(x, y, mapData, options) {
    if (!this.startPoint) return null;

    const result = this._drawLine(this.startPoint.x, this.startPoint.y, x, y, options);
    this.startPoint = null;
    return result;
  }

  getPreview(x, y, options) {
    if (!this.startPoint) {
      return [{ x, y, tile: options.selectedTile, isPreview: true }];
    }

    return this._getLineCells(this.startPoint.x, this.startPoint.y, x, y, options);
  }

  _drawLine(x1, y1, x2, y2, options) {
    const cells = this._getLineCells(x1, y1, x2, y2, options);
    return cells.length > 0 ? { cells } : null;
  }

  _getLineCells(x0, y0, x1, y1, options) {
    const { selectedTile, layer = 0, mapWidth = 16, mapHeight = 16 } = options;
    const cells = [];

    // Bresenham's line algorithm
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      // Check bounds and add cell
      if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
        // Apply brush size
        const brushCells = this.getBrushCells(x, y, mapWidth, mapHeight);
        for (const bc of brushCells) {
          // Avoid duplicates
          if (!cells.find(c => c.x === bc.x && c.y === bc.y)) {
            cells.push({ x: bc.x, y: bc.y, layer, tile: selectedTile });
          }
        }
      }

      if (x === x1 && y === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return cells;
  }
}
