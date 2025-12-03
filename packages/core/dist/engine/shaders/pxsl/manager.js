"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.ShaderManager = void 0;
var _transpiler = require("./transpiler.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    PXSL Shader Manager
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2020-2025 Kyle Derby MacInnis
 *
 * Unified shader management system that supports:
 *   - PXSL (.pxsl) - PixoSpritz Shader Language
 *   - GLSL (.glsl, .vert, .frag) - Standard WebGL shaders
 *   - JavaScript shader functions (legacy support)
 *
 * Features:
 *   - Automatic format detection
 *   - Shader caching
 *   - Hot-reload support
 *   - Error handling with helpful messages
 * ═══════════════════════════════════════════════════════════════════════════
 */
/**
 * Shader cache entry
 * @typedef {Object} CachedShader
 * @property {string} name - Shader name
 * @property {string} vs - Vertex shader source
 * @property {string} fs - Fragment shader source
 * @property {WebGLProgram} [program] - Compiled program (if compiled)
 * @property {number} timestamp - Cache timestamp
 */
/**
 * Shader Manager - Handles loading, caching, and compiling shaders
 */
var ShaderManager = exports.ShaderManager = /*#__PURE__*/function () {
  /**
   * @param {WebGL2RenderingContext} gl - WebGL context
   */
  function ShaderManager(gl) {
    _classCallCheck(this, ShaderManager);
    /** @type {WebGL2RenderingContext} */
    this.gl = gl;

    /** @type {Map<string, CachedShader>} */
    this.cache = new Map();

    /** @type {Map<string, WebGLProgram>} */
    this.programs = new Map();

    /** @type {boolean} */
    this.debug = process.env.NODE_ENV === 'development';
  }

  /**
   * Load shader from source code (auto-detects format)
   * @param {string} name - Shader identifier
   * @param {string|{vs: string, fs: string}} source - Shader source(s)
   * @returns {CachedShader}
   */
  return _createClass(ShaderManager, [{
    key: "load",
    value: function load(name, source) {
      // Check cache first
      if (this.cache.has(name)) {
        return this.cache.get(name);
      }
      var shader;
      if (typeof source === 'string') {
        // Single source - could be PXSL (combined) or needs separate files
        if (_transpiler.PXSLTranspiler.isPXSL(source)) {
          // PXSL format - transpile
          shader = this.loadPXSL(name, source);
        } else {
          throw new Error("ShaderManager: Single source must be PXSL format. Use {vs, fs} for separate GLSL.");
        }
      } else if (source.vs && source.fs) {
        // Separate vertex and fragment shaders
        shader = this.loadGLSL(name, source.vs, source.fs);
      } else {
        throw new Error("ShaderManager: Invalid source format for shader \"".concat(name, "\""));
      }
      this.cache.set(name, shader);
      return shader;
    }

    /**
     * Load and transpile PXSL shader
     * @param {string} name - Shader name
     * @param {string} source - PXSL source code
     * @returns {CachedShader}
     */
  }, {
    key: "loadPXSL",
    value: function loadPXSL(name, source) {
      try {
        var result = _transpiler.PXSLTranspiler.transpile(source);
        if (this.debug) {
          console.log("[ShaderManager] Transpiled PXSL shader \"".concat(result.name || name, "\""));
        }
        return {
          name: result.name || name,
          vs: result.vs,
          fs: result.fs,
          timestamp: Date.now(),
          format: 'pxsl'
        };
      } catch (error) {
        throw new Error("PXSL Transpilation Error in \"".concat(name, "\": ").concat(error.message));
      }
    }

    /**
     * Load GLSL shaders directly
     * @param {string} name - Shader name
     * @param {string} vs - Vertex shader source
     * @param {string} fs - Fragment shader source
     * @returns {CachedShader}
     */
  }, {
    key: "loadGLSL",
    value: function loadGLSL(name, vs, fs) {
      return {
        name: name,
        vs: vs,
        fs: fs,
        timestamp: Date.now(),
        format: 'glsl'
      };
    }

    /**
     * Compile a cached shader into a WebGL program
     * @param {string} name - Shader name
     * @returns {WebGLProgram}
     */
  }, {
    key: "compile",
    value: function compile(name) {
      // Check if already compiled
      if (this.programs.has(name)) {
        return this.programs.get(name);
      }
      var shader = this.cache.get(name);
      if (!shader) {
        throw new Error("ShaderManager: Shader \"".concat(name, "\" not loaded"));
      }
      var program = this.createProgram(shader.vs, shader.fs, name);
      this.programs.set(name, program);
      return program;
    }

    /**
     * Load and compile shader in one step
     * @param {string} name - Shader name
     * @param {string|{vs: string, fs: string}} source - Shader source
     * @returns {WebGLProgram}
     */
  }, {
    key: "loadAndCompile",
    value: function loadAndCompile(name, source) {
      this.load(name, source);
      return this.compile(name);
    }

    /**
     * Create a WebGL shader program from source
     * @param {string} vsSource - Vertex shader source
     * @param {string} fsSource - Fragment shader source
     * @param {string} name - Shader name (for error messages)
     * @returns {WebGLProgram}
     */
  }, {
    key: "createProgram",
    value: function createProgram(vsSource, fsSource) {
      var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'unnamed';
      var gl = this.gl;

      // Compile vertex shader
      var vertexShader = this.compileShader(gl.VERTEX_SHADER, vsSource, "".concat(name, ".vert"));

      // Compile fragment shader
      var fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fsSource, "".concat(name, ".frag"));

      // Create program
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var log = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error("Shader link error in \"".concat(name, "\": ").concat(log));
      }

      // Clean up individual shaders (they're now part of the program)
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      // Auto-detect and store attribute/uniform locations
      this.introspectProgram(program);
      return program;
    }

    /**
     * Compile a single shader
     * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @param {string} source - Shader source code
     * @param {string} name - Shader name for errors
     * @returns {WebGLShader}
     */
  }, {
    key: "compileShader",
    value: function compileShader(type, source, name) {
      var gl = this.gl;
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);

        // Add line numbers to source for debugging
        var numberedSource = source.split('\n').map(function (line, i) {
          return "".concat((i + 1).toString().padStart(3), ": ").concat(line);
        }).join('\n');
        throw new Error("Shader compile error in \"".concat(name, "\":\n").concat(log, "\n\nSource:\n").concat(numberedSource));
      }
      return shader;
    }

    /**
     * Introspect a program to find all attributes and uniforms
     * @param {WebGLProgram} program - The compiled program
     */
  }, {
    key: "introspectProgram",
    value: function introspectProgram(program) {
      var gl = this.gl;

      // Get active attributes
      var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
      program._attributes = {};
      for (var i = 0; i < numAttribs; i++) {
        var info = gl.getActiveAttrib(program, i);
        var location = gl.getAttribLocation(program, info.name);
        program._attributes[info.name] = {
          location: location,
          type: info.type,
          size: info.size
        };
        program[info.name] = location;
      }

      // Get active uniforms
      var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      program._uniforms = {};
      for (var _i = 0; _i < numUniforms; _i++) {
        var _info = gl.getActiveUniform(program, _i);
        // Handle array uniforms (name ends with [0])
        var baseName = _info.name.replace(/\[0\]$/, '');
        var _location = gl.getUniformLocation(program, _info.name);
        program._uniforms[baseName] = {
          location: _location,
          type: _info.type,
          size: _info.size
        };
        program[baseName] = _location;
      }
    }

    /**
     * Get a compiled program by name
     * @param {string} name - Shader name
     * @returns {WebGLProgram|null}
     */
  }, {
    key: "get",
    value: function get(name) {
      return this.programs.get(name) || null;
    }

    /**
     * Use a shader program
     * @param {string|WebGLProgram} nameOrProgram - Shader name or program
     */
  }, {
    key: "use",
    value: function use(nameOrProgram) {
      var program = typeof nameOrProgram === 'string' ? this.programs.get(nameOrProgram) : nameOrProgram;
      if (program) {
        this.gl.useProgram(program);
      }
    }

    /**
     * Reload a shader (for hot-reload support)
     * @param {string} name - Shader name
     * @param {string|{vs: string, fs: string}} source - New source
     * @returns {WebGLProgram}
     */
  }, {
    key: "reload",
    value: function reload(name, source) {
      // Delete old program
      var oldProgram = this.programs.get(name);
      if (oldProgram) {
        this.gl.deleteProgram(oldProgram);
        this.programs["delete"](name);
      }

      // Remove from cache
      this.cache["delete"](name);

      // Load and compile new version
      return this.loadAndCompile(name, source);
    }

    /**
     * Clear all cached shaders and programs
     */
  }, {
    key: "clear",
    value: function clear() {
      // Delete all programs
      var _iterator = _createForOfIteratorHelper(this.programs.values()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var program = _step.value;
          this.gl.deleteProgram(program);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.programs.clear();
      this.cache.clear();
    }

    /**
     * Get shader source (for debugging/editing)
     * @param {string} name - Shader name
     * @returns {CachedShader|null}
     */
  }, {
    key: "getSource",
    value: function getSource(name) {
      return this.cache.get(name) || null;
    }

    /**
     * List all loaded shaders
     * @returns {string[]}
     */
  }, {
    key: "list",
    value: function list() {
      return Array.from(this.cache.keys());
    }
  }]);
}();
var _default = exports["default"] = ShaderManager;