"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpriteLoader = void 0;
var _avatar = _interopRequireDefault(require("@Engine/dynamic/avatar.js"));
var _sprite = _interopRequireDefault(require("@Engine/dynamic/sprite.js"));
var _animatedSprite = _interopRequireDefault(require("@Engine/dynamic/animatedSprite.js"));
var _animatedTile = _interopRequireDefault(require("@Engine/dynamic/animatedTile.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
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
// Helps Loads New Sprite Instance
var SpriteLoader = exports.SpriteLoader = /*#__PURE__*/function () {
  function SpriteLoader(engine) {
    _classCallCheck(this, SpriteLoader);
    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  }

  // Load Sprite
  return _createClass(SpriteLoader, [{
    key: "loadFromZip",
    value: function () {
      var _loadFromZip = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(zip, type, spritzName) {
        var afterLoad,
          runConfigure,
          json,
          instance,
          _args2 = arguments,
          _t,
          _t2,
          _t3;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              console.log('loading sprite from zip: ' + type + ' for ' + spritzName);
              afterLoad = _args2[3];
              runConfigure = _args2[4];
              if (!this.instances[type]) {
                this.instances[type] = [];
              }
              // New Instance
              json = '';
              _context2.p = 1;
              _t = JSON;
              _context2.n = 2;
              return zip.file("sprites/".concat(type, ".json")).async('string');
            case 2:
              json = _t.parse.call(_t, _context2.v);
              _context2.n = 4;
              break;
            case 3:
              _context2.p = 3;
              _t2 = _context2.v;
              console.error(_t2);
            case 4:
              instance = {};
              _t3 = json.type;
              _context2.n = _t3 === 'animated-sprite' ? 5 : _t3 === 'animated-tile' ? 7 : _t3 === 'avatar' ? 9 : 11;
              break;
            case 5:
              instance = new _animatedSprite["default"](this.engine, json, zip);
              _context2.n = 6;
              return instance.loadJson();
            case 6:
              return _context2.a(3, 13);
            case 7:
              instance = new _animatedTile["default"](this.engine, json, zip);
              _context2.n = 8;
              return instance.loadJson();
            case 8:
              return _context2.a(3, 13);
            case 9:
              instance = new _avatar["default"](this.engine, json, zip);
              _context2.n = 10;
              return instance.loadJson();
            case 10:
              return _context2.a(3, 13);
            case 11:
              instance = new _sprite["default"](this.engine, json, zip);
              _context2.n = 12;
              return instance.loadJson();
            case 12:
              return _context2.a(3, 13);
            case 13:
              instance.templateLoaded = true;
              // Update Existing
              this.instances[type].forEach(/*#__PURE__*/function () {
                var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(instance) {
                  return _regenerator().w(function (_context) {
                    while (1) switch (_context.n) {
                      case 0:
                        if (!instance.afterLoad) {
                          _context.n = 1;
                          break;
                        }
                        _context.n = 1;
                        return instance.afterLoad(instance.instance);
                      case 1:
                        return _context.a(2);
                    }
                  }, _callee);
                }));
                return function (_x4) {
                  return _ref.apply(this, arguments);
                };
              }());
              // Configure if needed
              if (!runConfigure) {
                _context2.n = 14;
                break;
              }
              _context2.n = 14;
              return runConfigure(instance);
            case 14:
              if (!afterLoad) {
                _context2.n = 17;
                break;
              }
              if (!instance.templateLoaded) {
                _context2.n = 16;
                break;
              }
              _context2.n = 15;
              return afterLoad(instance);
            case 15:
              _context2.n = 17;
              break;
            case 16:
              this.instances[type].push({
                instance: instance,
                afterLoad: afterLoad
              });
            case 17:
              return _context2.a(2, instance);
          }
        }, _callee2, this, [[1, 3]]);
      }));
      function loadFromZip(_x, _x2, _x3) {
        return _loadFromZip.apply(this, arguments);
      }
      return loadFromZip;
    }()
  }]);
}();