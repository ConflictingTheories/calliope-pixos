"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.PointLight = void 0;
var _index = _interopRequireDefault(require("../index.js"));
var _manager = _interopRequireDefault(require("./manager.js"));
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
\*                                                 */
/**
 * LightManager - Manages lighting in the scene, including point lights and rendering.
 */
var LightManager = exports["default"] = /*#__PURE__*/_createClass(
/**
 * Creates an instance of LightManager.
 * @param {RenderManager} renderManager - The render manager instance.
 * @returns {LightManager} The singleton instance.
 */
function LightManager(renderManager) {
  var _this = this;
  _classCallCheck(this, LightManager);
  /**
   * Adds a light source to the renderer.
   * @param {string} id - The unique identifier for the light.
   * @param {number[]} pos - The position [x, y, z].
   * @param {number[]} color - The color [r, g, b].
   * @param {number[]} [attenuation=[0.8,0.8,0.8]] - The attenuation factors.
   * @param {number[]} [direction=[1,1,1]] - The direction vector.
   * @param {number} [density=1.0] - The density.
   * @param {number[]} [scatteringCoefficients=[1,1,1]] - The scattering coefficients.
   * @param {boolean} [enabled=true] - Whether the light is enabled.
   * @returns {string} The light ID.
   */
  _defineProperty(this, "addLight", function (id, pos, color) {
    var attenuation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [0.8, 0.8, 0.8];
    var direction = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [1, 1, 1];
    var density = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1.0;
    var scatteringCoefficients = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : [1, 1, 1];
    var enabled = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : true;
    var shaderProgram = _this.renderManager.shaderProgram;
    var index = _this.lights.length;
    if (index >= shaderProgram.maxLights) return;
    var light = new PointLight(_this.renderManager.engine, id, color, pos, attenuation, direction, density, scatteringCoefficients, enabled);
    _this.lights[id] = light;
    return id;
  });
  /**
   * Updates an existing light source.
   * @param {string} id - The light ID.
   * @param {number[]} [pos] - The new position.
   * @param {number[]} [color] - The new color.
   * @param {number[]} [attenuation] - The new attenuation.
   * @param {number[]} [direction] - The new direction.
   * @param {number} [density] - The new density.
   * @param {number[]} [scatteringCoefficients] - The new scattering coefficients.
   * @param {boolean} [enabled] - Whether to enable/disable.
   */
  _defineProperty(this, "updateLight", function (id, pos, color, attenuation, direction, density, scatteringCoefficients, enabled) {
    var light = _this.lights[id];
    if (!light) return;
    if (pos) light.pos = pos;
    if (color) light.color = color;
    if (attenuation) light.attenuation = attenuation;
    if (direction) light.direction = direction;
    if (density) light.density = density;
    if (scatteringCoefficients) light.scatteringCoefficients = scatteringCoefficients;
    if (enabled) light.enabled = enabled;
    _this.lights[id] = light;
  });
  /**
   * Removes a light source from the renderer.
   * @param {string} id - The light ID to remove.
   */
  _defineProperty(this, "removeLight", function (id) {
    delete _this.lights[id];
  });
  /**
   * Updates point lighting for all lights.
   */
  _defineProperty(this, "tick", function () {
    var keys = Object.keys(_this.lights);
    for (var i = 0; i < keys.length; i++) {
      _this.lights[keys[i]].tick();
    }
  });
  /**
   * Renders lights to the scene.
   */
  _defineProperty(this, "render", function () {
    var shaderProgram = _this.renderManager.shaderProgram;
    var lightUniforms = shaderProgram.uLights;
    if (!lightUniforms) return;
    for (var i = 0; i < shaderProgram.maxLights; i++) {
      var keys = Object.keys(_this.lights);
      if (!_this.lights[keys[i]]) continue;
      if (!_this.lights[keys[i]].enabled) continue;
      _this.lights[keys[i]].draw(lightUniforms[i]);
    }
  });
  /**
   * Sets matrix uniforms and renders lights to the frame.
   */
  _defineProperty(this, "setMatrixUniforms", function () {
    // update lights
    _this.tick();

    // render point lights to scene
    _this.render();
  });
  if (!LightManager.instance) {
    /** @type {Object.<string, PointLight>} */
    this.lights = {};
    /** @type {RenderManager} */
    this.renderManager = renderManager;
    /** @type {GLEngine} */
    this.engine = renderManager.engine;
    LightManager.instance = this;
  }
  return LightManager.instance;
});
/**
 * PointLight - Represents a point light source in the scene.
 */
var PointLight = exports.PointLight = /*#__PURE__*/_createClass(
/**
 * Creates an instance of PointLight.
 * @param {GLEngine} engine - The game engine instance.
 * @param {string} id - The light ID.
 * @param {number[]} color - The color [r, g, b].
 * @param {number[]} position - The position [x, y, z].
 * @param {number[]} attenuation - The attenuation factors.
 * @param {number[]} direction - The direction vector.
 * @param {number} density - The density.
 * @param {number[]} scatteringCoefficients - The scattering coefficients.
 * @param {boolean} enabled - Whether the light is enabled.
 */
function PointLight(engine, id, color, position, attenuation, direction, density, scatteringCoefficients, enabled) {
  var _this2 = this;
  _classCallCheck(this, PointLight);
  /**
   * Updates the light (e.g., for flicker effects).
   */
  _defineProperty(this, "tick", function () {
    // for (var i = 0; i < 3; i++) this.color[i] += Math.sin((0.0005 * this.frame * 180) / Math.PI) * 0.002;
    _this2.frame++;
  });
  /**
   * Draws the light to the scene.
   * @param {Object} lightUniforms - The light uniforms object.
   */
  _defineProperty(this, "draw", function (lightUniforms) {
    var gl = _this2.engine.gl;
    gl.uniform1f(lightUniforms.enabled, _this2.enabled);
    gl.uniform3fv(lightUniforms.position, _this2.pos);
    gl.uniform3fv(lightUniforms.color, _this2.color);
    gl.uniform3fv(lightUniforms.attenuation, _this2.attenuation);

    // Set new uniforms for volumetric lighting
    gl.uniform3fv(lightUniforms.direction, _this2.direction);
    gl.uniform3fv(lightUniforms.scatteringCoefficients, _this2.scatteringCoefficients);
    gl.uniform1f(lightUniforms.density, _this2.density);
  });
  /** @type {GLEngine} */
  this.engine = engine;
  /** @type {string} */
  this.id = id !== null && id !== void 0 ? id : 'light';
  /** @type {number[]} */
  this.color = color !== null && color !== void 0 ? color : [1.0, 1.0, 1.0];
  /** @type {number[]} */
  this.pos = position !== null && position !== void 0 ? position : [0.0, 0.0, 0.0];
  /** @type {number[]} */
  this.attenuation = attenuation !== null && attenuation !== void 0 ? attenuation : [0.5, 0.1, 0.0];
  /** @type {number} */
  this.density = density !== null && density !== void 0 ? density : 0.8;
  /** @type {number[]} */
  this.scatteringCoefficients = scatteringCoefficients !== null && scatteringCoefficients !== void 0 ? scatteringCoefficients : [0.5, 0.5, 0.5];
  /** @type {number[]} */
  this.direction = direction !== null && direction !== void 0 ? direction : [1.0, 1.0, 1.0];
  /** @type {boolean} */
  this.enabled = enabled !== null && enabled !== void 0 ? enabled : true;
  /** @type {number} */
  this.frame = 0;
});