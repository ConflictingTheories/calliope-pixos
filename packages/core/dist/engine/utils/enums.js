"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeDeep = exports.isObject = exports.Mouse = exports.Direction = void 0;
var _vector = require("@Engine/utils/math/vector.js");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); } /*                                                 *\
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
// Mouse event enumeration
var Mouse = exports.Mouse = {
  DOWN: 1,
  UP: 2,
  MOVE: 3
};

// Degrees to Radians
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

// Directions enumeration & methods
var Direction = exports.Direction = {
  None: 0,
  //0000
  Right: 1,
  //0001
  Up: 2,
  //0010
  Left: 4,
  //0100
  Down: 8,
  //1000
  All: 15,
  //1111
  fromOffset: function fromOffset(dp) {
    if (dp[0] > 0) return Direction.Right;
    if (dp[0] < 0) return Direction.Left;
    if (dp[1] > 0) return Direction.Down;
    if (dp[1] < 0) return Direction.Up;
    return 0;
  },
  toOffset: function toOffset(dir) {
    switch (dir) {
      case Direction.Right:
        return [1, 0];
      case Direction.Up:
        return [0, -1];
      case Direction.Left:
        return [-1, 0];
      case Direction.Down:
        return [0, 1];
    }
    return [0, 0];
  },
  reverse: function reverse(dir) {
    switch (dir) {
      case Direction.Right:
        return Direction.Left;
      case Direction.Up:
        return Direction.Down;
      case Direction.Left:
        return Direction.Right;
      case Direction.Down:
        return Direction.Up;
    }
    return Direction.None;
  },
  rotate: function rotate(dir) {
    var ccw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    switch (dir) {
      case Direction.Right:
        return ccw ? Direction.Up : Direction.Down;
      case Direction.Up:
        return ccw ? Direction.Left : Direction.Right;
      case Direction.Left:
        return ccw ? Direction.Down : Direction.Up;
      case Direction.Down:
        return ccw ? Direction.Right : Direction.Left;
    }
    return Direction.None;
  },
  // determine which camera facing applies (seems to be working)
  adjustCameraDirection: function adjustCameraDirection(vec) {
    switch (vec.z % 8) {
      case 0:
        return 'N';
      case 1:
      case -7:
        return 'NW';
      case 2:
      case -6:
        return 'W';
      case 3:
      case -5:
        return 'SW';
      case 4:
      case -4:
        return 'S';
      case 5:
      case -3:
        return 'SE';
      case 6:
      case -2:
        return 'E';
      case 7:
      case -1:
        return 'NE';
    }
  },
  // Get camera-relative movement direction
  // Maps input directions (forward/backward/left/right) to world directions based on camera facing
  // The mapping is based on sprite sequence logic: which direction makes the character move "into" the screen
  getCameraRelativeDirection: function getCameraRelativeDirection(inputDir, cameraDir) {
    var mappings = {
      // Camera North: standard orientation
      'N': {
        forward: Direction.Up,
        backward: Direction.Down,
        left: Direction.Left,
        right: Direction.Right
      },
      // Camera NE: forward=down (moving toward NE on screen)
      'NE': {
        forward: Direction.Down,
        backward: Direction.Up,
        left: Direction.Left,
        right: Direction.Right
      },
      // Camera East: rotated 90°
      'E': {
        forward: Direction.Right,
        backward: Direction.Left,
        left: Direction.Up,
        right: Direction.Down
      },
      // Camera SE: forward=down (moving toward SE on screen)
      'SE': {
        forward: Direction.Down,
        backward: Direction.Up,
        left: Direction.Right,
        right: Direction.Left
      },
      // Camera South: inverted from North
      'S': {
        forward: Direction.Down,
        backward: Direction.Up,
        left: Direction.Right,
        right: Direction.Left
      },
      // Camera SW: forward=right (moving toward SW on screen)
      'SW': {
        forward: Direction.Right,
        backward: Direction.Left,
        left: Direction.Down,
        right: Direction.Up
      },
      // Camera West: rotated 270° from North
      'W': {
        forward: Direction.Left,
        backward: Direction.Right,
        left: Direction.Down,
        right: Direction.Up
      },
      // Camera NW: forward=right (moving toward NW on screen)
      'NW': {
        forward: Direction.Right,
        backward: Direction.Left,
        left: Direction.Up,
        right: Direction.Down
      }
    };
    var mapping = mappings[cameraDir] || mappings['N'];
    return mapping[inputDir] || Direction.None;
  },
  // sprite sequence facing (Needs work -- still not quite right)
  spriteSequence: function spriteSequence(dir) {
    var camera = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'N';
    switch (camera) {
      case 'N':
        switch (dir) {
          case Direction.Up:
            return 'N';
          case Direction.Right:
            return 'E';
          case Direction.Down:
            return 'S';
          case Direction.Left:
            return 'W';
        }
      case 'E':
        switch (dir) {
          case Direction.Up:
            return 'W';
          case Direction.Right:
            return 'N';
          case Direction.Down:
            return 'E';
          case Direction.Left:
            return 'S';
        }
      case 'S':
        switch (dir) {
          case Direction.Up:
            return 'S';
          case Direction.Right:
            return 'W';
          case Direction.Down:
            return 'N';
          case Direction.Left:
            return 'E';
        }
      case 'W':
        switch (dir) {
          case Direction.Up:
            return 'E';
          case Direction.Right:
            return 'S';
          case Direction.Down:
            return 'W';
          case Direction.Left:
            return 'N';
        }
      case 'NE':
        switch (dir) {
          case Direction.Up:
            return 'NW';
          case Direction.Right:
            return 'SE';
          case Direction.Down:
            return 'NE';
          case Direction.Left:
            return 'SW';
        }
      case 'SE':
        switch (dir) {
          case Direction.Up:
            return 'SW';
          case Direction.Right:
            return 'NW';
          case Direction.Down:
            return 'SE';
          case Direction.Left:
            return 'NE';
        }
      case 'SW':
        switch (dir) {
          case Direction.Up:
            return 'NE';
          case Direction.Right:
            return 'SW';
          case Direction.Down:
            return 'NW';
          case Direction.Left:
            return 'SE';
        }
      case 'NW':
        switch (dir) {
          case Direction.Up:
            return 'SE';
          case Direction.Right:
            return 'NE';
          case Direction.Down:
            return 'SW';
          case Direction.Left:
            return 'NW';
        }
    }
    return 'S';
  },
  // adjust draw offset based on rotation position
  drawOffset: function drawOffset(vec) {
    var camera = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'N';
    // return vec;
    // todo -- needs work
    switch (camera) {
      case 'NE':
        return vec.cross(new _vector.Vector(Math.sin(degToRad(315)), 2 * Math.cos(degToRad(315)), 0));
      case 'NW':
        return vec.cross(new _vector.Vector(-2 * Math.sin(degToRad(315)), -Math.cos(degToRad(315)), 0));
      case 'SE':
        return vec.cross(new _vector.Vector(Math.sin(degToRad(225)), Math.cos(degToRad(225)), 0));
      case 'SW':
        return vec.cross(new _vector.Vector(Math.sin(degToRad(135)), Math.cos(degToRad(135)), 0));
      case 'E':
        return vec.cross(new _vector.Vector(Math.sin(degToRad(270)), Math.cos(degToRad(270)), 0));
      case 'W':
        return vec.cross(new _vector.Vector(Math.sin(degToRad(90)), Math.cos(degToRad(90)), 0));
      case 'S':
        return vec.cross(new _vector.Vector(Math.sin(degToRad(180)), Math.cos(degToRad(180)), 0));
      case 'N':
        return vec.cross(new _vector.Vector(Math.sin(degToRad(0)), Math.cos(degToRad(0)), 0));
      default:
        return vec;
    }
  },
  // object sequence rotation (TODO)
  objectSequence: function objectSequence(dir) {
    switch (dir) {
      case Direction.Right:
        return [0, 90, 0];
      case Direction.Up:
        return [0, 0, 0];
      case Direction.Left:
        return [0, -90, 0];
      case Direction.Down:
        return [0, 180, 0];
    }
    return [0, 0, 0];
  }
};
var isObject = exports.isObject = function isObject(item) {
  return item && _typeof(item) === 'object' && !Array.isArray(item);
};
var _mergeDeep = exports.mergeDeep = function mergeDeep(target) {
  for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }
  if (!sources.length) return target;
  var source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (var key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, _defineProperty({}, key, {}));
        _mergeDeep(target[key], source[key]);
      } else {
        var _target$key;
        Object.assign(target, _defineProperty({}, key, source[key] && Array.isArray(source[key]) ? [].concat((_target$key = target[key]) !== null && _target$key !== void 0 ? _target$key : [], source[key]) : source[key]));
      }
    }
  }
  return _mergeDeep.apply(void 0, [target].concat(sources));
};