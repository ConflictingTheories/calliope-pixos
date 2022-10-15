"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.from = exports.create3 = exports.create = void 0;
exports.isPowerOf2 = isPowerOf2;
exports.normalFromMat4 = normalFromMat4;
exports.rotate = exports.perspective = void 0;
exports.set = set;
exports.translate = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
var EPSILON = 0.000001;

var from = function from(mat) {
  var dest = new Float32Array(16);
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[3];
  dest[4] = mat[4];
  dest[5] = mat[5];
  dest[6] = mat[6];
  dest[7] = mat[7];
  dest[8] = mat[8];
  dest[9] = mat[9];
  dest[10] = mat[10];
  dest[11] = mat[11];
  dest[12] = mat[12];
  dest[13] = mat[13];
  dest[14] = mat[14];
  dest[15] = mat[15];
  return dest;
};

exports.from = from;

var create = function create() {
  var matrix = new Float32Array(16);
  matrix[0] = 1;
  matrix[5] = 1;
  matrix[10] = 1;
  matrix[15] = 1;
  return matrix;
};

exports.create = create;

var create3 = function create3() {
  var matrix = new Float32Array(9);
  matrix[0] = 1;
  matrix[4] = 1;
  matrix[8] = 1;
  return matrix;
};

exports.create3 = create3;

var perspective = function perspective(fovy, aspect, near, far) {
  var matrix = new Float32Array(16);
  var f = 1.0 / Math.tan(fovy / 2);
  matrix[0] = f / aspect;
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  matrix[4] = 0;
  matrix[5] = f;
  matrix[6] = 0;
  matrix[7] = 0;
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = -1;
  matrix[11] = -1;
  matrix[12] = 0;
  matrix[13] = 0;
  matrix[14] = -2 * near;
  matrix[15] = 0;

  if (far != null && far !== Infinity && far !== near) {
    var nf = 1 / (near - far);
    matrix[10] = (far + near) * nf;
    matrix[14] = 2 * far * near * nf;
  }

  return matrix;
};

exports.perspective = perspective;

var translate = function translate(m1, m2, v) {
  var matrix = m1;

  var _v = _slicedToArray(v, 3),
      x = _v[0],
      y = _v[1],
      z = _v[2];

  var _m = _slicedToArray(m2, 12),
      a00 = _m[0],
      a01 = _m[1],
      a02 = _m[2],
      a03 = _m[3],
      a10 = _m[4],
      a11 = _m[5],
      a12 = _m[6],
      a13 = _m[7],
      a20 = _m[8],
      a21 = _m[9],
      a22 = _m[10],
      a23 = _m[11];

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

exports.translate = translate;

var rotate = function rotate(m1, m2, rad, axis) {
  var matrix = m1;

  var _axis = _slicedToArray(axis, 3),
      x = _axis[0],
      y = _axis[1],
      z = _axis[2];

  var len = Math.hypot(x, y, z);

  if (len < EPSILON) {
    throw new Error('Matrix4*4 rotate has wrong axis');
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var t = 1 - c;

  var _m2 = _slicedToArray(m2, 12),
      a00 = _m2[0],
      a01 = _m2[1],
      a02 = _m2[2],
      a03 = _m2[3],
      a10 = _m2[4],
      a11 = _m2[5],
      a12 = _m2[6],
      a13 = _m2[7],
      a20 = _m2[8],
      a21 = _m2[9],
      a22 = _m2[10],
      a23 = _m2[11];

  var b00 = x * x * t + c;
  var b01 = y * x * t + z * s;
  var b02 = z * x * t - y * s;
  var b10 = x * y * t - z * s;
  var b11 = y * y * t + c;
  var b12 = z * y * t + x * s;
  var b20 = x * z * t + y * s;
  var b21 = y * z * t - x * s;
  var b22 = z * z * t + c;
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

exports.rotate = rotate;

function isPowerOf2(value) {
  return (value & value - 1) == 0;
}

function set(mat, dest) {
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[3];
  dest[4] = mat[4];
  dest[5] = mat[5];
  dest[6] = mat[6];
  dest[7] = mat[7];
  dest[8] = mat[8];
  dest[9] = mat[9];
  dest[10] = mat[10];
  dest[11] = mat[11];
  dest[12] = mat[12];
  dest[13] = mat[13];
  dest[14] = mat[14];
  dest[15] = mat[15];
  return dest;
}

;
/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/

function normalFromMat4(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

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