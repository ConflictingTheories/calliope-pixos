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
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
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
var Sprite = exports["default"] = /*#__PURE__*/function (_Loadable) {
  /**
   * Sprites are 2D objects
   * @param {*} engine
   */
  function Sprite(engine) {
    var _this;
    _classCallCheck(this, Sprite);
    _this = _callSuper(this, Sprite);
    /**
     * Load Sprite data and configure
     * @param {*} instanceData
     * @returns
     */
    _defineProperty(_this, "onLoad", function (instanceData) {
      if (_this.loaded) return;
      if (!_this.src || !_this.sheetSize || !_this.tileSize || !_this.frames) {
        console.error('Invalid sprite definition');
        return;
      }
      console.log({
        msg: 'sprite load',
        instanceData: instanceData,
        objId: _this.objId
      });
      // Zone Information
      _this.zone = instanceData.zone;
      if (instanceData.id) _this.id = instanceData.id;
      if (instanceData.pos) {
        _this.pos = instanceData.pos;
        // If z is not defined, compute from zone tile height
        if (_this.pos && (_this.pos.z === null || _this.pos.z === undefined)) {
          try {
            var _this$hotspotOffset$x, _this$hotspotOffset, _this$hotspotOffset$y, _this$hotspotOffset2;
            var hx = _this.pos.x + ((_this$hotspotOffset$x = (_this$hotspotOffset = _this.hotspotOffset) === null || _this$hotspotOffset === void 0 ? void 0 : _this$hotspotOffset.x) !== null && _this$hotspotOffset$x !== void 0 ? _this$hotspotOffset$x : 0);
            var hy = _this.pos.y + ((_this$hotspotOffset$y = (_this$hotspotOffset2 = _this.hotspotOffset) === null || _this$hotspotOffset2 === void 0 ? void 0 : _this$hotspotOffset2.y) !== null && _this$hotspotOffset$y !== void 0 ? _this$hotspotOffset$y : 0);
            var z = _this.zone.getHeight(hx, hy);
            _this.pos.z = typeof z === 'number' ? z : 0;
          } catch (err) {
            console.warn('Error computing sprite height from zone', err);
            _this.pos.z = 0;
          }
        }
      }
      if (instanceData.isLit) _this.isLit = instanceData.isLit;
      if (instanceData.attenuation) _this.attenuation = instanceData.attenuation;
      if (instanceData.direction) _this.direction = instanceData.direction;
      if (instanceData.lightColor) _this.lightColor = instanceData.lightColor;
      if (instanceData.density) _this.density = instanceData.density;
      if (instanceData.scatteringCoefficients) _this.scatteringCoefficients = instanceData.scatteringCoefficients;
      if (instanceData.rotation) _this.rotation = instanceData.rotation;
      if (instanceData.facing && instanceData.facing !== 0) _this.facing = instanceData.facing;
      if (instanceData.zones && instanceData.zones !== null) _this.zones = instanceData.zones;
      // Step Handler
      if (instanceData.onStep && typeof instanceData.onStep == 'function') {
        var stepParent = _this.onStep;
        _this.onStep = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
          return _regenerator().w(function (_context) {
            while (1) switch (_context.n) {
              case 0:
                _context.n = 1;
                return instanceData.onStep(_this, _this);
              case 1:
                _context.n = 2;
                return stepParent(_this, _this);
              case 2:
                return _context.a(2);
            }
          }, _callee);
        }));
      }
      // select handler
      if (instanceData.onSelect && typeof instanceData.onSelect == 'function') {
        var selectParent = _this.onSelect;
        _this.onSelect = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
          return _regenerator().w(function (_context2) {
            while (1) switch (_context2.n) {
              case 0:
                _context2.n = 1;
                return instanceData.onSelect(_this, _this);
              case 1:
                _context2.n = 2;
                return selectParent(_this, _this);
              case 2:
                return _context2.a(2);
            }
          }, _callee2);
        }));
      }
      // Texture Buffer
      _this.texture = _this.engine.resourceManager.loadTexture(_this.src);
      _this.texture.runWhenLoaded(_this.onTilesetOrTextureLoaded);
      _this.vertexTexBuf = _this.engine.renderManager.createBuffer(_this.getTexCoords(), _this.engine.gl.DYNAMIC_DRAW, 2);

      // // Speech bubble
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
      if (_this.isLit) {
        var _this$attenuation;
        console.log({
          msg: 'Adding Light Loaded',
          id: _this.id,
          pos: _this.pos.toArray()
        });
        _this.lightIndex = _this.engine.renderManager.lightManager.addLight(_this.id, _this.pos.toArray(), _this.lightColor, (_this$attenuation = _this.attenuation) !== null && _this$attenuation !== void 0 ? _this$attenuation : [0.01, 0.01, 0.01], _this.direction, _this.density, _this.scatteringCoefficients, true);
      }
      //
      _this.zone.tileset.runWhenDefinitionLoaded(_this.onTilesetDefinitionLoaded);
    });
    /**
     * Load Texture / Location
     * @param {*} instanceData
     * @param {Zip} zip
     * @returns
     */
    _defineProperty(_this, "onLoadFromZip", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(instanceData, zip) {
        var _this$hotspotOffset$x2, _this$hotspotOffset3, _this$hotspotOffset$y2, _this$hotspotOffset4, hx, hy, z, stepParent, _this$attenuation2;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              if (!_this.loaded) {
                _context4.n = 1;
                break;
              }
              return _context4.a(2);
            case 1:
              if (!(!_this.src || !_this.sheetSize || !_this.tileSize || !_this.frames)) {
                _context4.n = 2;
                break;
              }
              console.error('Invalid sprite definition');
              return _context4.a(2);
            case 2:
              console.log({
                msg: 'sprite load from zip',
                instanceData: instanceData
              });

              // Zone Information
              _this.update(instanceData);
              _this.zone = instanceData.zone;
              if (instanceData.id) _this.id = instanceData.id;
              if (instanceData.isLit) _this.isLit = instanceData.isLit;
              if (instanceData.lightColor) _this.lightColor = instanceData.lightColor;
              if (instanceData.density) _this.density = instanceData.density;
              if (instanceData.attenuation) _this.attenuation = instanceData.attenuation;
              if (instanceData.direction) _this.direction = instanceData.direction;
              if (instanceData.scatteringCoefficients) _this.scatteringCoefficients = instanceData.scatteringCoefficients;
              if (instanceData.fixed) _this.fixed = instanceData.fixed;
              if (instanceData.pos) {
                _this.pos = instanceData.pos;
                if (_this.pos && (_this.pos.z === null || _this.pos.z === undefined)) {
                  try {
                    hx = _this.pos.x + ((_this$hotspotOffset$x2 = (_this$hotspotOffset3 = _this.hotspotOffset) === null || _this$hotspotOffset3 === void 0 ? void 0 : _this$hotspotOffset3.x) !== null && _this$hotspotOffset$x2 !== void 0 ? _this$hotspotOffset$x2 : 0);
                    hy = _this.pos.y + ((_this$hotspotOffset$y2 = (_this$hotspotOffset4 = _this.hotspotOffset) === null || _this$hotspotOffset4 === void 0 ? void 0 : _this$hotspotOffset4.y) !== null && _this$hotspotOffset$y2 !== void 0 ? _this$hotspotOffset$y2 : 0);
                    z = _this.zone.getHeight(hx, hy);
                    _this.pos.z = typeof z === 'number' ? z : 0;
                  } catch (err) {
                    console.warn('Error computing sprite height from zone', err);
                    _this.pos.z = 0;
                  }
                }
              }
              if (instanceData.facing && instanceData.facing !== 0) _this.facing = instanceData.facing;
              if (instanceData.zones && instanceData.zones !== null) _this.zones = instanceData.zones;
              if (instanceData.onStep && typeof instanceData.onStep == 'function') {
                stepParent = _this.onStep;
                _this.onStep = /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
                  return _regenerator().w(function (_context3) {
                    while (1) switch (_context3.n) {
                      case 0:
                        _context3.n = 1;
                        return instanceData.onStep(_this, _this);
                      case 1:
                        _context3.n = 2;
                        return stepParent(_this, _this);
                      case 2:
                        return _context3.a(2);
                    }
                  }, _callee3);
                }));
              }

              // Step Handler - todo
              // if (instanceData.onStep) {
              //   let stepParent = this.onStep;
              //   this.onStep = async () => {
              //     // todo - need to add lua interpreter
              //     // -- should be able to run lua scripts
              //     eval.call(this, await this.zip.file(`triggers/${instanceData.onStep}.js`).async('string')).call(this, this);
              //     await stepParent(this, this);
              //   };
              // }

              // Texture Buffer
              _context4.n = 3;
              return _this.engine.resourceManager.loadTextureFromZip(_this.src, zip);
            case 3:
              _this.texture = _context4.v;
              _this.texture.runWhenLoaded(_this.onTilesetOrTextureLoaded);
              _this.vertexTexBuf = _this.engine.renderManager.createBuffer(_this.getTexCoords(), _this.engine.gl.DYNAMIC_DRAW, 2);

              // Speech bubble
              if (_this.enableSpeech) {
                _this.speech = _this.engine.resourceManager.loadSpeech(_this.id, _this.engine.mipmap);
                _this.speech.runWhenLoaded(_this.onTilesetOrTextureLoaded);
                _this.speechTexBuf = _this.engine.renderManager.createBuffer(_this.getSpeechBubbleTexture(), _this.engine.gl.DYNAMIC_DRAW, 2);
              }

              // load Portrait
              if (!_this.portraitSrc) {
                _context4.n = 5;
                break;
              }
              _context4.n = 4;
              return _this.engine.resourceManager.loadTextureFromZip(_this.portraitSrc, zip);
            case 4:
              _this.portrait = _context4.v;
              _this.portrait.runWhenLoaded(_this.onTilesetOrTextureLoaded);
            case 5:
              // lighting
              if (_this.isLit) {
                _this.lightIndex = _this.engine.renderManager.lightManager.addLight(_this.id, _this.pos.toArray(), _this.lightColor, (_this$attenuation2 = _this.attenuation) !== null && _this$attenuation2 !== void 0 ? _this$attenuation2 : [0.01, 0.01, 0.01], _this.direction, _this.density, _this.scatteringCoefficients, true);
              }
              _this.zone.tileset.runWhenDefinitionLoaded(_this.onTilesetDefinitionLoaded);
            case 6:
              return _context4.a(2);
          }
        }, _callee4);
      }));
      return function (_x, _x2) {
        return _ref3.apply(this, arguments);
      };
    }());
    /**
     * Definition Loaded
     */
    _defineProperty(_this, "onTilesetDefinitionLoaded", function () {
      // size of tiles (1x1 squares are assumed)
      var tileSize = _this.zone.tileset.tileSize;

      // normalize - ie scale the provided tile by the tile size
      var normTile = [_this.tileSize[0] / tileSize, _this.tileSize[1] / tileSize];

      // vertices
      var verts = [[0, 0, 0], [normTile[0], 0, 0], [normTile[0], 0, normTile[1]], [0, 0, normTile[1]]];

      // polys
      var poly = [[verts[2], verts[3], verts[0]], [verts[2], verts[0], verts[1]]].flat(3);

      // sprite data
      _this.vertexPosBuf = _this.engine.renderManager.createBuffer(poly, _this.engine.gl.STATIC_DRAW, 3);

      // speech bubble data - to account for proper height
      if (_this.enableSpeech) {
        _this.speechVerBuf = _this.engine.renderManager.createBuffer(_this.getSpeechBubbleVertices(), _this.engine.gl.STATIC_DRAW, 3);
      }
      _this.zone.tileset.runWhenLoaded(_this.onTilesetOrTextureLoaded);
    });
    /**
     * After Tileset / Texture Loaded
     * @returns
     */
    _defineProperty(_this, "onTilesetOrTextureLoaded", function () {
      if (!_this || _this.loaded || !_this.zone.tileset.loaded || !_this.texture.loaded || _this.enableSpeech && _this.speech && !_this.speech.loaded || _this.portrait && !_this.portrait.loaded) return;
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
     * Get Texture Coordinates
     * @returns
     */
    _defineProperty(_this, "getTexCoords", function () {
      var _this$frames$sequence;
      var sequence = _enums.Direction.spriteSequence(_this.facing, _this.engine.renderManager.camera.cameraDir);
      var frames = (_this$frames$sequence = _this.frames[sequence]) !== null && _this$frames$sequence !== void 0 ? _this$frames$sequence : _this.frames['N']; //default up
      var length = frames.length;
      var t = frames[_this.animFrame % length];
      var ss = _this.sheetSize;
      var ts = _this.tileSize;
      var bl = [(t[0] + ts[0]) / ss[0], t[1] / ss[1]];
      var tr = [t[0] / ss[0], (t[1] + ts[1]) / ss[1]];
      var v = [bl, [tr[0], bl[1]], tr, [bl[0], tr[1]]];
      var poly = [[v[0], v[1], v[2]], [v[0], v[2], v[3]]];
      return poly.flat(3);
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
     * Draw Sprite Sprite
     * @returns
     */
    _defineProperty(_this, "draw", function () {
      var _this$drawOffset$rm$c;
      if (!_this.loaded) return;
      // Increment sprite draw counter for debug metrics. Counting draws at
      // the start ensures that only successfully rendered sprites are tallied.
      if (_this.engine && _this.engine.renderManager && _this.engine.renderManager.debug) {
        _this.engine.renderManager.debug.spritesDrawn++;
      }
      var rm = _this.engine.renderManager;
      var isPickerPass = rm.isPickerPass;

      //update light position
      if (_this.isLit) {
        var pos = _this.pos.toArray();
        rm.lightManager.updateLight(_this.lightIndex, pos);
      }
      rm.mvPushMatrix();
      // position
      (0, _matrix.translate)(rm.uModelMat, rm.uModelMat, ((_this$drawOffset$rm$c = _this.drawOffset[rm.camera.cameraDir]) !== null && _this$drawOffset$rm$c !== void 0 ? _this$drawOffset$rm$c : _this.drawOffset['N']).toArray());
      (0, _matrix.translate)(rm.uModelMat, rm.uModelMat, _this.pos.toArray());

      // scale & rotate sprite to handle walls
      if (!_this.fixed) {
        // Only set main shader uniforms during normal render, not picker pass
        if (!isPickerPass) {
          rm.shaderProgram.setMatrixUniforms({
            id: _this.getPickingId(),
            scale: new _vector.Vector(1, Math.cos(rm.camera.cameraAngle / 180), 1)
          });
        }
        (0, _matrix.translate)(rm.uModelMat, rm.uModelMat, [0.5 * rm.camera.cameraVector.x, 0.5 * rm.camera.cameraVector.y, 0]);
        (0, _matrix.rotate)(rm.uModelMat, rm.uModelMat, (0, _vector2.degToRad)(rm.camera.cameraAngle * rm.camera.cameraVector.z), [0, 0, -1]);
        (0, _matrix.translate)(rm.uModelMat, rm.uModelMat, [-0.5 * rm.camera.cameraVector.x, -0.5 * rm.camera.cameraVector.y, 0]);
      }

      // Bind texture - attribute locations are the same for both shaders (hardcoded to 0, 1)
      rm.bindBuffer(_this.vertexPosBuf, rm.shaderProgram.aVertexPosition);
      rm.bindBuffer(_this.vertexTexBuf, rm.shaderProgram.aTextureCoord);
      _this.texture.attach();
      if (isPickerPass) {
        // During picker pass, only set picker shader uniforms
        rm.effectPrograms['picker'].setMatrixUniforms({
          sampler: 1.0,
          id: _this.getPickingId(),
          scale: new _vector.Vector(1, Math.cos(rm.camera.cameraAngle / 180), 1)
        });
      } else {
        // During normal render, set main shader uniforms
        // if selected
        if (_this.isSelected) {
          rm.shaderProgram.setMatrixUniforms({
            id: _this.getPickingId(),
            isSelected: true,
            sampler: 1.0,
            colorMultiplier: _this.engine.frameCount & 0x8 ? [1, 0, 0, 1] : [1, 1, 0, 1]
          });
        } else {
          rm.shaderProgram.setMatrixUniforms({
            id: _this.getPickingId(),
            sampler: 1.0
          });
        }
      }

      // Draw
      _this.engine.gl.depthFunc(_this.engine.gl.ALWAYS);
      _this.engine.gl.drawArrays(_this.engine.gl.TRIANGLES, 0, _this.vertexPosBuf.numItems);
      _this.engine.gl.depthFunc(_this.engine.gl.LESS);
      rm.mvPopMatrix();

      // Draw Speech (skip during picker pass - speech bubbles don't need to be pickable)
      if (_this.enableSpeech && !isPickerPass) {
        var _this$drawOffset$rm$c2;
        rm.mvPushMatrix();

        // Undo rotation so that character plane is normal to LOS
        (0, _matrix.translate)(rm.uModelMat, rm.uModelMat, ((_this$drawOffset$rm$c2 = _this.drawOffset[rm.camera.cameraDir]) !== null && _this$drawOffset$rm$c2 !== void 0 ? _this$drawOffset$rm$c2 : _this.drawOffset['N']).toArray());
        (0, _matrix.translate)(rm.uModelMat, rm.uModelMat, _this.pos.toArray());
        (0, _matrix.rotate)(rm.uModelMat, rm.uModelMat, (0, _vector2.degToRad)(rm.camera.cameraAngle * rm.camera.cameraVector.z), [0, 0, -1]);

        // Bind texture for speech bubble
        rm.bindBuffer(_this.speechVerBuf, rm.shaderProgram.aVertexPosition);
        rm.bindBuffer(_this.speechTexBuf, rm.shaderProgram.aTextureCoord);
        _this.speech.attach();

        // Draw Speech bubble
        rm.shaderProgram.setMatrixUniforms({
          id: _this.getPickingId()
        });
        _this.engine.gl.depthFunc(_this.engine.gl.ALWAYS);
        _this.engine.gl.drawArrays(_this.engine.gl.TRIANGLES, 0, _this.speechVerBuf.numItems);
        _this.engine.gl.depthFunc(_this.engine.gl.LESS);
        rm.mvPopMatrix();
      }
    });
    /**
     * Return id for picking
     * @returns
     */
    _defineProperty(_this, "getPickingId", function () {
      var id = [(_this.objId >> 0 & 0xff) / 0xff, (_this.objId >> 8 & 0xff) / 0xff, (_this.objId >> 16 & 0xff) / 0xff, 255];
      return id;
    });
    /**
     * Set Frame
     * @param {number} frame
     */
    _defineProperty(_this, "setFrame", function (frame) {
      _this.animFrame = frame;
      _this.engine.renderManager.updateBuffer(_this.vertexTexBuf, _this.getTexCoords());
    });
    /**
     * Set Facing
     * @param {string} facing
     */
    _defineProperty(_this, "setFacing", function (facing) {
      if (facing) _this.facing = facing;
      _this.setFrame(_this.animFrame);
    });
    /**
     * Add Action to Queue
     * @param {*} action
     */
    _defineProperty(_this, "addAction", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(action) {
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              _context5.n = 1;
              return Promise.resolve(action);
            case 1:
              action = _context5.v;
              if (_this.actionDict[action.id]) _this.removeAction(action.id);
              _this.actionDict[action.id] = action;
              _this.actionList.push(action);
            case 2:
              return _context5.a(2);
          }
        }, _callee5);
      }));
      return function (_x3) {
        return _ref5.apply(this, arguments);
      };
    }());
    /**
     * Remove Action
     * @param {string} id
     */
    _defineProperty(_this, "removeAction", function (id) {
      _this.actionList = _this.actionList.filter(function (action) {
        return action.id !== id;
      });
      delete _this.actionDict[id];
    });
    /**
     * Remove all actions
     */
    _defineProperty(_this, "removeAllActions", function () {
      _this.actionList = [];
      _this.actionDict = {};
    });
    /**
     * Tick Outer Wrapper - represents a logical cycle / step - runs the action queue & sprite actions
     * @param {int} time
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
        try {
          if (action.tick(time)) {
            toRemove.push(action); // remove from backlog
            action.onComplete(); // call completion handler
          }
        } catch (e) {
          console.error(e);
          toRemove.push(action);
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
    _defineProperty(_this, "init", function () {});
    /**
     * load from json specification
     * @param {string} url
     */
    _defineProperty(_this, "loadRemote", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(url) {
        var response;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.n) {
            case 0:
              _context6.n = 1;
              return fetch(url);
            case 1:
              response = _context6.v;
              if (response.ok) {
                _context6.n = 2;
                break;
              }
              throw new Error();
            case 2:
              _this.update(response.json());
            case 3:
              return _context6.a(2);
          }
        }, _callee6);
      }));
      return function (_x4) {
        return _ref6.apply(this, arguments);
      };
    }());
    /**
     * Output Dialogue to the HUD
     * @param {string} text
     * @param {boolean} showBubble
     * @param {*} dialogue
     */
    _defineProperty(_this, "speak", function (text) {
      var showBubble = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var dialogue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      if (!text && _this.speech.clearHud) _this.speech.clearHud();else {
        var _this$portrait;
        // speech tts output
        if (dialogue.speechOutput) {
          _this.speechSynthesis(text);
          dialogue.speechOutput = false;
        }

        // dialogue box
        _this.textbox = _this.engine.hud.scrollText(_this.id + ':> ' + text, true, {
          portrait: (_this$portrait = _this.portrait) !== null && _this$portrait !== void 0 ? _this$portrait : false
        });

        // speech bubble?
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
     * Text to Speech output
     * @param {string} text
     * @param {SpeechSynthesisVoice} voice
     * @param {string} lang
     * @param {number} rate
     * @param {number} volume
     * @param {number} pitch
     */
    _defineProperty(_this, "speechSynthesis", function (text) {
      var _window$speechSynthes;
      var voice = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var lang = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'en';
      var rate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var volume = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
      var pitch = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
      var speech = _this.voice;
      var voices = (_window$speechSynthes = window.speechSynthesis.getVoices()) !== null && _window$speechSynthes !== void 0 ? _window$speechSynthes : [];

      // set voice
      speech.voice = _this.gender ? _this.gender == 'male' ? voices[7] : voices[28] : voices[0];
      if (rate) speech.rate = rate;
      if (volume) speech.volume = volume;
      if (pitch) speech.pitch = pitch;
      speech.text = text;
      speech.lang = lang;

      // speak
      window.speechSynthesis.speak(speech);
    });
    /**
     * handles interaction -- default (should be overridden in definition)
     * @param {*} sprite sprite which triggered interaction
     * @param {*} finish callback to call on completion
     * @returns
     */
    _defineProperty(_this, "interact", /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(sprite, finish) {
        var ret, _t;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.n) {
            case 0:
              ret = null; // React based on internal state
              _t = _this.state;
              _context7.n = 1;
              break;
            case 1:
              return _context7.a(3, 2);
            case 2:
              // If completion handler passed through - call it when done
              if (finish) finish(true);
              return _context7.a(2, ret);
          }
        }, _callee7);
      }));
      return function (_x5, _x6) {
        return _ref7.apply(this, arguments);
      };
    }());
    /**
     * Set Facing
     * @param {string} facing
     * @param {boolean} override
     * @returns
     */
    _defineProperty(_this, "faceDir", function (facing) {
      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!override && _this.facing == facing || facing === _enums.Direction.None) return null;
      return new _index2.ActionLoader(_this.engine, 'face', [facing], _this);
    });
    /**
     * set message (for chat bubble above objects/sprites)
     * @param {string} greeting
     * @returns
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
    _this.objId = Math.round(Math.random() * 100) + 11;
    _this.engine = engine;
    _this.templateLoaded = false;
    _this.drawOffset = new _vector.Vector(0, 0, 0);
    _this.hotspotOffset = new _vector.Vector(0, 0, 0);
    _this.animFrame = 0;
    _this.fixed = false;
    _this.pos = new _vector.Vector(0, 0, 0);
    _this.scale = new _vector.Vector(1, 1, 1);
    _this.facing = _enums.Direction.Right;
    _this.actionDict = {};
    _this.actionList = [];
    _this.gender = null;
    _this.speech = {};
    _this.portrait = null;
    _this.onLoadActions = new _index["default"]();
    _this.inventory = [];
    _this.blocking = true; // default - cannot passthrough
    _this.override = false;
    _this.isLit = true;
    _this.lightIndex = null;
    _this.lightColor = [0.1, 1.0, 0.1];
    _this.density = 1;
    _this.voice = new SpeechSynthesisUtterance();
    _this.isSelected = false;
    return _this;
  }
  _inherits(Sprite, _Loadable);
  return _createClass(Sprite);
}(_loadable["default"]);