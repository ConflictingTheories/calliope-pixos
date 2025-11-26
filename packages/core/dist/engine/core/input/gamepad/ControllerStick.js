"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ControllerStick = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
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
// Controller Joystick Manager
var ControllerStick = exports.ControllerStick = /*#__PURE__*/_createClass(
/**
 * Creates an instance of ControllerStick.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {Object} layout - The layout object for positioning.
 * @param {Object.<string, any>} touches - The touch state object.
 * @param {Object.<string, string>} colours - The color scheme.
 * @param {number} radius - The radius for the stick.
 * @param {GamePad} gamepad - The parent gamepad instance.
 */
function ControllerStick(_ctx, _layout, _touches, colours, radius, _gamepad) {
  var _this = this;
  _classCallCheck(this, ControllerStick);
  /**
   * Initializes the stick position and resets map values.
   */
  _defineProperty(this, "init", function () {
    var layout = _this.layout,
      width = _this.width;
    _this.x = width - layout.x;
    _this.y = layout.y + 3 * _this.radius / 8;
    _this.dx = _this.x;
    _this.dy = _this.y;
    _this.gamepad.map['x-dir'] = 0;
    _this.gamepad.map['y-dir'] = 0;
    _this.gamepad.map['x-axis'] = 0;
    _this.gamepad.map['y-axis'] = 0;
  });
  /**
   * Draws the joystick on the canvas.
   */
  _defineProperty(this, "draw", function () {
    var ctx = _this.ctx;
    ctx.fillStyle = _this.colours.joystick.base;
    ctx.beginPath();
    ctx.arc(_this.x, _this.y, _this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = _this.colours.joystick.dust;
    ctx.beginPath();
    ctx.arc(_this.x, _this.y, _this.radius - 5, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = _this.colours.joystick.stick;
    ctx.beginPath();
    ctx.arc(_this.x, _this.y, 10, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = _this.colours.joystick.ball;
    ctx.beginPath();
    ctx.arc(_this.dx, _this.dy, _this.radius - 10, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
  });
  /**
   * Manages the event state for the joystick.
   * @param {string} id - The touch identifier.
   * @param {string} [type] - The event type.
   */
  _defineProperty(this, "state", function (id, type) {
    var gamepad = _this.gamepad;
    var touches = gamepad.touches,
      map = gamepad.map,
      checkInput = gamepad.checkInput;
    var touch = {
      x: touches[id].x,
      y: touches[id].y
    };
    var dx = parseInt(touch.x - _this.x);
    var dy = parseInt(touch.y - _this.y);
    var dist = parseInt(Math.sqrt(dx * dx + dy * dy));
    // Start
    if (dist < _this.radius * 1.2) {
      if (!type) {
        touches[id].id = 'stick';
      } else {
        switch (type) {
          case 'mousedown':
            touches[id].id = 'stick';
            break;
        }
      }
    }
    // Stop
    if (dist < _this.radius * 2.5) {
      if (!type) {
        touches[id].id = 'stick';
      } else {
        if (touches[id].id == 'stick') switch (type) {
          case 'mouseup':
            delete touches[id].id;
            _this.reset();
            break;
        }
      }
    }
    // Move
    if (touches[id].id == 'stick') {
      if (Math.abs(parseInt(dx)) < _this.radius / 2) {
        _this.dx = _this.x + dx;
      }
      if (Math.abs(parseInt(dy)) < _this.radius / 2) {
        _this.dy = _this.y + dy;
      }
      map['x-axis'] = (_this.dx - _this.x) / (_this.radius / 2);
      map['y-axis'] = (_this.dy - _this.y) / (_this.radius / 2);
      map['x-dir'] = Math.round(map['x-axis']);
      map['y-dir'] = Math.round(map['y-axis']);
      if (dist > _this.radius * 2.5) {
        _this.reset();
        delete touches[id].id;
      }
      if (typeof checkInput === 'function') {
        _this.gamepad.checkInput();
      }
    }
  });
  /**
   * Resets the joystick state.
   */
  _defineProperty(this, "reset", function () {
    var map = _this.gamepad.map;
    _this.dx = _this.x;
    _this.dy = _this.y;
    map['x-dir'] = 0;
    map['y-dir'] = 0;
    map['x-axis'] = 0;
    map['y-axis'] = 0;
  });
  /** @type {CanvasRenderingContext2D} */
  this.ctx = _ctx;
  /** @type {GamePad} */
  this.gamepad = _gamepad;
  /** @type {number} */
  this.width = _ctx.canvas.width;
  /** @type {number} */
  this.height = _ctx.canvas.height;
  /** @type {Object} */
  this.layout = _layout;
  /** @type {Object.<string, any>} */
  this.touches = _touches;
  /** @type {number} */
  this.radius = radius;
  /** @type {number} */
  this.x = 0;
  /** @type {number} */
  this.y = 0;
  /** @type {number} */
  this.dx = 0;
  /** @type {number} */
  this.dy = 0;
  this.gamepad.map['x-dir'] = 0;
  this.gamepad.map['y-dir'] = 0;
  this.gamepad.map['x-axis'] = 0;
  this.gamepad.map['y-axis'] = 0;
  /** @type {Object.<string, string>} */
  this.colours = colours;
});