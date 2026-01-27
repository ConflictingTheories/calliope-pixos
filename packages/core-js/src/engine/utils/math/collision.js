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

import { Vector } from './vector.js';

/**
 * Represents a plane in 3D space (ax + by + cz + d = 0)
 */
export class Plane {
  constructor(a = 0, b = 0, c = 0, d = 0) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  /**
   * Normalize the plane equation
   */
  normalize() {
    const length = Math.sqrt(this.a * this.a + this.b * this.b + this.c * this.c);
    if (length > 0) {
      this.a /= length;
      this.b /= length;
      this.c /= length;
      this.d /= length;
    }
    return this;
  }

  /**
   * Calculate signed distance from point to plane
   * @param {Vector} point - Point to test
   * @returns {number} Signed distance (positive = in front, negative = behind)
   */
  distanceToPoint(point) {
    return this.a * point.x + this.b * point.y + this.c * point.z + this.d;
  }
}

/**
 * Axis-Aligned Bounding Box
 */
export class AABB {
  constructor(min = new Vector(0, 0, 0), max = new Vector(0, 0, 0)) {
    this.min = min;
    this.max = max;
  }

  /**
   * Get the center of the bounding box
   */
  getCenter() {
    return new Vector(
      (this.min.x + this.max.x) / 2,
      (this.min.y + this.max.y) / 2,
      (this.min.z + this.max.z) / 2
    );
  }

  /**
   * Get the half-extents (size from center to edge)
   */
  getHalfExtents() {
    return new Vector(
      (this.max.x - this.min.x) / 2,
      (this.max.y - this.min.y) / 2,
      (this.max.z - this.min.z) / 2
    );
  }

  /**
   * Check if this AABB intersects with another
   * @param {AABB} other
   * @returns {boolean}
   */
  intersects(other) {
    return (
      this.min.x <= other.max.x &&
      this.max.x >= other.min.x &&
      this.min.y <= other.max.y &&
      this.max.y >= other.min.y &&
      this.min.z <= other.max.z &&
      this.max.z >= other.min.z
    );
  }

  /**
   * Check if a point is inside this AABB
   * @param {Vector} point
   * @returns {boolean}
   */
  containsPoint(point) {
    return (
      point.x >= this.min.x &&
      point.x <= this.max.x &&
      point.y >= this.min.y &&
      point.y <= this.max.y &&
      point.z >= this.min.z &&
      point.z <= this.max.z
    );
  }

  /**
   * Create AABB from center and size
   */
  static fromCenterSize(center, size) {
    const halfSize = new Vector(size.x / 2, size.y / 2, size.z / 2);
    return new AABB(
      new Vector(center.x - halfSize.x, center.y - halfSize.y, center.z - halfSize.z),
      new Vector(center.x + halfSize.x, center.y + halfSize.y, center.z + halfSize.z)
    );
  }
}

/**
 * Bounding Sphere
 */
export class BoundingSphere {
  constructor(center = new Vector(0, 0, 0), radius = 0) {
    this.center = center;
    this.radius = radius;
  }

  /**
   * Check if this sphere intersects with another
   */
  intersects(other) {
    const distSq = this.center.sub(other.center).lengthSq();
    const radiusSum = this.radius + other.radius;
    return distSq <= radiusSum * radiusSum;
  }

  /**
   * Create bounding sphere from AABB
   */
  static fromAABB(aabb) {
    const center = aabb.getCenter();
    const halfExtents = aabb.getHalfExtents();
    const radius = Math.sqrt(
      halfExtents.x * halfExtents.x + halfExtents.y * halfExtents.y + halfExtents.z * halfExtents.z
    );
    return new BoundingSphere(center, radius);
  }
}
