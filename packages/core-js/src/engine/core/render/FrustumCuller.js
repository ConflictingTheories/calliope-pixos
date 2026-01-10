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
 * FrustumCuller - Performance optimization for 3D rendering.
 * Determines which objects are visible within the camera's view frustum
 * and culls (skips) objects that are outside the visible area.
 */

import { Vector } from '../../utils/math/vector.js';

/**
 * Represents a plane in 3D space (ax + by + cz + d = 0)
 */
class Plane {
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
class AABB {
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
 * Bounding Sphere for quick culling checks
 */
class BoundingSphere {
  constructor(center = new Vector(0, 0, 0), radius = 0) {
    this.center = center;
    this.radius = radius;
  }

  /**
   * Create bounding sphere from AABB
   */
  static fromAABB(aabb) {
    const center = aabb.getCenter();
    const halfExtents = aabb.getHalfExtents();
    const radius = Math.sqrt(
      halfExtents.x * halfExtents.x +
      halfExtents.y * halfExtents.y +
      halfExtents.z * halfExtents.z
    );
    return new BoundingSphere(center, radius);
  }
}

/**
 * Frustum defined by 6 planes (left, right, top, bottom, near, far)
 */
class Frustum {
  constructor() {
    this.planes = [
      new Plane(), // Left
      new Plane(), // Right
      new Plane(), // Bottom
      new Plane(), // Top
      new Plane(), // Near
      new Plane(), // Far
    ];
  }

  /**
   * Extract frustum planes from a combined view-projection matrix
   * @param {Float32Array} vpMatrix - 4x4 view-projection matrix (column-major)
   */
  setFromMatrix(vpMatrix) {
    const m = vpMatrix;

    // Left plane: row 4 + row 1
    this.planes[0].a = m[3] + m[0];
    this.planes[0].b = m[7] + m[4];
    this.planes[0].c = m[11] + m[8];
    this.planes[0].d = m[15] + m[12];
    this.planes[0].normalize();

    // Right plane: row 4 - row 1
    this.planes[1].a = m[3] - m[0];
    this.planes[1].b = m[7] - m[4];
    this.planes[1].c = m[11] - m[8];
    this.planes[1].d = m[15] - m[12];
    this.planes[1].normalize();

    // Bottom plane: row 4 + row 2
    this.planes[2].a = m[3] + m[1];
    this.planes[2].b = m[7] + m[5];
    this.planes[2].c = m[11] + m[9];
    this.planes[2].d = m[15] + m[13];
    this.planes[2].normalize();

    // Top plane: row 4 - row 2
    this.planes[3].a = m[3] - m[1];
    this.planes[3].b = m[7] - m[5];
    this.planes[3].c = m[11] - m[9];
    this.planes[3].d = m[15] - m[13];
    this.planes[3].normalize();

    // Near plane: row 4 + row 3
    this.planes[4].a = m[3] + m[2];
    this.planes[4].b = m[7] + m[6];
    this.planes[4].c = m[11] + m[10];
    this.planes[4].d = m[15] + m[14];
    this.planes[4].normalize();

    // Far plane: row 4 - row 3
    this.planes[5].a = m[3] - m[2];
    this.planes[5].b = m[7] - m[6];
    this.planes[5].c = m[11] - m[10];
    this.planes[5].d = m[15] - m[14];
    this.planes[5].normalize();
  }

  /**
   * Test if a point is inside the frustum
   * @param {Vector} point
   * @returns {boolean}
   */
  containsPoint(point) {
    for (const plane of this.planes) {
      if (plane.distanceToPoint(point) < 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Test if a sphere intersects or is inside the frustum
   * @param {BoundingSphere} sphere
   * @returns {'inside'|'intersect'|'outside'}
   */
  testSphere(sphere) {
    let allInside = true;

    for (const plane of this.planes) {
      const distance = plane.distanceToPoint(sphere.center);

      if (distance < -sphere.radius) {
        return 'outside';
      }

      if (distance < sphere.radius) {
        allInside = false;
      }
    }

    return allInside ? 'inside' : 'intersect';
  }

  /**
   * Test if an AABB intersects or is inside the frustum
   * @param {AABB} aabb
   * @returns {'inside'|'intersect'|'outside'}
   */
  testAABB(aabb) {
    let allInside = true;

    for (const plane of this.planes) {
      // Find the positive vertex (furthest in direction of plane normal)
      const px = plane.a >= 0 ? aabb.max.x : aabb.min.x;
      const py = plane.b >= 0 ? aabb.max.y : aabb.min.y;
      const pz = plane.c >= 0 ? aabb.max.z : aabb.min.z;

      // Find the negative vertex (furthest in opposite direction)
      const nx = plane.a >= 0 ? aabb.min.x : aabb.max.x;
      const ny = plane.b >= 0 ? aabb.min.y : aabb.max.y;
      const nz = plane.c >= 0 ? aabb.min.z : aabb.max.z;

      // If positive vertex is behind plane, AABB is outside
      if (plane.a * px + plane.b * py + plane.c * pz + plane.d < 0) {
        return 'outside';
      }

      // If negative vertex is behind plane, AABB is intersecting
      if (plane.a * nx + plane.b * ny + plane.c * nz + plane.d < 0) {
        allInside = false;
      }
    }

    return allInside ? 'inside' : 'intersect';
  }
}

/**
 * FrustumCuller - Main class for frustum culling operations
 */
export default class FrustumCuller {
  /**
   * @param {Object} renderManager - Reference to the render manager
   */
  constructor(renderManager) {
    this.renderManager = renderManager;
    this.frustum = new Frustum();
    this.enabled = true;
    this.debug = {
      totalObjects: 0,
      culledObjects: 0,
      visibleObjects: 0,
    };
  }

  /**
   * Update the frustum from the current view-projection matrix
   * @param {Float32Array} projMatrix - Projection matrix
   * @param {Float32Array} viewMatrix - View matrix
   */
  update(projMatrix, viewMatrix) {
    if (!this.enabled) return;

    // Combine view and projection matrices
    const vpMatrix = this._multiplyMatrices(projMatrix, viewMatrix);
    this.frustum.setFromMatrix(vpMatrix);
  }

  /**
   * Cull an array of objects, returning only visible ones
   * @param {Array} objects - Array of objects to cull
   * @param {Function} getBounds - Function to get bounds from object (returns AABB or BoundingSphere)
   * @returns {Array} Visible objects
   */
  cull(objects, getBounds) {
    if (!this.enabled) {
      this.debug.totalObjects = objects.length;
      this.debug.visibleObjects = objects.length;
      this.debug.culledObjects = 0;
      return objects;
    }

    const visible = [];
    this.debug.totalObjects = objects.length;

    for (const obj of objects) {
      const bounds = getBounds(obj);

      if (!bounds) {
        // No bounds = always visible
        visible.push(obj);
        continue;
      }

      let result;
      if (bounds instanceof BoundingSphere) {
        result = this.frustum.testSphere(bounds);
      } else if (bounds instanceof AABB) {
        result = this.frustum.testAABB(bounds);
      } else {
        // Unknown bounds type, assume visible
        visible.push(obj);
        continue;
      }

      if (result !== 'outside') {
        visible.push(obj);
      }
    }

    this.debug.visibleObjects = visible.length;
    this.debug.culledObjects = objects.length - visible.length;

    return visible;
  }

  /**
   * Quick visibility check for a single point
   * @param {Vector} point
   * @returns {boolean}
   */
  isPointVisible(point) {
    if (!this.enabled) return true;
    return this.frustum.containsPoint(point);
  }

  /**
   * Quick visibility check for a sphere
   * @param {Vector} center - Sphere center
   * @param {number} radius - Sphere radius
   * @returns {boolean}
   */
  isSphereVisible(center, radius) {
    if (!this.enabled) return true;
    const sphere = new BoundingSphere(center, radius);
    return this.frustum.testSphere(sphere) !== 'outside';
  }

  /**
   * Quick visibility check for an AABB
   * @param {Vector} min - Min corner
   * @param {Vector} max - Max corner
   * @returns {boolean}
   */
  isAABBVisible(min, max) {
    if (!this.enabled) return true;
    const aabb = new AABB(min, max);
    return this.frustum.testAABB(aabb) !== 'outside';
  }

  /**
   * Enable/disable frustum culling
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Get culling statistics
   * @returns {Object}
   */
  getStats() {
    const cullRate = this.debug.totalObjects > 0
      ? (this.debug.culledObjects / this.debug.totalObjects * 100).toFixed(1)
      : 0;
    return {
      ...this.debug,
      cullRate: `${cullRate}%`,
    };
  }

  /**
   * Multiply two 4x4 matrices (column-major)
   * @private
   */
  _multiplyMatrices(a, b) {
    const result = new Float32Array(16);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[j * 4 + i] =
          a[i] * b[j * 4] +
          a[i + 4] * b[j * 4 + 1] +
          a[i + 8] * b[j * 4 + 2] +
          a[i + 12] * b[j * 4 + 3];
      }
    }

    return result;
  }
}

// Export helper classes
export { Plane, AABB, BoundingSphere, Frustum };
