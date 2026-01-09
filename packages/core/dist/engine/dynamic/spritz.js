"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _spritz = _interopRequireDefault(require("@Engine/core/scene/spritz.js"));
var _world = _interopRequireDefault(require("@Engine/core/scene/world.js"));
var _jszip = _interopRequireDefault(require("jszip"));
var _debugLogger = require("@Engine/utils/debug-logger.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
\*                                                 */ // Shaders
/**
 * ExampleDynamicSpritz - A dynamic Spritz implementation for loading games from zip files.
 */
var ExampleDynamicSpritz = exports["default"] = /*#__PURE__*/function (_Spritz) {
  function ExampleDynamicSpritz() {
    var _this;
    _classCallCheck(this, ExampleDynamicSpritz);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, ExampleDynamicSpritz, [].concat(args));
    /**
     * Initializes the dynamic Spritz instance.
     * @param {GLEngine} engine - The game engine instance.
     * @returns {Promise<void>}
     */
    _defineProperty(_this, "init", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(engine) {
        var world, loadSpritz, _loadSpritz, loadZipFile;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              loadZipFile = function _loadZipFile(menu) {
                var skipClick = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
                if (!skipClick || engine.fileUpload.files.length === 0) {
                  engine.fileUpload.click();
                  engine.fileUpload.onchange = function (e) {
                    return loadSpritz(menu);
                  };
                  return;
                } else {
                  // autoload if passed in
                  loadSpritz(null);
                }
              };
              _loadSpritz = function _loadSpritz3() {
                _loadSpritz = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(menu) {
                  var file, zip, manifest, _iterator, _step, zone, _t, _t2, _t3;
                  return _regenerator().w(function (_context2) {
                    while (1) switch (_context2.p = _context2.n) {
                      case 0:
                        _context2.p = 0;
                        // read zip from uploaded file
                        file = engine.fileUpload.files[0];
                        _context2.n = 1;
                        return _jszip["default"].loadAsync(file);
                      case 1:
                        zip = _context2.v;
                        _spritz["default"]._instance.zip = zip;

                        // find manifest and read
                        _t = JSON;
                        _context2.n = 2;
                        return zip.file('manifest.json').async('string');
                      case 2:
                        manifest = _t.parse.call(_t, _context2.v);
                        (0, _debugLogger.debug)('Spritz', 'loaded manifest', manifest);

                        // Connect to network if specified
                        if (manifest.network && manifest.network.url) {
                          (0, _debugLogger.debug)('Spritz', 'Network connection found -- attempting connection to server');
                          engine.networkManager.connect(manifest.network.url);
                        }

                        // load initial zone(s) from zip file. We await each load sequentially so that
                        // screen transitions complete cleanly between zones. Each call will fade
                        // out the current view, load the zone and then fade back in. Note: if
                        // multiple zones are specified, they will be loaded one after the other.
                        _iterator = _createForOfIteratorHelper(manifest.initialZones);
                        _context2.p = 3;
                        _iterator.s();
                      case 4:
                        if ((_step = _iterator.n()).done) {
                          _context2.n = 6;
                          break;
                        }
                        zone = _step.value;
                        _context2.n = 5;
                        return world.loadZoneFromZip(zone, zip, true, {
                          effect: 'cross',
                          duration: 500
                        });
                      case 5:
                        _context2.n = 4;
                        break;
                      case 6:
                        _context2.n = 8;
                        break;
                      case 7:
                        _context2.p = 7;
                        _t2 = _context2.v;
                        _iterator.e(_t2);
                      case 8:
                        _context2.p = 8;
                        _iterator.f();
                        return _context2.f(8);
                      case 9:
                        // start game
                        world.isPaused = false;

                        // Exit Menu
                        menu.completed = true;
                        _spritz["default"]._instance.loaded = true;
                        _context2.n = 11;
                        break;
                      case 10:
                        _context2.p = 10;
                        _t3 = _context2.v;
                        console.error(_t3);
                        return _context2.a(2);
                      case 11:
                        return _context2.a(2);
                    }
                  }, _callee2, null, [[3, 7, 8, 9], [0, 10]]);
                }));
                return _loadSpritz.apply(this, arguments);
              };
              loadSpritz = function _loadSpritz2(_x2) {
                return _loadSpritz.apply(this, arguments);
              };
              _spritz["default"]._instance.loaded = false;
              // game Engine & Timing
              _spritz["default"]._instance.engine = engine;
              // Init Game Engine Components
              world = _spritz["default"]._instance.world = new _world["default"](_spritz["default"]._instance, 'dynamic'); // load spritz
              // if no file don't go any further and prompt
              // show start menu
              world.startMenu({
                start: {
                  pausable: false,
                  text: 'Load Game File',
                  prompt: 'Please select a file to load...',
                  x: engine.screenSize().width / 2 - 75,
                  y: engine.screenSize().height / 2 - 50,
                  w: 150,
                  h: 75,
                  quittable: false,
                  colours: {
                    top: '#333',
                    bottom: '#777',
                    background: '#999'
                  },
                  onEnter: true,
                  onOpen: function onOpen(menu) {
                    // tood - needs a way to trigger on open
                    _this.isPaused = true;
                    // loadZipFile(true);
                  },
                  trigger: function () {
                    var _trigger = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(menu) {
                      return _regenerator().w(function (_context) {
                        while (1) switch (_context.n) {
                          case 0:
                            loadZipFile(menu);
                          case 1:
                            return _context.a(2);
                        }
                      }, _callee);
                    }));
                    function trigger(_x3) {
                      return _trigger.apply(this, arguments);
                    }
                    return trigger;
                  }()
                }
              });
            case 1:
              return _context3.a(2);
          }
        }, _callee3);
      }));
      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    return _this;
  }
  _inherits(ExampleDynamicSpritz, _Spritz);
  return _createClass(ExampleDynamicSpritz);
}(_spritz["default"]);