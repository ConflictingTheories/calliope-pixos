/*                                                 *\
** ----------------------------------------------- **
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import BinaryHeap from './BinaryHeap.js';

/**
 * Pathfinder - A* pathfinding implementation with path smoothing.
 * Provides efficient pathfinding with configurable heuristics and diagonal movement.
 */
export default class Pathfinder {
  /**
   * Creates an instance of Pathfinder.
   * @param {import('./zone.js').default} zone - The zone to pathfind in.
   */
  constructor(zone) {
    /** @type {import('./zone.js').default} */
    this.zone = zone;
    /** @type {number} */
    this.maxIterations = 10000;
  }

  /**
   * Finds a path from start to end using A* algorithm.
   * @param {number} startX - Start X coordinate.
   * @param {number} startY - Start Y coordinate.
   * @param {number} endX - End X coordinate.
   * @param {number} endY - End Y coordinate.
   * @param {Object} options - Pathfinding options.
   * @param {boolean} options.allowDiagonal - Allow diagonal movement (default: true).
   * @param {boolean} options.smoothPath - Apply path smoothing (default: true).
   * @param {number} options.maxIterations - Maximum iterations before giving up.
   * @returns {Array<Array<number>>|null} Path as array of [x, y, z] coordinates, or null if no path found.
   */
  findPath(startX, startY, endX, endY, options = {}) {
    const {
      allowDiagonal = true,
      smoothPath = true,
      maxIterations = this.maxIterations,
    } = options;

    // Convert world coordinates to grid coordinates
    const startGrid = this.worldToGrid(startX, startY);
    const endGrid = this.worldToGrid(endX, endY);

    if (!startGrid || !endGrid) {
      return null;
    }

    // If start and end are the same, return single point path
    if (startGrid[0] === endGrid[0] && startGrid[1] === endGrid[1]) {
      const z = this.zone.getHeight(startX, startY);
      return [[startX, startY, z]];
    }

    // A* algorithm
    const openSet = new BinaryHeap((a, b) => a.f - b.f);
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = `${startGrid[0]},${startGrid[1]}`;
    const endKey = `${endGrid[0]},${endGrid[1]}`;

    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(startGrid, endGrid, allowDiagonal));

    openSet.push({
      x: startGrid[0],
      y: startGrid[1],
      f: fScore.get(startKey),
    });

    let iterations = 0;

    while (!openSet.isEmpty() && iterations < maxIterations) {
      iterations++;

      const current = openSet.pop();
      const currentKey = `${current.x},${current.y}`;

      if (currentKey === endKey) {
        // Reconstruct path
        const path = this.reconstructPath(cameFrom, currentKey, startKey);
        if (smoothPath) {
          return this.smoothPath(path, allowDiagonal);
        }
        return path;
      }

      closedSet.add(currentKey);

      const neighbors = this.getNeighbors(current.x, current.y, allowDiagonal);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor[0]},${neighbor[1]}`;

        if (closedSet.has(neighborKey)) continue;

        if (!this.isWalkable(neighbor[0], neighbor[1])) continue;

        const tentativeG = (gScore.get(currentKey) || Infinity) + this.getCost(current, neighbor, allowDiagonal);

        if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeG);
          const f = tentativeG + this.heuristic(neighbor, endGrid, allowDiagonal);
          fScore.set(neighborKey, f);

          // Check if neighbor is already in open set
          const existing = openSet.heap.find(n => `${n.x},${n.y}` === neighborKey);
          if (existing) {
            existing.f = f;
            // Re-heapify (simplified - would need proper update in production)
            openSet.remove(existing);
            openSet.push({ x: neighbor[0], y: neighbor[1], f });
          } else {
            openSet.push({ x: neighbor[0], y: neighbor[1], f });
          }
        }
      }
    }

    // No path found
    return null;
  }

  /**
   * Calculates heuristic cost (estimated distance to goal).
   * Uses octile distance for 8-directional movement.
   * @param {Array<number>} a - Start point [x, y].
   * @param {Array<number>} b - End point [x, y].
   * @param {boolean} allowDiagonal - Whether diagonal movement is allowed.
   * @returns {number} Heuristic cost.
   */
  heuristic(a, b, allowDiagonal) {
    const dx = Math.abs(a[0] - b[0]);
    const dy = Math.abs(a[1] - b[1]);

    if (allowDiagonal) {
      // Octile distance for 8-directional movement
      return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
    } else {
      // Manhattan distance for 4-directional movement
      return dx + dy;
    }
  }

  /**
   * Gets movement cost between two nodes.
   * @param {Object} from - From node {x, y}.
   * @param {Array<number>} to - To node [x, y].
   * @param {boolean} allowDiagonal - Whether diagonal movement is allowed.
   * @returns {number} Movement cost.
   */
  getCost(from, to, allowDiagonal) {
    const dx = Math.abs(from.x - to[0]);
    const dy = Math.abs(from.y - to[1]);

    if (dx === 1 && dy === 1 && allowDiagonal) {
      // Diagonal movement costs more
      return Math.SQRT2;
    }
    return 1;
  }

  /**
   * Gets walkable neighbors of a grid cell.
   * @param {number} x - Grid X coordinate.
   * @param {number} y - Grid Y coordinate.
   * @param {boolean} allowDiagonal - Whether to include diagonal neighbors.
   * @returns {Array<Array<number>>} Array of [x, y] neighbor coordinates.
   */
  getNeighbors(x, y, allowDiagonal) {
    const neighbors = [
      [x, y - 1], // North
      [x + 1, y], // East
      [x, y + 1], // South
      [x - 1, y], // West
    ];

    if (allowDiagonal) {
      neighbors.push(
        [x + 1, y - 1], // Northeast
        [x + 1, y + 1], // Southeast
        [x - 1, y + 1], // Southwest
        [x - 1, y - 1]  // Northwest
      );
    }

    return neighbors;
  }

  /**
   * Checks if a grid cell is walkable.
   * @param {number} x - Grid X coordinate.
   * @param {number} y - Grid Y coordinate.
   * @returns {boolean} True if walkable.
   */
  isWalkable(x, y) {
    if (!this.zone || !this.zone.walkability) return false;

    const width = this.zone.size[0];
    const height = this.zone.size[1];

    if (x < 0 || x >= width || y < 0 || y >= height) {
      return false;
    }

    const index = y * width + x;
    const walkability = this.zone.walkability[index];

    // Check if any direction is walkable (walkability is a bitmask)
    return walkability !== undefined && walkability !== 0;
  }

  /**
   * Converts world coordinates to grid coordinates.
   * @param {number} worldX - World X coordinate.
   * @param {number} worldY - World Y coordinate.
   * @returns {Array<number>|null} Grid coordinates [x, y] or null if out of bounds.
   */
  worldToGrid(worldX, worldY) {
    if (!this.zone || !this.zone.bounds) return null;

    const gridX = Math.floor(worldX - this.zone.bounds[0]);
    const gridY = Math.floor(worldY - this.zone.bounds[1]);

    return [gridX, gridY];
  }

  /**
   * Converts grid coordinates to world coordinates.
   * @param {number} gridX - Grid X coordinate.
   * @param {number} gridY - Grid Y coordinate.
   * @returns {Array<number>|null} World coordinates [x, y, z] or null if out of bounds.
   */
  gridToWorld(gridX, gridY) {
    if (!this.zone || !this.zone.bounds) return null;

    const worldX = this.zone.bounds[0] + gridX + 0.5;
    const worldY = this.zone.bounds[1] + gridY + 0.5;
    const worldZ = this.zone.getHeight(worldX, worldY);

    return [worldX, worldY, worldZ];
  }

  /**
   * Reconstructs the path from the cameFrom map.
   * @param {Map} cameFrom - Map of node -> previous node.
   * @param {string} currentKey - Current node key.
   * @param {string} startKey - Start node key.
   * @returns {Array<Array<number>>} Path as array of [x, y, z] world coordinates.
   */
  reconstructPath(cameFrom, currentKey, startKey) {
    const path = [];
    let current = currentKey;

    while (current) {
      const [gridX, gridY] = current.split(',').map(Number);
      const worldPos = this.gridToWorld(gridX, gridY);
      if (worldPos) {
        path.unshift(worldPos);
      }

      if (current === startKey) break;
      current = cameFrom.get(current);
    }

    return path;
  }

  /**
   * Smooths a path by removing unnecessary waypoints.
   * Uses simple line-of-sight checks to remove intermediate points.
   * @param {Array<Array<number>>} path - Original path.
   * @param {boolean} allowDiagonal - Whether diagonal movement is allowed.
   * @returns {Array<Array<number>>} Smoothed path.
   */
  smoothPath(path, allowDiagonal) {
    if (path.length <= 2) return path;

    const smoothed = [path[0]];
    let currentIndex = 0;

    while (currentIndex < path.length - 1) {
      let farthestVisible = currentIndex + 1;

      // Try to find the farthest point we can see from current
      for (let i = path.length - 1; i > currentIndex; i--) {
        if (this.hasLineOfSight(path[currentIndex], path[i], allowDiagonal)) {
          farthestVisible = i;
          break;
        }
      }

      smoothed.push(path[farthestVisible]);
      currentIndex = farthestVisible;
    }

    return smoothed;
  }

  /**
   * Checks if there's a clear line of sight between two points.
   * @param {Array<number>} from - Start point [x, y, z].
   * @param {Array<number>} to - End point [x, y, z].
   * @param {boolean} allowDiagonal - Whether diagonal movement is allowed.
   * @returns {boolean} True if line of sight is clear.
   */
  hasLineOfSight(from, to, allowDiagonal) {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    if (steps === 0) return true;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = Math.floor(from[0] + dx * t);
      const y = Math.floor(from[1] + dy * t);

      if (!this.isWalkable(x, y)) {
        return false;
      }
    }

    return true;
  }
}
