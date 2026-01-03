/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Brush Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Paints tiles onto the map with configurable brush size.
 */

import BaseTool from './BaseTool.js';

export default class BrushTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'brush',
      icon: '🖌️',
      cursor: 'crosshair',
      shortcut: 'b',
      ...options,
    });
    this.lastPaintedCell = null;
  }

  onStart(x, y, mapData, options) {
    this.lastPaintedCell = { x, y };
    return this._paint(x, y, mapData, options);
  }

  onMove(x, y, mapData, options) {
    // Prevent duplicate paints on same cell
    if (this.lastPaintedCell?.x === x && this.lastPaintedCell?.y === y) {
      return null;
    }
    
    // Interpolate between last and current position for smooth lines
    const changes = [];
    if (this.lastPaintedCell) {
      const line = this._bresenhamLine(
        this.lastPaintedCell.x,
        this.lastPaintedCell.y,
        x,
        y
      );
      for (const point of line) {
        const result = this._paint(point.x, point.y, mapData, options);
        if (result) changes.push(...result.cells);
      }
    } else {
      const result = this._paint(x, y, mapData, options);
      if (result) changes.push(...result.cells);
    }
    
    this.lastPaintedCell = { x, y };
    return changes.length > 0 ? { cells: changes } : null;
  }

  onEnd(x, y, mapData, options) {
    this.lastPaintedCell = null;
    return null;
  }

  getPreview(x, y, options) {
    const { selectedTile, mapWidth = 16, mapHeight = 16 } = options;
    const cells = this.getBrushCells(x, y, mapWidth, mapHeight);
    return cells.map(c => ({ ...c, tile: selectedTile }));
  }

  _paint(x, y, mapData, options) {
    const { selectedTile, layer = 0, mapWidth = 16, mapHeight = 16 } = options;
    const cells = this.getBrushCells(x, y, mapWidth, mapHeight);
    
    return {
      cells: cells.map(c => ({
        x: c.x,
        y: c.y,
        layer,
        tile: selectedTile,
      })),
    };
  }

  /**
   * Bresenham's line algorithm for smooth brush strokes
   */
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
