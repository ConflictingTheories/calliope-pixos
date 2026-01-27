/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Eyedropper Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Picks a tile from the map to use as the current selection.
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
    this.onTilePicked = options.onTilePicked || null;
  }

  onStart(x, y, mapData, options) {
    return this._pick(x, y, mapData, options);
  }

  onMove() {
    return null;
  }

  onEnd() {
    return null;
  }

  getPreview(x, y) {
    return [{ x, y, tile: null, isEyedropper: true }];
  }

  _pick(x, y, mapData, options) {
    const { layer = 0 } = options;
    const cells = mapData.cells || mapData.layers?.[layer];

    if (!cells) return null;

    const tile = cells[y]?.[x];

    if (tile !== undefined && this.onTilePicked) {
      this.onTilePicked(tile);
    }

    // Return the picked tile info for the editor to handle
    return { pickedTile: tile };
  }

  /**
   * Set the callback for when a tile is picked
   * @param {Function} callback - Callback receiving the picked tile
   */
  setOnTilePicked(callback) {
    this.onTilePicked = callback;
  }
}
