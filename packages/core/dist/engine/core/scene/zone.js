"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _enums = require("@Engine/utils/enums.js");
var _resources = _interopRequireDefault(require("@Engine/utils/resources.js"));
var _index = _interopRequireDefault(require("@Engine/core/queue/index.js"));
var _vector = require("@Engine/utils/math/vector.js");
var _index2 = require("@Engine/utils/loaders/index.js");
var _map = require("@Engine/dynamic/map.js");
var _loadable = _interopRequireDefault(require("@Engine/core/queue/loadable.js"));
var _PixoScriptInterpreter = _interopRequireDefault(require("@Engine/scripting/PixoScriptInterpreter.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
\*                                                 */ /**
 * @fileoverview Zone class for Pixos game engine.
 * Manages map zones, sprites, objects, and rendering.
 */
/**
 * @typedef {object} ZoneData
 * @property {string} id - Zone ID.
 * @property {number} objId - Object ID.
 * @property {object[]} scripts - Scripts.
 * @property {object} data - Zone data.
 * @property {string[]} objects - Object IDs.
 * @property {string[]} sprites - Sprite IDs.
 * @property {Array<number[]>} selectedTiles - Selected tiles.
 */
/**
 * Zone - Represents a map zone with tiles, sprites, and objects.
 */
var Zone = exports["default"] = /*#__PURE__*/function (_Loadable) {
  /**
   * Creates an instance of Zone.
   * @param {string} zoneId - The zone ID.
   * @param {import('./world.js').default} world - The world instance.
   */
  function Zone(zoneId, _world) {
    var _this2;
    _classCallCheck(this, Zone);
    _this2 = _callSuper(this, Zone);
    /** @type {string} */
    /**
     * Gets the zone data.
     * @returns {ZoneData} The zone data.
     */
    _defineProperty(_this2, "getZoneData", function () {
      return {
        id: _this2.id,
        objId: _this2.objId,
        scripts: _this2.scripts,
        data: _this2.data,
        objects: Object.keys(_this2.objectDict),
        sprites: Object.keys(_this2.spriteDict),
        selectedTiles: _this2.selectedTiles
      };
    });
    /**
     * Called after tileset and actors are loaded.
     */
    _defineProperty(_this2, "afterTilesetAndActorsLoaded", function () {
      var _this2$tileset;
      if (_this2.loaded || !((_this2$tileset = _this2.tileset) !== null && _this2$tileset !== void 0 && _this2$tileset.loaded) || !_this2.spriteList.every(function (s) {
        return s.loaded;
      }) || !_this2.objectList.every(function (o) {
        return o.loaded;
      })) return;
      _this2.loaded = true;
      _this2.loadScripts(true);
      _this2.onLoadActions.run();
    });
    /**
     * Attaches tileset listeners.
     */
    _defineProperty(_this2, "attachTilesetListeners", function () {
      _this2.tileset.runWhenDefinitionLoaded(_this2.onTilesetDefinitionLoaded);
      _this2.tileset.runWhenLoaded(_this2.afterTilesetAndActorsLoaded);
    });
    /**
     * Finalizes the zone loading.
     */
    _defineProperty(_this2, "finalize", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var _iterator, _step, s, _iterator2, _step2, o;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _iterator = _createForOfIteratorHelper(_this2.spriteList);
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                s = _step.value;
                s.runWhenLoaded(_this2.afterTilesetAndActorsLoaded);
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
            _iterator2 = _createForOfIteratorHelper(_this2.objectList);
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                o = _step2.value;
                o.runWhenLoaded(_this2.afterTilesetAndActorsLoaded);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
            _this2.engine.networkManager.loadZone(_this2.id, _this2);
          case 1:
            return _context.a(2);
        }
      }, _callee);
    })));
    /**
     * Loads the zone remotely.
     */
    _defineProperty(_this2, "loadRemote", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var res, _this2$engine$renderM, data, _t, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            _context2.n = 1;
            return fetch(_resources["default"].zoneRequestUrl(_this2.id));
          case 1:
            res = _context2.v;
            if (res.ok) {
              _context2.n = 2;
              break;
            }
            return _context2.a(2);
          case 2:
            _context2.p = 2;
            _context2.n = 3;
            return res.json();
          case 3:
            data = _context2.v;
            _this2.bounds = data.bounds;
            _this2.size = [data.bounds[2] - data.bounds[0], data.bounds[3] - data.bounds[1]];
            _this2.cells = typeof data.cells === 'function' ? data.cells(_this2.bounds, _this2) : data.cells;
            _this2.sprites = typeof data.sprites === 'function' ? data.sprites(_this2.bounds, _this2) : data.sprites || [];
            _this2.objects = typeof data.objects === 'function' ? data.objects(_this2.bounds, _this2) : data.objects || [];
            _context2.n = 4;
            return _this2.tsLoader.load(data.tileset, _this2.spritzName);
          case 4:
            _this2.tileset = _context2.v;
            _this2.attachTilesetListeners();
            if (_this2.audioSrc) _this2.audio = _this2.engine.resourceManager.audioLoader.load(_this2.audioSrc, true);
            _context2.n = 5;
            return Promise.all([Promise.all(_this2.sprites.map(_this2.loadSprite)), Promise.all(_this2.objects.map(_this2.loadObject))]);
          case 5:
            if (!(data.skyboxShader && (_this2$engine$renderM = _this2.engine.renderManager) !== null && _this2$engine$renderM !== void 0 && (_this2$engine$renderM = _this2$engine$renderM.skyboxManager) !== null && _this2$engine$renderM !== void 0 && _this2$engine$renderM.setSkyboxShader)) {
              _context2.n = 6;
              break;
            }
            _context2.n = 6;
            return _this2.engine.renderManager.skyboxManager.setSkyboxShader(data.skyboxShader);
          case 6:
            _context2.n = 7;
            return _this2.finalize();
          case 7:
            _context2.p = 7;
            if (!data.mode) {
              _context2.n = 8;
              break;
            }
            _context2.n = 8;
            return _this2.loadMode(data.mode);
          case 8:
            _context2.n = 10;
            break;
          case 9:
            _context2.p = 9;
            _t = _context2.v;
            console.warn('zone mode load failed', _t);
          case 10:
            _context2.n = 12;
            break;
          case 11:
            _context2.p = 11;
            _t2 = _context2.v;
            console.error('Error parsing zone ' + _this2.id, _t2);
          case 12:
            return _context2.a(2);
        }
      }, _callee2, null, [[7, 9], [2, 11]]);
    })));
    /**
     * Loads the zone.
     */
    _defineProperty(_this2, "load", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
      var _this2$engine$renderM2, data, _t3, _t4;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            _context3.p = 0;
            data = require('@Spritz/' + _this2.spritzName + '/maps/' + _this2.id + '/map.js')["default"];
            Object.assign(_this2, data);

            // dynamic cells (such as randomly generated)
            if (typeof _this2.cells === 'function') _this2.cells = _this2.cells(_this2.bounds, _this2);
            // Background audio
            if (_this2.audioSrc) _this2.audio = _this2.engine.resourceManager.audioLoader.load(_this2.audioSrc, true);

            // Load in tileset assets
            _this2.size = [_this2.bounds[2] - _this2.bounds[0], _this2.bounds[3] - _this2.bounds[1]];
            _context3.n = 1;
            return _this2.tsLoader.load(_this2.tileset, _this2.spritzName);
          case 1:
            _this2.tileset = _context3.v;
            _this2.attachTilesetListeners();

            // dynamically add sprites (if appl.) - todo - possibly same thing for objects?
            if (typeof _this2.sprites === 'function') _this2.sprites = _this2.sprites(_this2.bounds, _this2);
            _this2.sprites = _this2.sprites || [];
            _this2.objects = _this2.objects || [];

            // populate
            _context3.n = 2;
            return Promise.all([Promise.all(_this2.sprites.map(_this2.loadSprite)), Promise.all(_this2.objects.map(_this2.loadObject))]);
          case 2:
            if (!(data.skyboxShader && (_this2$engine$renderM2 = _this2.engine.renderManager) !== null && _this2$engine$renderM2 !== void 0 && (_this2$engine$renderM2 = _this2$engine$renderM2.skyboxManager) !== null && _this2$engine$renderM2 !== void 0 && _this2$engine$renderM2.setSkyboxShader)) {
              _context3.n = 3;
              break;
            }
            _context3.n = 3;
            return _this2.engine.renderManager.skyboxManager.setSkyboxShader(data.skyboxShader);
          case 3:
            _context3.n = 4;
            return _this2.finalize();
          case 4:
            _context3.p = 4;
            if (!data.mode) {
              _context3.n = 5;
              break;
            }
            _context3.n = 5;
            return _this2.loadMode(data.mode);
          case 5:
            _context3.n = 7;
            break;
          case 6:
            _context3.p = 6;
            _t3 = _context3.v;
            console.warn('zone mode load failed', _t3);
          case 7:
            try {
              _this2.engine.networkManager.joinZone(_this2.id);
            } catch (e) {
              console.warn('Network Error :: could not send zone commend to server');
            }
            _context3.n = 9;
            break;
          case 8:
            _context3.p = 8;
            _t4 = _context3.v;
            console.error('Error parsing zone ' + _this2.id, _t4);
          case 9:
            return _context3.a(2);
        }
      }, _callee3, null, [[4, 6], [0, 8]]);
    })));
    /**
     * Loads a trigger from a zip archive.
     * @param {string} trigger - The trigger name.
     * @param {object} zip - The zip archive.
     * @returns {function(): void} The trigger function.
     */
    _defineProperty(_this2, "loadTriggerFromZip", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(trigger, zip) {
        var file, luaScript, _this2$engine, pxsFile, _luaScript, _this2$engine2, jsFile, triggerScript, factory, fn, _t5, _t6;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.p = _context4.n) {
            case 0:
              _context4.p = 0;
              _context4.n = 1;
              return zip.file("triggers/".concat(trigger, ".pxs"));
            case 1:
              file = _context4.v;
              if (!file) {
                _context4.n = 3;
                break;
              }
              _context4.n = 2;
              return file.async('string');
            case 2:
              luaScript = _context4.v;
              return _context4.a(2, function (_this, subject) {
                var interpreter = new _PixoScriptInterpreter["default"](_this.engine);
                interpreter.setScope({
                  _this: _this,
                  zone: _this2,
                  subject: subject
                });
                interpreter.initLibrary();
                return interpreter.run(luaScript);
              });
            case 3:
              _context4.n = 5;
              break;
            case 4:
              _context4.p = 4;
              _t5 = _context4.v;
              if ((_this2$engine = _this2.engine) !== null && _this2$engine !== void 0 && _this2$engine.debug) console.warn('Lua trigger load failed', _t5);
            case 5:
              _context4.p = 5;
              _context4.n = 6;
              return zip.file("triggers/".concat(trigger, ".pxs"));
            case 6:
              pxsFile = _context4.v;
              if (!pxsFile) {
                _context4.n = 8;
                break;
              }
              _context4.n = 7;
              return pxsFile.async('string');
            case 7:
              _luaScript = _context4.v;
              return _context4.a(2, function (_this, subject) {
                var interpreter = new _PixoScriptInterpreter["default"](_this.engine);
                interpreter.setScope({
                  _this: _this,
                  zone: _this2,
                  subject: subject
                });
                interpreter.initLibrary();
                return interpreter.run(_luaScript);
              });
            case 8:
              _context4.n = 10;
              break;
            case 9:
              _context4.p = 9;
              _t6 = _context4.v;
              if ((_this2$engine2 = _this2.engine) !== null && _this2$engine2 !== void 0 && _this2$engine2.debug) console.warn('PixoScript trigger load failed', _t6);
            case 10:
              _context4.n = 11;
              return zip.file("triggers/".concat(trigger, ".js"));
            case 11:
              jsFile = _context4.v;
              if (!jsFile) {
                _context4.n = 13;
                break;
              }
              _context4.n = 12;
              return jsFile.async('string');
            case 12:
              triggerScript = _context4.v;
              // new Function isolates scope; it receives (zone, engine) and must return a function
              factory = new Function('zone', 'engine', "".concat(triggerScript, "; return (typeof module !== 'undefined' && module.exports) ? module.exports : (typeof exports !== 'undefined' ? exports : (typeof trigger === 'function' ? trigger : null));"));
              fn = factory(_this2, _this2.engine);
              if (!(typeof fn === 'function')) {
                _context4.n = 13;
                break;
              }
              return _context4.a(2, fn.bind(_this2, _this2));
            case 13:
              return _context4.a(2, function () {});
          }
        }, _callee4, null, [[5, 9], [0, 4]]);
      }));
      return function (_x, _x2) {
        return _ref4.apply(this, arguments);
      };
    }());
    /**
     * Loads a mode from a zip archive.
     * @param {string} modeName - The mode name.
     * @param {object} zip - The zip archive.
     */
    _defineProperty(_this2, "loadModeFromZip", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(modeName, zip) {
        var setupFile, updateFile, teardownFile, world, interpreter, handlers, script, updateScript, tdScript, existing, _t9;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.p = _context7.n) {
            case 0:
              _context7.p = 0;
              console.log('Loading Game Mode From Zip');
              setupFile = zip.file("modes/".concat(modeName, "/setup.pxs"));
              updateFile = zip.file("modes/".concat(modeName, "/update.pxs"));
              teardownFile = zip.file("modes/".concat(modeName, "/teardown.pxs"));
              world = _this2.world;
              interpreter = new _PixoScriptInterpreter["default"](_this2.engine);
              interpreter.setScope({
                zone: _this2,
                map: _this2,
                _this: _this2
              });
              interpreter.initLibrary();
              handlers = {};
              if (!setupFile) {
                _context7.n = 2;
                break;
              }
              _context7.n = 1;
              return setupFile.async('string');
            case 1:
              script = _context7.v;
              // run the setup registration (it likely calls pixos.register_mode)
              console.log('Zone.loadModeFromZip: running setup.pxs for mode', modeName);
              _context7.n = 2;
              return interpreter.run(script);
            case 2:
              if (!updateFile) {
                _context7.n = 4;
                break;
              }
              _context7.n = 3;
              return updateFile.async('string');
            case 3:
              updateScript = _context7.v;
              // wrap as a function and register to call on each frame via ModeManager
              // We return a JS function that executes the Lua chunk each time
              handlers.update = /*#__PURE__*/function () {
                var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(time, params) {
                  var ui, res, _t7;
                  return _regenerator().w(function (_context5) {
                    while (1) switch (_context5.p = _context5.n) {
                      case 0:
                        _context5.p = 0;
                        // create a fresh interpreter env for update to avoid state bleed
                        ui = new _PixoScriptInterpreter["default"](_this2.engine);
                        ui.setScope({
                          zone: _this2,
                          map: _this2,
                          _this: _this2,
                          time: time,
                          params: params
                        });
                        ui.initLibrary();
                        // The update.pxs is expected to return a function
                        _context5.n = 1;
                        return ui.run(updateScript);
                      case 1:
                        res = _context5.v;
                        // If the script returned a callable (Lua function) we invoke it
                        if (typeof res === 'function') res(time, params);
                        _context5.n = 3;
                        break;
                      case 2:
                        _context5.p = 2;
                        _t7 = _context5.v;
                        console.warn('mode update exec failed', _t7);
                      case 3:
                        return _context5.a(2);
                    }
                  }, _callee5, null, [[0, 2]]);
                }));
                return function (_x5, _x6) {
                  return _ref6.apply(this, arguments);
                };
              }();
            case 4:
              if (!teardownFile) {
                _context7.n = 6;
                break;
              }
              _context7.n = 5;
              return teardownFile.async('string');
            case 5:
              tdScript = _context7.v;
              handlers.teardown = /*#__PURE__*/function () {
                var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(params) {
                  var td, res, _t8;
                  return _regenerator().w(function (_context6) {
                    while (1) switch (_context6.p = _context6.n) {
                      case 0:
                        _context6.p = 0;
                        td = new _PixoScriptInterpreter["default"](_this2.engine);
                        td.setScope({
                          zone: _this2
                        });
                        td.initLibrary();
                        _context6.n = 1;
                        return td.run(tdScript);
                      case 1:
                        res = _context6.v;
                        // if there is a returned callback, we can run it
                        if (typeof res === 'function') res(params);
                        _context6.n = 3;
                        break;
                      case 2:
                        _context6.p = 2;
                        _t8 = _context6.v;
                        console.warn('mode teardown failed', _t8);
                      case 3:
                        return _context6.a(2);
                    }
                  }, _callee6, null, [[0, 2]]);
                }));
                return function (_x7) {
                  return _ref7.apply(this, arguments);
                };
              }();
            case 6:
              // If the setup script used pixos.register_mode, the ModeManager will
              // already have the registration. But ensure we add handlers if not.
              if (world && world.modeManager) {
                existing = world.modeManager.registered[modeName];
                if (!existing) world.modeManager.register(modeName, handlers);
              }
              _context7.n = 8;
              break;
            case 7:
              _context7.p = 7;
              _t9 = _context7.v;
              console.warn('loadModeFromZip failed', modeName, _t9);
            case 8:
              return _context7.a(2);
          }
        }, _callee7, null, [[0, 7]]);
      }));
      return function (_x3, _x4) {
        return _ref5.apply(this, arguments);
      };
    }());
    /**
     * Loads a mode.
     * @param {string} modeName - The mode name.
     */
    _defineProperty(_this2, "loadMode", /*#__PURE__*/function () {
      var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(modeName) {
        var world, _t0;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.p = _context8.n) {
            case 0:
              _context8.p = 0;
              world = _this2.world;
              _context8.n = 1;
              return _this2.loadModeFromZip(modeName, world.spritz.zip);
            case 1:
              _context8.n = 3;
              break;
            case 2:
              _context8.p = 2;
              _t0 = _context8.v;
              console.warn('loadMode failed', modeName, _t0);
            case 3:
              return _context8.a(2);
          }
        }, _callee8, null, [[0, 2]]);
      }));
      return function (_x8) {
        return _ref8.apply(this, arguments);
      };
    }());
    /**
     * Loads a zone from a zip archive.
     * @param {object} zoneJson - The zone JSON.
     * @param {object} cellJson - The cell JSON.
     * @param {object} zip - The zip archive.
     * @param {boolean} [skipCache=false] - Whether to skip cache.
     */
    _defineProperty(_this2, "loadZoneFromZip", /*#__PURE__*/function () {
      var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(zoneJson, cellJson, zip) {
        var skipCache,
          _zoneJson$extends,
          _cellJson$extends,
          extension,
          _cells,
          heightsJson,
          heightsFile,
          _heightsJson,
          _heightsJson2,
          _heightsJson3,
          heightsStr,
          menus,
          tileset,
          cells,
          map,
          fn,
          _zoneJson$lights,
          lm,
          _iterator3,
          _step3,
          l,
          _fn,
          _args10 = arguments,
          _t1,
          _t10,
          _t11,
          _t12;
        return _regenerator().w(function (_context10) {
          while (1) switch (_context10.p = _context10.n) {
            case 0:
              skipCache = _args10.length > 3 && _args10[3] !== undefined ? _args10[3] : false;
              _context10.p = 1;
              if (!((_zoneJson$extends = zoneJson["extends"]) !== null && _zoneJson$extends !== void 0 && _zoneJson$extends.length)) {
                _context10.n = 3;
                break;
              }
              extension = {};
              _context10.n = 2;
              return Promise.all(zoneJson["extends"].map(/*#__PURE__*/function () {
                var _ref0 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(file) {
                  var str;
                  return _regenerator().w(function (_context9) {
                    while (1) switch (_context9.n) {
                      case 0:
                        _context9.n = 1;
                        return zip.file('maps/' + file + '/map.json').async('string');
                      case 1:
                        str = _context9.v;
                        extension = (0, _enums.mergeDeep)(extension, JSON.parse(str));
                      case 2:
                        return _context9.a(2);
                    }
                  }, _callee9);
                }));
                return function (_x10) {
                  return _ref0.apply(this, arguments);
                };
              }()));
            case 2:
              zoneJson = Object.assign(extension, _objectSpread(_objectSpread({}, zoneJson), {}, {
                "extends": null
              }));
            case 3:
              if (!((_cellJson$extends = cellJson["extends"]) !== null && _cellJson$extends !== void 0 && _cellJson$extends.length)) {
                _context10.n = 5;
                break;
              }
              _cells = [];
              _context10.n = 4;
              return Promise.all(cellJson["extends"].map(/*#__PURE__*/function () {
                var _ref1 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(file) {
                  var str, parsed;
                  return _regenerator().w(function (_context0) {
                    while (1) switch (_context0.n) {
                      case 0:
                        _context0.n = 1;
                        return zip.file('maps/' + file + '/cells.json').async('string');
                      case 1:
                        str = _context0.v;
                        parsed = JSON.parse(str);
                        _cells = _cells.concat(parsed.cells ? parsed.cells : parsed);
                      case 2:
                        return _context0.a(2);
                    }
                  }, _callee0);
                }));
                return function (_x11) {
                  return _ref1.apply(this, arguments);
                };
              }()));
            case 4:
              cellJson = _cells.concat(cellJson.cells || []);
            case 5:
              // Load heights.json if it exists
              heightsJson = null;
              _context10.p = 6;
              heightsFile = zip.file('maps/' + _this2.id + '/heights.json');
              if (!heightsFile) {
                _context10.n = 8;
                break;
              }
              _context10.n = 7;
              return heightsFile.async('string');
            case 7:
              heightsStr = _context10.v;
              heightsJson = JSON.parse(heightsStr);
              console.log("[Zone] Loaded heights.json for ".concat(_this2.id, ":"), (_heightsJson = heightsJson) === null || _heightsJson === void 0 ? void 0 : _heightsJson.length, 'rows');
              console.log("[Zone] First row heights:", (_heightsJson2 = heightsJson) === null || _heightsJson2 === void 0 ? void 0 : _heightsJson2[0]);
              console.log("[Zone] Heights data sample:", JSON.stringify((_heightsJson3 = heightsJson) === null || _heightsJson3 === void 0 ? void 0 : _heightsJson3.slice(0, 3)));
              _context10.n = 9;
              break;
            case 8:
              console.log("[Zone] No heights.json found for ".concat(_this2.id, ", using default geometry heights"));
            case 9:
              _context10.n = 11;
              break;
            case 10:
              _context10.p = 10;
              _t1 = _context10.v;
              console.warn("[Zone] Failed to load heights.json for ".concat(_this2.id, ":"), _t1.message);
            case 11:
              if (!zoneJson.menu) {
                _context10.n = 13;
                break;
              }
              menus = {};
              _context10.n = 12;
              return Promise.all(Object.keys(zoneJson.menu).map(/*#__PURE__*/function () {
                var _ref10 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(id) {
                  var menu;
                  return _regenerator().w(function (_context1) {
                    while (1) switch (_context1.n) {
                      case 0:
                        menu = _objectSpread(_objectSpread({}, zoneJson.menu[id]), {}, {
                          id: id
                        });
                        if (!menu.onOpen) {
                          _context1.n = 2;
                          break;
                        }
                        _context1.n = 1;
                        return _this2.loadTriggerFromZip(menu.onOpen, zip);
                      case 1:
                        menu.onOpen = _context1.v.bind(_this2, _this2);
                      case 2:
                        if (!menu.trigger) {
                          _context1.n = 4;
                          break;
                        }
                        _context1.n = 3;
                        return _this2.loadTriggerFromZip(menu.trigger, zip);
                      case 3:
                        menu.trigger = _context1.v.bind(_this2, _this2);
                      case 4:
                        menus[id] = menu;
                      case 5:
                        return _context1.a(2);
                    }
                  }, _callee1);
                }));
                return function (_x12) {
                  return _ref10.apply(this, arguments);
                };
              }()));
            case 12:
              _this2.menus = menus;
              _this2.world.startMenu(_this2.menus);
            case 13:
              _context10.n = 14;
              return _this2.tsLoader.loadFromZip(zip, zoneJson.tileset, _this2.spritzName);
            case 14:
              tileset = _context10.v;
              cells = (0, _map.dynamicCells)(cellJson, tileset.tiles);
              _context10.n = 15;
              return _map.loadMap.call(_this2, zoneJson, cells, zip, heightsJson);
            case 15:
              map = _context10.v;
              Object.assign(_this2, map);

              // Cells generator (string -> function)
              if (typeof _this2.cells === 'string') {
                try {
                  // Strict scope function (no global eval)
                  fn = new Function('bounds', 'zone', "return (".concat(_this2.cells, ")(bounds, zone);"));
                  _this2.cells = fn.call(_this2, _this2.bounds, _this2);
                } catch (e) {
                  console.error('error loading cell function', e);
                }
              }

              // Audio
              if (zoneJson.mode) {
                try {
                  _this2.mode = zoneJson.mode;
                } catch (e) {
                  console.error('audio load', e);
                }
              }

              // Audio
              if (!zoneJson.audioSrc) {
                _context10.n = 19;
                break;
              }
              _context10.p = 16;
              _context10.n = 17;
              return _this2.engine.resourceManager.audioLoader.loadFromZip(zip, zoneJson.audioSrc, true);
            case 17:
              _this2.audio = _context10.v;
              _context10.n = 19;
              break;
            case 18:
              _context10.p = 18;
              _t10 = _context10.v;
              console.error('audio load', _t10);
            case 19:
              // Lights
              try {
                _this2.lights = (_zoneJson$lights = zoneJson.lights) !== null && _zoneJson$lights !== void 0 ? _zoneJson$lights : [];
                lm = _this2.engine.renderManager.lightManager;
                _iterator3 = _createForOfIteratorHelper(_this2.lights);
                try {
                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                    l = _step3.value;
                    lm.addLight(l.id, l.pos, l.color, l.attenuation, l.direction, l.density, l.scatteringCoefficients, l.enabled);
                  }
                } catch (err) {
                  _iterator3.e(err);
                } finally {
                  _iterator3.f();
                }
              } catch (e) {
                console.error('lights', e);
              }

              // Tileset + size
              _this2.tileset = tileset;
              _this2.size = [_this2.bounds[2] - _this2.bounds[0], _this2.bounds[3] - _this2.bounds[1]];

              // Sprite generators
              if (typeof _this2.sprites === 'string') {
                try {
                  _fn = new Function('bounds', 'zone', "return (".concat(_this2.sprites, ")(bounds, zone);"));
                  _this2.sprites = _fn.call(_this2, _this2.bounds, _this2);
                } catch (e) {
                  console.error('sprite fn', e);
                }
              }
              _this2.sprites = _this2.sprites || [];
              _this2.objects = _this2.objects || [];
              _context10.n = 20;
              return Promise.all([Promise.all(_this2.sprites.map(function (s) {
                return _this2.loadSpriteFromZip(s, zip, skipCache);
              })), Promise.all(_this2.objects.map(function (o) {
                return _this2.loadObjectFromZip(o, zip);
              }))]);
            case 20:
              _this2.attachTilesetListeners();

              // If the loaded map object includes a 'mode' property attempt to load a mode module
              // todo - look into whether this should be updated or moved - not sure if the zone should control the mode like this.
              // in some cases, it makes sense, but I feel like if multiple zones are loaded, there could be conflicts, and the idea of
              // the zone controlling gameplay could be confusing in some cases, but for "battle zones" it kind of makes sense - but this could
              // be done via scripts - so possibly something which could be fully scripted instead of this kind of logic - and instead
              // I will likely move this to the world object - and then it will be the 'initial' mode.
              _context10.p = 21;
              if (!_this2.mode) {
                _context10.n = 22;
                break;
              }
              _context10.n = 22;
              return _this2.loadMode(_this2.mode);
            case 22:
              _context10.n = 24;
              break;
            case 23:
              _context10.p = 23;
              _t11 = _context10.v;
              console.warn('zone mode load failed', _t11);
            case 24:
              _context10.n = 25;
              return _this2.finalize();
            case 25:
              _context10.n = 27;
              break;
            case 26:
              _context10.p = 26;
              _t12 = _context10.v;
              console.error('Error parsing json zone ' + _this2.id, _t12);
            case 27:
              return _context10.a(2);
          }
        }, _callee10, null, [[21, 23], [16, 18], [6, 10], [1, 26]]);
      }));
      return function (_x9, _x0, _x1) {
        return _ref9.apply(this, arguments);
      };
    }());
    /**
     * Runs when the zone is deleted.
     */
    _defineProperty(_this2, "runWhenDeleted", function () {
      var _iterator4 = _createForOfIteratorHelper(_this2.lights),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var l = _step4.value;
          _this2.engine.renderManager.lightManager.removeLight(l.id);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    });
    /**
     * Called when tileset definition is loaded.
     */
    _defineProperty(_this2, "onTilesetDefinitionLoaded", function () {
      var width = _this2.size[0];
      var height = _this2.size[1];
      var rm = _this2.engine.renderManager;
      var gl = _this2.engine.gl;

      // Guard: Check if cells are properly loaded
      if (!_this2.cells || _this2.cells.length === 0) {
        console.error('[Zone.onTilesetDefinitionLoaded] No cells data - tileset may be missing tiles definition');
        return;
      }
      _this2.cellVertexPosBuf = Array.from({
        length: height
      }, function () {
        return new Array(width);
      });
      _this2.cellVertexTexBuf = Array.from({
        length: height
      }, function () {
        return new Array(width);
      });
      _this2.cellPickingId = Array.from({
        length: height
      }, function () {
        return new Array(width);
      });
      _this2.walkability = new Uint16Array(width * height);

      // Precompute
      var k = 0;
      for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++, k++) {
          var cell = _this2.cells[k];

          // Guard: Skip if cell is undefined (tile lookup failed)
          if (!cell || !Array.isArray(cell)) {
            console.warn("[Zone] Cell [".concat(j, ",").concat(i, "] is undefined - missing tile in tileset"));
            // Create empty buffers
            _this2.cellVertexPosBuf[j][i] = rm.createBuffer(new Float32Array([]), gl.STATIC_DRAW, 3);
            _this2.cellVertexTexBuf[j][i] = rm.createBuffer(new Float32Array([]), gl.STATIC_DRAW, 2);
            _this2.cellPickingId[j][i] = rm.pickingManager.nextPickingId();
            _this2.walkability[k] = 0;
            continue;
          }
          var layers = Math.floor(cell.length / 3);
          var cellVertices = [];
          var cellTex = [];
          var walk = _enums.Direction.All;

          // Get height override for this cell if heights data exists
          var heightOverride = _this2.heights && _this2.heights[j] && typeof _this2.heights[j][i] === 'number' ? _this2.heights[j][i] : null;

          // Debug first few cells - show null/number for diagnostics
          if (k < 5) {
            console.log("[Zone.finalize] Cell [".concat(j, ",").concat(i, "] heightOverride:"), heightOverride);
          }
          for (var l = 0; l < layers; l++) {
            var tileId = cell[3 * l];
            var tileVariant = cell[3 * l + 1];
            var z = cell[3 * l + 2];
            if (typeof z !== 'number') z = 0;
            var tilePos = [_this2.bounds[0] + i, _this2.bounds[1] + j, z];
            walk &= _this2.tileset.getWalkability(tileId);

            // Pass height override to getTileVertices
            cellVertices = cellVertices.concat(_this2.tileset.getTileVertices(tileId, tilePos, heightOverride));
            cellTex = cellTex.concat(_this2.tileset.getTileTexCoords(tileId, tileVariant));
          }

          // override walkability if provided
          if (cell.length === 3 * layers + 1) walk = cell[3 * layers];
          _this2.walkability[k] = walk;

          // GPU buffers
          var vPos = rm.createBuffer(new Float32Array(cellVertices), gl.STATIC_DRAW, 3);
          var vTex = rm.createBuffer(new Float32Array(cellTex), gl.STATIC_DRAW, 2);
          _this2.cellVertexPosBuf[j][i] = vPos;
          _this2.cellVertexTexBuf[j][i] = vTex;

          // Picking ID packed as floats [0..1, 0..1, 0..1, 255]
          _this2.cellPickingId[j][i] = [(_this2.objId & 0xff) / 255, (j & 0xff) / 255, (i & 0xff) / 255, 255];
        }
      }
    });
    /**
     * Loads scripts.
     * @param {boolean} [refresh=false] - Whether to refresh.
     */
    _defineProperty(_this2, "loadScripts", function () {
      var refresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      console.log('[Zone.loadScripts] ENTRY - zone:', _this2.id, 'refresh:', refresh, 'isPaused:', _this2.world.isPaused, 'scripts:', _this2.scripts.length);
      if (_this2.world.isPaused) return;
      // CRITICAL: Zone load scripts must run even when paused
      // They are responsible for initializing the zone state
      var zone = _this2;
      var _iterator5 = _createForOfIteratorHelper(_this2.scripts),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var x = _step5.value;
          console.log('[Zone.loadScripts] Checking script:', x.id, 'isLoadSpritz:', x.id === 'load-spritz', 'refresh:', refresh);
          if (x.id === 'load-spritz' && refresh) {
            // Call trigger immediately when loading/refreshing
            console.log('[Zone.loadScripts] Calling load-spritz trigger for zone:', _this2.id);
            try {
              x.trigger.call(zone);
            } catch (e) {
              console.error('[Zone.loadScripts] Error calling load-spritz trigger:', e);
            }
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    });
    /**
     * Loads an object.
     * @param {object} data - The object data.
     */
    _defineProperty(_this2, "loadObject", /*#__PURE__*/function () {
      var _ref11 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(data) {
        var obj;
        return _regenerator().w(function (_context11) {
          while (1) switch (_context11.n) {
            case 0:
              data.zone = _this2;
              if (_this2.objectDict[data.id]) {
                _context11.n = 2;
                break;
              }
              _context11.n = 1;
              return _this2.objectLoader.load(data, function (o) {
                return o.onLoad(o);
              });
            case 1:
              obj = _context11.v;
              _this2.world.objectDict[data.id] = _this2.objectDict[data.id] = obj;
              _this2.objectList.push(obj);
              _this2.world.objectList.push(obj);
            case 2:
              return _context11.a(2);
          }
        }, _callee11);
      }));
      return function (_x13) {
        return _ref11.apply(this, arguments);
      };
    }());
    /**
     * Loads an object from a zip archive.
     * @param {object} data - The object data.
     * @param {object} zip - The zip archive.
     */
    _defineProperty(_this2, "loadObjectFromZip", /*#__PURE__*/function () {
      var _ref12 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(data, zip) {
        var obj;
        return _regenerator().w(function (_context13) {
          while (1) switch (_context13.n) {
            case 0:
              data.zone = _this2;
              if (_this2.objectDict[data.id]) {
                _context13.n = 2;
                break;
              }
              _context13.n = 1;
              return _this2.objectLoader.loadFromZip(zip, data, /*#__PURE__*/function () {
                var _ref13 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(o) {
                  return _regenerator().w(function (_context12) {
                    while (1) switch (_context12.n) {
                      case 0:
                        return _context12.a(2, o.onLoadFromZip(o, zip));
                    }
                  }, _callee12);
                }));
                return function (_x16) {
                  return _ref13.apply(this, arguments);
                };
              }());
            case 1:
              obj = _context13.v;
              _this2.world.objectDict[data.id] = _this2.objectDict[data.id] = obj;
              _this2.objectList.push(obj);
              _this2.world.objectList.push(obj);
            case 2:
              return _context13.a(2);
          }
        }, _callee13);
      }));
      return function (_x14, _x15) {
        return _ref12.apply(this, arguments);
      };
    }());
    /**
     * Loads a sprite.
     * @param {object} data - The sprite data.
     */
    _defineProperty(_this2, "loadSprite", /*#__PURE__*/function () {
      var _ref14 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14(data) {
        var spr;
        return _regenerator().w(function (_context14) {
          while (1) switch (_context14.n) {
            case 0:
              data.zone = _this2;
              if (_this2.spriteDict[data.id]) {
                _context14.n = 2;
                break;
              }
              _context14.n = 1;
              return _this2.spriteLoader.load(data.type, _this2.spritzName, function (s) {
                return s.onLoad(data);
              });
            case 1:
              spr = _context14.v;
              _this2.world.spriteDict[data.id] = _this2.spriteDict[data.id] = spr;
              _this2.spriteList.push(spr);
              _this2.world.spriteList.push(spr);
            case 2:
              return _context14.a(2);
          }
        }, _callee14);
      }));
      return function (_x17) {
        return _ref14.apply(this, arguments);
      };
    }());
    /**
     * Loads a sprite from a zip archive.
     * @param {object} data - The sprite data.
     * @param {object} zip - The zip archive.
     */
    _defineProperty(_this2, "loadSpriteFromZip", /*#__PURE__*/function () {
      var _ref15 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16(data, zip) {
        var spr;
        return _regenerator().w(function (_context16) {
          while (1) switch (_context16.n) {
            case 0:
              data.zone = _this2;
              if (_this2.spriteDict[data.id]) {
                _context16.n = 2;
                break;
              }
              _context16.n = 1;
              return _this2.spriteLoader.loadFromZip(zip, data.type, _this2.spritzName, /*#__PURE__*/function () {
                var _ref16 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15(s) {
                  return _regenerator().w(function (_context15) {
                    while (1) switch (_context15.n) {
                      case 0:
                        return _context15.a(2, s.onLoadFromZip(data, zip));
                    }
                  }, _callee15);
                }));
                return function (_x20) {
                  return _ref16.apply(this, arguments);
                };
              }());
            case 1:
              spr = _context16.v;
              _this2.world.spriteDict[data.id] = _this2.spriteDict[data.id] = spr;
              _this2.spriteList.push(spr);
              _this2.world.spriteList.push(spr);
            case 2:
              return _context16.a(2);
          }
        }, _callee16);
      }));
      return function (_x18, _x19) {
        return _ref15.apply(this, arguments);
      };
    }());
    /**
     * Adds a sprite.
     * @param {object} sprite - The sprite.
     */
    _defineProperty(_this2, "addSprite", function (sprite) {
      sprite.zone = _this2;
      _this2.world.spriteDict[sprite.id] = _this2.spriteDict[sprite.id] = sprite;
      _this2.spriteList.push(sprite);
      _this2.world.spriteList.push(sprite);
    });
    /**
     * Removes a sprite.
     * @param {string} id - The sprite ID.
     */
    _defineProperty(_this2, "removeSprite", function (id) {
      var keep = function keep(s) {
        if (s.id !== id) return true;
        s.removeAllActions();
        return false;
      };
      _this2.spriteList = _this2.spriteList.filter(keep);
      _this2.world.spriteList = _this2.world.spriteList.filter(keep);
      delete _this2.spriteDict[id];
      delete _this2.world.spriteDict[id];
    });
    /**
     * Removes all sprites.
     */
    _defineProperty(_this2, "removeAllSprites", function () {
      var _iterator6 = _createForOfIteratorHelper(_this2.spriteList),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var s = _step6.value;
          _this2.removeSprite(s.id);
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    });
    /**
     * Gets a sprite by ID.
     * @param {string} id - The sprite ID.
     * @returns {object|null} The sprite.
     */
    _defineProperty(_this2, "getSpriteById", function (id) {
      return _this2.spriteDict[id];
    });
    /**
     * Adds a portal.
     * @param {object[]} sprites - The sprites.
     * @param {number} x - The x position.
     * @param {number} y - The y position.
     * @returns {object[]} The sprites.
     */
    _defineProperty(_this2, "addPortal", function (sprites, x, y) {
      var _this2$portals;
      if (!((_this2$portals = _this2.portals) !== null && _this2$portals !== void 0 && _this2$portals.length)) return sprites;
      var h = _this2.getHeight(x, y);
      if (h !== 0) return sprites;
      var make = function make(portal) {
        portal.pos = new _vector.Vector(x, y, h);
        sprites.push(portal);
      };
      if (_this2.portals.length > 0) {
        if (x * y % 3 === 0) make(_this2.portals.shift());else make(_this2.portals.pop());
      }
      return sprites;
    });
    /**
     * Gets the height at a position.
     * @param {number} x - The x position.
     * @param {number} y - The y position.
     * @returns {number} The height.
     */
    _defineProperty(_this2, "getHeight", function (x, y) {
      if (!_this2.isInZone(x, y)) {
        var _this2$engine3;
        if ((_this2$engine3 = _this2.engine) !== null && _this2$engine3 !== void 0 && _this2$engine3.debug) console.error("Height out of bounds [".concat(x, ", ").concat(y, "]"));
        return 0;
      }
      var i = Math.floor(x),
        j = Math.floor(y);
      var dp0 = x - i,
        dp1 = y - j;

      // index into cells
      var idx = (j - _this2.bounds[1]) * _this2.size[0] + (i - _this2.bounds[0]);
      var cell = _this2.cells[idx];
      var n = Math.floor(cell.length / 3);

      // Get height override from heights.json if it exists for this cell
      var heightOverride = _this2.heights && _this2.heights[j - _this2.bounds[1]] && typeof _this2.heights[j - _this2.bounds[1]][i - _this2.bounds[0]] === 'number' ? _this2.heights[j - _this2.bounds[1]][i - _this2.bounds[0]] : null;

      // local helper without allocations
      var triUV = function triUV(t) {
        var ux = t[1][0] - t[0][0];
        var uy = t[1][1] - t[0][1];
        var vx = t[2][0] - t[0][0];
        var vy = t[2][1] - t[0][1];
        var d = 1 / (ux * vy - uy * vx);
        var T0 = d * vy,
          T1 = -d * vx,
          T2 = -d * uy,
          T3 = d * ux;
        var px = dp0 - t[0][0];
        var py = dp1 - t[0][1];
        return [px * T0 + py * T1, px * T2 + py * T3];
      };
      for (var l = 0; l < n; l++) {
        var poly = _this2.tileset.getTileWalkPoly(cell[3 * l]);
        if (!poly) continue;
        var _baseZ = typeof cell[3 * l + 2] === 'number' ? cell[3 * l + 2] : 0;
        // Add heightOverride to baseZ (heights.json is an offset, not a replacement)
        var _heightOffset = heightOverride !== null ? heightOverride : 0;
        for (var p = 0; p < poly.length; p++) {
          var uv = triUV(poly[p]);
          var w = uv[0] + uv[1];
          if (uv[0] >= 0 && uv[1] >= 0 && w <= 1) {
            var _this2$engine4;
            var t = poly[p];
            var computed = _baseZ + _heightOffset + (1 - w) * t[0][2] + uv[0] * t[1][2] + uv[1] * t[2][2];
            if ((_this2$engine4 = _this2.engine) !== null && _this2$engine4 !== void 0 && _this2$engine4.debug) {
              _this2.__getHeightLogCount = (_this2.__getHeightLogCount || 0) + 1;
              if (_this2.__getHeightLogCount < 4) console.log("[Zone.getHeight] sample (x=".concat(x, ",y=").concat(y, ") -> i=").concat(i, ", j=").concat(j, ", baseZ=").concat(_baseZ, ", heightOffset=").concat(_heightOffset, ", uv=[").concat(uv[0].toFixed(2), ",").concat(uv[1].toFixed(2), "], w=").concat(w.toFixed(2), ", computed=").concat(computed.toFixed(2)));
            }
            return computed;
          }
        }
      }

      // No polygon matches - this shouldn't happen if walkPoly is properly defined
      // Use the walkPoly itself for fallback by finding closest triangle
      if (n > 0) {
        var _poly = _this2.tileset.getTileWalkPoly(cell[0]);
        if (_poly && _poly.length > 0) {
          var _this2$engine5;
          var _baseZ2 = typeof cell[2] === 'number' ? cell[2] : 0;
          var _heightOffset2 = heightOverride !== null ? heightOverride : 0;
          // Use first triangle's average as fallback
          var _t13 = _poly[0];
          var avgZ = _baseZ2 + _heightOffset2 + (_t13[0][2] + _t13[1][2] + _t13[2][2]) / 3;
          if ((_this2$engine5 = _this2.engine) !== null && _this2$engine5 !== void 0 && _this2$engine5.debug) console.log("[Zone.getHeight] walkPoly fallback for (".concat(x, ",").concat(y, "), using avg of first tri = ").concat(avgZ.toFixed(2)));
          return avgZ;
        }
      }

      // Final fallback: add heightOffset to cell base z
      var baseZ = typeof cell[2] === 'number' ? cell[2] : 0;
      var heightOffset = heightOverride !== null ? heightOverride : 0;
      return baseZ + heightOffset;
    });
    /**
     * Draws a row.
     * @param {number} row - The row.
     * @param {Set<string>} selectedSet - The selected set.
     * @param {number[]} highlight - The highlight.
     * @param {object} rm - The render manager.
     * @param {object} shaderProgram - The shader program.
     * @param {object} pickerProgram - The picker program.
     * @param {WebGLRenderingContext} gl - The WebGL context.
     */
    _defineProperty(_this2, "drawRow", function (row, selectedSet, highlight, rm, shaderProgram, pickerProgram, gl) {
      // Guard: Check if row data exists
      if (!_this2.cellVertexPosBuf || !_this2.cellVertexPosBuf[row]) {
        return; // Skip row if not initialized
      }

      // Attach tileset once per row (sprites may switch textures between rows)
      _this2.tileset.texture.attach();
      var vPosRow = _this2.cellVertexPosBuf[row];
      var vTexRow = _this2.cellVertexTexBuf[row];
      var width = _this2.size[0];

      // If we have cached picking IDs, use them without checks in the loop
      var pickingRow = _this2.cellPickingId[row];
      for (var cell = 0; cell < width; cell++) {
        var vPos = vPosRow[cell];
        var vTex = vTexRow[cell];

        // Guard: Skip cells with no vertices (empty or failed tile lookup)
        if (!vPos || !vTex || vPos.numItems === 0) {
          continue;
        }
        rm.bindBuffer(vPos, shaderProgram.aVertexPosition);
        rm.bindBuffer(vTex, shaderProgram.aTextureCoord);
        var id = pickingRow[cell];
        pickerProgram.setMatrixUniforms({
          id: id
        });
        shaderProgram.setMatrixUniforms({
          id: id,
          isSelected: selectedSet ? selectedSet.has("".concat(row, ",").concat(cell)) : false,
          sampler: 1.0,
          colorMultiplier: highlight
        });
        gl.drawArrays(gl.TRIANGLES, 0, vPos.numItems);
        if (rm.debug) rm.debug.tilesDrawn++;
      }
    });
    /**
     * Draws a cell.
     * @param {number} row - The row.
     * @param {number} cell - The cell.
     */
    _defineProperty(_this2, "drawCell", function (row, cell) {
      var rm = _this2.engine.renderManager;
      var gl = _this2.engine.gl;
      var shader = rm.shaderProgram;
      var picker = rm.effectPrograms['picker'];
      var isPickerPass = rm.isPickerPass;
      var vPos = _this2.cellVertexPosBuf[row][cell];
      var vTex = _this2.cellVertexTexBuf[row][cell];
      rm.bindBuffer(vPos, shader.aVertexPosition);
      rm.bindBuffer(vTex, shader.aTextureCoord);
      var id = _this2.cellPickingId[row][cell];
      if (isPickerPass) {
        // During picker pass, only set picker shader uniforms
        picker.setMatrixUniforms({
          id: id
        });
      } else {
        var _this2$_selectedSet;
        // During normal render, set main shader uniforms
        shader.setMatrixUniforms({
          id: id,
          isSelected: !!((_this2$_selectedSet = _this2._selectedSet) !== null && _this2$_selectedSet !== void 0 && _this2$_selectedSet.has("".concat(row, ",").concat(cell))),
          sampler: 1.0,
          colorMultiplier: _this2._highlight || [1, 1, 0, 1]
        });
      }
      gl.drawArrays(gl.TRIANGLES, 0, vPos.numItems);
    });
    /**
     * Draws the zone.
     */
    _defineProperty(_this2, "draw", function () {
      if (!_this2.loaded) return;
      var rm = _this2.engine.renderManager;
      var gl = _this2.engine.gl;
      var shaderProgram = rm.shaderProgram;
      var pickerProgram = rm.effectPrograms['picker'];

      // Build selected set once per frame
      var sel = _this2.selectedTiles;
      _this2.selectedSet = sel && sel.length ? new Set(sel.map(function (t) {
        return "".concat(t[0], ",").concat(t[1]);
      })) : null;
      _this2.highlight = _this2.engine.frameCount & 0x8 ? [1, 0, 0, 1] : [1, 1, 0, 1];

      // look into this
      var ensureSortedByY = function ensureSortedByY(arr) {
        for (var i = 1; i < arr.length; i++) if (arr[i - 1].pos.y > arr[i].pos.y) {
          arr.sort(function (a, b) {
            return a.pos.y - b.pos.y;
          });
          break;
        }
      };
      ensureSortedByY(_this2.spriteList);
      ensureSortedByY(_this2.objectList);
      rm.mvPushMatrix();
      // Do not reinitialize the camera when FreeCam is active — FreeCam edits camera.uViewMat directly
      if (!_this2.engine._freecamActive) rm.camera.setCamera();
      var si = 0; // sprite index
      var oi = 0; // object index

      // Need to update to handle the different directions (there are some issues with clipping on other angles)
      var drawForward = _this2.engine.renderManager.camera.cameraDir === 'N' || _this2.engine.renderManager.camera.cameraDir === 'NE' || _this2.engine.renderManager.camera.cameraDir === 'NW' || _this2.engine.renderManager.camera.cameraDir === 'E';
      if (drawForward) {
        for (var j = 0; j < _this2.size[1]; j++) {
          _this2.drawRow(j, _this2.selectedSet, _this2.highlight, rm, shaderProgram, pickerProgram, gl);
          while (oi < _this2.objectList.length && _this2.objectList[oi].pos.y - _this2.bounds[1] <= j) _this2.objectList[oi++].draw();
          while (si < _this2.spriteList.length && _this2.spriteList[si].pos.y - _this2.bounds[1] <= j) _this2.spriteList[si++].draw(_this2.engine);
        }
      } else {
        for (var _j = _this2.size[1] - 1; _j >= 0; _j--) {
          _this2.drawRow(_j, _this2.selectedSet, _this2.highlight, rm, shaderProgram, pickerProgram, gl);
          while (oi < _this2.objectList.length && _this2.bounds[1] - _this2.objectList[oi].pos.y <= _j) _this2.objectList[oi++].draw();
          while (si < _this2.spriteList.length && _this2.bounds[1] - _this2.spriteList[si].pos.y <= _j) _this2.spriteList[si++].draw(_this2.engine);
        }
      }
      while (oi < _this2.objectList.length) _this2.objectList[oi++].draw();
      while (si < _this2.spriteList.length) _this2.spriteList[si++].draw(_this2.engine);
      rm.mvPopMatrix();
    });
    /**
     * Ticks the zone.
     * @param {number} time - The time.
     * @param {boolean} isPaused - Whether paused.
     */
    _defineProperty(_this2, "tick", function (time, isPaused) {
      if (!_this2.loaded || isPaused) return;
      _this2.checkInput(time);
      var _iterator7 = _createForOfIteratorHelper(_this2.spriteList),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var s = _step7.value;
          s.tickOuter(time);
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    });
    /**
     * Checks input.
     * @param {number} time - The time.
     */
    _defineProperty(_this2, "checkInput", /*#__PURE__*/function () {
      var _ref17 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17(time) {
        return _regenerator().w(function (_context17) {
          while (1) switch (_context17.n) {
            case 0:
              if (!(time <= _this2.lastKey + 200)) {
                _context17.n = 1;
                break;
              }
              return _context17.a(2);
            case 1:
              _this2.engine.gamepad.checkInput();
              _this2.lastKey = time;
              // todo - look into hooks - game modes (allow for scripting keymaps)
            case 2:
              return _context17.a(2);
          }
        }, _callee17);
      }));
      return function (_x21) {
        return _ref17.apply(this, arguments);
      };
    }());
    /**
     * Checks if a position is in the zone.
     * @param {number} x - The x position.
     * @param {number} y - The y position.
     * @returns {boolean} Whether in zone.
     */
    _defineProperty(_this2, "isInZone", function (x, y) {
      return x >= _this2.bounds[0] && y >= _this2.bounds[1] && x < _this2.bounds[2] && y < _this2.bounds[3];
    });
    /**
     * Handles selection.
     * @param {number} row - The row.
     * @param {number} cell - The cell.
     */
    _defineProperty(_this2, "onSelect", /*#__PURE__*/function () {
      var _ref18 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18(row, cell) {
        var _this2$world, handled, removed, file, luaScript, interpreter, _this2$engine6, _t14, _t15;
        return _regenerator().w(function (_context18) {
          while (1) switch (_context18.p = _context18.n) {
            case 0:
              _context18.p = 0;
              if (!((_this2$world = _this2.world) !== null && _this2$world !== void 0 && _this2$world.modeManager && _this2.world.modeManager.handleSelect)) {
                _context18.n = 2;
                break;
              }
              console.log('Running Custom Select Handler');
              _context18.n = 1;
              return _this2.world.modeManager.handleSelect(_this2, row, cell, 'tile');
            case 1:
              handled = _context18.v;
              if (!handled) {
                _context18.n = 2;
                break;
              }
              return _context18.a(2);
            case 2:
              _context18.n = 4;
              break;
            case 3:
              _context18.p = 3;
              _t14 = _context18.v;
              console.warn('mode selection handler error', _t14);
            case 4:
              // toggle select
              removed = false;
              _this2.selectedTiles = _this2.selectedTiles.filter(function (t) {
                var keep = !(t[0] === row && t[1] === cell);
                if (!keep) removed = true;
                return keep;
              });
              if (!removed) {
                _context18.n = 5;
                break;
              }
              return _context18.a(2);
            case 5:
              _this2.selectedTiles.push([row, cell]);
              if (_this2.selectTrigger) {
                _context18.n = 6;
                break;
              }
              return _context18.a(2);
            case 6:
              _context18.p = 6;
              file = _this2.engine.spritz.zip.file("triggers/".concat(_this2.selectTrigger, ".pxs"));
              if (!file) file = _this2.engine.spritz.zip.file("triggers/".concat(_this2.selectTrigger, ".pxs"));
              if (file) {
                _context18.n = 7;
                break;
              }
              throw new Error('No Lua Script Found');
            case 7:
              _context18.n = 8;
              return file.async('string');
            case 8:
              luaScript = _context18.v;
              interpreter = new _PixoScriptInterpreter["default"](_this2.engine);
              interpreter.setScope({
                _this: _this2,
                zone: _this2,
                subject: new interpreter.pxs.Table([row, cell])
              });
              interpreter.initLibrary();
              _context18.n = 9;
              return interpreter.run(luaScript);
            case 9:
              return _context18.a(2, _context18.v);
            case 10:
              _context18.p = 10;
              _t15 = _context18.v;
              if ((_this2$engine6 = _this2.engine) !== null && _this2$engine6 !== void 0 && _this2$engine6.debug) console.warn('select trigger missing', _t15);
            case 11:
              return _context18.a(2);
          }
        }, _callee18, null, [[6, 10], [0, 3]]);
      }));
      return function (_x22, _x23) {
        return _ref18.apply(this, arguments);
      };
    }());
    /**
     * Checks if walkable.
     * @param {number} x - The x position.
     * @param {number} y - The y position.
     * @param {number} direction - The direction.
     * @returns {boolean|null} Whether walkable.
     */
    _defineProperty(_this2, "isWalkable", function (x, y, direction) {
      if (!_this2.isInZone(x, y)) return null;

      // sprites (values, not keys)
      for (var sId in _this2.spriteDict) {
        var s = _this2.spriteDict[sId];
        if (s.pos.x !== x || s.pos.y !== y) continue;
        if (!s.walkable && !s.blocking && s.override) return true; // bypass/override
        if (!s.walkable && s.blocking) return false; // blocking
      }

      // objects (AABB-lite checks)
      for (var oId in _this2.objectDict) {
        var o = _this2.objectDict[oId];
        var minX = o.pos.x - o.scale.x * (o.size.x / 2);
        var minY = o.pos.y - o.scale.y * (o.size.y / 2);
        var withinX = function withinX(xx, a, b) {
          var inc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
          return inc ? xx >= a && xx <= b : xx > a && xx < b;
        };
        var xHit = withinX(x, minX, o.pos.x, true);
        var yHit = withinX(y, minY, o.pos.y, true);
        if (!o.walkable && xHit && yHit && !o.blocking && o.override) return true;
        if (!o.walkable && (o.pos.x === x && o.pos.y === y || xHit && yHit) && o.blocking) return false;
      }

      // tile walkability
      return (_this2.walkability[(y - _this2.bounds[1]) * _this2.size[0] + (x - _this2.bounds[0])] & direction) !== 0;
    });
    /**
     * Checks if within range.
     * @param {number} x - The value.
     * @param {number} a - The min.
     * @param {number} b - The max.
     * @param {boolean} [include=false] - Whether inclusive.
     * @returns {boolean} Whether within.
     */
    _defineProperty(_this2, "within", function (x, a, b) {
      var include = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      return include ? x >= a && x <= b : x > a && x < b;
    });
    /**
     * Triggers a script.
     * @param {string} id - The script ID.
     */
    _defineProperty(_this2, "triggerScript", function (id) {
      var _iterator8 = _createForOfIteratorHelper(_this2.scripts),
        _step8;
      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var x = _step8.value;
          if (x.id === id) _this2.runWhenLoaded(x.trigger.bind(_this2));
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
    });
    /**
     * Moves a sprite.
     * @param {string} id - The sprite ID.
     * @param {number[]} location - The location.
     * @param {boolean} [running=false] - Whether running.
     * @returns {Promise} The promise.
     */
    _defineProperty(_this2, "moveSprite", /*#__PURE__*/function () {
      var _ref19 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee20(id, location) {
        var running,
          _args20 = arguments;
        return _regenerator().w(function (_context20) {
          while (1) switch (_context20.n) {
            case 0:
              running = _args20.length > 2 && _args20[2] !== undefined ? _args20[2] : false;
              return _context20.a(2, new Promise(/*#__PURE__*/function () {
                var _ref20 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee19(resolve) {
                  var sprite;
                  return _regenerator().w(function (_context19) {
                    while (1) switch (_context19.n) {
                      case 0:
                        sprite = _this2.getSpriteById(id);
                        _context19.n = 1;
                        return sprite.addAction(new _index2.ActionLoader(_this2.engine, 'patrol', [sprite.pos.toArray(), location, running ? 200 : 600, _this2], sprite, resolve));
                      case 1:
                        return _context19.a(2);
                    }
                  }, _callee19);
                }));
                return function (_x26) {
                  return _ref20.apply(this, arguments);
                };
              }()));
          }
        }, _callee20);
      }));
      return function (_x24, _x25) {
        return _ref19.apply(this, arguments);
      };
    }());
    /**
     * Shows sprite dialogue.
     * @param {string} id - The sprite ID.
     * @param {string} dialogue - The dialogue.
     * @param {object} [options={ autoclose: true }] - The options.
     * @returns {Promise} The promise.
     */
    _defineProperty(_this2, "spriteDialogue", /*#__PURE__*/function () {
      var _ref21 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee22(id, dialogue) {
        var options,
          _args22 = arguments;
        return _regenerator().w(function (_context22) {
          while (1) switch (_context22.n) {
            case 0:
              options = _args22.length > 2 && _args22[2] !== undefined ? _args22[2] : {
                autoclose: true
              };
              return _context22.a(2, new Promise(/*#__PURE__*/function () {
                var _ref22 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee21(resolve) {
                  var sprite;
                  return _regenerator().w(function (_context21) {
                    while (1) switch (_context21.n) {
                      case 0:
                        sprite = _this2.getSpriteById(id);
                        _context21.n = 1;
                        return sprite.addAction(new _index2.ActionLoader(_this2.engine, 'dialogue', [dialogue, false, options], sprite, resolve));
                      case 1:
                        return _context21.a(2);
                    }
                  }, _callee21);
                }));
                return function (_x29) {
                  return _ref22.apply(this, arguments);
                };
              }()));
          }
        }, _callee22);
      }));
      return function (_x27, _x28) {
        return _ref21.apply(this, arguments);
      };
    }());
    /**
     * Runs actions.
     * @param {object[]} actions - The actions.
     * @returns {Promise} The promise.
     */
    _defineProperty(_this2, "runActions", /*#__PURE__*/function () {
      var _ref23 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee24(actions) {
        var scope, p, _iterator9, _step9, _loop, _t17;
        return _regenerator().w(function (_context25) {
          while (1) switch (_context25.p = _context25.n) {
            case 0:
              scope = _this2;
              p = Promise.resolve();
              _iterator9 = _createForOfIteratorHelper(actions);
              _context25.p = 1;
              _loop = /*#__PURE__*/_regenerator().m(function _loop() {
                var action;
                return _regenerator().w(function (_context24) {
                  while (1) switch (_context24.n) {
                    case 0:
                      action = _step9.value;
                      p = p.then(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee23() {
                        var sprite, args, options, avatar, _t16;
                        return _regenerator().w(function (_context23) {
                          while (1) switch (_context23.p = _context23.n) {
                            case 0:
                              if (action) {
                                _context23.n = 1;
                                break;
                              }
                              return _context23.a(2);
                            case 1:
                              _context23.p = 1;
                              action.scope = action.scope || scope;
                              if (!action.sprite) {
                                _context23.n = 2;
                                break;
                              }
                              sprite = action.scope.getSpriteById(action.sprite);
                              if (!(sprite && action.action)) {
                                _context23.n = 2;
                                break;
                              }
                              args = _toConsumableArray(action.args);
                              options = args.pop();
                              _context23.n = 2;
                              return sprite.addAction(new _index2.ActionLoader(scope.engine, action.action, [].concat(_toConsumableArray(args), [_objectSpread({}, options)]), sprite, function () {}));
                            case 2:
                              if (!action.trigger) {
                                _context23.n = 3;
                                break;
                              }
                              avatar = action.scope.getSpriteById('avatar');
                              if (!avatar) {
                                _context23.n = 3;
                                break;
                              }
                              _context23.n = 3;
                              return avatar.addAction(new _index2.ActionLoader(scope.engine, 'script', [action.trigger, action.scope, function () {}], avatar));
                            case 3:
                              _context23.n = 5;
                              break;
                            case 4:
                              _context23.p = 4;
                              _t16 = _context23.v;
                              console.warn('runActions error', (_t16 === null || _t16 === void 0 ? void 0 : _t16.message) || _t16);
                            case 5:
                              return _context23.a(2);
                          }
                        }, _callee23, null, [[1, 4]]);
                      })));
                    case 1:
                      return _context24.a(2);
                  }
                }, _loop);
              });
              _iterator9.s();
            case 2:
              if ((_step9 = _iterator9.n()).done) {
                _context25.n = 4;
                break;
              }
              return _context25.d(_regeneratorValues(_loop()), 3);
            case 3:
              _context25.n = 2;
              break;
            case 4:
              _context25.n = 6;
              break;
            case 5:
              _context25.p = 5;
              _t17 = _context25.v;
              _iterator9.e(_t17);
            case 6:
              _context25.p = 6;
              _iterator9.f();
              return _context25.f(6);
            case 7:
              return _context25.a(2, p["catch"](function (err) {
                var _this2$engine7;
                if ((_this2$engine7 = _this2.engine) !== null && _this2$engine7 !== void 0 && _this2$engine7.debug) console.warn('runActions chain', err);
              }));
          }
        }, _callee24, null, [[1, 5, 6, 7]]);
      }));
      return function (_x30) {
        return _ref23.apply(this, arguments);
      };
    }());
    /**
     * Plays a cutscene.
     * @param {string} id - The cutscene ID.
     * @param {object} [spritz=null] - The spritz.
     * @returns {Promise} The promise.
     */
    _defineProperty(_this2, "playCutScene", /*#__PURE__*/function () {
      var _ref25 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee25(id) {
        var spritz,
          seq,
          _iterator0,
          _step0,
          x,
          _args26 = arguments,
          _t18,
          _t19;
        return _regenerator().w(function (_context26) {
          while (1) switch (_context26.p = _context26.n) {
            case 0:
              spritz = _args26.length > 1 && _args26[1] !== undefined ? _args26[1] : null;
              seq = spritz || _this2.spritz;
              _iterator0 = _createForOfIteratorHelper(seq);
              _context26.p = 1;
              _iterator0.s();
            case 2:
              if ((_step0 = _iterator0.n()).done) {
                _context26.n = 8;
                break;
              }
              x = _step0.value;
              _context26.p = 3;
              x.currentStep = x.currentStep || 0;
              if (!(x.currentStep > seq.length)) {
                _context26.n = 4;
                break;
              }
              return _context26.a(3, 7);
            case 4:
              if (!(x.id === id)) {
                _context26.n = 5;
                break;
              }
              _context26.n = 5;
              return _this2.runActions(x.actions);
            case 5:
              _context26.n = 7;
              break;
            case 6:
              _context26.p = 6;
              _t18 = _context26.v;
              console.error(_t18);
            case 7:
              _context26.n = 2;
              break;
            case 8:
              _context26.n = 10;
              break;
            case 9:
              _context26.p = 9;
              _t19 = _context26.v;
              _iterator0.e(_t19);
            case 10:
              _context26.p = 10;
              _iterator0.f();
              return _context26.f(10);
            case 11:
              return _context26.a(2);
          }
        }, _callee25, null, [[3, 6], [1, 9, 10, 11]]);
      }));
      return function (_x31) {
        return _ref25.apply(this, arguments);
      };
    }());
    _this2.spritzName = _world.id;
    /** @type {string} */
    _this2.id = zoneId;
    /** @type {number} */
    _this2.objId = Math.round(Math.random() * 100);
    /** @type {import('./world.js').default} */
    _this2.world = _world;
    /** @type {object} */
    _this2.data = {};
    /** @type {Object.<string, object>} */
    _this2.spriteDict = Object.create(null);
    /** @type {object[]} */
    _this2.spriteList = [];
    /** @type {Object.<string, object>} */
    _this2.objectDict = Object.create(null);
    /** @type {object[]} */
    _this2.objectList = [];
    /** @type {Array<number[]>} */
    _this2.selectedTiles = [];
    /** @type {object[]} */
    _this2.lights = [];
    /** @type {object[]} */
    _this2.spritz = [];
    /** @type {object[]} */
    _this2.scripts = _this2.scripts || [];
    /** @type {number} */
    _this2.lastKey = 0;
    /** @type {import('../index.js').default} */
    _this2.engine = _world.engine;
    /** @type {ActionQueue} */
    _this2.onLoadActions = new _index["default"]();
    /** @type {SpriteLoader} */
    _this2.spriteLoader = new _index2.SpriteLoader(_world.engine);
    /** @type {ObjectLoader} */
    _this2.objectLoader = new _index2.ObjectLoader(_world.engine);
    /** @type {typeof EventLoader} */
    _this2.EventLoader = _index2.EventLoader;
    /** @type {TilesetLoader} */
    _this2.tsLoader = new _index2.TilesetLoader(_world.engine);
    /** @type {object|null} */
    _this2.audio = null;
    /** @type {Set<string>|null} */
    _this2._selectedSet = null;
    /** @type {number[]|null} */
    _this2._highlight = null;
    return _this2;
  }
  _inherits(Zone, _Loadable);
  return _createClass(Zone);
}(_loadable["default"]);