/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Fill (Bucket) Tool
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Flood fills contiguous regions with the selected tile.
 */

import BaseTool from './BaseTool.js';

export default class FillTool extends BaseTool {
  constructor(options = {}) {
    super({
      name: 'fill',
      icon: '🪣',
      cursor: 'crosshair',
      shortcut: 'g',
      ...options,
    });
    this.maxFillSize = options.maxFillSize || 10000;
    this.diagonal = options.diagonal ?? false;
  }

  onStart(x, y, mapData, options) {
    return this._fill(x, y, mapData, options);
  }

  onMove(x, y, mapData, options) {
    // Fill tool doesn't do anything on move
    return null;
  }

  onEnd(x, y, mapData, options) {
    return null;
  }

  getPreview(x, y, options) {
    // Fill preview shows just the target cell
    const { selectedTile } = options;
    return [{ x, y, tile: selectedTile }];
  }

  _fill(x, y, mapData, options) {
    const { selectedTile, layer = 0, mapWidth, mapHeight } = options;
    const cells = mapData.cells || mapData.layers?.[layer];

    if (!cells || !this.isInBounds(x, y, mapWidth, mapHeight)) {
      return null;
    }

    const targetTile = cells[y]?.[x];

    // Don't fill if target is same as selected
    if (targetTile === selectedTile) {
      return null;
    }

    const filled = [];
    const visited = new Set();
    const queue = [{ x, y }];

    while (queue.length > 0 && filled.length < this.maxFillSize) {
      const current = queue.shift();
      const key = `${current.x},${current.y}`;

      if (visited.has(key)) continue;
      if (!this.isInBounds(current.x, current.y, mapWidth, mapHeight)) continue;

      const currentTile = cells[current.y]?.[current.x];
      if (currentTile !== targetTile) continue;

      visited.add(key);
      filled.push({
        x: current.x,
        y: current.y,
        layer,
        tile: selectedTile,
      });

      // Add neighbors (4-directional by default)
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      // Add diagonals if enabled
      if (this.diagonal) {
        neighbors.push(
          { x: current.x + 1, y: current.y + 1 },
          { x: current.x + 1, y: current.y - 1 },
          { x: current.x - 1, y: current.y + 1 },
          { x: current.x - 1, y: current.y - 1 }
        );
      }

      for (const neighbor of neighbors) {
        const nKey = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(nKey)) {
          queue.push(neighbor);
        }
      }
    }

    return filled.length > 0 ? { cells: filled } : null;
  }
}
