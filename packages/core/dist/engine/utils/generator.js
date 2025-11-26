"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STORE_NAME = void 0;
exports.generateZone = generateZone;
exports.loadAvatar = loadAvatar;
var _reactRecollect = require("react-recollect");
var _vector = require("@Engine/utils/math/vector.js");
var _enums = require("@Engine/utils/enums.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; } /*                                                 *\
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
// Store Name
var STORE_NAME = exports.STORE_NAME = 'garden-tome';

// generate random map zone
function generateZone(_x, _x2, _x3, _x4) {
  return _generateZone.apply(this, arguments);
} // load avatar
function _generateZone() {
  _generateZone = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(self, gender, storeName, cyoa) {
    var tome, spritz;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          // load current spritz or play welcome
          tome = self.engine.store.get(storeName);
          if (tome) {
            _context4.n = 2;
            break;
          }
          // Initialize the garden
          tome = {
            gender: gender,
            position: _construct(_vector.Vector, [8, 3, 0]),
            selected: -2,
            rain: true,
            snow: false,
            spritz: [],
            sprites: [],
            objects: []
          };

          // Load CYOA config
          Object.assign(tome, cyoa);
          self.engine.store.add(storeName, tome);

          // Generate a collection of spritz programmably
          // and append them to the spritz collection.

          // self.randomlyGenerateSprites();
          // self.randomlySprites();
          _context4.n = 1;
          return self.playCutScene('welcome');
        case 1:
          _context4.n = 8;
          break;
        case 2:
          _context4.n = 3;
          return Promise.all(tome.sprites.filter(function (x) {
            // Determine whether to load sprite or not
            // base on the tome settings and cyoa

            return x.id == tome.selected;
          }).map(self.loadSprite.bind(self)));
        case 3:
          _context4.n = 4;
          return Promise.all(tome.objects.filter(function (x) {
            // Determine whether to load object or not
            // base on the tome settings and cyoa

            return x.id == tome.selected;
          }).map(self.loadObject.bind(self)));
        case 4:
          _context4.n = 5;
          return Promise.all(tome.npcs.filter(function (x) {
            // Determine whether to load NPC and decide what
            // dialogue is base on the tome settings and cyoa

            return x.id == tome.selected;
          }).map(/*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(trigger) {
              return _regenerator().w(function (_context) {
                while (1) switch (_context.n) {
                  case 0:
                    return _context.a(2);
                }
              }, _callee);
            }));
            return function (_x7) {
              return _ref.apply(this, arguments);
            };
          }()));
        case 5:
          _context4.n = 6;
          return Promise.all(tome.triggers.filter(function (x) {
            // Determine whether to load trigger
            // base on the tome settings and cyoa

            return x.id == tome.selected;
          }).map(/*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(trigger) {
              return _regenerator().w(function (_context2) {
                while (1) switch (_context2.n) {
                  case 0:
                    return _context2.a(2);
                }
              }, _callee2);
            }));
            return function (_x8) {
              return _ref2.apply(this, arguments);
            };
          }()));
        case 6:
          _context4.n = 7;
          return Promise.all(tome.spritz.filter(function (x) {
            return x.id == tome.selected;
          }).map(/*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(spritz) {
              return _regenerator().w(function (_context3) {
                while (1) switch (_context3.n) {
                  case 0:
                    _context3.n = 1;
                    return self.playCutScene(spritz.id, tome.spritz);
                  case 1:
                    return _context3.a(2);
                }
              }, _callee3);
            }));
            return function (_x9) {
              return _ref3.apply(this, arguments);
            };
          }()));
        case 7:
          // run custom spritz
          spritz = [{
            id: 'new-space' + Math.random(),
            actions: [
            // manual actions
            // Scripted Dialogue Action Controls directly on sprites
            {
              sprite: 'avatar',
              action: 'dialogue',
              args: [['Welcome traveler... I see you are exploring. Good. Please continue to look', 'You have travelled into the number ' + (_reactRecollect.store.pixos && _reactRecollect.store.pixos[storeName] ? _reactRecollect.store.pixos[storeName].selected : -2) + ' room'], false, {
                autoclose: true
              }],
              scope: self // scoped to the zone
            }]
          }];
          _context4.n = 8;
          return self.playCutScene(spritz[0].id, spritz);
        case 8:
          return _context4.a(2);
      }
    }, _callee4);
  }));
  return _generateZone.apply(this, arguments);
}
function loadAvatar(_x5, _x6) {
  return _loadAvatar.apply(this, arguments);
}
function _loadAvatar() {
  _loadAvatar = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(zone, storeName) {
    var _store$pixos$storeNam, _store$pixos$storeNam2;
    var gender;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          // randomly pick gender & store
          gender = typeof ((_store$pixos$storeNam = _reactRecollect.store.pixos[storeName]) === null || _store$pixos$storeNam === void 0 ? void 0 : _store$pixos$storeNam.gender) !== 'undefined' ? _reactRecollect.store.pixos[storeName].gender : ['male', 'female'][Math.floor(2 * Math.random() % 2)]; // Load avatar (Male or Female)
          _context5.n = 1;
          return zone.loadSprite.bind(self)({
            id: 'avatar',
            type: 'characters/' + gender,
            gender: gender,
            pos: typeof ((_store$pixos$storeNam2 = _reactRecollect.store.pixos[storeName]) === null || _store$pixos$storeNam2 === void 0 ? void 0 : _store$pixos$storeNam2.position) !== 'undefined' ? _reactRecollect.store.pixos[storeName].position : _construct(_vector.Vector, [8, 8, zone.getHeight(8, 8)]),
            facing: _enums.Direction.Down
          });
        case 1:
          return _context5.a(2, gender);
      }
    }, _callee5);
  }));
  return _loadAvatar.apply(this, arguments);
}