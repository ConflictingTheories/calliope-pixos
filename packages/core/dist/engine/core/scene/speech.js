"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _index = _interopRequireDefault(require("@Engine/core/queue/index.js"));
var _index2 = require("@Engine/core/hud/index.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
\*                                                 */ /**
 * @fileoverview Speech class for Pixos game engine.
 * Handles speech bubbles and text rendering.
 */
/**
 * @typedef {object} SpeechOptions
 * @property {boolean} [portrait] - Whether to include a portrait.
 */
/**
 * Speech - Handles speech bubbles and positioned text.
 */
var Speech = exports["default"] = /*#__PURE__*/_createClass(
/**
 * Creates an instance of Speech.
 * @param {HTMLCanvasElement} canvas - The canvas element.
 * @param {import('../index.js').default} engine - The game engine instance.
 * @param {string} id - The speech ID.
 */
function Speech(canvas, engine, id) {
  var _this = this;
  _classCallCheck(this, Speech);
  /**
   * Runs an action when loaded or adds to queue.
   * @param {function(): void} action - The action to run.
   */
  _defineProperty(this, "runWhenLoaded", function (action) {
    if (_this.loaded) action();else _this.onLoadActions.add(action);
  });
  /**
   * Loads the texture from the canvas.
   */
  _defineProperty(this, "loadImage", function () {
    var gl = _this.engine.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, _this.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _this.canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    _this.loaded = true;
    _this.onLoadActions.run();
  });
  /**
   * Binds the texture to the uniform.
   */
  _defineProperty(this, "attach", function () {
    var gl = _this.engine.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, _this.glTexture);
    gl.uniform1i(_this.engine.renderManager.shaderProgram.samplerUniform, 0);
  });
  /**
   * Clears the HUD overlay.
   */
  _defineProperty(this, "clearHud", function () {
    var ctx = _this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    _this.loadImage();
  });
  /**
   * Writes text to the HUD.
   * @param {string} text - The text to write.
   * @param {number} [x] - The x position.
   * @param {number} [y] - The y position.
   */
  _defineProperty(this, "writeText", function (text, x, y) {
    var ctx = _this.ctx;
    ctx.save();
    ctx.font = '32px minecraftia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(text, x !== null && x !== void 0 ? x : ctx.canvas.width / 2, y !== null && y !== void 0 ? y : ctx.canvas.height / 2);
    ctx.restore();
  });
  /**
   * Creates a scrolling textbox.
   * @param {string} text - The text to display.
   * @param {boolean} [scrolling=false] - Whether to scroll.
   * @param {SpeechOptions} [options={}] - Additional options.
   * @returns {textScrollBox} The textbox instance.
   */
  _defineProperty(this, "scrollText", function (text) {
    var scrolling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var txt = new _index2.textScrollBox(_this.ctx);
    if (options.portrait) {
      txt.init(text, 10, 10, _this.canvas.width - 20 - 84, 2 * _this.canvas.height / 3 - 20, options);
    } else {
      txt.init(text, 10, 10, _this.canvas.width - 20, 2 * _this.canvas.height / 3 - 20, options);
    }
    txt.setOptions(options);
    if (scrolling) {
      txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5);
    }
    txt.render();
    return txt;
  });
  /** @type {string} */
  this.id = id;
  /** @type {import('../index.js').default} */
  this.engine = engine;
  /** @type {HTMLCanvasElement} */
  this.canvas = canvas;
  /** @type {CanvasRenderingContext2D} */
  this.ctx = canvas.getContext('2d');
  /** @type {WebGLTexture} */
  this.glTexture = engine.gl.createTexture();
  /** @type {boolean} */
  this.loaded = false;
  /** @type {ActionQueue} */
  this.onLoadActions = new _index["default"]();
  this.loadImage();
});