"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _vector = require("@Engine/utils/math/vector.js");
var _enums = require("@Engine/utils/enums.js");
var _index = _interopRequireDefault(require("../queue/index.js"));
var _index2 = require("@Engine/utils/loaders/index.js");
var _matrix = require("@Engine/utils/math/matrix4.js");
var _loadable = _interopRequireDefault(require("@Engine/core/queue/loadable.js"));
var _vector2 = require("../../utils/math/vector.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
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
 * Build a WebGL buffer from data
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {number} type - Buffer type (gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER)
 * @param {number[]} data - Data to buffer
 * @param {number} itemSize - Number of components per vertex
 * @returns {WebGLBuffer} The created buffer with numItems property
 */
function _buildBuffer(gl, type, data, itemSize) {
  var buffer = gl.createBuffer();
  var TypedArray = type === gl.ELEMENT_ARRAY_BUFFER ? Uint16Array : Float32Array;
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, new TypedArray(data), gl.STATIC_DRAW);
  buffer.itemSize = itemSize;
  buffer.numItems = data.length / itemSize;
  return buffer;
}
var ModelObject = exports["default"] = /*#__PURE__*/function (_Loadable) {
  /**
   * 3D Model Objects
   * @param {*} engine
   */
  function ModelObject(_engine) {
    var _this;
    _classCallCheck(this, ModelObject);
    _this = _callSuper(this, ModelObject);
    /**
     * Load Object and Materials
     * @param {*} instanceData
     * @returns
     */
    _defineProperty(_this, "onLoad", function (instanceData) {
      if (_this.loaded) return;

      // Zone Information
      _this.zone = instanceData.zone;
      if (instanceData.id) _this.id = instanceData.id;
      if (instanceData.pos) {
        _this.pos = instanceData.pos;
        // If z is not defined, compute height from the zone
        if (_this.pos && (_this.pos.z === null || _this.pos.z === undefined)) {
          try {
            var _this$hotspotOffset$x, _this$hotspotOffset, _this$hotspotOffset$y, _this$hotspotOffset2;
            var hx = _this.pos.x + ((_this$hotspotOffset$x = (_this$hotspotOffset = _this.hotspotOffset) === null || _this$hotspotOffset === void 0 ? void 0 : _this$hotspotOffset.x) !== null && _this$hotspotOffset$x !== void 0 ? _this$hotspotOffset$x : 0);
            var hy = _this.pos.y + ((_this$hotspotOffset$y = (_this$hotspotOffset2 = _this.hotspotOffset) === null || _this$hotspotOffset2 === void 0 ? void 0 : _this$hotspotOffset2.y) !== null && _this$hotspotOffset$y !== void 0 ? _this$hotspotOffset$y : 0);
            var z = _this.zone.getHeight(hx, hy);
            _this.pos.z = typeof z === 'number' ? z : 0;
          } catch (err) {
            console.warn('Error computing object height from zone', err);
            _this.pos.z = 0;
          }
        }
      }
      if (instanceData.isLit) _this.isLit = instanceData.isLit;
      if (instanceData.lightColor) _this.lightColor = instanceData.lightColor;
      if (instanceData.attenuation) _this.attenuation = instanceData.attenuation;
      if (instanceData.direction) _this.direction = instanceData.direction;
      if (instanceData.rotation) _this.rotation = instanceData.rotation;
      if (instanceData.facing && instanceData.facing !== 0) _this.facing = instanceData.facing;
      if (instanceData.zones && instanceData.zones !== null) _this.zones = instanceData.zones;
      var mesh = instanceData.mesh;

      // Mesh bounds
      var maxX,
        minX = null;
      var maxY,
        minY = null;
      var maxZ,
        minZ = null;
      for (var i = 0; i < mesh.vertices.length; i = i + 3) {
        var v = mesh.vertices.slice(i, i + 3);
        // calculate size
        if (maxX == null || v[0] > maxX) maxX = v[0];
        if (minX == null || v[0] < minX) minX = v[0];
        if (maxY == null || v[1] > maxY) maxY = v[1];
        if (minY == null || v[1] < minY) minY = v[1];
        if (maxZ == null || v[2] > maxZ) maxZ = v[2];
        if (minZ == null || v[2] < minZ) minZ = v[2];
      }

      // normalize x, y to fit in tile (todo)
      var size = new _vector.Vector(maxX - minX, maxZ - minZ, maxY - minY);
      _this.size = size;
      _this.scale = new _vector.Vector(1 / Math.max(size.x, size.z), 1 / Math.max(size.x, size.z), 1 / Math.max(size.x, size.z));
      if (instanceData.useScale) _this.scale = instanceData.useScale;
      _this.drawOffset = new _vector.Vector(0.5, 0.5, 0);

      // mesh buffers
      _this.mesh = mesh;
      _this.engine.resourceManager.objHelper.initBuffers([_this.mesh]);

      // Speech bubble
      if (_this.enableSpeech) {
        _this.speech = _this.engine.resourceManager.loadSpeech(_this.id, _this.engine.mipmap);
        _this.speech.runWhenLoaded(_this.onTilesetOrTextureLoaded);
        _this.speechTexBuf = _this.engine.renderManager.createBuffer(_this.getSpeechBubbleTexture(), _this.engine.gl.DYNAMIC_DRAW, 2);
      }

      // load Portrait
      if (_this.portraitSrc) {
        _this.portrait = _this.engine.resourceManager.loadTexture(_this.portraitSrc);
        _this.portrait.runWhenLoaded(_this.onTilesetOrTextureLoaded);
      }

      // lighting
      if (_this.isLit) {
        _this.lightIndex = _this.engine.renderManager.lightManager.addLight(_this.id, _this.pos.toArray(), _this.lightColor, [0.01, 0.01, 0.01]);
      }
      _this.zone.tileset.runWhenDefinitionLoaded(_this.onTilesetDefinitionLoaded);
    });
    /**
     * Load Object and Materials
     * @param {*} instanceData
     * @param {*} zip
     * @returns
     */
    _defineProperty(_this, "onLoadFromZip", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(instanceData, zip) {
        var _this$hotspotOffset$x2, _this$hotspotOffset3, _this$hotspotOffset$y2, _this$hotspotOffset4, hx, hy, z, mesh, maxX, minX, maxY, minY, maxZ, minZ, i, v, size;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              if (!_this.loaded) {
                _context.n = 1;
                break;
              }
              return _context.a(2);
            case 1:
              // Zone Information
              _this.zone = instanceData.zone;
              if (instanceData.id) _this.id = instanceData.id;
              if (instanceData.pos) {
                _this.pos = instanceData.pos;
                if (_this.pos && (_this.pos.z === null || _this.pos.z === undefined)) {
                  try {
                    hx = _this.pos.x + ((_this$hotspotOffset$x2 = (_this$hotspotOffset3 = _this.hotspotOffset) === null || _this$hotspotOffset3 === void 0 ? void 0 : _this$hotspotOffset3.x) !== null && _this$hotspotOffset$x2 !== void 0 ? _this$hotspotOffset$x2 : 0);
                    hy = _this.pos.y + ((_this$hotspotOffset$y2 = (_this$hotspotOffset4 = _this.hotspotOffset) === null || _this$hotspotOffset4 === void 0 ? void 0 : _this$hotspotOffset4.y) !== null && _this$hotspotOffset$y2 !== void 0 ? _this$hotspotOffset$y2 : 0);
                    z = _this.zone.getHeight(hx, hy);
                    _this.pos.z = typeof z === 'number' ? z : 0;
                  } catch (err) {
                    console.warn('Error computing object height from zone', err);
                    _this.pos.z = 0;
                  }
                }
              }
              if (instanceData.isLit) _this.isLit = instanceData.isLit;
              if (instanceData.lightColor) _this.lightColor = instanceData.lightColor;
              if (instanceData.attenuation) _this.attenuation = instanceData.attenuation;
              if (instanceData.density) _this.density = instanceData.density;
              if (instanceData.scatteringCoefficients) _this.scatteringCoefficients = instanceData.scatteringCoefficients;
              if (instanceData.direction) _this.direction = instanceData.direction;
              if (instanceData.rotation) _this.rotation = instanceData.rotation;
              if (instanceData.facing && instanceData.facing !== 0) _this.facing = instanceData.facing;
              if (instanceData.zones && instanceData.zones !== null) _this.zones = instanceData.zones;
              mesh = instanceData.mesh; // Mesh bounds
              minX = null;
              minY = null;
              minZ = null;
              for (i = 0; i < mesh.vertices.length; i = i + 3) {
                v = mesh.vertices.slice(i, i + 3); // calculate size
                if (maxX == null || v[0] > maxX) maxX = v[0];
                if (minX == null || v[0] < minX) minX = v[0];
                if (maxY == null || v[1] > maxY) maxY = v[1];
                if (minY == null || v[1] < minY) minY = v[1];
                if (maxZ == null || v[2] > maxZ) maxZ = v[2];
                if (minZ == null || v[2] < minZ) minZ = v[2];
              }

              // normalize x, y to fit in tile (todo)
              size = new _vector.Vector(maxX - minX, maxZ - minZ, maxY - minY);
              _this.size = size;
              _this.scale = new _vector.Vector(1 / Math.max(size.x, size.z), 1 / Math.max(size.x, size.z), 1 / Math.max(size.x, size.z));
              if (instanceData.useScale) _this.scale = instanceData.useScale;
              _this.drawOffset = new _vector.Vector(0.5, 0.5, 0);

              // mesh buffers
              _this.mesh = mesh;
              _this.engine.resourceManager.objHelper.initBuffers([_this.mesh]);

              // Speech bubble
              if (_this.enableSpeech) {
                _this.speech = _this.engine.resourceManager.loadSpeech(_this.id, _this.engine.mipmap);
                _this.speech.runWhenLoaded(_this.onTilesetOrTextureLoaded);
                _this.speechTexBuf = _this.engine.renderManager.createBuffer(_this.getSpeechBubbleTexture(), _this.engine.gl.DYNAMIC_DRAW, 2);
              }

              // load Portrait
              if (!_this.portraitSrc) {
                _context.n = 3;
                break;
              }
              _context.n = 2;
              return _this.engine.resourceManager.loadTextureFromZip(_this.portraitSrc, zip);
            case 2:
              _this.portrait = _context.v;
              _this.portrait.runWhenLoaded(_this.onTilesetOrTextureLoaded);
            case 3:
              // lighting?
              if (_this.isLit) {
                _this.lightIndex = _this.engine.renderManager.lightManager.addLight(_this.id, _this.pos.toArray(), _this.lightColor, _this.attenuation, _this.direction, _this.density, _this.scatteringCoefficients, true);
              }

              //
              _this.zone.tileset.runWhenDefinitionLoaded(_this.onTilesetDefinitionLoaded);
            case 4:
              return _context.a(2);
          }
        }, _callee);
      }));
      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
    /**
     * Definition Loaded
     */
    _defineProperty(_this, "onTilesetDefinitionLoaded", function () {
      _this.zone.tileset.runWhenLoaded(_this.onTilesetOrTextureLoaded);
    });
    /**
     * After Tileset / Texture Loaded
     * @returns
     */
    _defineProperty(_this, "onTilesetOrTextureLoaded", function () {
      if (!_this || _this.loaded || _this.enableSpeech && _this.speech && !_this.speech.loaded || _this.portrait && !_this.portrait.loaded) return;
      _this.init(); // Hook for sprite implementations
      if (_this.enableSpeech && _this.speech) {
        if (_this.speech.clearHud) {
          _this.speech.clearHud();
          _this.speech.writeText(_this.id);
          _this.speech.loadImage();
        }
      }
      _this.loaded = true;
      _this.onLoadActions.run();
    });
    /**
     * Speech Area texture
     * @returns
     */
    _defineProperty(_this, "getSpeechBubbleTexture", function () {
      return [[1.0, 1.0], [0.0, 1.0], [0.0, 0.0], [1.0, 1.0], [0.0, 0.0], [1.0, 0.0]].flat(3);
    });
    /**
     * speech bubble position
     * @returns
     */
    _defineProperty(_this, "getSpeechBubbleVertices", function () {
      return [_construct(_vector.Vector, [2, 0, 4]).toArray(), _construct(_vector.Vector, [0, 0, 4]).toArray(), _construct(_vector.Vector, [0, 0, 2]).toArray(), _construct(_vector.Vector, [2, 0, 4]).toArray(), _construct(_vector.Vector, [0, 0, 2]).toArray(), _construct(_vector.Vector, [2, 0, 2]).toArray()].flat(3);
    });
    /**
     * bind texture
     * @param {*} texture
     */
    _defineProperty(_this, "attach", function (texture) {
      var gl = _this.engine.gl;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(_this.engine.renderManager.shaderProgram.diffuseMapUniform, 0);
    });
    /**
     * draw obj model with materials and textures (needs work)
     */
    _defineProperty(_this, "drawTexturedObj", function () {
      var _this2 = _this,
        engine = _this2.engine,
        mesh = _this2.mesh;
      var rm = engine.renderManager;
      var isPickerPass = rm.isPickerPass;

      // draw each piece of the object (per material)
      if (mesh.indicesPerMaterial.length >= 1 && Object.keys(mesh.materialsByIndex).length > 0) {
        mesh.indicesPerMaterial.forEach(function (x, i) {
          // vertices
          rm.bindBuffer(mesh.vertexBuffer, rm.shaderProgram.aVertexPosition);
          // texture
          rm.bindBuffer(mesh.textureBuffer, rm.shaderProgram.aTextureCoord);
          // normal
          rm.bindBuffer(mesh.normalBuffer, rm.shaderProgram.aVertexNormal);
          if (!isPickerPass) {
            var _mesh$materialsByInde;
            // Only set material properties during normal render
            // Diffuse material properties
            engine.gl.uniform3fv(rm.shaderProgram.uDiffuse, mesh.materialsByIndex[i].diffuse);
            engine.gl.uniform1f(rm.shaderProgram.uSpecularExponent, mesh.materialsByIndex[i].specularExponent);

            // Bind texture if available
            var hasTexture = (_mesh$materialsByInde = mesh.materialsByIndex[i]) === null || _mesh$materialsByInde === void 0 || (_mesh$materialsByInde = _mesh$materialsByInde.mapDiffuse) === null || _mesh$materialsByInde === void 0 ? void 0 : _mesh$materialsByInde.glTexture;
            if (hasTexture) {
              _this.attach(mesh.materialsByIndex[i].mapDiffuse.glTexture);
              engine.gl.uniform1f(rm.shaderProgram.useDiffuse, 1.0);
            } else {
              engine.gl.uniform1f(rm.shaderProgram.useDiffuse, 0.0);
            }

            // Specular
            engine.gl.uniform3fv(rm.shaderProgram.uSpecular, mesh.materialsByIndex[i].specular);
            engine.gl.uniform1f(rm.shaderProgram.uSpecularExponent, mesh.materialsByIndex[i].specularExponent);
          }

          // indices
          var bufferInfo = _buildBuffer(engine.gl, engine.gl.ELEMENT_ARRAY_BUFFER, x, 1);
          engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, bufferInfo);
          if (isPickerPass) {
            // During picker pass, only set picker shader uniforms
            rm.effectPrograms['picker'].setMatrixUniforms({
              scale: _this.scale,
              id: _this.getPickingId(),
              sampler: 0.0
            });
          } else {
            // During normal render, set main shader uniforms
            rm.shaderProgram.setMatrixUniforms({
              isSelected: _this.isSelected,
              colorMultiplier: _this.engine.frameCount & 0x8 ? [1, 0, 0, 1] : [1, 1, 0, 1],
              scale: _this.scale,
              sampler: 0.0
            });
          }
          engine.gl.drawElements(engine.gl.TRIANGLES, bufferInfo.numItems, engine.gl.UNSIGNED_SHORT, 0);
        });
      } else {
        // no materials
        // vertices
        rm.bindBuffer(mesh.vertexBuffer, rm.shaderProgram.aVertexPosition);
        rm.bindBuffer(mesh.normalBuffer, rm.shaderProgram.aVertexNormal);
        rm.bindBuffer(mesh.textureBuffer, rm.shaderProgram.aTextureCoord);
        engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        if (!isPickerPass) {
          // Only set material properties during normal render
          // Diffuse
          engine.gl.uniform3fv(rm.shaderProgram.uDiffuse, [0.6, 0.3, 0.6]);
          // Specular
          engine.gl.uniform3fv(rm.shaderProgram.uSpecular, [0.1, 0.1, 0.2]);
          engine.gl.uniform1f(rm.shaderProgram.uSpecularExponent, 2);
        }
        if (isPickerPass) {
          // During picker pass, only set picker shader uniforms
          rm.effectPrograms['picker'].setMatrixUniforms({
            scale: _this.scale,
            id: _this.getPickingId(),
            sampler: 0.0
          });
        } else {
          // During normal render, set main shader uniforms
          rm.shaderProgram.setMatrixUniforms({
            isSelected: _this.isSelected,
            colorMultiplier: _this.engine.frameCount & 0x8 ? [1, 0, 0, 1] : [1, 1, 0, 1],
            scale: _this.scale,
            sampler: 0.0
          });
        }
        engine.gl.drawElements(engine.gl.TRIANGLES, mesh.indexBuffer.numItems, engine.gl.UNSIGNED_SHORT, 0);
      }
    });
    /**
     * Return id for picking (based on colour pixel translation)
     * @returns
     */
    _defineProperty(_this, "getPickingId", function () {
      var id = [(_this.objId >> 0 & 0xff) / 0xff, (_this.objId >> 8 & 0xff) / 0xff, (_this.objId >> 16 & 0xff) / 0xff, 255];
      return id;
    });
    /**
     * draw object with textures / materials
     */
    _defineProperty(_this, "drawObj", function () {
      var _this3 = _this,
        engine = _this3.engine,
        mesh = _this3.mesh;
      var rm = engine.renderManager;
      var isPickerPass = rm.isPickerPass;
      engine.gl.disableVertexAttribArray(rm.shaderProgram.aTextureCoord);
      rm.bindBuffer(mesh.vertexBuffer, rm.shaderProgram.aVertexPosition);
      rm.bindBuffer(mesh.normalBuffer, rm.shaderProgram.aVertexNormal);
      engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      if (isPickerPass) {
        // During picker pass, only set picker shader uniforms
        rm.effectPrograms['picker'].setMatrixUniforms({
          scale: _this.scale,
          id: _this.getPickingId(),
          sampler: 1.0
        });
      } else {
        // During normal render, set main shader uniforms
        rm.shaderProgram.setMatrixUniforms({
          scale: _this.scale,
          sampler: 1.0
        });
      }
      engine.gl.drawElements(engine.gl.TRIANGLES, mesh.indexBuffer.numItems, engine.gl.UNSIGNED_SHORT, 0);
    });
    /**
     * Draw Object
     * @returns
     */
    _defineProperty(_this, "draw", function () {
      if (!_this.loaded) return;
      // Increment object draw counter for debug metrics. Only increment if the
      // render manager's debug object is available. This helps track how
      // many 3D objects are drawn each frame in the debug overlay.
      if (_this.engine && _this.engine.renderManager && _this.engine.renderManager.debug) {
        _this.engine.renderManager.debug.objectsDrawn++;
      }
      var _this4 = _this,
        engine = _this4.engine,
        mesh = _this4.mesh;
      // setup obj attributes
      engine.gl.enableVertexAttribArray(engine.renderManager.shaderProgram.aVertexNormal);
      engine.gl.enableVertexAttribArray(engine.renderManager.shaderProgram.aTextureCoord);
      // initialize buffers
      engine.renderManager.mvPushMatrix();
      // position object
      (0, _matrix.translate)(_this.engine.renderManager.uModelMat, _this.engine.renderManager.uModelMat, _this.drawOffset.toArray());
      (0, _matrix.translate)(_this.engine.renderManager.uModelMat, _this.engine.renderManager.uModelMat, _this.pos.toArray());
      (0, _matrix.rotate)(_this.engine.renderManager.uModelMat, _this.engine.renderManager.uModelMat, (0, _vector2.degToRad)(90), [1, 0, 0]);
      // rotate object
      if (_this.rotation && _this.rotation.toArray) {
        var rotation = Math.max.apply(Math, _toConsumableArray(_this.rotation.toArray()));
        if (rotation > 0) (0, _matrix.rotate)(_this.engine.renderManager.uModelMat, _this.engine.renderManager.uModelMat, (0, _vector2.degToRad)(rotation), [_this.rotation.x / rotation, _this.rotation.y / rotation, _this.rotation.z / rotation]);
      }
      // Draw Object
      if (!mesh.textures.length) {
        _this.drawObj();
      } else {
        _this.drawTexturedObj();
      }
      engine.renderManager.mvPopMatrix();
      // clear obj rendering attributes
      engine.gl.enableVertexAttribArray(engine.renderManager.shaderProgram.aTextureCoord);
      engine.gl.disableVertexAttribArray(engine.renderManager.shaderProgram.aVertexNormal);
    });
    /**
     * Set Facing
     * @param {*} facing
     */
    _defineProperty(_this, "setFacing", function (facing) {
      if (facing) _this.facing = facing;
      _this.rotation = _enums.Direction.objectSequence(facing);
    });
    /**
     * Remove Action
     * @param {*} id
     */
    _defineProperty(_this, "removeAction", function (id) {
      _this.actionList = _this.actionList.filter(function (action) {
        return action.id !== id;
      });
      delete _this.actionDict[id];
    });
    /**
     * Remove Action
     */
    _defineProperty(_this, "removeAllActions", function () {
      _this.actionList = [];
      _this.actionDict = {};
    });
    /**
     * Outer Tick Handler
     * @param {number} time
     * @returns
     */
    _defineProperty(_this, "tickOuter", function (time) {
      if (!_this.loaded) return;
      // Sort activities by increasing startTime, then by id
      _this.actionList.sort(function (a, b) {
        var dt = a.startTime - b.startTime;
        if (!dt) return dt;
        return a.id > b.id ? 1 : -1;
      });
      // Run & Queue for Removal when complete
      var toRemove = [];
      _this.actionList.forEach(function (action) {
        if (!action.loaded || action.startTime > time) return;
        if (action.tick(time)) {
          toRemove.push(action); // remove from backlog
          action.onComplete(); // call completion handler
        }
      });
      // clear completed activities
      toRemove.forEach(function (action) {
        return _this.removeAction(action.id);
      });
      // tick
      if (_this.tick) _this.tick(time);
    });
    /**
     * Hook for sprite implementations
     */
    _defineProperty(_this, "init", function () {
      console.log('- object hook', _this.id, _this.pos, _this.objId);
    });
    /**
     * speak
     * @param {*} text
     * @param {*} showBubble
     */
    _defineProperty(_this, "speak", function (text) {
      var showBubble = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!text) _this.speech.clearHud();else {
        var _this$portrait;
        _this.textbox = _this.engine.hud.scrollText(_this.id + ':> ' + text, true, {
          portrait: (_this$portrait = _this.portrait) !== null && _this$portrait !== void 0 ? _this$portrait : false
        });
        if (showBubble && _this.speech) {
          var _this$portrait2;
          _this.speech.scrollText(text, false, {
            portrait: (_this$portrait2 = _this.portrait) !== null && _this$portrait2 !== void 0 ? _this$portrait2 : false
          });
          _this.speech.loadImage();
        }
      }
    });
    /**
     * handles interaction -- default (should be overridden in definition)
     * @param {*} sprite
     * @param {*} finish
     * @returns
     */
    _defineProperty(_this, "interact", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(sprite, finish) {
        var ret, _t;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              ret = null; // React based on internal state
              _t = _this.state;
              _context2.n = 1;
              break;
            case 1:
              return _context2.a(3, 2);
            case 2:
              // If completion handler passed through - call it when done
              if (finish) finish(true);
              return _context2.a(2, ret);
          }
        }, _callee2);
      }));
      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
    /**
     * Set Facing
     * @param {*} facing
     */
    _defineProperty(_this, "setFacing", function (facing) {
      if (facing) _this.facing = facing;
      _this.rotation = _enums.Direction.objectSequence(facing);
    });
    /**
     * Change direction
     * @param {*} facing
     * @returns
     */
    _defineProperty(_this, "faceDir", function (facing) {
      if (_this.facing == facing || facing === _enums.Direction.None) return null;
      return new _index2.ActionLoader(_this.engine, 'face', [facing], _this);
    });
    /**
     * set message (for chat bubbles)
     */
    _defineProperty(_this, "setGreeting", function (greeting) {
      if (_this.speech.clearHud) {
        _this.speech.clearHud();
      }
      _this.speech.writeText(greeting);
      _this.speech.loadImage();
      return new _index2.ActionLoader(_this.engine, 'greeting', [greeting, {
        autoclose: true
      }], _this);
    });
    _this.objId = Math.floor(Math.random() * 100);
    _this.engine = _engine;
    _this.templateLoaded = false;
    _this.drawOffset = new _vector.Vector(0, 0, 0);
    _this.hotspotOffset = new _vector.Vector(0, 0, 0);
    _this.pos = new _vector.Vector(0, 0, 0);
    _this.size = new _vector.Vector(1, 1, 1);
    _this.scale = new _vector.Vector(1, 1, 1);
    _this.rotation = new _vector.Vector(0, 0, 0);
    _this.facing = _enums.Direction.Right;
    _this.actionDict = {};
    _this.actionList = [];
    _this.speech = {};
    _this.portrait = null;
    _this.isLit = true;
    _this.lightColor = [1.0, 1.0, 1.0];
    _this.lightIndex = null;
    _this.onLoadActions = new _index["default"]();
    _this.inventory = [];
    _this.blocking = true; // default - cannot passthrough
    _this.override = false;
    _this.isSelected = false;
    return _this;
  }
  _inherits(ModelObject, _Loadable);
  return _createClass(ModelObject, [{
    key: "addAction",
    value: (
    /**
     * Add Action to Queue
     * @param {*} action
     */
    function () {
      var _addAction = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(action) {
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              _context3.n = 1;
              return Promise.resolve(action);
            case 1:
              action = _context3.v;
              if (this.actionDict[action.id]) this.removeAction(action.id);
              this.actionDict[action.id] = action;
              this.actionList.push(action);
            case 2:
              return _context3.a(2);
          }
        }, _callee3, this);
      }));
      function addAction(_x5) {
        return _addAction.apply(this, arguments);
      }
      return addAction;
    }())
  }]);
}(_loadable["default"]);