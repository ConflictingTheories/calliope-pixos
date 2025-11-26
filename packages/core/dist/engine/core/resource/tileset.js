"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _index = _interopRequireDefault(require("@Engine/core/queue/index.js"));
var _loadable = _interopRequireDefault(require("@Engine/core/queue/loadable.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
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
var Tileset = exports["default"] = /*#__PURE__*/function (_Loadable) {
  /**
   * Tileset geometry and tiles
   * @param {*} engine
   */
  function Tileset(engine) {
    var _this;
    _classCallCheck(this, Tileset);
    _this = _callSuper(this, Tileset);
    /**
     * Received tileset definition JSON
     * @param {*} data
     */
    _defineProperty(_this, "onJsonLoaded", function (data) {
      // Merge tileset definition into this object
      Object.keys(data).map(function (k) {
        _this[k] = data[k];
      });
      // Definition actions must always run before loaded actions
      _this.definitionLoaded = true;
      _this.onDefinitionLoadActions.run();
      // load texture
      _this.texture = _this.engine.resourceManager.loadTexture(_this.src);
      _this.texture.runWhenLoaded(_this.onTextureLoaded);
      // set background colour
      if (_this.bgColor) _this.engine.gl.clearColor(_this.bgColor[0] / 255, _this.bgColor[1] / 255, _this.bgColor[2] / 255, 1.0);
    });
    /**
     * Received tileset definition JSON
     * @param {*} data
     * @param {*} zip
     */
    _defineProperty(_this, "onJsonLoadedFromZip", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(data, zip) {
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              // Merge tileset definition into this object
              Object.keys(data).map(function (k) {
                _this[k] = data[k];
              });
              // Definition actions must always run before loaded actions
              _this.definitionLoaded = true;
              _this.onDefinitionLoadActions.run();
              // load texture
              _context.n = 1;
              return _this.engine.resourceManager.loadTextureFromZip(_this.src, zip);
            case 1:
              _this.texture = _context.v;
              _this.texture.runWhenLoaded(_this.onTextureLoaded);
              // set background colour
              if (_this.bgColor) _this.engine.gl.clearColor(_this.bgColor[0] / 255, _this.bgColor[1] / 255, _this.bgColor[2] / 255, 1.0);
            case 2:
              return _context.a(2);
          }
        }, _callee);
      }));
      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
    /**
     * run when loaded
     */
    _defineProperty(_this, "onTextureLoaded", function () {
      _this.loaded = true;
      _this.onLoadActions.run();
    });
    /**
     * Actions to run after the tileset definition has loaded,
     * but before the texture is ready
     * @param {*} action
     */
    _defineProperty(_this, "runWhenDefinitionLoaded", function (action) {
      if (_this.definitionLoaded) action();else _this.onDefinitionLoadActions.add(action);
    });
    /**
     * Get vertices for tile
     * @param {*} id - Tile geometry ID
     * @param {*} offset - Position offset [x, y, z]
     * @param {number} heightOverride - Optional height override for the tile
     * @returns {Array} Flattened array of vertices
     */
    _defineProperty(_this, "getTileVertices", function (id, offset) {
      var heightOverride = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      // The tile 'offset' is [x, y, z]. Height override refers to the vertical
      // elevation of the tile (z-offset). We must not override the Y grid offset.
      var xOffset = offset[0];
      var yOffset = offset[1];
      var zOffset = heightOverride !== null ? heightOverride : offset[2];

      // Debug logging for first few calls with height override
      if (heightOverride !== null) {
        console.log("[Tileset.getTileVertices] tile=".concat(id, ", offset=[").concat(offset, "], heightOverride=").concat(heightOverride, ", zOffset=").concat(zOffset));
      }
      if (!_this.geometry[id] || !_this.geometry[id].vertices) {
        // If geometry is missing for a tile, log a warning and fallback to either
        // geometry[0] or a simple flat quad to avoid blank spaces in the map.
        console.warn("[Tileset.getTileVertices] Missing geometry for tile id ".concat(id, ". Attempting fallback."));
        if (_this.geometry[0] && _this.geometry[0].vertices) {
          id = 0; // fallback to first geometry definition
        } else {
          // Simple fallback quad: [0,0,0], [1,0,0], [1,0,1], [0,0,1]
          var quad = [[[0, 0, 0], [1, 0, 0], [1, 0, 1]], [[0, 0, 0], [1, 0, 1], [0, 0, 1]]];
          return quad.map(function (poly) {
            return poly.map(function (vertex) {
              return [vertex[0] + offset[0], vertex[1] + yOffset, vertex[2] + zOffset];
            });
          }).flat(3);
        }
      }
      return _this.geometry[id].vertices.map(function (poly) {
        return poly.map(function (vertex) {
          return [vertex[0] + xOffset, vertex[1] + yOffset, vertex[2] + zOffset];
        });
      }).flat(3);
    });
    /**
     * get texture coordinates
     * @param {*} id
     * @param {*} texId
     * @returns
     */
    _defineProperty(_this, "getTileTexCoords", function (id, texId) {
      var tileOffset = _this.textures[texId];
      var size = [_this.tileSize / _this.sheetSize[0], _this.tileSize / _this.sheetSize[1]];
      return _this.geometry[id].surfaces.map(function (poly) {
        return poly.map(function (vertex) {
          return [(vertex[0] + tileOffset[0]) * size[0], (vertex[1] + tileOffset[1]) * size[1]];
        });
      }).flat(3);
    });
    /**
     * determine walkability
     * @param {*} tileId
     * @returns
     */
    _defineProperty(_this, "getWalkability", function (tileId) {
      return _this.geometry[tileId].type;
    });
    /**
     * get poly for walk
     * @param {*} tileId
     * @returns
     */
    _defineProperty(_this, "getTileWalkPoly", function (tileId) {
      return _this.geometry[tileId].walkPoly;
    });
    /**
     * Get metadata for a tile (e.g., preserveHeightOnWalk)
     * @param {string} tileName
     * @returns {object}
     */
    _defineProperty(_this, "getTileMetadata", function (tileName) {
      return _this.tileMetadata[tileName] || {};
    });
    _this.engine = engine;
    _this.src = null;
    _this.sheetSize = [0, 0];
    _this.tileSize = 0;
    _this.tiles = {};
    _this.tileMetadata = {}; // Metadata per tile (e.g., preserveHeightOnWalk)
    _this.loaded = false;
    _this.onLoadActions = new _index["default"]();
    _this.onDefinitionLoadActions = new _index["default"]();
    return _this;
  }
  _inherits(Tileset, _Loadable);
  return _createClass(Tileset);
}(_loadable["default"]);