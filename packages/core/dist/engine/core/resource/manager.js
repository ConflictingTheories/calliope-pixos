"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _AudioLoader = require("../../utils/loaders/AudioLoader.js");
var _texture = require("./texture.js");
var _speech = _interopRequireDefault(require("../scene/speech.js"));
var _ObjHelper = _interopRequireDefault(require("../../utils/ObjHelper.js"));
var _index = _interopRequireDefault(require("../index.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
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
\*                                                 */ // Absolute imports
// Relative imports
// Absolute imports
/**
 * ResourceManager - Manages loading and caching of game resources like textures, audio, models, etc.
 */
var ResourceManager = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of ResourceManager.
   * @param {GLEngine} engine - The game engine instance.
   * @returns {ResourceManager} The singleton instance.
   */
  function ResourceManager(engine) {
    var _this = this;
    _classCallCheck(this, ResourceManager);
    /**
     * Loads a texture from a source URL.
     * @param {string} src - The texture source URL.
     * @returns {Texture} The loaded texture.
     */
    _defineProperty(this, "loadTexture", function (src) {
      if (_this.textures[src]) return _this.textures[src];
      _this.textures[src] = new _texture.Texture(src, _this.engine);
      return _this.textures[src];
    });
    /**
     * Loads a texture from a zip file.
     * @param {string} src - The texture filename in the zip.
     * @param {JSZip} zip - The zip file instance.
     * @returns {Promise<Texture>} The loaded texture.
     */
    _defineProperty(this, "loadTextureFromZip", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(src, zip) {
        var imageData, buffer, blob, dataUrl;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              if (!_this.textures[src]) {
                _context.n = 1;
                break;
              }
              return _context.a(2, _this.textures[src]);
            case 1:
              _context.n = 2;
              return zip.file("textures/".concat(src)).async('arrayBuffer');
            case 2:
              imageData = _context.v;
              buffer = new Uint8Array(imageData);
              blob = new Blob([buffer.buffer]);
              dataUrl = URL.createObjectURL(blob);
              _this.textures[src] = new _texture.Texture(dataUrl, _this.engine);
              return _context.a(2, _this.textures[src]);
          }
        }, _callee);
      }));
      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
    /**
     * Loads a speech instance.
     * @param {string} src - The speech source.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @returns {Speech} The loaded speech instance.
     */
    _defineProperty(this, "loadSpeech", function (src, canvas) {
      if (_this.speeches[src]) return _this.speeches[src];
      _this.speeches[src] = new _speech["default"](canvas, _this.engine, src);
      return _this.speeches[src];
    });
    if (!ResourceManager._instance) {
      /** @type {GLEngine} */
      this.engine = engine;

      /** @type {ObjHelper} */
      this.objHelper = new _ObjHelper["default"](engine.gl);
      /** @type {AudioLoader} */
      this.audioLoader = new _AudioLoader.AudioLoader(this);

      // ASSETS
      /** @type {Object.<string, Texture>} */
      this.textures = {};
      /** @type {Object.<string, ColorTexture>} */
      this.colors = {};
      /** @type {Object.<string, Speech>} */
      this.speeches = {};
      ResourceManager._instance = this;
    }
    return ResourceManager._instance;
  }

  // TODO: Move all resources into this class (tilesets, textures, audio, models, fonts, shaders).

  /**
   * Loads an OBJ model using ObjHelper (modern loader).
   * @param {string} objText - OBJ file content (string)
   * @param {string} [mtlText] - MTL file content (string, optional)
   * @param {Object} [textureMap] - Map of texture names to data URIs (optional)
   * @returns {Promise<ParsedMesh[]>} Array of parsed and initialized meshes
   */
  return _createClass(ResourceManager, [{
    key: "loadModel",
    value: function () {
      var _loadModel = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(objText) {
        var mtlText,
          textureMap,
          meshes,
          materials,
          _args2 = arguments;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              mtlText = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : null;
              textureMap = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : null;
              // Parse OBJ and MTL
              meshes = this.objHelper.parseOBJ(objText);
              materials = {};
              if (mtlText) {
                materials = this.objHelper.parseMTL(mtlText);
                this.objHelper.assignMaterials(meshes, materials);
              }
              // Load textures if provided
              if (!textureMap) {
                _context2.n = 1;
                break;
              }
              _context2.n = 1;
              return this.objHelper.loadTextures(meshes, textureMap);
            case 1:
              // Initialize WebGL buffers
              this.objHelper.initBuffers(meshes);
              return _context2.a(2, meshes);
          }
        }, _callee2, this);
      }));
      function loadModel(_x3) {
        return _loadModel.apply(this, arguments);
      }
      return loadModel;
    }()
    /**
     * Clean up WebGL resources for meshes loaded with ObjHelper.
     * @param {ParsedMesh[]} meshes
     */
  }, {
    key: "deleteModelBuffers",
    value: function deleteModelBuffers(meshes) {
      this.objHelper.deleteMeshBuffers(meshes);
    }
  }]);
}();