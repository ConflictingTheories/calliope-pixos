/*                                                 *\
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

/**
 * SpatialHash - Broad-phase collision detection using spatial hashing.
 * Divides space into cells to quickly find potential collision pairs.
 * Reduces collision checks from O(n²) to O(n) for most cases.
 */
export default class SpatialHash {
  /**
   * Creates an instance of SpatialHash.
   * @param {number} cellSize - Size of each cell in world units (default: 32).
   */
  constructor(cellSize = 32) {
    /** @type {number} */
    this.cellSize = cellSize;
    /** @type {Map<string, Set<Object>>} */
    this.cells = new Map();
  }

  /**
   * Gets the cell key for a given position.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {string} Cell key.
   */
  getCellKey(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Gets cell keys that an AABB overlaps.
   * @param {Object} aabb - AABB with min/max vectors.
   * @returns {Array<string>} Array of cell keys.
   */
  getCellKeysForAABB(aabb) {
    if (!aabb || !aabb.min || !aabb.max) return [];

    const minX = Math.floor(aabb.min.x / this.cellSize);
    const maxX = Math.floor(aabb.max.x / this.cellSize);
    const minY = Math.floor(aabb.min.y / this.cellSize);
    const maxY = Math.floor(aabb.max.y / this.cellSize);

    const keys = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        keys.push(`${x},${y}`);
      }
    }
    return keys;
  }

  /**
   * Inserts a body into the spatial hash.
   * @param {Object} body - Physics body with getAABB() method.
   */
  insert(body) {
    if (!body || !body.getAABB) return;

    const aabb = body.getAABB();
    if (!aabb) return;

    const cellKeys = this.getCellKeysForAABB(aabb);
    for (const key of cellKeys) {
      if (!this.cells.has(key)) {
        this.cells.set(key, new Set());
      }
      this.cells.get(key).add(body);
    }
  }

  /**
   * Removes a body from the spatial hash.
   * @param {Object} body - Physics body to remove.
   */
  remove(body) {
    for (const cell of this.cells.values()) {
      cell.delete(body);
    }
  }

  /**
   * Clears all bodies from the spatial hash.
   */
  clear() {
    this.cells.clear();
  }

  /**
   * Gets potential collision pairs for a given body.
   * @param {Object} body - Physics body to check.
   * @returns {Set<Object>} Set of potential collision bodies.
   */
  getPotentialCollisions(body) {
    if (!body || !body.getAABB) return new Set();

    const aabb = body.getAABB();
    if (!aabb) return new Set();

    const candidates = new Set();
    const cellKeys = this.getCellKeysForAABB(aabb);

    for (const key of cellKeys) {
      const cell = this.cells.get(key);
      if (cell) {
        for (const other of cell) {
          if (other !== body) {
            candidates.add(other);
          }
        }
      }
    }

    return candidates;
  }

  /**
   * Gets all potential collision pairs in the hash.
   * @returns {Array<Array<Object>>} Array of [body1, body2] pairs.
   */
  getAllPotentialCollisions() {
    const pairs = [];
    const processed = new Set();

    for (const cell of this.cells.values()) {
      const bodies = Array.from(cell);
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const body1 = bodies[i];
          const body2 = bodies[j];
          const pairKey = `${body1.id || body1}-${body2.id || body2}`;
          
          if (!processed.has(pairKey)) {
            processed.add(pairKey);
            pairs.push([body1, body2]);
          }
        }
      }
    }

    return pairs;
  }
}
