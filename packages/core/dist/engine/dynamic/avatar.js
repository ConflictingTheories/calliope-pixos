"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _vector = require("@Engine/utils/math/vector.js");
var _avatar = _interopRequireDefault(require("@Engine/core/scene/avatar.js"));
var _PixoScriptInterpreter = _interopRequireDefault(require("@Engine/scripting/PixoScriptInterpreter.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
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
\*                                                 */
/**
 * DynamicAvatar - A dynamic avatar with JSON loading and Lua scripting support.
 */
var DynamicAvatar = exports["default"] = /*#__PURE__*/function (_Avatar) {
  /**
   * Creates an instance of DynamicAvatar.
   * @param {GLEngine} engine - The game engine instance.
   * @param {Object} json - The JSON configuration.
   * @param {Object} zip - The zip file data.
   */
  function DynamicAvatar(engine, json, zip) {
    var _this2;
    _classCallCheck(this, DynamicAvatar);
    // Initialize Sprite
    _this2 = _callSuper(this, DynamicAvatar, [engine]);
    /** @type {Object} */
    /**
     * Loads JSON properties into the object.
     * @returns {Promise<void>}
     */
    _defineProperty(_this2, "loadJson", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var _this2$json$state;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            if (!_this2.json["extends"]) {
              _context2.n = 2;
              break;
            }
            _context2.n = 1;
            return Promise.all(_this2.json["extends"].map(/*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(file) {
                var stringD, _t;
                return _regenerator().w(function (_context) {
                  while (1) switch (_context.n) {
                    case 0:
                      _t = JSON;
                      _context.n = 1;
                      return _this2.zip.file('sprites/' + file + '.json').async('string');
                    case 1:
                      stringD = _t.parse.call(_t, _context.v);
                      Object.assign(_this2.json, stringD);
                    case 2:
                      return _context.a(2);
                  }
                }, _callee);
              }));
              return function (_x) {
                return _ref2.apply(this, arguments);
              };
            }()));
          case 1:
            // unset
            _this2.json["extends"] = null;
          case 2:
            // core properties
            _this2.update(_this2.json);
            _this2.src = _this2.json.src;
            _this2.portraitSrc = _this2.json.portraitSrc;
            _this2.sheetSize = _this2.json.sheetSize;
            _this2.tileSize = _this2.json.tileSize;
            _this2.state = (_this2$json$state = _this2.json.state) !== null && _this2$json$state !== void 0 ? _this2$json$state : 'intro';
            // Frames
            _this2.frames = _this2.json.frames;
            // Offsets
            _this2.hotspotOffset = _construct(_vector.Vector, _toConsumableArray(_this2.json.hotspotOffset));
            _this2.drawOffset = {};
            Object.keys(_this2.json.drawOffset).forEach(function (offset) {
              _this2.drawOffset[offset] = _construct(_vector.Vector, _toConsumableArray(_this2.json.drawOffset[offset]));
            });
            // Should the camera follow the avatar?
            _this2.bindCamera = _this2.json.bindCamera;
            _this2.enableSpeech = _this2.json.enableSpeech; // speech bubble
          case 3:
            return _context2.a(2);
        }
      }, _callee2);
    })));
    /**
     * Handles selection interaction, with Lua scripting support.
     * @param {Object} _this - The context.
     * @param {Sprite} sprite - The sprite being selected.
     * @returns {Promise<any>}
     */
    _defineProperty(_this2, "onSelect", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(_this, sprite) {
        var file, luaScript, interpreter, _t2;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              if (_this2.selectTrigger) {
                _context3.n = 1;
                break;
              }
              return _context3.a(2);
            case 1:
              if (!(_this2.selectTrigger === 'interact')) {
                _context3.n = 3;
                break;
              }
              _context3.n = 2;
              return _this2.interact(_this2);
            case 2:
              return _context3.a(2, _context3.v);
            case 3:
              _context3.p = 3;
              console.log({
                trigger: _this2.selectTrigger
              });
              file = _this2.zip.file("triggers/".concat(_this2.selectTrigger, ".lua"));
              if (!file) file = _this2.zip.file("triggers/".concat(_this2.selectTrigger, ".pxs"));
              if (file) {
                _context3.n = 4;
                break;
              }
              throw new Error('No Lua Script Found');
            case 4:
              _context3.n = 5;
              return file.async('string');
            case 5:
              luaScript = _context3.v;
              console.log({
                msg: 'trigger lua statement',
                luaScript: luaScript
              });
              interpreter = new _PixoScriptInterpreter["default"](_this2.engine);
              interpreter.setScope({
                _this: _this,
                zone: sprite.zone,
                subject: sprite
              });
              interpreter.initLibrary();
              interpreter.run('print("hello world lua")');
              _context3.n = 6;
              return interpreter.run(luaScript);
            case 6:
              return _context3.a(2, _context3.v);
            case 7:
              _context3.p = 7;
              _t2 = _context3.v;
              console.log({
                msg: 'no lua script found',
                e: _t2
              });
            case 8:
              return _context3.a(2);
          }
        }, _callee3, null, [[3, 7]]);
      }));
      return function (_x2, _x3) {
        return _ref3.apply(this, arguments);
      };
    }());
    _this2.json = json;
    /** @type {Object} */
    _this2.zip = zip;
    return _this2;
  }
  _inherits(DynamicAvatar, _Avatar);
  return _createClass(DynamicAvatar);
}(_avatar["default"]);