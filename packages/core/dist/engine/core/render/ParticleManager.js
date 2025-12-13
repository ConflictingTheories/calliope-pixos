"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _vector = require("../../utils/math/vector.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
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
 * @typedef {object} ParticleConfig
 * @property {number} [count=8] - Number of particles to emit.
 * @property {number} [life=1000] - Lifetime in milliseconds.
 * @property {number} [speed=0.02] - Initial speed.
 * @property {number} [spread=0.5] - Spread factor for direction.
 * @property {number} [size=0.5] - Particle size.
 * @property {number[]} [color=[1.0, 0.7, 0.2]] - RGB color array.
 * @property {number[]} [gravity=[0, -0.00098, 0]] - Gravity vector.
 * @property {number} [drag=0.995] - Drag coefficient.
 * @property {string} [preset] - Preset name for quick config.
 */
/**
 * @typedef {object} Particle
 * @property {number[]} pos - Position [x, y, z].
 * @property {number[]} vel - Velocity [vx, vy, vz].
 * @property {number} life - Total lifetime.
 * @property {number} age - Current age.
 * @property {number} size - Size scalar.
 * @property {number[]} color - RGB color.
 * @property {number[]} gravity - Gravity vector.
 * @property {number} drag - Drag coefficient.
 */
/**
 * ParticleManager - Manages particle effects in the Pixos game engine.
 * Handles emission, physics updates, and rendering of particles.
 */
var ParticleManager = exports["default"] = /*#__PURE__*/_createClass(
/**
 * Creates an instance of ParticleManager.
 * @param {import('./manager.js').default} renderManager - The render manager instance.
 */
function ParticleManager(renderManager) {
  var _this = this;
  _classCallCheck(this, ParticleManager);
  /**
   * Initializes GL buffers. Called after RenderManager has initialized shaders/GL.
   * @returns {void}
   */
  _defineProperty(this, "init", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    if (!gl) return;

    // A simple unit quad centered at origin (two triangles)
    var quad = [-0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0];
    // Simple UVs (not used when not texturing)
    var uvs = [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0];
    _this.vertexPosBuf = _this.renderManager.createBuffer(quad, gl.STATIC_DRAW, 3);
    _this.vertexTexBuf = _this.renderManager.createBuffer(uvs, gl.STATIC_DRAW, 2);
    _this.initialized = true;
  });
  /**
   * Emits particles based on a config object.
   * @param {number[]|Vector} [position=[0, 0, 0]] - Position [x, y, z] or Vector.
   * @param {ParticleConfig} [config={}] - Configuration for particles.
   * @returns {void}
   */
  _defineProperty(this, "emit", function () {
    var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0, 0];
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    /** @type {number[]} */
    var pos = Array.isArray(position) ? position : position.toArray ? position.toArray() : [0, 0, 0];
    var x = pos[0],
      y = pos[1],
      zOffset = pos[2] || 0;
    /** @type {import('../../scene/zone.js').Zone|null} */
    var zone = _this.engine.spritz.world.zoneContaining(x, y);
    var z = zOffset;
    if (zone) {
      z += zone.getHeight(x, y);
    }
    pos = [x, y, z];

    /** @type {ParticleConfig} */
    var c = Object.assign({
      count: 8,
      life: 1000,
      // ms
      speed: 0.02,
      spread: 0.5,
      size: 0.5,
      color: [1.0, 0.7, 0.2],
      gravity: [0, -0.00098, 0],
      drag: 0.995
    }, config);
    for (var i = 0; i < c.count; i++) {
      // random direction in unit sphere
      var rx = (Math.random() * 2 - 1) * c.spread;
      var ry = (Math.random() * 2 - 1) * c.spread;
      var rz = (Math.random() * 2 - 1) * c.spread;
      var vx = rx * c.speed * (0.5 + Math.random() * 1.5);
      var vy = ry * c.speed * (0.5 + Math.random() * 1.5);
      var vz = rz * c.speed * (0.5 + Math.random() * 1.5);

      /** @type {Particle} */
      var particle = {
        pos: [pos[0], pos[1], pos[2]],
        vel: [vx, vy, vz],
        life: c.life,
        age: 0,
        size: c.size * (0.8 + Math.random() * 0.8),
        color: c.color,
        gravity: c.gravity,
        drag: c.drag
      };
      _this.particles.push(particle);
    }
  });
  /**
   * Returns a preset configuration for particles.
   * @param {string} name - The preset name.
   * @returns {ParticleConfig|null} The preset config or null if not found.
   */
  _defineProperty(this, "preset", function (name) {
    switch ((name || '').toLowerCase()) {
      case 'sparks':
        return {
          count: 12,
          life: 700,
          speed: 0.06,
          spread: 1.2,
          size: 0.15,
          color: [1, 0.8, 0.2],
          gravity: [0, -0.002, 0]
        };
      case 'flame':
        return {
          count: 200,
          life: 2000,
          speed: 0.02,
          spread: 0.8,
          size: 0.06,
          color: [1, 0.5, 0.1],
          gravity: [0, -0.0003, 0],
          drag: 0.995
        };
      case 'water':
        return {
          count: 20,
          life: 800,
          speed: 0.05,
          spread: 1.5,
          size: 0.12,
          color: [0.6, 0.7, 1.0],
          gravity: [0, -0.003, 0],
          drag: 0.996
        };
      case 'weapon':
        return {
          count: 6,
          life: 600,
          speed: 0.08,
          spread: 0.3,
          size: 0.18,
          color: [1, 1, 0.6],
          gravity: [0, -0.001, 0]
        };
      default:
        return null;
    }
  });
  /**
   * Updates particle physics. Timestamp in ms.
   * @param {number} timestamp - Current timestamp.
   * @returns {void}
   */
  _defineProperty(this, "update", function (timestamp) {
    if (!_this.lastUpdateTime) _this.lastUpdateTime = timestamp;
    var dt = timestamp - _this.lastUpdateTime;
    _this.lastUpdateTime = timestamp;
    if (!dt) return;

    // Update particle physics
    for (var i = _this.particles.length - 1; i >= 0; i--) {
      /** @type {Particle} */
      var p = _this.particles[i];
      // apply gravity
      p.vel[0] += (p.gravity[0] || 0) * dt;
      p.vel[1] += (p.gravity[1] || 0) * dt;
      p.vel[2] += (p.gravity[2] || 0) * dt;
      // apply drag
      p.vel[0] *= Math.pow(p.drag || 1, dt / 16.6667);
      p.vel[1] *= Math.pow(p.drag || 1, dt / 16.6667);
      p.vel[2] *= Math.pow(p.drag || 1, dt / 16.6667);
      // integrate
      p.pos[0] += p.vel[0] * dt;
      p.pos[1] += p.vel[1] * dt;
      p.pos[2] += p.vel[2] * dt;
      p.age += dt;
      if (p.age >= p.life) {
        _this.particles.splice(i, 1);
      }
    }
  });
  /**
   * Renders particles using the dedicated particle shader as proper billboards.
   * Particles are sorted back-to-front for correct alpha blending.
   * @returns {void}
   */
  _defineProperty(this, "render", function () {
    if (!_this.initialized) _this.init();
    if (!_this.initialized) return;
    if (!_this.particles.length) return;

    /** @type {import('./manager.js').default} */
    var rm = _this.renderManager;
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    /** @type {WebGLProgram} */
    var shader = rm.particleShaderProgram;
    if (!shader) return;

    // Reset all vertex attrib arrays to prevent errors from other shaders
    for (var i = 0; i < 8; i++) {
      gl.disableVertexAttribArray(i);
    }

    // Use particle shader
    gl.useProgram(shader);

    // Enable blending for transparency - additive blending for glow effects
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    // Disable depth writing (but keep depth test) for proper transparency
    gl.depthMask(false);

    // Enable vertex attributes for particle shader
    gl.enableVertexAttribArray(shader.aVertexPosition);
    gl.enableVertexAttribArray(shader.aTextureCoord);

    // Sort particles back-to-front based on distance from camera
    var cameraPos = rm.camera.cameraPosition;
    var sortedParticles = _toConsumableArray(_this.particles).sort(function (a, b) {
      var distA = Math.pow(a.pos[0] - cameraPos.x, 2) + Math.pow(a.pos[1] - cameraPos.y, 2) + Math.pow(a.pos[2] - cameraPos.z, 2);
      var distB = Math.pow(b.pos[0] - cameraPos.x, 2) + Math.pow(b.pos[1] - cameraPos.y, 2) + Math.pow(b.pos[2] - cameraPos.z, 2);
      return distB - distA; // Back to front
    });
    var _iterator = _createForOfIteratorHelper(sortedParticles),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var p = _step.value;
        rm.mvPushMatrix();

        // Set model matrix translation only (billboarding handled in shader)
        var m = rm.uModelMat;
        // Reset to identity
        for (var _i = 0; _i < 16; _i++) m[_i] = _i % 5 === 0 ? 1 : 0;
        // Set translation
        m[12] = p.pos[0];
        m[13] = p.pos[1];
        m[14] = p.pos[2];

        // Calculate alpha based on particle age (fade out towards end of life)
        var lifeRatio = p.age / p.life;
        var alpha = Math.max(0, 1.0 - lifeRatio * lifeRatio); // Quadratic fade

        // Set scale and matrix uniforms with alpha
        var scaleVec = new _vector.Vector(p.size, p.size, p.size);
        shader.setMatrixUniforms({
          scale: scaleVec,
          color: p.color,
          alpha: alpha
        });

        // Bind buffers and draw
        rm.bindBuffer(_this.vertexPosBuf, shader.aVertexPosition);
        rm.bindBuffer(_this.vertexTexBuf, shader.aTextureCoord);
        gl.drawArrays(gl.TRIANGLES, 0, _this.vertexPosBuf.numItems);
        rm.mvPopMatrix();
      }

      // Restore depth mask and blending
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    gl.depthMask(true);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Disable vertex attrib arrays to prevent WebGL state issues
    gl.disableVertexAttribArray(shader.aVertexPosition);
    gl.disableVertexAttribArray(shader.aTextureCoord);

    // cleanup
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
  });
  /** @type {import('./manager.js').default} */
  this.renderManager = renderManager;
  /** @type {import('../index.js').default} */
  this.engine = renderManager.engine;
  /** @type {Particle[]} */
  this.particles = [];
  /** @type {boolean} */
  this.initialized = false;
  /** @type {WebGLBuffer|null} */
  this.vertexPosBuf = null;
  /** @type {WebGLBuffer|null} */
  this.vertexTexBuf = null;
  /** @type {number|null} */
  this.lastUpdateTime = null;
});