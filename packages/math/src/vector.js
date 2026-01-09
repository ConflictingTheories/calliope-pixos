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
 * V3 - Lightweight 3D vector utility object for common operations.
 * All methods take and return plain arrays [x, y, z].
 */
export const V3 = {
  /** Add two 3D vectors */
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  /** Subtract vector b from vector a */
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  /** Multiply vector by scalar */
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  /** Dot product of two 3D vectors */
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  /** Cross product of two 3D vectors */
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  /** Length/magnitude of a 3D vector */
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  /** Normalize a 3D vector (returns unit vector) */
  norm: (a) => {
    const L = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / L, a[1] / L, a[2] / L];
  }
};

/**
 * Coord - A 2D coordinate class with basic vector operations.
 */
export class Coord {
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  add(vec) {
    return new Coord(this.x + vec.x, this.y + vec.y);
  }

  sub(vec) {
    return new Coord(this.x - vec.x, this.y - vec.y);
  }

  mul(n) {
    return new Coord(this.x * n, this.y * n);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  distance(vec) {
    return this.sub(vec).length();
  }

  normal() {
    if (this.x === 0 && this.y === 0) return new Coord(0, 0);
    const l = this.length();
    return new Coord(this.x / l, this.y / l);
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  toArray() {
    return [this.x, this.y];
  }

  toString() {
    return `( ${this.x}, ${this.y} )`;
  }

  negate() {
    return new Coord(this.x * -1, this.y * -1);
  }
}

/**
 * Vector - A 3D vector class with basic vector operations.
 */
export class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z);
  }

  sub(vec) {
    return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z);
  }

  mul(n) {
    return new Vector(this.x * n, this.y * n, this.z * n);
  }

  mul3(n) {
    return new Vector(this.x * n.x, this.y * n.y, this.z * n.z);
  }

  cross(n) {
    return new Vector(
      this.y * n.z - this.z * n.y,
      this.z * n.x - this.x * n.z,
      this.x * n.y - this.y * n.x
    );
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  distance(vec) {
    return this.sub(vec).length();
  }

  normal() {
    if (this.x === 0 && this.y === 0 && this.z === 0) return new Vector(0, 0, 0);
    const l = this.length();
    return new Vector(this.x / l, this.y / l, this.z / l);
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y + this.z * vec.z;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  toString() {
    return `( ${this.x}, ${this.y}, ${this.z} )`;
  }

  negate() {
    return new Vector(this.x * -1, this.y * -1, this.z * -1);
  }
}

/**
 * Vector4 - A 4D vector class with basic vector operations.
 */
export class Vector4 {
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  add(vec) {
    return new Vector4(this.x + vec.x, this.y + vec.y, this.z + vec.z, this.w + vec.w);
  }

  sub(vec) {
    return new Vector4(this.x - vec.x, this.y - vec.y, this.z - vec.z, this.w - vec.w);
  }

  mul(n) {
    return new Vector4(this.x * n, this.y * n, this.z * n, this.w * n);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }

  distance(vec) {
    return this.sub(vec).length();
  }

  normal() {
    if (this.x === 0 && this.y === 0 && this.z === 0 && this.w === 0) return new Vector4(0, 0, 0, 0);
    const l = this.length();
    return new Vector4(this.x / l, this.y / l, this.z / l, this.w / l);
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y + this.z * vec.z + this.w * vec.w;
  }

  toArray() {
    return [this.x, this.y, this.z, this.w];
  }

  toString() {
    return `( ${this.x}, ${this.y}, ${this.z}, ${this.w} )`;
  }

  negate() {
    return new Vector4(this.x * -1, this.y * -1, this.z * -1, this.w * -1);
  }
}

/**
 * Functional vec3 utilities
 */
export const vec3 = {
  sub: (a, b, out = [0, 0, 0]) => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  },
  add: (a, b, out = [0, 0, 0]) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  },
  cross: (a, b, out = [0, 0, 0]) => {
    const ax = a[0], ay = a[1], az = a[2];
    const bx = b[0], by = b[1], bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  },
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  length: (v) => Math.hypot(v[0], v[1], v[2]),
  normalize: (v, out = [0, 0, 0]) => {
    const len = vec3.length(v);
    if (len === 0) return out;
    out[0] = v[0] / len;
    out[1] = v[1] / len;
    out[2] = v[2] / len;
    return out;
  },
  scale: (v, s, out = [0, 0, 0]) => {
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    out[2] = v[2] * s;
    return out;
  },
  copy: (v, out = [0, 0, 0]) => {
    out[0] = v[0];
    out[1] = v[1];
    out[2] = v[2];
    return out;
  },
};

// Utility functions
export function set(w, v) {
  v.x = w.x;
  v.y = w.y;
  v.z = w.z;
}

export function negate(vec, dest) {
  if (!dest) dest = new Vector(-vec.x, -vec.y, -vec.z);
  dest.x = -vec.x;
  dest.y = -vec.y;
  dest.z = -vec.z;
  return dest;
}

export function lerp(vec, vec2, t, dest) {
  if (!dest) dest = vec;
  dest.x = vec.x + t * (vec2.x - vec.x);
  dest.y = vec.y + t * (vec2.y - vec.y);
  dest.z = vec.z + t * (vec2.z - vec.z);
  return dest;
}

export function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians) {
  return (radians * 180) / Math.PI;
}

// Collision utilities
export function lineRectCollide(line, rect) {
  return rect.y > line.y - rect.size / 2 && 
         rect.y < line.y + rect.size / 2 && 
         rect.x > line.x1 - rect.size / 2 && 
         rect.x < line.x2 + rect.size / 2;
}

export function rectRectCollide(r1, r2) {
  if (r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2) return true;
  if (r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2) return true;
  if (r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2) return true;
  if (r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2) return true;
  return false;
}

export function pushQuad(v, p1, p2, p3, p4) {
  v.push(p1[0], p1[1], p1[2], p1[3], p1[4], p1[5], p1[6], p1[7], p1[8]);
  v.push(p2[0], p2[1], p2[2], p2[3], p2[4], p2[5], p2[6], p2[7], p2[8]);
  v.push(p3[0], p3[1], p3[2], p3[3], p3[4], p3[5], p3[6], p3[7], p3[8]);
  v.push(p3[0], p3[1], p3[2], p3[3], p3[4], p3[5], p3[6], p3[7], p3[8]);
  v.push(p4[0], p4[1], p4[2], p4[3], p4[4], p4[5], p4[6], p4[7], p4[8]);
  v.push(p1[0], p1[1], p1[2], p1[3], p1[4], p1[5], p1[6], p1[7], p1[8]);
}
