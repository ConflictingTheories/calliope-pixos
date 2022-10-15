"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vector4 = exports.Vector = exports.Coord = void 0;
exports.lerp = lerp;
exports.lineRectCollide = lineRectCollide;
exports.negate = negate;
exports.pushQuad = pushQuad;
exports.rectRectCollide = rectRectCollide;
exports.set = set;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

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
var Coord = /*#__PURE__*/function () {
  function Coord(x, y, z, w) {
    _classCallCheck(this, Coord);

    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  _createClass(Coord, [{
    key: "add",
    value: function add(vec) {
      return new Coord(this.x + vec.x, this.y + vec.y);
    }
  }, {
    key: "sub",
    value: function sub(vec) {
      return new Coord(this.x - vec.x, this.y - vec.y);
    }
  }, {
    key: "mul",
    value: function mul(n) {
      return new Coord(this.x * n, this.y * n);
    }
  }, {
    key: "length",
    value: function length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  }, {
    key: "distance",
    value: function distance(vec) {
      return this.sub(vec).length();
    }
  }, {
    key: "normal",
    value: function normal() {
      if (this.x === 0 && this.y === 0) return new Coord(0, 0);
      var l = this.length();
      return new Coord(this.x / l, this.y / l);
    }
  }, {
    key: "dot",
    value: function dot(vec) {
      return this.x * vec.x + this.y * vec.y;
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return [this.x, this.y];
    }
  }, {
    key: "toString",
    value: function toString() {
      return "( ".concat(this.x, ", ").concat(this.y, " )");
    }
  }, {
    key: "negate",
    value: function negate() {
      return new Vector(this.x * -1, this.y * -1);
    }
  }]);

  return Coord;
}();

exports.Coord = Coord;

var Vector = /*#__PURE__*/function () {
  function Vector(x, y, z) {
    _classCallCheck(this, Vector);

    this.x = x;
    this.y = y;
    this.z = z;
  }

  _createClass(Vector, [{
    key: "add",
    value: function add(vec) {
      return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z);
    }
  }, {
    key: "sub",
    value: function sub(vec) {
      return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z);
    }
  }, {
    key: "mul",
    value: function mul(n) {
      return new Vector(this.x * n, this.y * n, this.z * n);
    }
  }, {
    key: "length",
    value: function length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
  }, {
    key: "distance",
    value: function distance(vec) {
      return this.sub(vec).length();
    }
  }, {
    key: "normal",
    value: function normal() {
      if (this.x === 0 && this.y === 0 && this.z === 0) return new Vector(0, 0, 0);
      var l = this.length();
      return new Vector(this.x / l, this.y / l, this.z / l);
    }
  }, {
    key: "dot",
    value: function dot(vec) {
      return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return [this.x, this.y, this.z];
    }
  }, {
    key: "toString",
    value: function toString() {
      return "( ".concat(this.x, ", ").concat(this.y, ", ").concat(this.z, " )");
    }
  }, {
    key: "negate",
    value: function negate() {
      return new Vector(this.x * -1, this.y * -1, this.z * -1);
    }
  }]);

  return Vector;
}();

exports.Vector = Vector;

var Vector4 = /*#__PURE__*/function () {
  function Vector4(x, y, z, w) {
    _classCallCheck(this, Vector4);

    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  _createClass(Vector4, [{
    key: "add",
    value: function add(vec) {
      return new Vector4(this.x + vec.x, this.y + vec.y, this.z + vec.z, this.w + vec.w);
    }
  }, {
    key: "sub",
    value: function sub(vec) {
      return new Vector4(this.x - vec.x, this.y - vec.y, this.z - vec.z, this.w - vec.w);
    }
  }, {
    key: "mul",
    value: function mul(n) {
      return new Vector4(this.x * n, this.y * n, this.z * n, this.w * n);
    }
  }, {
    key: "length",
    value: function length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
  }, {
    key: "distance",
    value: function distance(vec) {
      return this.sub(vec).length();
    }
  }, {
    key: "normal",
    value: function normal() {
      if (this.x === 0 && this.y === 0 && this.z === 0 && this.w === 0) return new Vector4(0, 0, 0, 0);
      var l = this.length();
      return new Vector4(this.x / l, this.y / l, this.z / l, this.w / l);
    }
  }, {
    key: "dot",
    value: function dot(vec) {
      return this.x * vec.x + this.y * vec.y + this.z * vec.z + this.w * vec.w;
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return [this.x, this.y, this.z, this.w];
    }
  }, {
    key: "toString",
    value: function toString() {
      return "( ".concat(this.x, ", ").concat(this.y, ", ").concat(this.z, ", ").concat(this.w, " )");
    }
  }, {
    key: "negate",
    value: function negate() {
      return new Vector(this.x * -1, this.y * -1, this.z * -1, this.w * -1);
    }
  }]);

  return Vector4;
}(); // lineRectCollide( line, rect )
//
// Checks if an axis-aligned line and a bounding box overlap.
// line = { y, x1, x2 } or line = { x, y1, y2 }
// rect = { x, y, size }


exports.Vector4 = Vector4;

function lineRectCollide(line, rect) {
  return rect.y > line.y - rect.size / 2 && rect.y < line.y + rect.size / 2 && rect.x > line.x1 - rect.size / 2 && rect.x < line.x2 + rect.size / 2;
} // rectRectCollide( r1, r2 )
//
// Checks if two rectangles (x1, y1, x2, y2) overlap.


function rectRectCollide(r1, r2) {
  if (r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2) return true;
  if (r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y1 > r1.y1 && r2.y1 < r1.y2) return true;
  if (r2.x2 > r1.x1 && r2.x2 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2) return true;
  if (r2.x1 > r1.x1 && r2.x1 < r1.x2 && r2.y2 > r1.y1 && r2.y2 < r1.y2) return true;
  return false;
} // Push a Qua


function pushQuad(v, p1, p2, p3, p4) {
  v.push(p1[0], p1[1], p1[2], p1[3], p1[4], p1[5], p1[6], p1[7], p1[8]);
  v.push(p2[0], p2[1], p2[2], p2[3], p2[4], p2[5], p2[6], p2[7], p2[8]);
  v.push(p3[0], p3[1], p3[2], p3[3], p3[4], p3[5], p3[6], p3[7], p3[8]);
  v.push(p3[0], p3[1], p3[2], p3[3], p3[4], p3[5], p3[6], p3[7], p3[8]);
  v.push(p4[0], p4[1], p4[2], p4[3], p4[4], p4[5], p4[6], p4[7], p4[8]);
  v.push(p1[0], p1[1], p1[2], p1[3], p1[4], p1[5], p1[6], p1[7], p1[8]);
} // apply values from one vector to another


function set(w, v) {
  v.x = w.x;
  v.y = w.y;
  v.z = w.z;
}

function negate(vec, dest) {
  if (!dest) dest = new Vector(-vec.x, -vec.y, -vec.z);
  dest.x = -vec.x;
  dest.y = -vec.y;
  dest.z = -vec.z;
  return dest;
}

function lerp(vec, vec2, lerp, dest) {
  if (!dest) {
    dest = vec;
  }

  dest.x = vec.x + lerp * (vec2.x - vec.x);
  dest.y = vec.y + lerp * (vec2.y - vec.y);
  dest.z = vec.z + lerp * (vec2.z - vec.z);
  return dest;
}