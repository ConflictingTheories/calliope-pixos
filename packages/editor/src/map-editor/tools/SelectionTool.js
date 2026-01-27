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
    this.endPoint = null;
    this.selection = null;
    this.clipboard = null;
  }

  onStart(x, y, mapData, options) {
    this.startPoint = { x, y };
    this.endPoint = { x, y };
    this.updateSelection();
    return null; // Selection doesn't modify tiles directly
  }

  onMove(x, y, mapData, options) {
    if (this.startPoint) {
      this.endPoint = { x, y };
      this.updateSelection();
    }
    return null;
  }

  onEnd(x, y, mapData, options) {
    this.endPoint = { x, y };
    this.updateSelection();
    return null;
  }

  getPreview(x, y, options) {
    if (!this.selection) {
      return [{ x, y, tile: null, isSelection: true }];
    }

    const preview = [];
    for (let py = this.selection.y; py < this.selection.y + this.selection.height; py++) {
      for (let px = this.selection.x; px < this.selection.x + this.selection.width; px++) {
        preview.push({ x: px, y: py, tile: null, isSelection: true });
      }
    }
    return preview;
  }

  updateSelection() {
    if (!this.startPoint || !this.endPoint) {
      this.selection = null;
      return;
    }

    const x = Math.min(this.startPoint.x, this.endPoint.x);
    const y = Math.min(this.startPoint.y, this.endPoint.y);
    const width = Math.abs(this.endPoint.x - this.startPoint.x) + 1;
    const height = Math.abs(this.endPoint.y - this.startPoint.y) + 1;

    this.selection = { x, y, width, height };
  }

  /**
   * Get the current selection bounds
   * @returns {{x: number, y: number, width: number, height: number}|null}
   */
  getSelection() {
    return this.selection;
  }

  /**
   * Copy the selected region from map data
   * @param {Object} mapData - Map data
   * @param {Object} options - Options including layer
   * @returns {Object|null} Copied data
   */
  copy(mapData, options) {
    if (!this.selection) return null;

    const { layer = 0 } = options;
    const cells = mapData.cells || mapData.layers?.[layer];
    if (!cells) return null;

    const copied = [];
    for (let y = 0; y < this.selection.height; y++) {
      const row = [];
      for (let x = 0; x < this.selection.width; x++) {
        const mapY = this.selection.y + y;
        const mapX = this.selection.x + x;
        row.push(cells[mapY]?.[mapX] ?? 0);
      }
      copied.push(row);
    }

    this.clipboard = {
      width: this.selection.width,
      height: this.selection.height,
      tiles: copied,
    };

    return this.clipboard;
  }

  /**
   * Paste clipboard data at position
   * @param {number} x - Target X position
   * @param {number} y - Target Y position
   * @param {Object} options - Options including layer
   * @returns {Object|null} Changes to apply
   */
  paste(x, y, options) {
    if (!this.clipboard) return null;

    const { layer = 0, mapWidth, mapHeight } = options;
    const changes = [];

    for (let py = 0; py < this.clipboard.height; py++) {
      for (let px = 0; px < this.clipboard.width; px++) {
        const targetX = x + px;
        const targetY = y + py;

        if (this.isInBounds(targetX, targetY, mapWidth, mapHeight)) {
          changes.push({
            x: targetX,
            y: targetY,
            layer,
            tile: this.clipboard.tiles[py][px],
          });
        }
      }
    }

    return changes.length > 0 ? { cells: changes } : null;
  }

  /**
   * Clear the current selection
   */
  clearSelection() {
    this.startPoint = null;
    this.endPoint = null;
    this.selection = null;
  }

  /**
   * Fill selection with a tile
   * @param {any} tile - Tile to fill with
   * @param {Object} options - Options including layer
   * @returns {Object|null} Changes to apply
   */
  fillSelection(tile, options) {
    if (!this.selection) return null;

    const { layer = 0 } = options;
    const changes = [];

    for (let y = 0; y < this.selection.height; y++) {
      for (let x = 0; x < this.selection.width; x++) {
        changes.push({
          x: this.selection.x + x,
          y: this.selection.y + y,
          layer,
          tile,
        });
      }
    }

    return changes.length > 0 ? { cells: changes } : null;
  }

  /**
   * Delete (clear) selected region
   * @param {Object} options - Options including layer and emptyTile
   * @returns {Object|null} Changes to apply
   */
  deleteSelection(options) {
    const emptyTile = options.emptyTile ?? 0;
    return this.fillSelection(emptyTile, options);
  }
}
