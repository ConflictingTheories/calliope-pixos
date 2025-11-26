"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _matrix = require("../../utils/math/matrix4.js");
var _vector = require("../../utils/math/vector.js");
var _texture = require("../resource/texture.js");
var _shaders = require("./shaders.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
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
 * SkyboxManager - Manages skybox rendering, including shader switching and cubemap setup.
 */
var SkyboxManager = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of SkyboxManager.
   * @param {RenderManager} renderManager - The render manager instance.
   * @returns {SkyboxManager} The singleton instance.
   */
  function SkyboxManager(renderManager) {
    var _this = this;
    _classCallCheck(this, SkyboxManager);
    /**
     * Loads and compiles shader source.
     * @param {number} type - The shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
     * @param {string} source - The shader source code.
     * @returns {WebGLShader} The compiled shader.
     */
    _defineProperty(this, "loadShader", function (type, source) {
      var gl = _this.engine.gl;
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      // if error clear
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shaders: ".concat(log));
      }
      return shader;
    });
    /**
     * Initializes the texture shader program (TODO: not working yet - needs to load from zip).
     * @param {Object} param1 - The shader sources.
     * @param {string} param1.vs - The vertex shader source.
     * @param {string} param1.fs - The fragment shader source.
     * @returns {WebGLProgram} The shader program.
     */
    _defineProperty(this, "initTextureShaderProgram", function (_ref) {
      var vsSource = _ref.vs,
        fsSource = _ref.fs;
      var gl = _this.engine.gl;
      var self = _this;
      var vertexShader = _this.loadShader(gl.VERTEX_SHADER, vsSource);
      var fragmentShader = _this.loadShader(gl.FRAGMENT_SHADER, fsSource);

      // generate shader program
      var shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);
      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error("WebGL unable to initialize the shader program: ".concat(shaderProgram));
      }

      // Set up attribute locations
      shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
      gl.enableVertexAttribArray(shaderProgram.aVertexPosition);

      // Set up uniform locations
      shaderProgram.uSkyboxTexture = gl.getUniformLocation(shaderProgram, 'uSkyboxTexture');
      shaderProgram.uSkyboxCenter = gl.getUniformLocation(shaderProgram, 'uSkyboxCenter');
      shaderProgram.uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
      shaderProgram.uModelMatrix = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
      shaderProgram.uViewMatrix = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
      // Set up uniform functions
      shaderProgram.setMatrixUniforms = function () {
        var modelMatrix = self.uModelMat;
        var viewMatrix = self.camera.uViewMat;
        var projectionMatrix = self.uProjMat;
        gl.uniformMatrix4fv(this.uProjectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(this.uModelMatrix, false, modelMatrix);
        gl.uniformMatrix4fv(this.uViewMatrix, false, viewMatrix);
      };
      _this.shaderProgram = shaderProgram;
      return shaderProgram;
    });
    if (!SkyboxManager.instance) {
      /** @type {RenderManager} */
      this.renderManager = renderManager;
      /** @type {GLEngine} */
      this.engine = renderManager.engine;
      SkyboxManager.instance = this;
    }
    return SkyboxManager.instance;
  }

  /**
   * Initializes the skybox with optional texture and shader.
   * @param {string|null} textureSrc - The texture source (TODO: allow custom texture loading).
   * @param {string} shaderName - The shader name.
   * @param {number[]} centre - The skybox center [x, y, z].
   */
  return _createClass(SkyboxManager, [{
    key: "setSkyboxShader",
    value: (
    /**
     * Changes the active skybox shader at runtime.
     * @param {string} shaderName - The shader name (e.g., 'cosmic', 'sunset', 'morning', 'sky').
     */
    function () {
      var _setSkyboxShader = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(shaderName) {
        var vs, fs;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              if (this.engine.gl) {
                _context.n = 1;
                break;
              }
              return _context.a(2);
            case 1:
              this.gl = this.engine.gl;
              // Dynamically import shader sources
              _context.n = 2;
              return function (specifier) {
                return new Promise(function (r) {
                  return r(specifier);
                }).then(function (s) {
                  return _interopRequireWildcard(require(s));
                });
              }("../../shaders/skybox/".concat(shaderName, "/vs.js"));
            case 2:
              vs = _context.v["default"]();
              _context.n = 3;
              return function (specifier) {
                return new Promise(function (r) {
                  return r(specifier);
                }).then(function (s) {
                  return _interopRequireWildcard(require(s));
                });
              }("../../shaders/skybox/".concat(shaderName, "/fs.js"));
            case 3:
              fs = _context.v["default"]();
              this.shaderProgram = this.initSkyboxShaderProgram(vs, fs);
              // Optionally re-init buffer/cubemap if needed
            case 4:
              return _context.a(2);
          }
        }, _callee, this);
      }));
      function setSkyboxShader(_x) {
        return _setSkyboxShader.apply(this, arguments);
      }
      return setSkyboxShader;
    }())
  }, {
    key: "init",
    value: (function () {
      var _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
        var textureSrc,
          shaderName,
          centre,
          vsCosmic,
          fsCosmic,
          _args2 = arguments;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              textureSrc = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : null;
              shaderName = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : 'cosmic';
              centre = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : [0.0, 0.0, 0.0];
              if (this.engine.gl) {
                _context2.n = 1;
                break;
              }
              return _context2.a(2);
            case 1:
              this.gl = this.engine.gl;
              if (!textureSrc) {
                _context2.n = 3;
                break;
              }
              _context2.n = 2;
              return this.engine.resourceManager.loadTextureFromZip(textureSrc, this.engine.spritz.zip);
            case 2:
              this.texture = _context2.v;
              this.texture.runWhenLoaded(this.createTextureSkyboxProgram);
              _context2.n = 6;
              break;
            case 3:
              _context2.n = 4;
              return function (specifier) {
                return new Promise(function (r) {
                  return r("".concat(specifier));
                }).then(function (s) {
                  return _interopRequireWildcard(require(s));
                });
              }('../../shaders/skybox/' + shaderName + '/vs.js');
            case 4:
              vsCosmic = _context2.v["default"]();
              _context2.n = 5;
              return function (specifier) {
                return new Promise(function (r) {
                  return r("".concat(specifier));
                }).then(function (s) {
                  return _interopRequireWildcard(require(s));
                });
              }('../../shaders/skybox/' + shaderName + '/fs.js');
            case 5:
              fsCosmic = _context2.v["default"]();
              this.shaderProgram = this.initSkyboxShaderProgram(vsCosmic, fsCosmic);
            case 6:
              // Create cubemap for skybox
              this.cubeMap = this.createDefaultCubeMap();
              this.skyboxCenter = centre;
              this.buffer = this.createSkyboxBuffer();
              this.initialized = true;
            case 7:
              return _context2.a(2);
          }
        }, _callee2, this);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }()
    /**
     * Creates a default cubemap (placeholder, replace with actual cubemap loading).
     * @returns {WebGLTexture} The cubemap texture.
     */
    )
  }, {
    key: "createDefaultCubeMap",
    value: function createDefaultCubeMap() {
      var gl = this.gl;
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      // Fill each face with a solid color for now
      var faceInfos = [{
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        color: [255, 0, 0, 255]
      }, {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        color: [0, 255, 0, 255]
      }, {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        color: [0, 0, 255, 255]
      }, {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        color: [255, 255, 0, 255]
      }, {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        color: [0, 255, 255, 255]
      }, {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        color: [255, 0, 255, 255]
      }];
      // set colours as cubemap textures
      faceInfos.forEach(function (faceInfo) {
        var target = faceInfo.target,
          color = faceInfo.color;
        var data = new Uint8Array(color);
        gl.texImage2D(target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      });
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return texture;
    }

    /**
     * Creates the cube vertex buffer for the skybox (cube skybox - TODO: look into other shapes like sphere).
     * @returns {WebGLBuffer} The vertex buffer.
     */
  }, {
    key: "createSkyboxBuffer",
    value: function createSkyboxBuffer() {
      this.vertices = [-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0];
      this.numVertices = this.vertices.length / 3;
      var buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
      return buffer;
    }

    /**
     * Initializes the skybox shader program.
     * @param {string} vsSource - The vertex shader source.
     * @param {string} fsSource - The fragment shader source.
     * @returns {WebGLProgram} The shader program.
     */
  }, {
    key: "initSkyboxShaderProgram",
    value: function initSkyboxShaderProgram(vsSource, fsSource) {
      var gl = this.engine.gl;

      // Load and compile the shaders from the provided source code.
      var vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
      var fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
      var shaderProgram = gl.createProgram();

      // Attach the vertex and fragment shaders to the shader program.
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);

      // Link the shader program together.
      gl.linkProgram(shaderProgram);

      // Check if the shader program was successfully linked.
      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error('WebGL unable to initialize the skybox shader program');
      }

      // Set up and cache the attribute location for 'aPosition'.
      shaderProgram.aPosition = gl.getAttribLocation(shaderProgram, 'aPosition');
      gl.enableVertexAttribArray(shaderProgram.aPosition);

      // Cache the uniform locations for various uniforms used in the shaders.
      shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
      shaderProgram.uSkybox = gl.getUniformLocation(shaderProgram, 'uSkybox');
      shaderProgram.uViewDirectionProjectionInverse = gl.getUniformLocation(shaderProgram, 'uViewDirectionProjectionInverse');
      shaderProgram.uTime = gl.getUniformLocation(shaderProgram, 'uTime');
      shaderProgram.uResolution = gl.getUniformLocation(shaderProgram, 'uResolution');

      // Return the initialized shader program for use in rendering or further configuration.
      return shaderProgram;
    }
  }, {
    key: "renderSkybox",
    value:
    /**
     * Renders the skybox using the specified shader program.
     * @param {Float32Array} viewDirectionProjectionInverse - The inverse view-direction-projection matrix.
     */
    function renderSkybox(viewDirectionProjectionInverse) {
      if (!this.initialized || !this.shaderProgram) return; // Exit if the shader program is not initialized or available

      var gl = this.engine.gl;

      // Use the shader program for rendering
      gl.useProgram(this.shaderProgram);

      // Bind the buffer containing vertex data (assuming it's already set up)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

      // Enable the attribute array for 'aPosition'
      gl.enableVertexAttribArray(this.shaderProgram.aPosition);

      // Specify how the buffer data should be read from the currently bound buffer
      gl.vertexAttribPointer(this.shaderProgram.aPosition, 3, gl.FLOAT, false, 0, 0);

      // Bind the cubemap texture to a texture unit and set it as the active texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubeMap);
      gl.uniform1i(this.shaderProgram.uSkybox, 0); // Set the sampler2D uniform to use texture unit 0

      // Set the viewDirectionProjectionInverse matrix uniform for the shader
      gl.uniformMatrix4fv(this.shaderProgram.uViewDirectionProjectionInverse, false, viewDirectionProjectionInverse);

      // Set the uTime uniform with the current time (assuming it's used in the shader)
      // pass time in seconds
      var time = Date.now() * 0.001;
      if (this.shaderProgram.uTime !== -1 && this.shaderProgram.uTime !== null) {
        gl.uniform1f(this.shaderProgram.uTime, time);
      }

      // pass resolution if the shader expects it
      if (this.shaderProgram.uResolution !== undefined) {
        // try to grab drawing buffer size
        var resX = gl.drawingBufferWidth || this.engine.canvas.width || 800;
        var resY = gl.drawingBufferHeight || this.engine.canvas.height || 600;
        gl.uniform2f(this.shaderProgram.uResolution, resX, resY);
      }

      // Draw the skybox using TRIANGLE_STRIP and the specified number of vertices
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numVertices);

      // Unbind the buffer and program after drawing
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.useProgram(null);
    }
  }, {
    key: "createTextureSkyboxProgram",
    value:
    /**
     * Creates the texture skybox program (TODO: move into shader files).
     * @returns {WebGLProgram} The shader program.
     */
    function createTextureSkyboxProgram() {
      var vertexShaderSource = "#version 300 es\n        in vec3 aVertexPosition;\n        uniform mat4 uProjectionMatrix;\n        uniform mat4 uModelMatrix;\n        uniform mat4 uViewMatrix;\n        void main() {\n            gl_Position = uProjectionMatrix * uModelMatrix * uViewMatrix * vec4(aVertexPosition, 1.0);\n        }\n        ";
      var fragmentShaderSource = "#version 300 es\n        precision highp float;\n        uniform sampler2D uSkyboxTexture;\n        uniform vec3 uSkyboxCenter;\n        out vec4 outColor;\n        void main() {\n            vec3 direction = normalize(gl_FragCoord.xyz - uSkyboxCenter);\n            vec4 skyboxColor = texture(uSkyboxTexture, direction.xy);\n            float dotProduct = dot(direction, skyboxColor.rgb);\n            if (dotProduct < 0.01) {\n                discard;\n            } else {\n                outColor = vec4(dotProduct, dotProduct, dotProduct, 1.0);\n            }\n        }\n        ";
      return this.initShaderProgram({
        vs: vertexShaderSource,
        fs: fragmentShaderSource
      });
    }
  }]);
}();