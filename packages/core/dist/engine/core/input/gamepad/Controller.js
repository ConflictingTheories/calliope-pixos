"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = void 0;
var _ControllerStick = require("@Engine/core/input/gamepad/ControllerStick.js");
var _ControllerButtons = require("@Engine/core/input/gamepad/ControllerButtons.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
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
// Controller Manager for Gamepad
var Controller = exports.Controller = /*#__PURE__*/function () {
  /**
   * Creates an instance of Controller.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Object} buttonOffset - The offset for button placement.
   * @param {Object.<string, any>} touches - The touch state object.
   * @param {boolean} start - Whether start button is enabled.
   * @param {boolean} select - Whether select button is enabled.
   * @param {Object.<string, string>} colours - The color scheme.
   * @param {GamePad} gamepad - The parent gamepad instance.
   */
  function Controller(ctx, buttonOffset, touches, start, select, colours, gamepad) {
    _classCallCheck(this, Controller);
    /** @type {CanvasRenderingContext2D} */
    this.ctx = ctx;
    /** @type {GamePad} */
    this.gamepad = gamepad;
    /** @type {number} */
    this.width = ctx.canvas.width;
    /** @type {number} */
    this.height = ctx.canvas.height;
    /** @type {number} */
    this.radius = ctx.canvas.width / 10;
    /** @type {Object.<string, any>} */
    this.touches = touches;
    /** @type {boolean} */
    this.start = start;
    /** @type {boolean} */
    this.select = select;
    /** @type {Object} */
    this.buttonOffset = buttonOffset;
    /** @type {Object.<string, string>} */
    this.colours = colours;
    /** @type {Object} */
    this.layout = {
      x: this.width - this.buttonOffset.x,
      y: this.height - this.buttonOffset.y
    };
    /** @type {ControllerStick} */
    this.stick = new _ControllerStick.ControllerStick(this.ctx, this.layout, this.touches, this.colours, this.radius, this.gamepad);
    /** @type {ControllerButtons} */
    this.buttons = new _ControllerButtons.ControllerButtons(this.ctx, this.layout, this.touches, this.start, this.select, this.colours, this.radius, this.gamepad);
  }
  /**
   * Initializes the controller components.
   */
  return _createClass(Controller, [{
    key: "init",
    value: function init() {
      this.stick.init();
      this.buttons.init();
    }

    /**
     * Draws the controller components.
     */
  }, {
    key: "draw",
    value: function draw() {
      this.stick.draw();
      this.buttons.draw();
    }
  }]);
}();