"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dynamicCells = dynamicCells;
exports.loadMap = loadMap;
var _enums = require("@Engine/utils/enums.js");
var _vector = require("@Engine/utils/math/vector.js");
var _PixoScriptInterpreter = _interopRequireDefault(require("@Engine/scripting/PixoScriptInterpreter.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; } /*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
/**
 * Loads map information from JSON, cells, and zip data.
 * @param {Object} json - The JSON configuration.
 * @param {Array|string} cells - The cells data.
 * @param {Object} zip - The zip file data.
 * @param {Array} heights - Optional heights data for tile elevation.
 * @returns {Promise<Object>} The loaded map data.
 */
function loadMap(_x, _x2, _x3) {
  return _loadMap.apply(this, arguments);
}
/**
 * Generates map cells from a tileset.
 * @param {Array|string} cells - The cells data.
 * @param {Object} Tileset - The tileset mapping.
 * @returns {Array|string} The generated cells.
 */
function _loadMap() {
  _loadMap = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(json, cells, zip) {
    var _json$scenes,
      _this2 = this,
      _json$scripts,
      _json$objects;
    var heights,
      $sprites,
      $scenes,
      $scripts,
      $objects,
      _args3 = arguments;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          heights = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : null;
          console.log('loading map....');
          if (heights) {
            console.log('[loadMap] Using heights data:', heights.length, 'rows');
          }

          // read sprites & handle functions
          $sprites = typeof json.sprites === 'string' ? json.sprites : json.sprites.map(function (sprite) {
            var _sprite$zones;
            return {
              id: sprite.id,
              type: sprite.type,
              pos: _construct(_vector.Vector, _toConsumableArray(sprite.pos)),
              facing: _enums.Direction[sprite.facing],
              zones: (_sprite$zones = sprite.zones) !== null && _sprite$zones !== void 0 ? _sprite$zones : null
            };
          });
          $scenes = ((_json$scenes = json.scenes) !== null && _json$scenes !== void 0 ? _json$scenes : []).map(function (scene) {
            return {
              id: scene.id,
              actions: scene.actions.map(function (action) {
                if (action.trigger) {
                  return {
                    trigger: action.trigger,
                    scope: _this2
                  };
                } else {
                  return {
                    sprite: action.sprite,
                    action: action.action,
                    args: action.args,
                    scope: _this2
                  };
                }
              }),
              scope: _this2
            };
          });
          _context3.n = 1;
          return Promise.all(((_json$scripts = json.scripts) !== null && _json$scripts !== void 0 ? _json$scripts : []).map(/*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(script) {
              var file, luaScript, result, _t;
              return _regenerator().w(function (_context2) {
                while (1) switch (_context2.p = _context2.n) {
                  case 0:
                    _context2.p = 0;
                    file = zip.file("triggers/".concat(script.trigger, ".pxs"));
                    if (!file) file = zip.file("triggers/".concat(script.trigger, ".pxs"));
                    _context2.n = 1;
                    return file.async('string');
                  case 1:
                    luaScript = _context2.v;
                    console.log({
                      msg: 'lua script',
                      luaScript: luaScript
                    });

                    // defer execution of lua until trigger is called
                    result = function (_this) {
                      var interpreter = new _PixoScriptInterpreter["default"](_this.engine);
                      interpreter.setScope({
                        _this: _this,
                        zone: _this2,
                        subject: _this
                      });
                      interpreter.initLibrary();
                      interpreter.run('print("hello world lua - zone")');
                      return {
                        id: script.id,
                        trigger: function () {
                          var _trigger = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
                            return _regenerator().w(function (_context) {
                              while (1) switch (_context.n) {
                                case 0:
                                  console.log('running actual trigger');
                                  return _context.a(2, interpreter.run(luaScript));
                              }
                            }, _callee);
                          }));
                          function trigger() {
                            return _trigger.apply(this, arguments);
                          }
                          return trigger;
                        }()
                      };
                    }.bind(_this2)(_this2);
                    console.log({
                      msg: 'zone trigger Lua eval response',
                      result: result
                    });
                    return _context2.a(2, result);
                  case 2:
                    _context2.p = 2;
                    _t = _context2.v;
                    console.error(_t);
                  case 3:
                    return _context2.a(2);
                }
              }, _callee2, null, [[0, 2]]);
            }));
            return function (_x4) {
              return _ref.apply(this, arguments);
            };
          }()));
        case 1:
          $scripts = _context3.v;
          $objects = ((_json$objects = json.objects) !== null && _json$objects !== void 0 ? _json$objects : []).map(function (object) {
            return {
              id: object.id,
              type: object.type,
              mtl: object.mtl,
              useScale: object.useScale ? _construct(_vector.Vector, _toConsumableArray(object.useScale)) : null,
              pos: object.pos ? _construct(_vector.Vector, _toConsumableArray(object.pos)) : null,
              rotation: object.rotation ? _construct(_vector.Vector, _toConsumableArray(object.rotation)) : null
            };
          }); // let $lights = json.lights.map((light) => {
          //   console.log(light);
          //   return {
          //     id: light.id,
          //     pos: light.pos ? new Vector(...light.pos) : null,
          //     color: light.color ? new Vector(...light.color) : null,
          //     direction: light.direction ? new Vector(...light.direction) : null,
          //     attentuation: light.attentuation ? new Vector(...light.attentuation) : null,
          //     enabled: light.enabled ?? false,
          //   };
          // });
          // console.log('adding lights....' + $lights.length);
          return _context3.a(2, {
            // size of map
            bounds: json.bounds,
            // Determines the tileset to load
            tileset: json.tileset,
            // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
            cells: cells,
            // Heights data for each cell (optional)
            heights: heights,
            // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
            sprites: $sprites,
            // Scenes + Scenarios
            scenes: $scenes,
            // Scripts / Triggers for the Zone
            scripts: $scripts,
            // objects // 3d
            objects: $objects,
            // lights
            lights: json.lights,
            // select Trigger
            selectTrigger: json.selectTrigger
          });
      }
    }, _callee3);
  }));
  return _loadMap.apply(this, arguments);
}
function dynamicCells(cells, Tileset) {
  // handle cells generator
  if (typeof cells === 'string') {
    return cells;
  }

  // Guard: Check if Tileset is valid
  if (!Tileset || _typeof(Tileset) !== 'object') {
    console.error('[dynamicCells] Tileset is undefined or invalid - tiles.json may be missing from tileset');
    return [];
  }
  var result = [];
  var missingTiles = new Set();
  cells.forEach(function (row, i) {
    var len = row.length;
    row.forEach(function (cell, j) {
      var tileData = Tileset[cell];
      if (!tileData) {
        missingTiles.add(cell);
        // Provide a fallback empty tile
        result[i * len + j] = ['FLAT_ALL', 'FLOOR', 0];
      } else {
        result[i * len + j] = tileData;
      }
    });
  });

  // Log missing tiles once
  if (missingTiles.size > 0) {
    console.warn('[dynamicCells] Missing tile definitions:', Array.from(missingTiles).join(', '));
  }
  return result;
}