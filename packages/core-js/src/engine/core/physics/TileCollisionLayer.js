/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { Vector } from '../../utils/math/vector.js';
import { AABB } from '../../utils/math/collision.js';
import SpatialHash from './SpatialHash.js';

/**
 * TileCollisionLayer - Tile-based collision data for maps.
 * Enables efficient collision with tilemap collision layers.
 */
export default class TileCollisionLayer {
  /**
   * Creates a tile collision layer.
   * @param {number} tileWidth - Width of each tile in pixels
   * @param {number} tileHeight - Height of each tile in pixels
   * @param {number} width - Map width in tiles
   * @param {number} height - Map height in tiles
   */
  constructor(tileWidth, tileHeight, width, height) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.width = width;
    this.height = height;

    // Collision data: 0 = no collision, 1+ = collision type/layer
    this.collisionData = new Uint8Array(width * height);

    // Tile collision shape data (for more complex shapes)
    // Format: [x_offset, y_offset, width, height, ...] per tile
    this.tileShapes = new Map();

    // Spatial hash for quick queries
    this.spatialHash = new SpatialHash(tileWidth * 2);

    // Collision layer and mask (for interaction with physics bodies)
    this.collisionLayer = 8; // Typically separate from entity layers
    this.collisionMask = 0xffff;
  }

  /**
   * Sets collision data for a tile.
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {number} collisionType - Collision type (0 = none, 1+ = solid)
   */
  setTile(x, y, collisionType = 0) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.collisionData[y * this.width + x] = collisionType;
  }

  /**
   * Gets collision data for a tile.
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {number} Collision type
   */
  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 1; // Treat out of bounds as solid
    }
    return this.collisionData[y * this.width + x];
  }

  /**
   * Sets a custom collision shape for a tile.
   * Useful for diagonal, sloped, or partial collisions.
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {Array<number>} shape - Array of [x, y, width, height] offsets from tile origin
   */
  setTileShape(x, y, shape) {
    const key = `${x},${y}`;
    if (shape && shape.length > 0) {
      this.tileShapes.set(key, shape);
    } else {
      this.tileShapes.delete(key);
    }
  }

  /**
   * Gets collision shape for a tile.
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {Array<number>|null} Shape data or null for full tile collision
   */
  getTileShape(x, y) {
    const key = `${x},${y}`;
    return this.tileShapes.get(key) || null;
  }

  /**
   * Gets all collision boxes that intersect with an AABB.
   * @param {AABB} aabb - Test AABB
   * @returns {Array<Object>} Array of {x, y, aabb} collision boxes
   */
  getCollidingTiles(aabb) {
    const results = [];

    // Calculate tile range
    const minTileX = Math.floor(aabb.min.x / this.tileWidth);
    const maxTileX = Math.ceil(aabb.max.x / this.tileWidth);
    const minTileY = Math.floor(aabb.min.y / this.tileHeight);
    const maxTileY = Math.ceil(aabb.max.y / this.tileHeight);

    // Check all tiles in range
    for (let y = Math.max(0, minTileY); y < Math.min(this.height, maxTileY); y++) {
      for (let x = Math.max(0, minTileX); x < Math.min(this.width, maxTileX); x++) {
        if (this.getTile(x, y) === 0) continue; // No collision

        // Get tile AABB
        const tileAABB = this._getTileAABB(x, y);

        // Check intersection
        if (aabb.intersects(tileAABB)) {
          results.push({
            x,
            y,
            collisionType: this.getTile(x, y),
            aabb: tileAABB,
          });
        }
      }
    }

    return results;
  }

  /**
   * Gets the AABB for a tile.
   * @private
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {AABB} Tile bounds
   */
  _getTileAABB(x, y) {
    const min = new Vector(x * this.tileWidth, y * this.tileHeight, 0);
    const max = new Vector((x + 1) * this.tileWidth, (y + 1) * this.tileHeight, 1);
    return new AABB(min, max);
  }

  /**
   * Raycasts through the tilemap.
   * @param {Vector} origin - Ray origin
   * @param {Vector} direction - Ray direction (normalized)
   * @param {number} maxDistance - Max distance to check
   * @returns {Object|null} Hit info or null
   */
  raycast(origin, direction, maxDistance = Infinity) {
    let closestHit = null;
    let minDistance = maxDistance;

    // Calculate AABB for ray bounds
    const rayEnd = origin.add(direction.mul(maxDistance));
    const rayAABB = new AABB(
      new Vector(Math.min(origin.x, rayEnd.x), Math.min(origin.y, rayEnd.y), 0),
      new Vector(Math.max(origin.x, rayEnd.x), Math.max(origin.y, rayEnd.y), 1)
    );

    const tiles = this.getCollidingTiles(rayAABB);

    for (const tile of tiles) {
      const distance = this._intersectRayAABB(origin, direction, tile.aabb);
      if (distance !== null && distance < minDistance) {
        minDistance = distance;
        closestHit = {
          tile: { x: tile.x, y: tile.y },
          collisionType: tile.collisionType,
          distance,
          point: origin.add(direction.mul(distance)),
        };
      }
    }

    return closestHit;
  }

  /**
   * Ray-AABB intersection test.
   * @private
   */
  _intersectRayAABB(origin, direction, aabb) {
    let tmin = (aabb.min.x - origin.x) / (direction.x || 0.0001);
    let tmax = (aabb.max.x - origin.x) / (direction.x || 0.0001);

    if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

    let tymin = (aabb.min.y - origin.y) / (direction.y || 0.0001);
    let tymax = (aabb.max.y - origin.y) / (direction.y || 0.0001);

    if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

    if (tmin > tymax || tymin > tmax) return null;

    if (tymin > tmin) tmin = tymin;
    if (tymax < tmax) tmax = tymax;

    return tmin >= 0 ? tmin : tmax >= 0 ? tmax : null;
  }

  /**
   * Loads collision data from a tilemap layer.
   * Expected format: Array of collision type IDs
   * @param {Array<number>} data - Collision data
   */
  loadFromArray(data) {
    if (data.length !== this.collisionData.length) {
      console.warn('Collision data size mismatch');
    }
    this.collisionData.set(data);
  }

  /**
   * Exports collision data as array.
   * @returns {Uint8Array} Collision data
   */
  toArray() {
    return new Uint8Array(this.collisionData);
  }

  /**
   * Clears all collision data.
   */
  clear() {
    this.collisionData.fill(0);
    this.tileShapes.clear();
  }

  /**
   * Creates a physics body for this collision layer (for registration with physics manager).
   * @returns {Object} Pseudo-body for collision queries
   */
  createPhysicsProxy() {
    return {
      isTileLayer: true,
      collisionLayer: this.collisionLayer,
      collisionMask: this.collisionMask,
      isTrigger: false,
      getAABB: () =>
        new AABB(
          new Vector(0, 0, 0),
          new Vector(this.width * this.tileWidth, this.height * this.tileHeight, 1)
        ),
      query: aabb => this.getCollidingTiles(aabb),
    };
  }
}
