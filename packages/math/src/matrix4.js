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

const EPSILON = 0.000001;

/**
 * Creates a Matrix4 from an array of 16 numbers.
 */
export const from = mat => {
  let dest = new Float32Array(16);
  for (let i = 0; i < 16; i++) dest[i] = mat[i];
  return dest;
};

/**
 * Creates an identity Matrix4.
 */
export const create = () => {
  let matrix = new Float32Array(16);
  matrix[0] = 1;
  matrix[5] = 1;
  matrix[10] = 1;
  matrix[15] = 1;
  return matrix;
};

/**
 * Creates an identity Matrix3.
 */
export const create3 = () => {
  let matrix = new Float32Array(9);
  matrix[0] = 1;
  matrix[4] = 1;
  matrix[8] = 1;
  return matrix;
};

/**
 * Creates a perspective projection Matrix4.
 */
export const perspective = (fovy, aspect, near, far) => {
  let matrix = new Float32Array(16);
  let f = 1.0 / Math.tan(fovy / 2);
  matrix[0] = f / aspect;
  matrix[5] = f;
  matrix[10] = -1;
  matrix[11] = -1;
  matrix[14] = -2 * near;
  if (far != null && far !== Infinity && far !== near) {
    const nf = 1 / (near - far);
    matrix[10] = (far + near) * nf;
    matrix[14] = 2 * far * near * nf;
  }
  return matrix;
};

/**
 * Creates a frustum projection Matrix4.
 */
export const frustum = (l, r, b, t, n, f) => {
  let m = new Float32Array(16);
  m[0] = (2 * n) / (r - l);
  m[2] = (r + l) / (r - l);
  m[5] = (2 * n) / (t - b);
  m[6] = (t + b) / (t - b);
  m[10] = -(f + n) / (f - n);
  m[11] = (-2 * f * n) / (f - n);
  m[14] = -1;
  return m;
};

/**
 * Translates a Matrix4 by a vector.
 */
export const translate = (m1, m2, v) => {
  let matrix = m1;
  let [x, y, z] = v;
  let [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23] = m2;
  if (m1 !== m2) {
    matrix[0] = a00;
    matrix[1] = a01;
    matrix[2] = a02;
    matrix[3] = a03;
    matrix[4] = a10;
    matrix[5] = a11;
    matrix[6] = a12;
    matrix[7] = a13;
    matrix[8] = a20;
    matrix[9] = a21;
    matrix[10] = a22;
    matrix[11] = a23;
  }
  matrix[12] = a00 * x + a10 * y + a20 * z + m2[12];
  matrix[13] = a01 * x + a11 * y + a21 * z + m2[13];
  matrix[14] = a02 * x + a12 * y + a22 * z + m2[14];
  matrix[15] = a03 * x + a13 * y + a23 * z + m2[15];
  return matrix;
};

/**
 * Rotates a Matrix4 around an axis by a given angle.
 */
export const rotate = (m1, m2, rad, axis) => {
  let matrix = m1;
  let [x, y, z] = axis;
  let len = Math.hypot(x, y, z);

  if (len < EPSILON) {
    throw new Error('Matrix4*4 rotate has wrong axis');
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  let s = Math.sin(rad);
  let c = Math.cos(rad);
  let t = 1 - c;

  let [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23] = m2;

  let b00 = x * x * t + c;
  let b01 = y * x * t + z * s;
  let b02 = z * x * t - y * s;
  let b10 = x * y * t - z * s;
  let b11 = y * y * t + c;
  let b12 = z * y * t + x * s;
  let b20 = x * z * t + y * s;
  let b21 = y * z * t - x * s;
  let b22 = z * z * t + c;

  matrix[0] = a00 * b00 + a10 * b01 + a20 * b02;
  matrix[1] = a01 * b00 + a11 * b01 + a21 * b02;
  matrix[2] = a02 * b00 + a12 * b01 + a22 * b02;
  matrix[3] = a03 * b00 + a13 * b01 + a23 * b02;
  matrix[4] = a00 * b10 + a10 * b11 + a20 * b12;
  matrix[5] = a01 * b10 + a11 * b11 + a21 * b12;
  matrix[6] = a02 * b10 + a12 * b11 + a22 * b12;
  matrix[7] = a03 * b10 + a13 * b11 + a23 * b12;
  matrix[8] = a00 * b20 + a10 * b21 + a20 * b22;
  matrix[9] = a01 * b20 + a11 * b21 + a21 * b22;
  matrix[10] = a02 * b20 + a12 * b21 + a22 * b22;
  matrix[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (m2 !== m1) {
    matrix[12] = m2[12];
    matrix[13] = m2[13];
    matrix[14] = m2[14];
    matrix[15] = m2[15];
  }
  return matrix;
};

/**
 * Subtracts two vectors.
 */
export const subtractVectors = (a, b) => {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
};

/**
 * Normalizes a vector to unit length.
 */
export const normalize = v => {
  let len = Math.hypot(...v);
  if (!len || Math.abs(len) < EPSILON) return [0, 0, 1];
  return [v[0] / len, v[1] / len, v[2] / len];
};

/**
 * Calculates a 3x3 normal matrix from 4x4 matrix.
 */
export function normalFromMat4(out, a) {
  let a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  let a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  let a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  let a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];

  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) return null;
  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

  return out;
}

/**
 * Copies a Matrix4 to another.
 */
export function set(mat, dest) {
  for (let i = 0; i < 16; i++) dest[i] = mat[i];
  return dest;
}

/**
 * Checks if a value is a power of 2.
 */
export function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

/**
 * Creates a lookAt view matrix.
 */
export function lookAt(eye, center, up) {
  const out = new Float32Array(16);

  let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  const eyex = eye[0],
    eyey = eye[1],
    eyez = eye[2];
  const upx = up[0],
    upy = up[1],
    upz = up[2];
  const centerx = center[0],
    centery = center[1],
    centerz = center[2];

  if (
    Math.abs(eyex - centerx) < EPSILON &&
    Math.abs(eyey - centery) < EPSILON &&
    Math.abs(eyez - centerz) < EPSILON
  ) {
    return create();
  }

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;

  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);
  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);
  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;

  return out;
}

/**
 * Multiplies two 4x4 matrices.
 */
export function multiply(out, a, b) {
  const a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  const a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  const a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  const a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];

  let b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  return out;
}

/**
 * Scales a 4x4 matrix by a vector.
 */
export function scale(out, a, v) {
  const x = v[0],
    y = v[1],
    z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

/**
 * Returns a new identity matrix as a plain array.
 * @returns {number[]} 16-element identity matrix
 */
export function identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/**
 * Multiplies two 4x4 matrices and returns a new array.
 * Unlike multiply(), this creates and returns a new array instead of writing to an output parameter.
 * @param {number[]} a - First matrix
 * @param {number[]} b - Second matrix
 * @returns {number[]} Result of a * b
 */
export function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) {
    const b0 = b[c * 4 + 0],
      b1 = b[c * 4 + 1],
      b2 = b[c * 4 + 2],
      b3 = b[c * 4 + 3];
    o[c * 4 + 0] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    o[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    o[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    o[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return o;
}

/**
 * Inverts a 4x4 matrix.
 * @param {number[]} m - Matrix to invert
 * @returns {number[]} Inverted matrix, or identity if not invertible
 */
export function invert(m) {
  const out = new Array(16);
  const b00 = m[0] * m[5] - m[1] * m[4],
    b01 = m[0] * m[6] - m[2] * m[4],
    b02 = m[0] * m[7] - m[3] * m[4],
    b03 = m[1] * m[6] - m[2] * m[5],
    b04 = m[1] * m[7] - m[3] * m[5],
    b05 = m[2] * m[7] - m[3] * m[6],
    b06 = m[8] * m[13] - m[9] * m[12],
    b07 = m[8] * m[14] - m[10] * m[12],
    b08 = m[8] * m[15] - m[11] * m[12],
    b09 = m[9] * m[14] - m[10] * m[13],
    b10 = m[9] * m[15] - m[11] * m[13],
    b11 = m[10] * m[15] - m[11] * m[14],
    det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) return identity();
  const id = 1 / det;
  out[0] = (m[5] * b11 - m[6] * b10 + m[7] * b09) * id;
  out[1] = (-m[1] * b11 + m[2] * b10 - m[3] * b09) * id;
  out[2] = (m[13] * b05 - m[14] * b04 + m[15] * b03) * id;
  out[3] = (-m[9] * b05 + m[10] * b04 - m[11] * b03) * id;
  out[4] = (-m[4] * b11 + m[6] * b08 - m[7] * b07) * id;
  out[5] = (m[0] * b11 - m[2] * b08 + m[3] * b07) * id;
  out[6] = (-m[12] * b05 + m[14] * b02 - m[15] * b01) * id;
  out[7] = (m[8] * b05 - m[10] * b02 + m[11] * b01) * id;
  out[8] = (m[4] * b10 - m[5] * b08 + m[7] * b06) * id;
  out[9] = (-m[0] * b10 + m[1] * b08 - m[3] * b06) * id;
  out[10] = (m[12] * b04 - m[13] * b02 + m[15] * b00) * id;
  out[11] = (-m[8] * b04 + m[9] * b02 - m[11] * b00) * id;
  out[12] = (-m[4] * b09 + m[5] * b07 - m[6] * b06) * id;
  out[13] = (m[0] * b09 - m[1] * b07 + m[2] * b06) * id;
  out[14] = (-m[12] * b03 + m[13] * b01 - m[14] * b00) * id;
  out[15] = (m[8] * b03 - m[9] * b01 + m[10] * b00) * id;
  return out;
}
