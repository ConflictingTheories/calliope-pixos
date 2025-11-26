"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.Camera = void 0;
var _matrix = require("../../utils/math/matrix4.js");
var _vector = require("../../utils/math/vector.js");
var _enums = require("../../utils/enums.js");
var _manager = _interopRequireDefault(require("./manager.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*                                                 *\
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
 * Camera - Manages camera position, orientation, and view matrix for 3D rendering.
 */
var Camera = exports.Camera = /*#__PURE__*/_createClass(
/**
 * Creates an instance of Camera.
 * @param {RenderManager} renderingManager - The rendering manager instance.
 */
function Camera(renderingManager) {
  var _this = this;
  _classCallCheck(this, Camera);
  /**
   * Sets the camera target and updates the view.
   * @param {Vector} target The new camera target.
   */
  _defineProperty(this, "setTarget", function (target) {
    _this.cameraTarget = target;
    _this.updateViewFromAngles();
  });
  /**
   * Sets the camera position and angle to default values.
   */
  _defineProperty(this, "setCamera", function () {
    // Legacy behavior preserved for engine scenes: build view matrix from
    // cameraAngle/cameraVector and cameraOffset so existing scene code
    // that expects this transform continues to render.
    // Reset view matrix to identity before applying legacy transforms so
    // transforms do not accumulate across frames.
    (0, _matrix.set)((0, _matrix.create)(), _this.uViewMat);
    (0, _matrix.translate)(_this.uViewMat, _this.uViewMat, [0.0, 0.0, -15.0]);
    (0, _matrix.rotate)(_this.uViewMat, _this.uViewMat, (0, _vector.degToRad)(_this.cameraAngle * _this.cameraVector.x), [1, 0, 0]);
    (0, _matrix.rotate)(_this.uViewMat, _this.uViewMat, (0, _vector.degToRad)(_this.cameraAngle * _this.cameraVector.y), [0, 1, 0]);
    (0, _matrix.rotate)(_this.uViewMat, _this.uViewMat, (0, _vector.degToRad)(_this.cameraAngle * _this.cameraVector.z), [0, 0, 1]);
    (0, _vector.negate)(_this.cameraPosition, _this.cameraOffset);
    (0, _matrix.translate)(_this.uViewMat, _this.uViewMat, _this.cameraOffset.toArray());

    // Update cameraDir based on cameraVector.z for sprite rendering
    _this.cameraDir = _enums.Direction.adjustCameraDirection(_this.cameraVector);
  });
  /**
   * Changes the camera angle.
   * @param {number} dTheta - The angle delta.
   */
  _defineProperty(this, "changeAngle", function (dTheta) {
    _this.lookAt(_this.cameraPosition.toArray(), _this.cameraOffset.toArray(), dTheta);
  });
  /**
   * Manually positions the camera and makes it look at a target.
   * @param {number[]} pos - The camera position [x, y, z].
   * @param {number[]} target - The target position [x, y, z].
   * @param {number} up - The up vector or angle.
   */
  _defineProperty(this, "lookAt", function (pos, target, up) {
    // Compute forward (z) axis from pos -> target. If degenerate (pos==target)
    // fall back to a safe forward vector to avoid NaNs in the view matrix.
    var forwardArr = (0, _matrix.normalize)((0, _matrix.subtractVectors)(pos, target));
    if (!Number.isFinite(forwardArr[0]) || !Number.isFinite(forwardArr[1]) || !Number.isFinite(forwardArr[2])) {
      forwardArr = [0, 0, 1];
    }
    var zAxis = _construct(_vector.Vector, _toConsumableArray(forwardArr));
    // If forward is near-zero length, pick a default forward
    if (zAxis.length() === 0) zAxis = new _vector.Vector(0, 0, 1);
    var xAxis = up.cross(zAxis).normal();
    // If up is parallel to forward, cross product may be zero; choose another up
    if (xAxis.length() === 0) {
      xAxis = new _vector.Vector(1, 0, 0);
    }
    var yAxis = zAxis.cross(xAxis).normal();
    // Build matrix in same layout used elsewhere in engine
    var viewMatrix = [xAxis.x, xAxis.y, xAxis.z, 0, yAxis.x, yAxis.y, yAxis.z, 0, zAxis.x, zAxis.y, zAxis.z, 0, pos.x, pos.y, pos.z, 1];
    _this.uViewMat = (0, _matrix.set)(viewMatrix, _this.uViewMat);
  });
  /**
   * Initializes camera position and angles from an existing view matrix.
   * @param {Float32Array} viewMat - The view matrix.
   */
  _defineProperty(this, "setFromViewMatrix", function (viewMat) {
    if (!viewMat) return;
    // position stored at indices 12,13,14 in our matrix layout
    try {
      _this.cameraPosition = new _vector.Vector(viewMat[12], viewMat[13], viewMat[14]);
      // zAxis stored at indices 8,9,10 --- note zAxis = normalize(pos - target)
      var zx = viewMat[8];
      var zy = viewMat[9];
      var zz = viewMat[10];
      // forward vector is -zAxis
      var fx = -zx;
      var fy = -zy;
      var fz = -zz;
      // compute yaw and pitch from forward vector
      // For Z-up coordinate system we treat X/Y as horizontal plane and Z as up.
      // yaw is angle in XY plane, pitch is elevation around horizontal plane.
      _this.yaw = Math.atan2(fy, fx);
      _this.pitch = Math.asin(fz / Math.max(1e-6, Math.hypot(fx, fy, fz)));
      // attempt to compute distance and target: assume target is along forward from position
      var forwardLen = Math.hypot(fx, fy, fz);
      var approxForward = new _vector.Vector(fx / (forwardLen || 1), fy / (forwardLen || 1), fz / (forwardLen || 1));
      // pick a reasonable distance if not set
      _this.cameraDistance = _this.cameraDistance || 15.0;
      _this.cameraTarget = _this.cameraPosition.add(approxForward.mul(_this.cameraDistance * -1));
    } catch (err) {
      // fallback: leave defaults
    }
  });
  /**
   * Updates the view matrix from camera position, yaw, and pitch.
   */
  _defineProperty(this, "updateViewFromAngles", function () {
    // Ensure camera parameters are finite and sane
    if (!Number.isFinite(_this.yaw)) _this.yaw = 0;
    if (!Number.isFinite(_this.pitch)) _this.pitch = 0;
    if (!Number.isFinite(_this.cameraDistance) || _this.cameraDistance <= 0) _this.cameraDistance = Math.max(0.1, Math.abs(_this.cameraDistance) || 15.0);
    // Compute camera world-space position (eye) from target + spherical coords
    // Z is up. yaw is angle around Z axis in XY plane. pitch is elevation.
    var ex = _this.cameraTarget.x + _this.cameraDistance * Math.cos(_this.pitch) * Math.cos(_this.yaw);
    var ey = _this.cameraTarget.y + _this.cameraDistance * Math.cos(_this.pitch) * Math.sin(_this.yaw);
    var ez = _this.cameraTarget.z + _this.cameraDistance * Math.sin(_this.pitch);
    var pos = new _vector.Vector(ex, ey, ez);
    // update stored cameraPosition
    _this.cameraPosition = new _vector.Vector(pos.x, pos.y, pos.z);
    var target = new _vector.Vector(_this.cameraTarget.x, _this.cameraTarget.y, _this.cameraTarget.z);
    // world up (Z-up coordinate system)
    var up = new _vector.Vector(0, 0, 1);
    _this.lookAt(pos, target, up);

    // Update cameraDir and cameraVector for sprite rendering
    // Convert yaw (radians) to 8-directional facing
    // yaw = 0 is East (+X), increases counter-clockwise
    var yawDeg = _this.yaw * 180 / Math.PI % 360;
    if (yawDeg < 0) yawDeg += 360;

    // Map yaw to 8 directions (N, NE, E, SE, S, SW, W, NW)
    // Adjust so 0° = North, 90° = West, 180° = South, 270° = East
    var adjustedYaw = (90 - yawDeg + 360) % 360;
    var octant = Math.round(adjustedYaw / 45) % 8;
    var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    _this.cameraDir = directions[octant];

    // Update cameraVector for legacy compatibility
    _this.cameraVector.z = octant;
  });
  /**
   * Translates the camera in the specified direction.
   * @param {string} direction - The direction: 'UP', 'LEFT', 'RIGHT', 'DOWN'.
   */
  _defineProperty(this, "translateCam", function (direction) {
    var speed = 0.5; // units per tick
    // Move the camera target in local camera plane (so camera orbits remain consistent)
    // forward points in the direction camera is facing (may have Z component)
    var forward = new _vector.Vector(Math.cos(_this.pitch) * Math.cos(_this.yaw), Math.cos(_this.pitch) * Math.sin(_this.yaw), Math.sin(_this.pitch)).normal();
    // right vector is perpendicular in XY plane (no Z component) for strafing
    var right = new _vector.Vector(-Math.sin(_this.yaw), Math.cos(_this.yaw), 0).normal();
    switch (direction) {
      case 'UP':
        // forward
        _this.cameraTarget = _this.cameraTarget.add(forward.mul(speed));
        break;
      case 'DOWN':
        // backward
        _this.cameraTarget = _this.cameraTarget.add(forward.mul(-speed));
        break;
      case 'LEFT':
        // strafe left
        _this.cameraTarget = _this.cameraTarget.add(right.mul(-speed));
        break;
      case 'RIGHT':
        // strafe right
        _this.cameraTarget = _this.cameraTarget.add(right.mul(speed));
        break;
    }
    _this.updateViewFromAngles();
  });
  /**
   * Rotates the camera in the specified direction.
   * @param {string} direction - The direction: 'LEFT', 'RIGHT', 'UP', 'DOWN'.
   */
  _defineProperty(this, "rotateCam", function (direction) {
    var speed = 0.05; // radians
    switch (direction) {
      case 'LEFT':
        _this.yaw -= speed;
        break;
      case 'RIGHT':
        _this.yaw += speed;
        break;
      case 'UP':
        _this.pitch = Math.max(-Math.PI / 2 + 0.01, _this.pitch - speed);
        break;
      case 'DOWN':
        _this.pitch = Math.min(Math.PI / 2 - 0.01, _this.pitch + speed);
        break;
    }
    _this.updateViewFromAngles();
  });
  /**
   * Zooms the camera in/out (positive delta zooms in).
   * @param {number} delta - The zoom delta.
   */
  _defineProperty(this, "zoom", function (delta) {
    _this.cameraDistance = Math.max(0.1, _this.cameraDistance + delta);
    _this.updateViewFromAngles();
  });
  /**
   * Pans the camera clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to pan.
   */
  _defineProperty(this, "panCW", function () {
    var radians = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Math.PI / 4;
    _this.yaw -= radians;
    _this.updateViewFromAngles();
  });
  /**
   * Pans the camera counter-clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to pan.
   */
  _defineProperty(this, "panCCW", function () {
    var radians = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Math.PI / 4;
    _this.yaw += radians;
    _this.updateViewFromAngles();
  });
  /**
   * Pitches the camera clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to pitch.
   */
  _defineProperty(this, "pitchCW", function () {
    var radians = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Math.PI / 4;
    _this.pitch -= radians;
    _this.updateViewFromAngles();
  });
  /**
   * Pitches the camera counter-clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to pitch.
   */
  _defineProperty(this, "pitchCCW", function () {
    var radians = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Math.PI / 4;
    _this.pitch += radians;
    _this.updateViewFromAngles();
  });
  /**
   * Tilts the camera clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to tilt.
   */
  _defineProperty(this, "tiltCW", function () {
    var radians = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Math.PI / 4;
    // tilt around forward axis — modify pitch slightly
    _this.pitch -= radians * 0.1;
    _this.updateViewFromAngles();
  });
  /**
   * Tilts the camera counter-clockwise.
   * @param {number} [radians=Math.PI/4] - The radians to tilt.
   */
  _defineProperty(this, "tiltCCW", function () {
    var radians = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Math.PI / 4;
    _this.pitch += radians * 0.1;
    _this.updateViewFromAngles();
  });
  // Add clamp method to Number prototype for easy use
  Number.prototype.clamp = function (min, max) {
    return this < min ? min : this > max ? max : this;
  };

  /** @type {RenderManager} */
  this.renderingManager = renderingManager;
  /** @type {Float32Array} */
  this.uViewMat = (0, _matrix.create)();
  /** @type {number} */
  this.fov = 45;
  /** @type {Vector} */
  this.thetaLimits = _construct(_vector.Vector, [1.5 * Math.PI, 1.8 * Math.PI, 0]);
  /** @type {number} */
  this.cameraAngle = 45;
  /** @type {Vector} */
  this.cameraVector = _construct(_vector.Vector, [1, 0, 0]);
  /** @type {string} */
  this.cameraDir = 'N';
  // Position and orientation (use yaw/pitch/distance/target for intuitive controls)
  /** @type {Vector} */
  this.cameraPosition = new _vector.Vector(8, 8, -1);
  /** @type {number} */
  this.yaw = 0; // radians
  /** @type {number} */
  this.pitch = 0; // radians
  /** @type {number} */
  this.cameraDistance = 15.0; // distance from target
  /** @type {Vector} */
  this.cameraTarget = new _vector.Vector(8, 8, -1);
  /** @type {Vector} */
  this.cameraOffset = new _vector.Vector(0, 0, 0);
});
/**
 * CameraManager - Singleton factory for managing the camera instance.
 */
var CameraManager = exports["default"] = /*#__PURE__*/_createClass(
/**
 * Creates an instance of CameraManager.
 * @param {RenderManager} renderingManager - The rendering manager instance.
 * @returns {CameraManager} The singleton instance.
 */
function CameraManager(renderingManager) {
  _classCallCheck(this, CameraManager);
  if (!CameraManager.instance) {
    /** @type {Camera} */
    this.camera = new Camera(renderingManager);
    CameraManager.instance = this;
  }
  return CameraManager.instance;
});