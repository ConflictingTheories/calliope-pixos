"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vec3 = exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
 * CameraController - A unified camera control system for both engine and editor
 * 
 * Supports:
 * - Spherical coordinate controls (yaw/pitch/distance)
 * - Both Y-up and Z-up coordinate systems
 * - Mouse drag rotation
 * - Mouse wheel zoom
 * - Keyboard WASD/Arrow movement
 * - Touch gesture support
 * - View matrix generation
 * 
 * @example
 * // For editor (Y-up):
 * const controller = new CameraController({ upAxis: 'y' });
 * 
 * // For engine (Z-up):
 * const controller = new CameraController({ upAxis: 'z' });
 * 
 * // Handle input
 * canvas.addEventListener('mousedown', e => controller.onMouseDown(e));
 * canvas.addEventListener('mousemove', e => controller.onMouseMove(e));
 * canvas.addEventListener('mouseup', e => controller.onMouseUp(e));
 * canvas.addEventListener('wheel', e => controller.onWheel(e));
 * 
 * // Get view matrix for rendering
 * const viewMatrix = controller.getViewMatrix();
 */

/**
 * Simple vec3 math utilities
 */
var vec3 = exports.vec3 = {
  sub: function sub(a, b) {
    var out = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0, 0];
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  },
  cross: function cross(a, b) {
    var out = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0, 0];
    var ax = a[0],
      ay = a[1],
      az = a[2];
    var bx = b[0],
      by = b[1],
      bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  },
  dot: function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  },
  length: function length(v) {
    return Math.hypot(v[0], v[1], v[2]);
  },
  normalize: function normalize(v) {
    var out = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
    var len = vec3.length(v);
    if (len === 0) return out;
    out[0] = v[0] / len;
    out[1] = v[1] / len;
    out[2] = v[2] / len;
    return out;
  },
  add: function add(a, b) {
    var out = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0, 0];
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  },
  scale: function scale(v, s) {
    var out = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0, 0];
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    out[2] = v[2] * s;
    return out;
  }
};

/**
 * Camera configuration options
 * @typedef {Object} CameraConfig
 * @property {'y'|'z'} [upAxis='z'] - The up axis ('y' for Y-up, 'z' for Z-up)
 * @property {number} [yaw=0] - Initial yaw in radians
 * @property {number} [pitch=0] - Initial pitch in radians
 * @property {number} [distance=10] - Initial distance from target
 * @property {number[]} [target=[0,0,0]] - Initial target position
 * @property {number} [rotationSpeed=0.005] - Mouse rotation sensitivity
 * @property {number} [zoomSpeed=0.1] - Scroll wheel zoom sensitivity
 * @property {number} [panSpeed=0.5] - Keyboard pan speed
 * @property {number} [minDistance=0.1] - Minimum zoom distance
 * @property {number} [maxDistance=1000] - Maximum zoom distance
 * @property {number} [minPitch=-Math.PI/2+0.01] - Minimum pitch (avoid gimbal lock)
 * @property {number} [maxPitch=Math.PI/2-0.01] - Maximum pitch (avoid gimbal lock)
 */

/**
 * Unified camera controller class
 */
var CameraController = exports["default"] = /*#__PURE__*/function () {
  /**
   * @param {CameraConfig} [config={}] Configuration options
   */
  function CameraController() {
    var _config$yaw, _config$pitch, _config$distance, _config$rotationSpeed, _config$zoomSpeed, _config$panSpeed, _config$minDistance, _config$maxDistance, _config$minPitch, _config$maxPitch;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, CameraController);
    // Coordinate system
    this.upAxis = config.upAxis || 'z';

    // Spherical coordinates
    this.yaw = (_config$yaw = config.yaw) !== null && _config$yaw !== void 0 ? _config$yaw : 0;
    this.pitch = (_config$pitch = config.pitch) !== null && _config$pitch !== void 0 ? _config$pitch : 0;
    this.distance = (_config$distance = config.distance) !== null && _config$distance !== void 0 ? _config$distance : 10;

    // Target position
    this.target = config.target ? _toConsumableArray(config.target) : [0, 0, 0];

    // Computed position
    this.position = [0, 0, 0];

    // Control sensitivities
    this.rotationSpeed = (_config$rotationSpeed = config.rotationSpeed) !== null && _config$rotationSpeed !== void 0 ? _config$rotationSpeed : 0.005;
    this.zoomSpeed = (_config$zoomSpeed = config.zoomSpeed) !== null && _config$zoomSpeed !== void 0 ? _config$zoomSpeed : 0.1;
    this.panSpeed = (_config$panSpeed = config.panSpeed) !== null && _config$panSpeed !== void 0 ? _config$panSpeed : 0.5;

    // Limits
    this.minDistance = (_config$minDistance = config.minDistance) !== null && _config$minDistance !== void 0 ? _config$minDistance : 0.1;
    this.maxDistance = (_config$maxDistance = config.maxDistance) !== null && _config$maxDistance !== void 0 ? _config$maxDistance : 1000;
    this.minPitch = (_config$minPitch = config.minPitch) !== null && _config$minPitch !== void 0 ? _config$minPitch : -Math.PI / 2 + 0.01;
    this.maxPitch = (_config$maxPitch = config.maxPitch) !== null && _config$maxPitch !== void 0 ? _config$maxPitch : Math.PI / 2 - 0.01;

    // Drag state
    this._dragging = false;
    this._lastMouse = {
      x: 0,
      y: 0
    };

    // Touch state
    this._lastTouch = null;
    this._lastPinchDist = null;

    // Cached view matrix
    this._viewMatrix = new Float32Array(16);
    this._dirty = true;

    // Update position
    this._updatePosition();
  }

  /**
   * Update camera position from spherical coordinates
   * @private
   */
  return _createClass(CameraController, [{
    key: "_updatePosition",
    value: function _updatePosition() {
      var cosPitch = Math.cos(this.pitch);
      var sinPitch = Math.sin(this.pitch);
      var cosYaw = Math.cos(this.yaw);
      var sinYaw = Math.sin(this.yaw);
      if (this.upAxis === 'y') {
        // Y-up coordinate system (common in WebGL editors)
        this.position[0] = this.target[0] + this.distance * sinYaw * cosPitch;
        this.position[1] = this.target[1] + this.distance * sinPitch;
        this.position[2] = this.target[2] + this.distance * cosYaw * cosPitch;
      } else {
        // Z-up coordinate system (engine default)
        this.position[0] = this.target[0] + this.distance * cosPitch * cosYaw;
        this.position[1] = this.target[1] + this.distance * cosPitch * sinYaw;
        this.position[2] = this.target[2] + this.distance * sinPitch;
      }
      this._dirty = true;
    }

    /**
     * Clamp pitch to avoid gimbal lock
     * @private
     */
  }, {
    key: "_clampPitch",
    value: function _clampPitch() {
      this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
    }

    /**
     * Clamp distance to limits
     * @private
     */
  }, {
    key: "_clampDistance",
    value: function _clampDistance() {
      this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
    }

    /**
     * Set camera target and update view
     * @param {number[]} target - [x, y, z] target position
     */
  }, {
    key: "setTarget",
    value: function setTarget(target) {
      this.target = _toConsumableArray(target);
      this._updatePosition();
    }

    /**
     * Rotate camera by delta angles
     * @param {number} dYaw - Yaw delta in radians
     * @param {number} dPitch - Pitch delta in radians
     */
  }, {
    key: "rotate",
    value: function rotate(dYaw, dPitch) {
      this.yaw += dYaw;
      this.pitch += dPitch;
      this._clampPitch();
      this._updatePosition();
    }

    /**
     * Zoom camera by delta distance
     * @param {number} delta - Distance delta (positive = zoom out)
     */
  }, {
    key: "zoom",
    value: function zoom(delta) {
      this.distance += delta;
      this._clampDistance();
      this._updatePosition();
    }

    /**
     * Pan camera (move target in camera-local space)
     * @param {string} direction - 'UP', 'DOWN', 'LEFT', 'RIGHT'
     */
  }, {
    key: "pan",
    value: function pan(direction) {
      var speed = this.panSpeed;

      // Calculate forward and right vectors based on yaw
      var forward, right;
      if (this.upAxis === 'y') {
        // Y-up: forward is in XZ plane
        forward = [Math.sin(this.yaw), 0, Math.cos(this.yaw)];
        right = [Math.cos(this.yaw), 0, -Math.sin(this.yaw)];
      } else {
        // Z-up: forward is in XY plane
        forward = [Math.cos(this.yaw), Math.sin(this.yaw), 0];
        right = [-Math.sin(this.yaw), Math.cos(this.yaw), 0];
      }
      switch (direction) {
        case 'UP':
          this.target = vec3.add(this.target, vec3.scale(forward, speed));
          break;
        case 'DOWN':
          this.target = vec3.add(this.target, vec3.scale(forward, -speed));
          break;
        case 'LEFT':
          this.target = vec3.add(this.target, vec3.scale(right, -speed));
          break;
        case 'RIGHT':
          this.target = vec3.add(this.target, vec3.scale(right, speed));
          break;
      }
      this._updatePosition();
    }

    /**
     * Handle mouse down event
     * @param {MouseEvent} event
     */
  }, {
    key: "onMouseDown",
    value: function onMouseDown(event) {
      event.preventDefault();
      this._dragging = true;
      this._lastMouse = {
        x: event.clientX,
        y: event.clientY
      };
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} event
     */
  }, {
    key: "onMouseMove",
    value: function onMouseMove(event) {
      if (!this._dragging) return;
      var dx = event.clientX - this._lastMouse.x;
      var dy = event.clientY - this._lastMouse.y;
      this._lastMouse = {
        x: event.clientX,
        y: event.clientY
      };
      this.rotate(-dx * this.rotationSpeed, -dy * this.rotationSpeed);
    }

    /**
     * Handle mouse up event
     * @param {MouseEvent} event
     */
  }, {
    key: "onMouseUp",
    value: function onMouseUp(event) {
      this._dragging = false;
    }

    /**
     * Handle mouse leave event
     * @param {MouseEvent} event
     */
  }, {
    key: "onMouseLeave",
    value: function onMouseLeave(event) {
      this._dragging = false;
    }

    /**
     * Handle wheel event (zoom)
     * @param {WheelEvent} event
     */
  }, {
    key: "onWheel",
    value: function onWheel(event) {
      event.preventDefault();
      var delta = event.deltaY > 0 ? this.distance * this.zoomSpeed : -this.distance * this.zoomSpeed;
      this.zoom(delta);
    }

    /**
     * Handle touch start event
     * @param {TouchEvent} event
     */
  }, {
    key: "onTouchStart",
    value: function onTouchStart(event) {
      event.preventDefault();
      if (event.touches.length === 1) {
        this._lastTouch = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      } else if (event.touches.length === 2) {
        // Pinch zoom start
        var dx = event.touches[0].clientX - event.touches[1].clientX;
        var dy = event.touches[0].clientY - event.touches[1].clientY;
        this._lastPinchDist = Math.hypot(dx, dy);
      }
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} event
     */
  }, {
    key: "onTouchMove",
    value: function onTouchMove(event) {
      event.preventDefault();
      if (event.touches.length === 1 && this._lastTouch) {
        // Single touch rotation
        var dx = event.touches[0].clientX - this._lastTouch.x;
        var dy = event.touches[0].clientY - this._lastTouch.y;
        this._lastTouch = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
        this.rotate(-dx * this.rotationSpeed, -dy * this.rotationSpeed);
      } else if (event.touches.length === 2 && this._lastPinchDist !== null) {
        // Pinch zoom
        var _dx = event.touches[0].clientX - event.touches[1].clientX;
        var _dy = event.touches[0].clientY - event.touches[1].clientY;
        var dist = Math.hypot(_dx, _dy);
        var delta = (this._lastPinchDist - dist) * this.zoomSpeed * 0.1;
        this.zoom(delta);
        this._lastPinchDist = dist;
      }
    }

    /**
     * Handle touch end event
     * @param {TouchEvent} event
     */
  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(event) {
      this._lastTouch = null;
      this._lastPinchDist = null;
    }

    /**
     * Build a lookAt view matrix
     * @returns {Float32Array} 4x4 view matrix
     */
  }, {
    key: "getViewMatrix",
    value: function getViewMatrix() {
      if (!this._dirty) return this._viewMatrix;
      var eye = this.position;
      var center = this.target;

      // Get up vector based on coordinate system
      var upVec = this.upAxis === 'y' ? [0, 1, 0] : [0, 0, 1];

      // Compute forward axis (normalized)
      var f = vec3.normalize(vec3.sub(center, eye));

      // Handle degenerate case
      if (!Number.isFinite(f[0]) || vec3.length(f) === 0) {
        f[0] = 0;
        f[1] = 0;
        f[2] = -1;
      }

      // Compute right axis (cross of up and forward)
      var s = vec3.normalize(vec3.cross(upVec, f));
      if (vec3.length(s) === 0) {
        s[0] = 1;
        s[1] = 0;
        s[2] = 0;
      }

      // Compute true up axis (cross of forward and right)
      var u = vec3.cross(f, s);

      // Build view matrix (column-major for WebGL)
      var out = this._viewMatrix;
      out[0] = s[0];
      out[1] = u[0];
      out[2] = -f[0];
      out[3] = 0;
      out[4] = s[1];
      out[5] = u[1];
      out[6] = -f[1];
      out[7] = 0;
      out[8] = s[2];
      out[9] = u[2];
      out[10] = -f[2];
      out[11] = 0;
      out[12] = -vec3.dot(s, eye);
      out[13] = -vec3.dot(u, eye);
      out[14] = vec3.dot(f, eye);
      out[15] = 1;
      this._dirty = false;
      return this._viewMatrix;
    }

    /**
     * Get current camera state for serialization
     * @returns {Object} Camera state
     */
  }, {
    key: "getState",
    value: function getState() {
      return {
        yaw: this.yaw,
        pitch: this.pitch,
        distance: this.distance,
        target: _toConsumableArray(this.target),
        position: _toConsumableArray(this.position)
      };
    }

    /**
     * Restore camera state from serialized data
     * @param {Object} state - Camera state object
     */
  }, {
    key: "setState",
    value: function setState(state) {
      if (state.yaw !== undefined) this.yaw = state.yaw;
      if (state.pitch !== undefined) this.pitch = state.pitch;
      if (state.distance !== undefined) this.distance = state.distance;
      if (state.target) this.target = _toConsumableArray(state.target);
      this._clampPitch();
      this._clampDistance();
      this._updatePosition();
    }

    /**
     * Get 8-directional facing string based on yaw
     * @returns {string} Direction string ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW')
     */
  }, {
    key: "getDirection",
    value: function getDirection() {
      // Convert yaw to degrees
      var yawDeg = this.yaw * 180 / Math.PI % 360;
      if (yawDeg < 0) yawDeg += 360;

      // Map to 8 directions
      // For Z-up: 0° = East (+X), 90° = North (+Y)
      // Adjust so 0° maps to North for sprite rendering
      var adjustedYaw = (90 - yawDeg + 360) % 360;
      var octant = Math.round(adjustedYaw / 45) % 8;
      var directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      return directions[octant];
    }

    /**
     * Attach event listeners to an element
     * @param {HTMLElement} element - Element to attach listeners to
     * @returns {Function} Cleanup function to remove listeners
     */
  }, {
    key: "attach",
    value: function attach(element) {
      var _this = this;
      var onMouseDown = function onMouseDown(e) {
        return _this.onMouseDown(e);
      };
      var onMouseMove = function onMouseMove(e) {
        return _this.onMouseMove(e);
      };
      var onMouseUp = function onMouseUp(e) {
        return _this.onMouseUp(e);
      };
      var onMouseLeave = function onMouseLeave(e) {
        return _this.onMouseLeave(e);
      };
      var onWheel = function onWheel(e) {
        return _this.onWheel(e);
      };
      var onTouchStart = function onTouchStart(e) {
        return _this.onTouchStart(e);
      };
      var onTouchMove = function onTouchMove(e) {
        return _this.onTouchMove(e);
      };
      var onTouchEnd = function onTouchEnd(e) {
        return _this.onTouchEnd(e);
      };
      element.addEventListener('mousedown', onMouseDown);
      element.addEventListener('mousemove', onMouseMove);
      element.addEventListener('mouseup', onMouseUp);
      element.addEventListener('mouseleave', onMouseLeave);
      element.addEventListener('wheel', onWheel, {
        passive: false
      });
      element.addEventListener('touchstart', onTouchStart, {
        passive: false
      });
      element.addEventListener('touchmove', onTouchMove, {
        passive: false
      });
      element.addEventListener('touchend', onTouchEnd);

      // Return cleanup function
      return function () {
        element.removeEventListener('mousedown', onMouseDown);
        element.removeEventListener('mousemove', onMouseMove);
        element.removeEventListener('mouseup', onMouseUp);
        element.removeEventListener('mouseleave', onMouseLeave);
        element.removeEventListener('wheel', onWheel);
        element.removeEventListener('touchstart', onTouchStart);
        element.removeEventListener('touchmove', onTouchMove);
        element.removeEventListener('touchend', onTouchEnd);
      };
    }
  }]);
}(); // Export vec3 utilities for external use