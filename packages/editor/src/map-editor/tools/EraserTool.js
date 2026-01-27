/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Eraser Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Erases tiles from the map (sets them to empty/0).
 */

import BaseTool from './BaseTool.js';

export default class EraserTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'eraser',
      icon: '🧹',
      cursor: 'crosshair',
      shortcut: 'e',
      ...options,
    });
    this.emptyTile = options.emptyTile ?? 0;
    this.lastErasedCell = null;
  }

  onStart(x, y, mapData, options) {
    this.lastErasedCell = { x, y };
    return this._erase(x, y, mapData, options);
  }

  onMove(x, y, mapData, options) {
    if (this.lastErasedCell?.x === x && this.lastErasedCell?.y === y) {
      return null;
    }

    const changes = [];
    if (this.lastErasedCell) {
      const line = this._bresenhamLine(this.lastErasedCell.x, this.lastErasedCell.y, x, y);
      for (const point of line) {
        const result = this._erase(point.x, point.y, mapData, options);
        if (result) changes.push(...result.cells);
      }
    } else {
      const result = this._erase(x, y, mapData, options);
      if (result) changes.push(...result.cells);
    }

    this.lastErasedCell = { x, y };
    return changes.length > 0 ? { cells: changes } : null;
  }

  onEnd(x, y, mapData, options) {
    this.lastErasedCell = null;
    return null;
  }

  getPreview(x, y, options) {
    const { mapWidth = 16, mapHeight = 16 } = options;
    const cells = this.getBrushCells(x, y, mapWidth, mapHeight);
    return cells.map(c => ({ ...c, tile: this.emptyTile, isEraser: true }));
  }

  _erase(x, y, mapData, options) {
    const { layer = 0, mapWidth = 16, mapHeight = 16 } = options;
    const cells = this.getBrushCells(x, y, mapWidth, mapHeight);

    return {
      cells: cells.map(c => ({
        x: c.x,
        y: c.y,
        layer,
        tile: this.emptyTile,
      })),
    };
  }

  _bresenhamLine(x0, y0, x1, y1) {
    const points = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      points.push({ x, y });
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

    return points;
  }
}
