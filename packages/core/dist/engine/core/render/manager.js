"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _matrix = require("../../utils/math/matrix4.js");
var _vector = require("../../utils/math/vector.js");
var _camera = _interopRequireDefault(require("./camera.js"));
var _light = _interopRequireDefault(require("./light.js"));
var _skybox = _interopRequireDefault(require("./skybox.js"));
var _shaders = require("./shaders.js");
var _ParticleManager = _interopRequireDefault(require("./ParticleManager.js"));
var _FrustumCuller = _interopRequireDefault(require("./FrustumCuller.js"));
var _CameraEffects = _interopRequireDefault(require("./CameraEffects.js"));
var _LODManager = _interopRequireDefault(require("./LODManager.js"));
var _TextureAtlas = _interopRequireDefault(require("./TextureAtlas.js"));
var _vs = _interopRequireDefault(require("../../shaders/particles/vs.js"));
var _fs = _interopRequireDefault(require("../../shaders/particles/fs.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
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
\*                                                 */ // Absolute imports
// Layout attribute key constants (from OBJ loader, defined inline to avoid import)
var LAYOUT_KEYS = {
  POSITION: 'position',
  NORMAL: 'normal',
  UV: 'uv'
};
/**
 * @typedef {object} ShaderSource
 * @property {string} vs - Vertex shader source code.
 * @property {string} fs - Fragment shader source code.
 */
/**
 * @typedef {object} EffectShaderConfig
 * @property {string} id - Unique identifier for the effect shader.
 * @property {string} vs - Vertex shader source code.
 * @property {string} fs - Fragment shader source code.
 * @property {function(RenderManager, WebGLProgram): WebGLProgram} init - Initialization function for the effect shader program.
 */
/**
 * @typedef {object} LightUniform
 * @property {WebGLUniformLocation|null} enabled - Whether the light is enabled.
 * @property {WebGLUniformLocation|null} color - Light color.
 * @property {WebGLUniformLocation|null} position - Light position.
 * @property {WebGLUniformLocation|null} attenuation - Light attenuation.
 * @property {WebGLUniformLocation|null} direction - Light direction.
 * @property {WebGLUniformLocation|null} scatteringCoefficients - Scattering coefficients.
 * @property {WebGLUniformLocation|null} density - Light density.
 */
/**
 * RenderManager - Manages all WebGL rendering operations, including shaders, cameras, lights,
 * and screen transitions. Acts as a central point for drawing the game world.
 */
var RenderManager = exports["default"] = /*#__PURE__*/_createClass(
/**
 * Creates an instance of RenderManager.
 * @param {import('../index.js').default} engine - The main game engine instance.
 * @returns {RenderManager} The singleton instance.
 */
function RenderManager(engine) {
  var _this = this;
  _classCallCheck(this, RenderManager);
  /**
   * Initializes the rendering manager, setting up WebGL context, shaders, and projection.
   * @returns {void}
   */
  _defineProperty(this, "init", function () {
    /** @type {import('../index.js').SpritzGame} */
    var _this$engine = _this.engine,
      spritz = _this$engine.spritz,
      gl = _this$engine.gl;
    if (!gl) {
      console.error('RenderManager.init called but engine.gl is null. Engine state:', {
        engineExists: !!_this.engine,
        glExists: !!gl,
        spritzExists: !!spritz
      });
      throw new Error('RenderManager initialization failed: WebGL context is null');
    }

    // Configure GL
    gl.clearColor(0, 1.0, 0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    _this.framebuffer = gl.createFramebuffer();

    // Initialize Main Shader Program
    _this.initShaderProgram(spritz.shaders);

    // Initialize Particle Shader Program
    _this.initParticleShaderProgram();

    // Initialize picker shader (special shader which allows for picking objects on screen)
    _this.initShaderEffects({
      id: 'picker',
      vs: require('../../shaders/picker/vs.js')["default"](),
      fs: require('../../shaders/picker/fs.js')["default"](),
      init: require('../../shaders/picker/init.js')["default"]
    });

    // Initialize Effects (TODO: Needs work, doesn't apply filter correctly)
    if (spritz.effects) {
      for (var i in spritz.effects) {
        // spritz.effectPrograms[i] = this.initShaderEffects(gl, spritz.effects[i]);
        if (process.env.NODE_ENV === 'development') {
          console.warn("Effect \"".concat(i, "\" is present but not fully implemented in RenderManager."));
        }
      }
    }

    // Initialize Projection Matrix
    _this.initProjection();

    // Initialize skybox
    _this.skyboxManager.init();

    // Initialize texture atlas for batched rendering
    _this.textureAtlas.init();
    _this.initializedWebGl = true;
  });
  /**
   * Loads and compiles a WebGL shader from source.
   * @param {number} type - The type of shader (e.g., `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`).
   * @param {string} source - The GLSL source code for the shader.
   * @returns {WebGLShader} The compiled shader.
   * @throws {Error} If the shader fails to compile.
   */
  _defineProperty(this, "loadShader", function (type, source) {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    /** @type {WebGLShader} */
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    // If error, log and delete
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error("An error occurred compiling the shaders: ".concat(log));
    }
    return shader;
  });
  /**
   * Initializes the main shader program used for rendering game objects.
   * Compiles vertex and fragment shaders, links them into a program, and retrieves all attribute and uniform locations.
   * @param {ShaderSource} shaders - An object containing vertex and fragment shader source.
   * @returns {WebGLProgram} The initialized shader program.
   * @throws {Error} If the shader program fails to link.
   */
  _defineProperty(this, "initShaderProgram", function (_ref) {
    var vsSource = _ref.vs,
      fsSource = _ref.fs;
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    var self = _this;
    /** @type {WebGLShader} */
    var vertexShader = _this.loadShader(gl.VERTEX_SHADER, vsSource);
    /** @type {WebGLShader} */
    var fragmentShader = _this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Generate shader program
    /** @type {WebGLProgram} */
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.bindAttribLocation(shaderProgram, 0, 'aVertexPosition');
    gl.bindAttribLocation(shaderProgram, 1, 'aTextureCoord');
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error("WebGL unable to initialize the shader program: ".concat(gl.getProgramInfoLog(shaderProgram)));
    }

    // Get attribute locations (don't enable them here - enable during render)
    shaderProgram.aVertexNormal = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
    shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');

    // Get uniform locations
    shaderProgram.uDiffuse = gl.getUniformLocation(shaderProgram, 'uDiffuse');
    shaderProgram.uSpecular = gl.getUniformLocation(shaderProgram, 'uSpecular');
    shaderProgram.uSpecularExponent = gl.getUniformLocation(shaderProgram, 'uSpecularExponent');
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, 'uNormalMatrix');
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
    shaderProgram.diffuseMapUniform = gl.getUniformLocation(shaderProgram, 'uDiffuseMap');
    shaderProgram.cameraPosition = gl.getUniformLocation(shaderProgram, "uCameraPosition");
    shaderProgram.runTransition = gl.getUniformLocation(shaderProgram, 'runTransition');
    shaderProgram.useSampler = gl.getUniformLocation(shaderProgram, 'useSampler');
    shaderProgram.useDiffuse = gl.getUniformLocation(shaderProgram, 'useDiffuse');
    shaderProgram.isSelected = gl.getUniformLocation(shaderProgram, 'isSelected');
    shaderProgram.colorMultiplier = gl.getUniformLocation(shaderProgram, 'uColorMultiplier');
    shaderProgram.scale = gl.getUniformLocation(shaderProgram, 'u_scale');
    shaderProgram.id = gl.getUniformLocation(shaderProgram, 'u_id');

    // Light uniforms
    shaderProgram.maxLights = 32; // Max number of lights supported by the shader
    /** @type {LightUniform[]} */
    shaderProgram.uLights = [];
    for (var i = 0; i < shaderProgram.maxLights; i++) {
      shaderProgram.uLights[i] = {
        enabled: gl.getUniformLocation(shaderProgram, "uLights[".concat(i, "].enabled")),
        color: gl.getUniformLocation(shaderProgram, "uLights[".concat(i, "].color")),
        position: gl.getUniformLocation(shaderProgram, "uLights[".concat(i, "].position")),
        attenuation: gl.getUniformLocation(shaderProgram, "uLights[".concat(i, "].attenuation")),
        direction: gl.getUniformLocation(shaderProgram, "uLights[".concat(i, "].direction")),
        scatteringCoefficients: gl.getUniformLocation(shaderProgram, "uLights[".concat(i, "].scatteringCoefficients")),
        density: gl.getUniformLocation(shaderProgram, "uLights[".concat(i, "].density"))
      };
    }

    /**
     * Sets the matrix and other common uniforms for the shader program.
     * @param {object} [options] - Options for setting uniforms.
     * @param {number[]|null} [options.id=null] - The object ID for picking (RGBA format).
     * @param {Vector|null} [options.scale=null] - The scale vector for the model.
     * @param {number} [options.sampler=1.0] - Whether to use a texture sampler (1.0) or material color (0.0).
     * @param {boolean} [options.isSelected=false] - Whether the object is currently selected.
     * @param {number[]|null} [options.colorMultiplier=null] - A color multiplier to apply to the object.
     * @returns {void}
     */
    shaderProgram.setMatrixUniforms = function (_ref2) {
      var _ref2$id = _ref2.id,
        id = _ref2$id === void 0 ? null : _ref2$id,
        _ref2$scale = _ref2.scale,
        scale = _ref2$scale === void 0 ? null : _ref2$scale,
        _ref2$sampler = _ref2.sampler,
        sampler = _ref2$sampler === void 0 ? 1.0 : _ref2$sampler,
        _ref2$isSelected = _ref2.isSelected,
        isSelected = _ref2$isSelected === void 0 ? false : _ref2$isSelected,
        _ref2$colorMultiplier = _ref2.colorMultiplier,
        colorMultiplier = _ref2$colorMultiplier === void 0 ? null : _ref2$colorMultiplier;
      // Ensure this program is active before setting uniforms
      gl.useProgram(shaderProgram);
      gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
      gl.uniformMatrix4fv(this.mMatrixUniform, false, self.uModelMat);
      gl.uniformMatrix4fv(this.vMatrixUniform, false, self.camera.uViewMat);

      // Normal matrix (for transforming normals correctly with model-view transformations)
      self.normalMatrix = (0, _matrix.create3)();
      (0, _matrix.normalFromMat4)(self.normalMatrix, self.uModelMat);
      gl.uniformMatrix3fv(this.nMatrixUniform, false, self.normalMatrix);

      // Scale
      gl.uniform3fv(this.scale, scale ? scale.toArray() : self.scale.toArray());

      // Selection and color multiplier
      gl.uniform4fv(this.id, id ? id : [1.0, 0.0, 0.0, 0.0]); // Default to a non-zero ID if not provided
      gl.uniform1f(this.isSelected, isSelected ? 1.0 : 0.0);
      gl.uniform4fv(this.colorMultiplier, colorMultiplier ? colorMultiplier : [1.0, 1.0, 1.0, 1.0]);

      // Use sampler or materials?
      gl.uniform1f(this.useSampler, sampler);

      // Transition state
      gl.uniform1f(this.runTransition, self.isTransitioning ? 1.0 : 0.0);

      // Camera position for lighting calculations
      gl.uniform3fv(this.cameraPosition, self.camera.cameraPosition.toArray());

      // Point lights
      self.lightManager.setMatrixUniforms();
    };
    var attrs = {
      aVertexPosition: LAYOUT_KEYS.POSITION,
      aVertexNormal: LAYOUT_KEYS.NORMAL,
      aTextureCoord: LAYOUT_KEYS.UV
    };
    /**
     * Applies attribute pointers for a given mesh, linking mesh buffer data to shader attributes.
     * @param {object} mesh - The mesh object containing vertex buffer layout.
     * @returns {void}
     */
    shaderProgram.applyAttributePointers = function (mesh) {
      var layout = mesh.vertexBuffer.layout;
      for (var attrName in attrs) {
        if (!attrs.hasOwnProperty(attrName) || shaderProgram[attrName] === -1) {
          continue;
        }
        var layoutKey = attrs[attrName];
        if (shaderProgram[attrName] !== -1) {
          var attr = layout.attributeMap[layoutKey];
          gl.vertexAttribPointer(shaderProgram[attrName], attr.size, gl[attr.type], attr.normalized, attr.stride, attr.offset);
        }
      }
    };
    // Disable aVertexNormal by default if not always used, or ensure it's enabled when needed.
    // For now, keeping it enabled as per original code, but noting it for potential optimization.
    // gl.disableVertexAttribArray(shaderProgram.aVertexNormal);

    _this.shaderProgram = shaderProgram;
    return shaderProgram;
  });
  /**
   * Initializes the particle shader program for optimized particle rendering.
   * @returns {WebGLProgram} The initialized particle shader program.
   * @throws {Error} If the particle shader program fails to link.
   */
  _defineProperty(this, "initParticleShaderProgram", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    var self = _this;
    var vsSource = (0, _vs["default"])();
    var fsSource = (0, _fs["default"])();

    /** @type {WebGLShader} */
    var vertexShader = _this.loadShader(gl.VERTEX_SHADER, vsSource);
    /** @type {WebGLShader} */
    var fragmentShader = _this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Generate particle shader program
    /** @type {WebGLProgram} */
    var particleShaderProgram = gl.createProgram();
    gl.attachShader(particleShaderProgram, vertexShader);
    gl.attachShader(particleShaderProgram, fragmentShader);
    gl.bindAttribLocation(particleShaderProgram, 0, 'aVertexPosition');
    gl.bindAttribLocation(particleShaderProgram, 1, 'aTextureCoord');
    gl.linkProgram(particleShaderProgram);
    if (!gl.getProgramParameter(particleShaderProgram, gl.LINK_STATUS)) {
      throw new Error("WebGL unable to initialize the particle shader program: ".concat(gl.getProgramInfoLog(particleShaderProgram)));
    }

    // Get attribute locations (don't enable them here - enable during render)
    particleShaderProgram.aVertexPosition = gl.getAttribLocation(particleShaderProgram, 'aVertexPosition');
    particleShaderProgram.aTextureCoord = gl.getAttribLocation(particleShaderProgram, 'aTextureCoord');

    // Get uniform locations
    particleShaderProgram.pMatrixUniform = gl.getUniformLocation(particleShaderProgram, 'uProjectionMatrix');
    particleShaderProgram.mMatrixUniform = gl.getUniformLocation(particleShaderProgram, 'uModelMatrix');
    particleShaderProgram.vMatrixUniform = gl.getUniformLocation(particleShaderProgram, 'uViewMatrix');
    particleShaderProgram.scaleUniform = gl.getUniformLocation(particleShaderProgram, 'uScale');
    particleShaderProgram.particleColorUniform = gl.getUniformLocation(particleShaderProgram, 'uParticleColor');
    particleShaderProgram.alphaUniform = gl.getUniformLocation(particleShaderProgram, 'uAlpha');

    /**
     * Sets the matrix and other common uniforms for the particle shader program.
     * @param {object} [options] - Options for setting uniforms.
     * @param {Vector|null} [options.scale=null] - The scale vector for the particle.
     * @param {number[]|null} [options.color=null] - The color of the particle.
     * @param {number} [options.alpha=1.0] - The alpha transparency of the particle.
     * @returns {void}
     */
    particleShaderProgram.setMatrixUniforms = function (_ref3) {
      var _ref3$color = _ref3.color,
        color = _ref3$color === void 0 ? null : _ref3$color,
        _ref3$scale = _ref3.scale,
        scale = _ref3$scale === void 0 ? null : _ref3$scale,
        _ref3$alpha = _ref3.alpha,
        alpha = _ref3$alpha === void 0 ? 1.0 : _ref3$alpha;
      // Ensure this program is active before setting uniforms
      gl.useProgram(particleShaderProgram);
      gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
      gl.uniformMatrix4fv(this.mMatrixUniform, false, self.uModelMat);
      gl.uniformMatrix4fv(this.vMatrixUniform, false, self.camera.uViewMat);

      // Scale
      gl.uniform3fv(this.scaleUniform, scale ? scale.toArray() : self.scale.toArray());

      // Color
      gl.uniform3fv(this.particleColorUniform, color ? color : [1.0, 1.0, 1.0]);

      // Alpha
      gl.uniform1f(this.alphaUniform, alpha);
    };
    _this.particleShaderProgram = particleShaderProgram;
    return particleShaderProgram;
  });
  /**
   * Updates particles. Call from engine loop with timestamp.
   * @param {number} timestamp - The current timestamp.
   * @returns {void}
   */
  _defineProperty(this, "updateParticles", function (timestamp) {
    if (_this.particleManager && typeof _this.particleManager.update === 'function') {
      _this.particleManager.update(timestamp);
    }
  });
  /**
   * Renders particles. Should be called after main scene draw or where appropriate.
   * @returns {void}
   */
  _defineProperty(this, "renderParticles", function () {
    if (_this.particleManager && typeof _this.particleManager.render === 'function') {
      _this.particleManager.render();
    }
  });
  /**
   * Resets all vertex attribute arrays to a clean state.
   * This should be called when switching between different shader programs
   * to prevent WebGL errors from enabled but unbound attributes.
   * @returns {void}
   */
  _defineProperty(this, "resetVertexAttribArrays", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    // Disable a reasonable number of attrib arrays (most shaders use < 8)
    for (var i = 0; i < 8; i++) {
      gl.disableVertexAttribArray(i);
    }
  });
  /**
   * Activates the main shader program for rendering.
   * Sets the program as current and binds the default framebuffer.
   * @returns {void}
   */
  _defineProperty(this, "activateShaderProgram", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;

    // Clear picker pass flag - back to normal rendering
    _this.isPickerPass = false;

    // Reset vertex attrib state before switching shader
    _this.resetVertexAttribArrays();
    gl.useProgram(_this.shaderProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Render to screen
    _this.initProjection(); // Re-initialize projection in case canvas size changed
  });
  /**
   * Activates the picker shader program for object selection.
   * Renders objects with unique color IDs for picking.
   * @param {boolean} useFrustum - If true, a 1x1 pixel frustum is used for optimized picking.
   * @returns {void}
   */
  _defineProperty(this, "activatePickerShaderProgram", function (useFrustum) {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;

    // Set picker pass flag - objects will check this to use picker uniforms only
    _this.isPickerPass = true;
    gl.useProgram(_this.effectPrograms['picker']);

    // TODO: Improve performance - make it only 1x1 pixel framebuffer - and avoid needing to reclear screen.
    if (useFrustum) {
      // Bind frame buffer (TODO: Not working as expected, needs investigation)
      gl.bindFramebuffer(gl.FRAMEBUFFER, _this.framebuffer);
      _this.initProjection(); // Re-initialize projection for the frustum
      _this.applyPixelFrustum();
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Render to screen for full-screen picking pass
      _this.initProjection(); // Re-initialize projection for full screen
    }
  });
  /**
   * Activates a specific shader effect program.
   * @param {string} id - The ID of the effect program to activate.
   * @returns {void}
   */
  _defineProperty(this, "activateShaderEffectProgram", function (id) {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    gl.useProgram(_this.effectPrograms[id]);
  });
  /**
   * Initializes a shader effect program.
   * Compiles the shaders for a given effect, links them, and calls an initialization callback to set up any effect-specific uniforms or attributes.
   * @param {EffectShaderConfig} config - Configuration object for the effect shader.
   * @returns {WebGLProgram} The initialized effect shader program.
   * @throws {Error} If the shader effect program fails to link.
   */
  _defineProperty(this, "initShaderEffects", function (_ref4) {
    var vsSource = _ref4.vs,
      fsSource = _ref4.fs,
      id = _ref4.id,
      init = _ref4.init;
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    var self = _this;
    /** @type {WebGLShader} */
    var vertexShader = _this.loadShader(gl.VERTEX_SHADER, vsSource);
    /** @type {WebGLShader} */
    var fragmentShader = _this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Generate shader program
    /** @type {WebGLProgram} */
    var effectProgram = gl.createProgram();
    gl.attachShader(effectProgram, vertexShader);
    gl.attachShader(effectProgram, fragmentShader);
    gl.bindAttribLocation(effectProgram, 0, 'aVertexPosition');
    gl.bindAttribLocation(effectProgram, 1, 'aTextureCoord');
    gl.linkProgram(effectProgram);
    if (!gl.getProgramParameter(effectProgram, gl.LINK_STATUS)) {
      throw new Error("WebGL unable to initialize the shader effect program: ".concat(gl.getProgramInfoLog(effectProgram)));
    }

    // Apply callback to initialize effect-specific uniforms/attributes
    _this.effectPrograms[id] = init.call(self, effectProgram);
    _this.effects.push(id);

    // No need to keep shaders after linking.
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return _this.effectPrograms[id];
  });
  /**
   * Sets up the projection matrix based on the camera's field of view and canvas aspect ratio.
   * Configures the WebGL viewport and depth/blend states.
   * @returns {void}
   */
  _defineProperty(this, "initProjection", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    var fieldOfView = (0, _vector.degToRad)(_this.camera.fov);
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 0.1;
    var zFar = 100.0;
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    _this.uProjMat = (0, _matrix.perspective)(fieldOfView, aspect, zNear, zFar);
    // Do not reinitialize camera.uViewMat here — the Camera instance manages its own view matrix.
    // Overwriting it each frame would discard any runtime modifications (e.g., FreeCam).
    if (!_this.camera.uViewMat) {
      _this.camera.uViewMat = (0, _matrix.create)();
    }
    // TODO: Investigate why projectionMatrix[5] is multiplied by -1. This often indicates
    // a coordinate system mismatch (e.g., WebGL's Y-up vs. a different convention).
    // It might be a workaround that could be resolved by adjusting camera or model matrices.
    _this.uProjMat[5] *= -1;
  });
  /**
   * Enables back-face culling.
   * @returns {void}
   */
  _defineProperty(this, "enableCulling", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  });
  /**
   * Disables back-face culling.
   * @returns {void}
   */
  _defineProperty(this, "disableCulling", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    gl.disable(gl.CULL_FACE);
  });
  /**
   * Enables blending.
   * @returns {void}
   */
  _defineProperty(this, "enableBlending", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    gl.enable(gl.BLEND);
  });
  /**
   * Disables blending.
   * @returns {void}
   */
  _defineProperty(this, "disableBlending", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    gl.disable(gl.BLEND);
  });
  /**
   * Clears the color and depth buffers of the WebGL canvas.
   * @returns {void}
   */
  _defineProperty(this, "clearScreen", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  });
  /**
   * Applies a 1x1 pixel frustum for optimized object picking.
   * Narrows the view to a single pixel under the mouse cursor.
   * TODO: This functionality needs to be thoroughly tested and potentially refined as it's marked as "not working" in `activatePickerShaderProgram`.
   * @returns {void}
   */
  _defineProperty(this, "applyPixelFrustum", function () {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    var zNear = 0.1;
    var zFar = 100.0;
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var top = Math.tan((0, _vector.degToRad)(_this.camera.fov) * 0.5) * zNear;
    var bottom = -top;
    var left = aspect * bottom;
    var right = aspect * top;
    var width = Math.abs(right - left);
    var height = Math.abs(top - bottom);

    // Compute the portion of the near plane that covers the 1 pixel under the mouse.
    var mouseX = _this.engine.gamepad.x || 0;
    var mouseY = _this.engine.gamepad.y || 0;
    var pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
    var pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
    var subLeft = left + pixelX * width / gl.canvas.width;
    var subBottom = bottom + pixelY * height / gl.canvas.height;
    var subWidth = width / gl.canvas.width;
    var subHeight = height / gl.canvas.height;
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.viewport(0, 0, 1, 1); // Set viewport to 1x1 pixel

    _this.uProjMat = (0, _matrix.frustum)(subLeft, subLeft + subWidth, subBottom, subBottom + subHeight, zNear, zFar);
    _this.uProjMat[5] *= -1; // Apply the same Y-axis inversion as in initProjection
  });
  /**
   * Toggles fullscreen mode for the game canvas.
   * @returns {void}
   */
  _defineProperty(this, "toggleFullscreen", function () {
    if (!_this.fullscreen) {
      try {
        _this.engine.gamepadcanvas.parentElement.requestFullscreen();
        _this.fullscreen = true;
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to enter fullscreen:', e);
        }
      }
    } else {
      try {
        document.exitFullscreen();
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to exit fullscreen:', e);
        }
      }
      _this.fullscreen = false;
    }
  });
  /**
   * Pushes the current model and view matrices onto a stack.
   * Useful for hierarchical transformations where a parent's transformation needs to be temporarily saved before applying child transformations.
   * @returns {void}
   */
  _defineProperty(this, "mvPushMatrix", function () {
    var copyModel = (0, _matrix.create)();
    (0, _matrix.set)(_this.uModelMat, copyModel);
    var copyView = (0, _matrix.create)();
    (0, _matrix.set)(_this.camera.uViewMat, copyView);
    _this.modelViewMatrixStack.push([copyModel, copyView]);
  });
  /**
   * Pops the last saved model and view matrices from the stack and applies them.
   * Restores the transformation state to a previous point.
   * @throws {Error} If the matrix stack is empty.
   * @returns {void}
   */
  _defineProperty(this, "mvPopMatrix", function () {
    if (_this.modelViewMatrixStack.length === 0) {
      throw new Error('Invalid popMatrix! Matrix stack is empty.');
    }
    var _this$modelViewMatrix = _this.modelViewMatrixStack.pop();
    var _this$modelViewMatrix2 = _slicedToArray(_this$modelViewMatrix, 2);
    _this.uModelMat = _this$modelViewMatrix2[0];
    _this.camera.uViewMat = _this$modelViewMatrix2[1];
  });
  /**
   * @deprecated This method seems to be an older transition implementation and is likely superseded by `startTransition` and `updateTransition`. It should be removed or refactored.
   * Renders a frame of the old transition system.
   * @returns {void}
   */
  _defineProperty(this, "transition", function () {
    var now = new Date().getMilliseconds();
    // This `this.transition.draw` call refers to an external object/API not defined here.
    // It's likely part of an older system.
    // this.transition.draw(
    //   ((this.transitionTime - now) / this.transitionDuration) % 1,
    //   this.transitionTexture,
    //   this.transitionTexture,
    //   this.engine.gl.canvas.width,
    //   this.engine.gl.canvas.height,
    //   this.transitionParams
    // );
    if (now >= _this.transitionTime) {
      _this.isTransitioning = false;
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn('Deprecated `RenderManager.transition()` method called. Use `startTransition()` and `updateTransition()` instead.');
    }
  });
  /**
   * Creates a new WebGL buffer.
   * @param {number[]} contents - The data to put into the buffer.
   * @param {number} type - The buffer usage type (e.g., `gl.STATIC_DRAW`, `gl.DYNAMIC_DRAW`).
   * @param {number} itemSize - The number of components per item (e.g., 3 for vec3, 2 for vec2).
   * @returns {WebGLBuffer} The created WebGL buffer.
   */
  _defineProperty(this, "createBuffer", function (contents, type, itemSize) {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    /** @type {WebGLBuffer} */
    var buf = gl.createBuffer();
    buf.itemSize = itemSize;
    buf.numItems = contents.length / itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(contents), type);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buf;
  });
  /**
   * Updates the data in an existing WebGL buffer.
   * @param {WebGLBuffer} buffer - The buffer to update.
   * @param {number[]} contents - The new data to put into the buffer.
   * @returns {void}
   */
  _defineProperty(this, "updateBuffer", function (buffer, contents) {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(contents));
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  });
  /**
   * Binds a WebGL buffer to an attribute location.
   * @param {WebGLBuffer} buffer - The buffer to bind.
   * @param {number} attribute - The attribute location to bind the buffer to.
   * @returns {void}
   */
  _defineProperty(this, "bindBuffer", function (buffer, attribute) {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
  });
  /**
   * Begins a custom screen transition. Overlays an effect (fade, cross, or swirl) on top of the current scene for the specified duration.
   * When the effect completes, the returned Promise resolves. If another transition is already running, this will queue a new one once the current one finishes.
   * @param {{effect?: string, direction?: 'out'|'in', duration?: number}} params - Transition parameters.
   * @returns {Promise<void>} Resolves when the transition has completed.
   */
  _defineProperty(this, "startTransition", function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var _params$effect = params.effect,
      effect = _params$effect === void 0 ? 'fade' : _params$effect,
      _params$direction = params.direction,
      direction = _params$direction === void 0 ? 'out' : _params$direction,
      _params$duration = params.duration,
      duration = _params$duration === void 0 ? 1000 : _params$duration;
    // If another transition is currently active, we create a chained Promise that
    // will run after the existing one. This avoids overlapping transitions.
    var schedule = function schedule() {
      _this.isTransitioning = true;
      _this.transitionEffect = effect;
      _this.transitionDirection = direction;
      _this.transitionDuration = duration;
      _this.transitionStartTime = performance.now();
      return new Promise(function (resolve) {
        _this.transitionCallback = resolve;
      });
    };
    if (_this.isTransitioning) {
      // Chain onto the existing callback
      var prevCallback = _this.transitionCallback;
      return new Promise(function (resolve) {
        _this.transitionCallback = function () {
          prevCallback === null || prevCallback === void 0 || prevCallback();
          schedule().then(resolve);
        };
      });
    }
    return schedule();
  });
  /**
   * Updates an in-progress transition. Should be called once per frame from the engine render loop.
   * When the transition ends, it cleans up and calls the stored callback.
   * @returns {void}
   */
  _defineProperty(this, "updateTransition", function () {
    if (!_this.isTransitioning) {
      return;
    }
    var now = performance.now();
    var progress = (now - _this.transitionStartTime) / _this.transitionDuration;
    if (progress >= 1.0) {
      progress = 1.0;
    }
    // Draw the overlay using a GPU full-screen quad. Each effect has its own
    // compiled shader. We lazily compile the program on first use via
    // `initTransitionProgram()` and then draw a quad using the effect.
    _this.renderTransition(progress);
    if (progress >= 1.0) {
      // Finalize
      _this.isTransitioning = false;
      var cb = _this.transitionCallback;
      _this.transitionCallback = null;
      cb && cb();
    }
  });
  /**
   * Compiles and caches a WebGL shader program for the requested transition effect.
   * The program draws a full-screen quad with a fragment shader specific to the effect (fade, cross, or swirl).
   * This function is called automatically by `renderTransition()` the first time an effect is used.
   * @param {string} effect - Name of the transition effect.
   * @throws {Error} If the transition shader program fails to link.
   * @returns {void}
   */
  _defineProperty(this, "initTransitionProgram", function (effect) {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    // If already initialized, do nothing.
    if (_this.transitionGL[effect]) return;
    // Load shader sources from the transition shader files. We normalize
    // effect names that start with "fade" to the base "fade" directory.
    var effectName = effect;
    if (effectName.startsWith('fade')) {
      effectName = 'fade';
    }

    // Require the vertex and fragment shaders for the selected effect.
    var _fetchTransitionShade = (0, _shaders.fetchTransitionShaderFiles)(effectName),
      _fetchTransitionShade2 = _slicedToArray(_fetchTransitionShade, 2),
      vsSource = _fetchTransitionShade2[0],
      fsSource = _fetchTransitionShade2[1];

    // Compile and link the program.
    /** @type {WebGLShader} */
    var vertexShader = _this.loadShader(gl.VERTEX_SHADER, vsSource);
    /** @type {WebGLShader} */
    var fragmentShader = _this.loadShader(gl.FRAGMENT_SHADER, fsSource);
    /** @type {WebGLProgram} */
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.bindAttribLocation(program, 0, 'aPosition'); // Assuming 'aPosition' for fullscreen quad
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("Could not link transition shader program for effect \"".concat(effect, "\": ").concat(gl.getProgramInfoLog(program)));
    }
    // Create a buffer for the quad vertices (-1 to 1). We'll use a
    // triangle strip with four vertices.
    /** @type {WebGLBuffer} */
    var quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    // Four corners: bottom-left, top-left, bottom-right, top-right.
    var vertices = new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    // Get uniform locations.
    var uProgress = gl.getUniformLocation(program, 'uProgress');
    var uDirection = gl.getUniformLocation(program, 'uDirection');
    // Store compiled resources.
    _this.transitionGL[effect] = {
      program: program,
      buffer: quadBuffer,
      uProgress: uProgress,
      uDirection: uDirection
    };
    // No need to keep shaders after linking.
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  });
  /**
   * Renders the transition overlay. Draws a full-screen quad with the precompiled shader corresponding to the current transition effect.
   * @param {number} progress - A value between 0 and 1 indicating the progress of the transition.
   * @returns {void}
   */
  _defineProperty(this, "renderTransition", function (progress) {
    if (!_this.engine.spritz.loaded) return; // Only render if game is loaded
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;
    var effect = _this.transitionEffect || 'fade';
    // Ensure the program is compiled.
    _this.initTransitionProgram(effect);
    var trans = _this.transitionGL[effect];
    if (!trans) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Transition effect \"".concat(effect, "\" program not found."));
      }
      return;
    }
    // Save WebGL state that we'll modify. We need to disable the depth test and
    // set blending appropriately so the overlay blends over the 3D scene.
    var depthEnabled = gl.isEnabled(gl.DEPTH_TEST);
    var blendEnabled = gl.isEnabled(gl.BLEND);
    var prevBlendSrc = gl.getParameter(gl.BLEND_SRC_RGB);
    var prevBlendDst = gl.getParameter(gl.BLEND_DST_RGB);

    // Draw the quad.
    gl.useProgram(trans.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, trans.buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    // Set uniforms: progress and direction (0 for out, 1 for in).
    gl.uniform1f(trans.uProgress, progress);
    var directionVal = _this.transitionDirection === 'in' ? 1.0 : 0.0;
    gl.uniform1f(trans.uDirection, directionVal);
    // Configure blending and disable depth to ensure the overlay draws on top.
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // Draw the quad as a triangle strip (4 vertices -> 2 triangles).
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // Restore previous state.
    if (depthEnabled) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }
    if (!blendEnabled) {
      gl.disable(gl.BLEND);
    }
    gl.blendFunc(prevBlendSrc, prevBlendDst); // Restore previous blend function

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
  });
  /**
   * Renders the skybox.
   * @returns {void}
   */
  _defineProperty(this, "renderSkybox", function () {
    if (!_this.engine.spritz.loaded) return;
    _this.skyboxManager.renderSkybox(_this.uProjMat);
  });
  /**
   * Handles canvas resize events. Updates projection matrix and viewport.
   * @param {number} width - The new canvas width.
   * @param {number} height - The new canvas height.
   * @returns {void}
   */
  _defineProperty(this, "handleResize", function (width, height) {
    /** @type {WebGL2RenderingContext} */
    var gl = _this.engine.gl;

    // Update viewport
    gl.viewport(0, 0, width, height);

    // Recalculate projection matrix with new aspect ratio
    var fieldOfView = (0, _vector.degToRad)(_this.camera.fov);
    var aspect = width / height;
    var zNear = 0.1;
    var zFar = 100.0;
    _this.uProjMat = (0, _matrix.perspective)(fieldOfView, aspect, zNear, zFar);
    // Maintain Y-flip for coordinate system compatibility
    _this.uProjMat[5] *= -1;
  });
  /**
   * Resets debug counters at the start of a new frame. Should be invoked by the engine's render loop before any drawing takes place.
   * @returns {void}
   */
  _defineProperty(this, "resetDebugCounters", function () {
    if (_this.debug) {
      _this.debug.tilesDrawn = 0;
      _this.debug.spritesDrawn = 0;
      _this.debug.objectsDrawn = 0;
    }
  });
  if (!RenderManager._instance) {
    /** @type {import('../index.js').default} */
    this.engine = engine;
    /** @type {boolean} */
    this.fullscreen = engine.fullscreen;

    // Matrices
    /** @type {Float32Array} */
    this.uProjMat = (0, _matrix.create)();
    /** @type {Float32Array} */
    this.uModelMat = (0, _matrix.create)();
    /** @type {Float32Array} */
    this.normalMatrix = (0, _matrix.create3)();
    /** @type {Array<[Float32Array, Float32Array]>} */
    this.modelViewMatrixStack = [];

    // Properties
    /** @type {Vector} */
    this.scale = new _vector.Vector(1, 1, 1);
    /** @type {boolean} */
    this.initializedWebGl = false;

    // Effects
    /** @type {string[]} */
    this.effects = [];
    /** @type {Object.<string, WebGLProgram>} */
    this.effectPrograms = {};
    /** @type {WebGLFramebuffer|null} */
    this.framebuffer = null; // Framebuffer for off-screen rendering (e.g., picker)

    // Picker State - true when rendering for object picking
    /** @type {boolean} */
    this.isPickerPass = false;

    // Transitions
    /** @type {boolean} */
    this.isTransitioning = false;
    /** @type {string|null} */
    this.transitionEffect = null;
    /** @type {'out'|'in'} */
    this.transitionDirection = 'out';
    /** @type {number} */
    this.transitionDuration = 0;
    /** @type {number} */
    this.transitionStartTime = 0;
    /** @type {function(): void|null} */
    this.transitionCallback = null;
    /** @type {Object.<string, {program: WebGLProgram, buffer: WebGLBuffer, uProgress: WebGLUniformLocation, uDirection: WebGLUniformLocation}>} */
    this.transitionGL = {}; // Stores compiled transition shader programs and buffers

    /** @type {{tilesDrawn: number, spritesDrawn: number, objectsDrawn: number}} */
    this.debug = {
      tilesDrawn: 0,
      spritesDrawn: 0,
      objectsDrawn: 0
    };

    // Camera
    /** @type {CameraManager} */
    this.cameraManager = new _camera["default"](this);
    /** @type {import('./camera.js').Camera} */
    this.camera = this.cameraManager.camera;

    // Initialize camera effects after camera is created
    this.cameraEffects = new _CameraEffects["default"](this.camera);

    // Lights
    /** @type {LightManager} */
    this.lightManager = new _light["default"](this);

    // Skybox
    /** @type {SkyboxManager} */
    this.skyboxManager = new _skybox["default"](this);

    // Particle system
    /** @type {ParticleManager} */
    this.particleManager = new _ParticleManager["default"](this);

    // Frustum culling for performance optimization
    /** @type {FrustumCuller} */
    this.frustumCuller = new _FrustumCuller["default"](this);

    // Level of Detail manager for performance optimization
    /** @type {LODManager} */
    this.lodManager = new _LODManager["default"](this);

    // Texture atlas for batched rendering
    /** @type {TextureAtlas} */
    this.textureAtlas = new _TextureAtlas["default"](this);

    // Camera effects (shake, follow, fade, etc.)
    /** @type {CameraEffects} */
    this.cameraEffects = null; // Initialized after camera

    // Particle shader program
    /** @type {WebGLProgram|null} */
    this.particleShaderProgram = null;

    /** @type {WebGLProgram|null} */
    this.shaderProgram = null; // The main shader program for rendering game objects

    RenderManager._instance = this;
  }
  return RenderManager._instance;
});