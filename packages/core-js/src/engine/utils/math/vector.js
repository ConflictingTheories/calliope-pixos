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
 * Coord - A 2D coordinate class with basic vector operations.
 */
export class Coord {
  /**
   * Creates an instance of Coord.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @param {number} z - The z coordinate (optional).
   * @param {number} w - The w coordinate (optional).
   */
  constructor(x, y, z, w) {
    /** @type {number} */
    this.x = x;
    /** @type {number} */
    this.y = y;
    /** @type {number} */
    this.z = z;
    /** @type {number} */
    this.w = w;
  }

  /**
   * Adds another Coord to this one.
   * @param {Coord} vec - The vector to add.
   * @returns {Coord} The resulting vector.
   */
  add(vec) {
    return new Coord(this.x + vec.x, this.y + vec.y);
  }

  /**
   * Subtracts another Coord from this one.
   * @param {Coord} vec - The vector to subtract.
   * @returns {Coord} The resulting vector.
   */
  sub(vec) {
    return new Coord(this.x - vec.x, this.y - vec.y);
  }

  /**
   * Multiplies this Coord by a scalar.
   * @param {number} n - The scalar.
   * @returns {Coord} The resulting vector.
   */
  mul(n) {
    return new Coord(this.x * n, this.y * n);
  }

  /**
   * Calculates the length of this vector.
   * @returns {number} The length.
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Calculates the distance to another vector.
   * @param {Coord} vec - The other vector.
   * @returns {number} The distance.
   */
  distance(vec) {
    return this.sub(vec).length();
  }

  /**
   * Normalizes this vector.
   * @returns {Coord} The normalized vector.
   */
  normal() {
    if (this.x === 0 && this.y === 0) return new Coord(0, 0);
    const l = this.length();
    return new Coord(this.x / l, this.y / l);
  }

  /**
   * Calculates the dot product with another vector.
   * @param {Coord} vec - The other vector.
   * @returns {number} The dot product.
   */
  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  /**
   * Converts to an array.
   * @returns {number[]} The array representation.
   */
  toArray() {
    return [this.x, this.y];
  }

  /**
   * Converts to a string.
   * @returns {string} The string representation.
   */
  toString() {
    return `( ${this.x}, ${this.y} )`;
  }

  /**
   * Negates this vector.
   * @returns {Vector} The negated vector.
   */
  negate() {
    return new Vector(this.x * -1, this.y * -1);
  }
}

/**
 * Vector - A 3D vector class with basic vector operations.
 */
export class Vector {
  /**
   * Creates an instance of Vector.
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   */
  constructor(x, y, z) {
    /** @type {number} */
    this.x = x;
    /** @type {number} */
    this.y = y;
    /** @type {number} */
    this.z = z;
  }

  /**
   * Adds another Vector to this one.
   * @param {Vector} vec - The vector to add.
   * @returns {Vector} The resulting vector.
   */
  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z);
  }

  /**
   * Subtracts another Vector from this one.
   * @param {Vector} vec - The vector to subtract.
   * @returns {Vector} The resulting vector.
   */
  sub(vec) {
    return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z);
  }

  /**
   * Multiplies this Vector by a scalar.
   * @param {number} n - The scalar.
   * @returns {Vector} The resulting vector.
   */
  mul(n) {
    return new Vector(this.x * n, this.y * n, this.z * n);
  }

  /**
   * Multiplies this Vector by another Vector component-wise.
   * @param {Vector} n - The vector to multiply by.
   * @returns {Vector} The resulting vector.
   */
  mul3(n) {
    return new Vector(this.x * n.x, this.y * n.y, this.z * n.z);
  }

  /**
   * Calculates the cross product with another vector.
   * @param {Vector} n - The other vector.
   * @returns {Vector} The cross product.
   */
  cross(n) {
    // Standard 3D cross product: (y1*z2 - z1*y2, z1*x2 - x1*z2, x1*y2 - y1*x2)
    return new Vector(
      this.y * n.z - this.z * n.y,
      this.z * n.x - this.x * n.z,
      this.x * n.y - this.y * n.x
    );
  }

  /**
   * Calculates the length of this vector.
   * @returns {number} The length.
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Calculates the distance to another vector.
   * @param {Vector} vec - The other vector.
   * @returns {number} The distance.
   */
  distance(vec) {
    return this.sub(vec).length();
  }

  /**
   * Normalizes this vector.
   * @returns {Vector} The normalized vector.
   */
  normal() {
    if (this.x === 0 && this.y === 0 && this.z === 0) return new Vector(0, 0, 0);
    const l = this.length();
    return new Vector(this.x / l, this.y / l, this.z / l);
  }

  /**
   * Calculates the dot product with another vector.
   * @param {Vector} vec - The other vector.
   * @returns {number} The dot product.
   */
  dot(vec) {
    return this.x * vec.x + this.y * vec.y + this.z * vec.z;
  }

  /**
   * Converts to an array.
   * @returns {number[]} The array representation.
   */
  toArray() {
    return [this.x, this.y, this.z];
  }

  /**
   * Converts to a string.
   * @returns {string} The string representation.
   */
  toString() {
    return `( ${this.x}, ${this.y}, ${this.z} )`;
  }

  /**
   * Negates this vector.
   * @returns {Vector} The negated vector.
   */
  negate() {
    return new Vector(this.x * -1, this.y * -1, this.z * -1);
  }
}

/**
 * Vector4 - A 4D vector class with basic vector operations.
 */
export class Vector4 {
  /**
   * Creates an instance of Vector4.
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   * @param {number} w - The w component.
   */
  constructor(x, y, z, w) {
    /** @type {number} */
    this.x = x;
    /** @type {number} */
    this.y = y;
    /** @type {number} */
    this.z = z;
    /** @type {number} */
    this.w = w;
  }

  /**
   * Adds another Vector4 to this one.
   * @param {Vector4} vec - The vector to add.
   * @returns {Vector4} The resulting vector.
   */
  add(vec) {
    return new Vector4(this.x + vec.x, this.y + vec.y, this.z + vec.z, this.w + vec.w);
  }

  /**
   * Subtracts another Vector4 from this one.
   * @param {Vector4} vec - The vector to subtract.
   * @returns {Vector4} The resulting vector.
   */
  sub(vec) {
    return new Vector4(this.x - vec.x, this.y - vec.y, this.z - vec.z, this.w - vec.w);
  }

  /**
   * Multiplies this Vector4 by a scalar.
   * @param {number} n - The scalar.
   * @returns {Vector4} The resulting vector.
   */
  mul(n) {
    return new Vector4(this.x * n, this.y * n, this.z * n, this.w * n);
  }

  /**
   * Calculates the length of this vector.
   * @returns {number} The length.
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }

  /**
   * Calculates the distance to another vector.
   * @param {Vector4} vec - The other vector.
   * @returns {number} The distance.
   */
  distance(vec) {
    return this.sub(vec).length();
  }

  /**
   * Normalizes this vector.
   * @returns {Vector4} The normalized vector.
   */
  normal() {
    if (this.x === 0 && this.y === 0 && this.z === 0 && this.w === 0)
      return new Vector4(0, 0, 0, 0);
    const l = this.length();
    return new Vector4(this.x / l, this.y / l, this.z / l, this.w / l);
  }

  /**
   * Calculates the dot product with another vector.
   * @param {Vector4} vec - The other vector.
   * @returns {number} The dot product.
   */
  dot(vec) {
    return this.x * vec.x + this.y * vec.y + this.z * vec.z + this.w * vec.w;
  }

  /**
   * Converts to an array.
   * @returns {number[]} The array representation.
   */
  toArray() {
    return [this.x, this.y, this.z, this.w];
  }

  /**
   * Converts to a string.
   * @returns {string} The string representation.
   */
  toString() {
    return `( ${this.x}, ${this.y}, ${this.z}, ${this.w} )`;
  }

  /**
   * Negates this vector.
   * @returns {Vector} The negated vector.
   */
  negate() {
    return new Vector(this.x * -1, this.y * -1, this.z * -1, this.w * -1);
  }
}

/**
 * Checks if an axis-aligned line and a bounding box overlap.
 * @param {Object} line - The line object { y, x1, x2 } or { x, y1, y2 }.
 * @param {Object} rect - The rectangle object { x, y, size }.
 * @returns {boolean} True if they collide.
 */
export function lineRectCollide(line, rect) {
  return (
    rect.y > line.y - rect.size / 2 &&
    rect.y < line.y + rect.size / 2 &&
    rect.x > line.x1 - rect.size / 2 &&
    rect.x < line.x2 + rect.size / 2
  );
}

/**
 * Checks if two rectangles (x1, y1, x2, y2) overlap.
 * @param {Object} r1 - First rectangle { x1, y1, x2, y2 }.
 * @param {Object} r2 - Second rectangle { x1, y1, x2, y2 }.
 * @returns {boolean} True if they collide.
 */
export function rectRectCollide(r1, r2) {
  if (r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2) return true;
  if (r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2) return true;
  if (r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2) return true;
  if (r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2) return true;
  return false;
}

/**
 * Pushes a quad into a vertex array.
 * @param {Array} v - The vertex array.
 * @param {Array} p1 - Point 1.
 * @param {Array} p2 - Point 2.
 * @param {Array} p3 - Point 3.
 * @param {Array} p4 - Point 4.
 */
export function pushQuad(v, p1, p2, p3, p4) {
  v.push(p1[0], p1[1], p1[2], p1[3], p1[4], p1[5], p1[6], p1[7], p1[8]);
  v.push(p2[0], p2[1], p2[2], p2[3], p2[4], p2[5], p2[6], p2[7], p2[8]);
  v.push(p3[0], p3[1], p3[2], p3[3], p3[4], p3[5], p3[6], p3[7], p3[8]);

  v.push(p3[0], p3[1], p3[2], p3[3], p3[4], p3[5], p3[6], p3[7], p3[8]);
  v.push(p4[0], p4[1], p4[2], p4[3], p4[4], p4[5], p4[6], p4[7], p4[8]);
  v.push(p1[0], p1[1], p1[2], p1[3], p1[4], p1[5], p1[6], p1[7], p1[8]);
}

/**
 * Applies values from one vector to another.
 * @param {Vector} w - Source vector.
 * @param {Vector} v - Destination vector.
 */
export function set(w, v) {
  v.x = w.x;
  v.y = w.y;
  v.z = w.z;
}

/**
 * Negates a vector.
 * @param {Vector} vec - The vector to negate.
 * @param {Vector} [dest] - Optional destination vector.
 * @returns {Vector} The negated vector.
 */
export function negate(vec, dest) {
  if (!dest) dest = new Vector(-vec.x, -vec.y, -vec.z);
  dest.x = -vec.x;
  dest.y = -vec.y;
  dest.z = -vec.z;
  return dest;
}

/**
 * Linearly interpolates between two vectors.
 * @param {Vector} vec - First vector.
 * @param {Vector} vec2 - Second vector.
 * @param {number} lerp - Interpolation factor.
 * @param {Vector} [dest] - Optional destination vector.
 * @returns {Vector} The interpolated vector.
 */
export function lerp(vec, vec2, lerp, dest) {
  if (!dest) {
    dest = vec;
  }

  dest.x = vec.x + lerp * (vec2.x - vec.x);
  dest.y = vec.y + lerp * (vec2.y - vec.y);
  dest.z = vec.z + lerp * (vec2.z - vec.z);

  return dest;
}

/**
 * Converts degrees to radians.
 * @param {number} degrees - The angle in degrees.
 * @returns {number} The angle in radians.
 */
export function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}
