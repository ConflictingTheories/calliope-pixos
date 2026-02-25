/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Rectangle Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Draws filled or outlined rectangles on the map.
 */

import BaseTool from './BaseTool.js';

export default class RectangleTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'rectangle',
      icon: '⬜',
      cursor: 'crosshair',
      shortcut: 'u',
      ...options,
    });
    this.startPoint = null;
    this.filled = options.filled ?? true;
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

    const result = this._drawRectangle(this.startPoint.x, this.startPoint.y, x, y, options);
    this.startPoint = null;
    return result;
  }

  getPreview(x, y, options) {
    if (!this.startPoint) {
      return [{ x, y, tile: options.selectedTile, isPreview: true }];
    }

    return this._getRectangleCells(this.startPoint.x, this.startPoint.y, x, y, options);
  }

  _drawRectangle(x1, y1, x2, y2, options) {
    const cells = this._getRectangleCells(x1, y1, x2, y2, options);
    return cells.length > 0 ? { cells } : null;
  }

  _getRectangleCells(x1, y1, x2, y2, options) {
    const { selectedTile, layer = 0, mapWidth = 16, mapHeight = 16 } = options;
    const cells = [];

    const minX = Math.max(0, Math.min(x1, x2));
    const maxX = Math.min(mapWidth - 1, Math.max(x1, x2));
    const minY = Math.max(0, Math.min(y1, y2));
    const maxY = Math.min(mapHeight - 1, Math.max(y1, y2));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (this.filled || x === minX || x === maxX || y === minY || y === maxY) {
          cells.push({ x, y, layer, tile: selectedTile });
        }
      }
    }

    return cells;
  }

  /**
   * Toggle between filled and outline mode
   */
  toggleFilled() {
    this.filled = !this.filled;
  }

  /**
   * Set filled mode
   * @param {boolean} filled - Whether to draw filled rectangles
   */
  setFilled(filled) {
    this.filled = filled;
  }
}
