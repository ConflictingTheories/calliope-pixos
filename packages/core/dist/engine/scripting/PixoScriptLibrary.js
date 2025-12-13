"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _index = require("@Engine/utils/loaders/index.js");
var _PxcPlayer = _interopRequireDefault(require("@Engine/core/cutscene/PxcPlayer.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
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
var PixoScriptLibrary = exports["default"] = /*#__PURE__*/_createClass(
/**
 * Constructor
 * @param {pixoscript} pixoscript - PixoScript Library
 * @constructor
 */
function PixoScriptLibrary(pixoscript) {
  var _this = this;
  _classCallCheck(this, PixoScriptLibrary);
  /**
   * Create Script Environment
   */
  _defineProperty(this, "getLibrary", function (engine, envScope) {
    console.log({
      msg: 'creating pixoscript library',
      envScope: envScope
    });
    return new _this.pixoscript.Table(_objectSpread(_objectSpread({}, envScope), {}, {
      // core functions
      get_caller: function get_caller() {
        return envScope._this;
      },
      get_subject: function get_subject() {
        return envScope.subject;
      },
      get_map: function get_map() {
        return envScope.map || envScope.zone;
      },
      get_zone: function get_zone() {
        return envScope.map || envScope.zone;
      },
      get_world: function get_world() {
        return engine.spritz.world;
      },
      // network functions
      send_action: function send_action() {
        var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var networkManager = engine.networkManager;
        if (networkManager && networkManager.ws) {
          var sent = networkManager.sendAction(action.toObject());
          if (action) return function () {
            return Promise.resolve(sent);
          };
          return sent;
        }
        if (action) return function () {
          return Promise.resolve(false);
        };
        return false;
      },
      // flag functions
      all_flags: function all_flags() {
        var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var flags = engine.store.all();
        if (action) return function () {
          return Promise.resolve(flags);
        };
        return flags;
      },
      has_flag: function has_flag(key) {
        var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        console.log('checking flag via lua', key, action);
        var hasFlag = engine.store.keys().includes(key);
        if (action) return function () {
          return Promise.resolve(hasFlag);
        };
        return hasFlag;
      },
      set_flag: function set_flag(key, value) {
        var action = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        console.log('setting flag via lua', key, action);
        var flag = engine.store.set(key, value.toObject());
        if (action) return function () {
          return Promise.resolve(flag);
        };
        return flag;
      },
      add_flag: function add_flag(key, value) {
        var action = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        console.log('adding flag via lua', key, action);
        engine.store.add(key, value.toObject());
        if (action) return function () {
          return Promise.resolve(true);
        };
        return true;
      },
      get_flag: function get_flag(key) {
        var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        console.log('getting flag via lua', key, action);
        var flag = engine.store.get(key);
        if (action) return function () {
          return Promise.resolve(flag);
        };
        return flag;
      },
      // world functions
      remove_all_zones: function remove_all_zones() {
        console.log({
          msg: 'removing all zones via lua'
        });
        return engine.spritz.world.removeAllZones();
      },
      load_zone_from_zip: function load_zone_from_zip(z, zip) {
        console.log({
          msg: 'loading zone from zip via lua',
          world: engine.spritz.world,
          z: z,
          zip: zip
        });
        // When loading zones via Lua we allow the world to manage screen
        // transitions. Passing `undefined` (or omitting the parameter) causes
        // World.loadZoneFromZip() to use its default transition settings
        // (typically a fade in/out). This keeps portal transitions consistent
        // with other zone loads while still avoiding duplicate fades when the
        // engine is already transitioning. The world implementation guards
        // against overlapping transitions via the renderManager.isTransitioning
        // flag and skips transitions if the zone is already cached.
        return engine.spritz.world.loadZoneFromZip(z, zip, false);
      },
      /**
       * Register a cutscene definition from Lua. The `steps` parameter
       * should be a Lua table (array-like) whose entries are tables with
       * step definitions (type, effect, direction, duration, zone, etc.).
       * These tables are converted to plain JS objects and stored under
       * the provided name. Once registered, call pixos.start_cutscene(name)
       * to play it. If a cutscene with the same name already exists it
       * will be replaced.
       *
       * Example Lua:
       *   pixos.register_cutscene("intro", {
       *     { type = 'transition', effect = 'fade', direction = 'out', duration = 500 },
       *     { type = 'load_zone', zone = 'village', effect = 'fade', duration = 500 },
       *     { type = 'transition', effect = 'fade', direction = 'in', duration = 500 },
       *   })
       * @param {string} name
       * @param {table} steps
       */
      register_cutscene: function register_cutscene(name, steps) {
        try {
          // Convert Lua table to JS array of step objects
          var arr = _this.pixoscript.utils.ensureArray(steps.toObject());
          var jsSteps = arr.map(function (item) {
            // `item` may be a Lua Table; convert to JS object
            return item && typeof item.toObject === 'function' ? item.toObject() : item;
          });
          engine.cutsceneManager.register(name, jsSteps);
        } catch (e) {
          console.warn('Failed to register cutscene from Lua', e);
        }
      },
      /**
       * Start a pre-registered cutscene by name. Returns immediately. The
       * cutscene will run asynchronously. Use pixos.skip_cutscene() to
       * cancel the currently playing cutscene.
       * @param {string} name
       */
      start_cutscene: function start_cutscene(name) {
        try {
          engine.cutsceneManager.start(name);
        } catch (e) {
          console.warn('Failed to start cutscene', name, e);
        }
      },
      /**
       * Skip the currently active cutscene, if any. Clears the cutscene
       * queue immediately. Safe to call even if no cutscene is running.
       */
      skip_cutscene: function skip_cutscene() {
        try {
          engine.cutsceneManager.skip();
        } catch (e) {
          console.warn('Failed to skip cutscene', e);
        }
      },
      /**
       * Set the backdrop for the current cutscene.
       * @param {string} backdrop - The backdrop label to set.
       */
      set_backdrop: function set_backdrop(backdrop) {
        try {
          engine.cutsceneManager.setBackdrop({
            backdrop: backdrop
          });
        } catch (e) {
          console.warn('Failed to set backdrop', e);
        }
      },
      /**
       * Show a cutout in the current cutscene.
       * @param {string} sprite - The sprite ID.
       * @param {string} cutout - The cutout label.
       * @param {string} [position='left'] - The position ('left' or 'right').
       */
      show_cutout: function show_cutout(sprite, cutout) {
        var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'left';
        try {
          engine.cutsceneManager.showCutout({
            sprite: sprite,
            cutout: cutout,
            position: position
          });
        } catch (e) {
          console.warn('Failed to show cutout', e);
        }
      },
      /**
       * Play a cutscene by name. Supports both:
       * 1. Pre-registered cutscene names (registered via register_cutscene)
       * 2. File paths to .pxc cutscene files
       * 
       * Returns a function that can be yielded in a Lua script.
       * 
       * Example Lua:
       *   pixos.sync({ pixos.play_cutscene('intro') })
       *   pixos.sync({ pixos.play_cutscene('cutscenes/opening.pxc') })
       * 
       * @param {string} cutscene - Cutscene name or file path
       * @returns {function} Async function that resolves when cutscene completes
       */
      play_cutscene: function play_cutscene(cutscene) {
        return function () {
          return new Promise(/*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(resolve) {
              var scriptText, player, _engine$cutsceneManag, _engine$cutsceneManag2, _envScope$zone, _poll, _t;
              return _regenerator().w(function (_context) {
                while (1) switch (_context.p = _context.n) {
                  case 0:
                    _context.p = 0;
                    if (!(typeof cutscene === 'string' && cutscene.endsWith('.pxc'))) {
                      _context.n = 5;
                      break;
                    }
                    _context.n = 1;
                    return engine.assetLoader.load(cutscene);
                  case 1:
                    scriptText = _context.v;
                    if (!scriptText) {
                      _context.n = 3;
                      break;
                    }
                    player = new _PxcPlayer["default"](engine, {
                      onEnd: function onEnd() {
                        return resolve();
                      }
                    });
                    _context.n = 2;
                    return player.playCutscene(scriptText);
                  case 2:
                    _context.n = 4;
                    break;
                  case 3:
                    console.warn('[play_cutscene] Failed to load cutscene file:', cutscene);
                    resolve();
                  case 4:
                    _context.n = 9;
                    break;
                  case 5:
                    if (!(engine.cutsceneManager && (_engine$cutsceneManag = (_engine$cutsceneManag2 = engine.cutsceneManager).isRegistered) !== null && _engine$cutsceneManag !== void 0 && _engine$cutsceneManag.call(_engine$cutsceneManag2, cutscene))) {
                      _context.n = 6;
                      break;
                    }
                    engine.cutsceneManager.start(cutscene);
                    // Poll until cutscene finishes
                    _poll = function poll() {
                      if (!engine.cutsceneManager.isRunning()) {
                        resolve();
                      } else {
                        setTimeout(_poll, 30);
                      }
                    };
                    _poll();
                    _context.n = 9;
                    break;
                  case 6:
                    if (!((_envScope$zone = envScope.zone) !== null && _envScope$zone !== void 0 && _envScope$zone.playCutscene)) {
                      _context.n = 8;
                      break;
                    }
                    _context.n = 7;
                    return envScope.zone.playCutscene(cutscene);
                  case 7:
                    resolve();
                    _context.n = 9;
                    break;
                  case 8:
                    console.warn('[play_cutscene] Cutscene not found:', cutscene);
                    resolve();
                  case 9:
                    _context.n = 11;
                    break;
                  case 10:
                    _context.p = 10;
                    _t = _context.v;
                    console.warn('[play_cutscene] Error playing cutscene:', _t);
                    resolve();
                  case 11:
                    return _context.a(2);
                }
              }, _callee, null, [[0, 10]]);
            }));
            return function (_x) {
              return _ref.apply(this, arguments);
            };
          }());
        };
      },
      /**
       * TODO - This is working well - but I need to fix up older cutscene methods,
       * and consolidate everything together. Zones, etc, should all work using the 
       * same system.
       * 
       * Run an ad-hoc cutscene defined by a Lua table of steps. Returns a
       * function that can be yielded in a Lua script and executed via
       * pixos.sync. The returned function resolves when the cutscene
       * completes. Steps are converted to plain JS objects. A unique
       * temporary name is generated for each call to avoid collisions.
       *
       * Example Lua:
       *   local steps = {
       *     { type = 'transition', effect = 'cross', direction = 'out', duration = 500 },
       *     { type = 'load_zone', zone = 'cave', effect = 'cross', duration = 500 },
       *     { type = 'transition', effect = 'cross', direction = 'in', duration = 500 },
       *   }
       *   pixos.sync({ pixos.run_cutscene(steps) })
       */
      run_cutscene: function run_cutscene(steps) {
        // Return an async function that the Lua runtime will call
        return function () {
          return new Promise(function (resolve) {
            try {
              var arr = _this.pixoscript.utils.ensureArray(steps.toObject());
              var jsSteps = arr.map(function (item) {
                return item && typeof item.toObject === 'function' ? item.toObject() : item;
              });
              // Generate a unique name for this temporary cutscene
              var name = '__lua_cutscene_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
              engine.cutsceneManager.register(name, jsSteps);
              engine.cutsceneManager.start(name);
              // Poll until cutscene finishes
              var _poll2 = function poll() {
                if (!engine.cutsceneManager.isRunning()) {
                  resolve();
                } else {
                  setTimeout(_poll2, 30);
                }
              };
              _poll2();
            } catch (e) {
              console.warn('Failed to run cutscene', e);
              resolve();
            }
          });
        };
      },
      run_transition: function run_transition() {
        var effect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'fade';
        var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'out';
        var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 500;
        return function () {
          new Promise(function (resolve) {
            var rm = engine.renderManager;
            if (!rm) resolve();
            return rm.startTransition({
              effect: effect,
              direction: direction,
              duration: duration
            }).then(function () {
              return resolve();
            });
          });
        };
      },
      sprite_dialogue: function sprite_dialogue(spriteId, dialogue) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return function () {
          return new Promise(function (resolve) {
            console.log({
              msg: 'playing dialogue via lua',
              zone: envScope.zone,
              spriteId: spriteId,
              dialogue: dialogue
            });
            options.onClose = function () {
              return resolve();
            };
            return envScope.zone.spriteDialogue(spriteId, dialogue, options).then(function () {
              console.log({
                msg: 'played dialogue via lua',
                zone: envScope.zone,
                spriteId: spriteId,
                dialogue: dialogue
              });
            });
          });
        };
      },
      move_sprite: function move_sprite(spriteId, location, running) {
        return function () {
          return new Promise(function (resolve) {
            console.log({
              msg: 'moving sprite via lua',
              zone: envScope.zone,
              spriteId: spriteId,
              location: location,
              running: running
            });
            return envScope.zone.moveSprite(spriteId, _this.pixoscript.utils.ensureArray(location.toObject()), running).then(function () {
              console.log({
                msg: 'moved sprite via lua',
                zone: envScope.zone,
                spriteId: spriteId,
                location: location,
                running: running
              });
              resolve();
            });
          });
        };
      },
      load_scripts: function load_scripts(scripts) {
        console.log({
          msg: 'loading scripts via lua',
          scripts: scripts,
          envScope: envScope
        });
        return envScope.zone.loadScripts(scripts);
      },
      /**
       * Play a .pxc cutscene file
       * Returns a function that resolves when cutscene completes
       * 
       * Example:
       *   pixos.sync({ pixos.play_pxc_cutscene('cutscenes/intro.pxc') })
       */
      play_pxc_cutscene: function play_pxc_cutscene(filePath) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return function () {
          return new Promise(/*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(resolve) {
              var scriptText, callbacks, player, _t2;
              return _regenerator().w(function (_context2) {
                while (1) switch (_context2.p = _context2.n) {
                  case 0:
                    _context2.p = 0;
                    console.log('[PixoScript] Loading .pxc cutscene:', filePath);

                    // Load the .pxc file from asset loader
                    _context2.n = 1;
                    return engine.assetLoader.load(filePath);
                  case 1:
                    scriptText = _context2.v;
                    if (scriptText) {
                      _context2.n = 2;
                      break;
                    }
                    console.error('[PixoScript] Failed to load cutscene:', filePath);
                    resolve();
                    return _context2.a(2);
                  case 2:
                    // Create PxcPlayer instance with callbacks
                    callbacks = {
                      onDialogueShow: options.onDialogueShow || function (data) {
                        console.log('[PxcPlayer] Dialogue:', data.actor, data.text);
                      },
                      onBackdropChange: options.onBackdropChange || function (url, opts) {
                        console.log('[PxcPlayer] Backdrop:', url);
                      },
                      onEnd: function onEnd() {
                        console.log('[PxcPlayer] Cutscene ended');
                        if (options.onEnd) options.onEnd();
                        resolve();
                      }
                    };
                    player = new _PxcPlayer["default"](engine, callbacks); // Play the cutscene
                    _context2.n = 3;
                    return player.playCutscene(scriptText);
                  case 3:
                    _context2.n = 5;
                    break;
                  case 4:
                    _context2.p = 4;
                    _t2 = _context2.v;
                    console.error('[PixoScript] Error playing .pxc cutscene:', _t2);
                    resolve();
                  case 5:
                    return _context2.a(2);
                }
              }, _callee2, null, [[0, 4]]);
            }));
            return function (_x2) {
              return _ref2.apply(this, arguments);
            };
          }());
        };
      },
      /**
       * Play inline .pxc cutscene script
       * Returns a function that resolves when cutscene completes
       * 
       * Example:
       *   local script = [[
       *     @backdrop textures/room.gif
       *     HERO: [expression=smile] Hello!
       *     waitInput
       *     @end
       *   ]]
       *   pixos.sync({ pixos.play_pxc_script(script) })
       */
      play_pxc_script: function play_pxc_script(scriptText) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return function () {
          return new Promise(/*#__PURE__*/function () {
            var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(resolve) {
              var callbacks, player, _t3;
              return _regenerator().w(function (_context3) {
                while (1) switch (_context3.p = _context3.n) {
                  case 0:
                    _context3.p = 0;
                    console.log('[PixoScript] Playing inline .pxc script');

                    // Create PxcPlayer instance with callbacks
                    callbacks = {
                      onDialogueShow: options.onDialogueShow || function (data) {
                        console.log('[PxcPlayer] Dialogue:', data.actor, data.text);
                      },
                      onBackdropChange: options.onBackdropChange || function (url, opts) {
                        console.log('[PxcPlayer] Backdrop:', url);
                      },
                      onEnd: function onEnd() {
                        console.log('[PxcPlayer] Cutscene ended');
                        if (options.onEnd) options.onEnd();
                        resolve();
                      }
                    };
                    player = new _PxcPlayer["default"](engine, callbacks); // Play the cutscene
                    _context3.n = 1;
                    return player.playCutscene(scriptText);
                  case 1:
                    _context3.n = 3;
                    break;
                  case 2:
                    _context3.p = 2;
                    _t3 = _context3.v;
                    console.error('[PixoScript] Error playing inline .pxc script:', _t3);
                    resolve();
                  case 3:
                    return _context3.a(2);
                }
              }, _callee3, null, [[0, 2]]);
            }));
            return function (_x3) {
              return _ref3.apply(this, arguments);
            };
          }());
        };
      },
      // camera functions
      // ...
      set_camera: function set_camera() {
        engine.renderManager.camera.setCamera();
      },
      get_camera_vector: function get_camera_vector() {
        return engine.renderManager.camera.cameraTarget;
      },
      look_at: function look_at(pos, trgt, up) {
        var position = _this.pixoscript.utils.ensureArray(pos.toObject());
        var target = _this.pixoscript.utils.ensureArray(trgt.toObject());
        var upDir = _this.pixoscript.utils.ensureArray(up.toObject());
        engine.renderManager.camera.lookAt(position, target, upDir);
      },
      pan_camera: function pan_camera(from, to, duration) {
        console.log({
          msg: 'panning camera via lua',
          from: from,
          to: to,
          duration: duration
        });
        return function () {
          return new Promise(function (resolve) {
            engine.spritz.world.addEvent(new _index.EventLoader(engine, 'camera', ['pan', {
              from: from,
              to: to,
              duration: duration
            }], engine.spritz.world, /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
              return _regenerator().w(function (_context4) {
                while (1) switch (_context4.n) {
                  case 0:
                    resolve();
                  case 1:
                    return _context4.a(2);
                }
              }, _callee4);
            }))));
          });
        };
      },
      _pan: function _pan(direction) {
        var radians = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Math.PI / 4;
        if (direction === 'CCW') {
          engine.renderManager.camera.panCCW(_this.pixoscript.utils.coerceToNumber(radians));
        } else {
          engine.renderManager.camera.panCW(_this.pixoscript.utils.coerceToNumber(radians));
        }
      },
      pitch: function pitch(direction) {
        var radians = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Math.PI / 4;
        if (direction === 'CCW') {
          engine.renderManager.camera.pitchCCW(_this.pixoscript.utils.coerceToNumber(radians));
        } else {
          engine.renderManager.camera.pitchCW(_this.pixoscript.utils.coerceToNumber(radians));
        }
      },
      tilt: function tilt(direction) {
        var radians = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Math.PI / 4;
        if (direction === 'CCW') {
          engine.renderManager.camera.tiltCCW(_this.pixoscript.utils.coerceToNumber(radians));
        } else {
          engine.renderManager.camera.tiltCW(_this.pixoscript.utils.coerceToNumber(radians));
        }
      },
      // input functions
      bind_action: function bind_action(action, inputType, inputValue) {
        try {
          if (engine.inputManager) {
            engine.inputManager.bindAction(action, inputType, inputValue);
          }
        } catch (e) {
          console.warn('bind_action failed', e);
        }
      },
      unbind_action: function unbind_action(action, inputType) {
        try {
          if (engine.inputManager) {
            engine.inputManager.unbindAction(action, inputType);
          }
        } catch (e) {
          console.warn('unbind_action failed', e);
        }
      },
      register_action_hook: function register_action_hook(action, hook) {
        try {
          if (engine.inputManager) {
            engine.inputManager.registerActionHook(action, hook);
          }
        } catch (e) {
          console.warn('register_action_hook failed', e);
        }
      },
      is_action_active: function is_action_active(action) {
        try {
          return engine.inputManager ? engine.inputManager.isActionActive(action) : false;
        } catch (e) {
          console.warn('is_action_active failed', e);
          return false;
        }
      },
      get_action_input: function get_action_input(action) {
        try {
          return engine.inputManager ? engine.inputManager.getActionInput(action) : null;
        } catch (e) {
          console.warn('get_action_input failed', e);
          return null;
        }
      },
      // audio functions
      // ...

      // sprite functions
      // ...

      // math functions
      vector: function vector(tbl) {
        var _this$pixoscript$util = _this.pixoscript.utils.ensureArray(tbl.toObject()),
          _this$pixoscript$util2 = _slicedToArray(_this$pixoscript$util, 3),
          x = _this$pixoscript$util2[0],
          y = _this$pixoscript$util2[1],
          z = _this$pixoscript$util2[2];
        return new engine.utils.Vector(x, y, z);
      },
      vec_sub: function vec_sub(a, b) {
        return a.sub(b);
      },
      // misc utils & functions
      sync: function () {
        var _sync = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(p) {
          var _iterator, _step, a, _t4;
          return _regenerator().w(function (_context5) {
            while (1) switch (_context5.p = _context5.n) {
              case 0:
                _iterator = _createForOfIteratorHelper(p.toObject());
                _context5.p = 1;
                _iterator.s();
              case 2:
                if ((_step = _iterator.n()).done) {
                  _context5.n = 4;
                  break;
                }
                a = _step.value;
                _context5.n = 3;
                return a();
              case 3:
                _context5.n = 2;
                break;
              case 4:
                _context5.n = 6;
                break;
              case 5:
                _context5.p = 5;
                _t4 = _context5.v;
                _iterator.e(_t4);
              case 6:
                _context5.p = 6;
                _iterator.f();
                return _context5.f(6);
              case 7:
                return _context5.a(2);
            }
          }, _callee5, null, [[1, 5, 6, 7]]);
        }));
        function sync(_x4) {
          return _sync.apply(this, arguments);
        }
        return sync;
      }(),
      as_obj: function as_obj(tbl) {
        return tbl.toObject();
      },
      as_array: function as_array(tbl) {
        return _this.pixoscript.utils.ensureArray(tbl.toObject());
      },
      as_table: function as_table(obj) {
        var table = new _this.pixoscript.Table();
        for (var _i = 0, _Object$entries = Object.entries(obj); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];
          table.set(key, value);
        }
        return table;
      },
      log: function log(msg) {
        console.log(msg);
      },
      to: function to(obj, tbl) {
        for (var _i2 = 0, _Object$entries2 = Object.entries(tbl.toObject()); _i2 < _Object$entries2.length; _i2++) {
          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            key = _Object$entries2$_i[0],
            value = _Object$entries2$_i[1];
          obj[key] = value;
        }
      },
      /** Mode API - allow Lua scripts to change or query current mode */
      set_mode: function set_mode(name, params) {
        try {
          console.log('pixos.set_mode called ->', name, params);
          var world = engine.spritz.world;
          if (world && world.modeManager) {
            // params may be a Lua table - convert if necessary
            var p = params && typeof params.toObject === 'function' ? params.toObject() : params;
            world.modeManager.set(name, p);
          }
        } catch (e) {
          console.warn('set_mode failed', e);
        }
      },
      get_mode: function get_mode() {
        try {
          return engine.spritz.world.modeManager.getMode();
        } catch (e) {
          return null;
        }
      },
      set_mode_mappings: function set_mode_mappings(name, params) {
        try {
          console.log('pixos.set_mode_mappings called ->', name, params);
          if (engine && engine.inputManager) {
            // params may be a Lua table - convert if necessary
            var p = params && typeof params.toObject === 'function' ? params.toObject() : params;
            engine.inputManager.setModeMappings(name, p);
          }
        } catch (e) {
          console.warn('set_mode_mappings failed', e);
        }
      },
      register_mode: function register_mode(name, handlers) {
        try {
          if (!name) {
            console.warn('pixos.register_mode called with undefined name');
            return;
          }
          console.log('pixos.register_mode called ->', name);
          var world = engine.spritz.world;
          if (!world || !world.modeManager) return;
          // handlers may be a Lua table; convert to JS object safely
          var h = {};
          var asObj = handlers && typeof handlers.toObject === 'function' ? handlers.toObject() : handlers || {};
          if (asObj.setup) h.setup = asObj.setup;
          if (asObj.update) h.update = asObj.update;
          if (asObj.teardown) h.teardown = asObj.teardown;
          if (asObj.check_input) h.check_input = asObj.check_input;
          if (asObj.on_select) h.on_select = asObj.on_select;
          if (asObj.picker !== undefined) h.picker = asObj.picker;
          world.modeManager.register(name, h);
        } catch (e) {
          console.warn('register_mode failed', e);
        }
      },
      from: function from(obj, key) {
        return obj[key];
      },
      length: function length(tbl) {
        return tbl.length || 0;
      },
      callback_finish: function callback_finish(success) {
        console.log({
          msg: 'callback finish',
          success: success
        });
        if (envScope.finish) {
          envScope.finish(success > 0);
        }
      },
      // skybox shader switching
      set_skybox_shader: function () {
        var _set_skybox_shader = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(shaderName) {
          var _engine$renderManager;
          return _regenerator().w(function (_context6) {
            while (1) switch (_context6.n) {
              case 0:
                if (!((_engine$renderManager = engine.renderManager) !== null && _engine$renderManager !== void 0 && (_engine$renderManager = _engine$renderManager.skyboxManager) !== null && _engine$renderManager !== void 0 && _engine$renderManager.setSkyboxShader)) {
                  _context6.n = 1;
                  break;
                }
                _context6.n = 1;
                return engine.renderManager.skyboxManager.setSkyboxShader(shaderName);
              case 1:
                return _context6.a(2);
            }
          }, _callee6);
        }));
        function set_skybox_shader(_x5) {
          return _set_skybox_shader.apply(this, arguments);
        }
        return set_skybox_shader;
      }(),
      // particle system
      emit_particles: function emit_particles(posTbl, cfgTbl) {
        try {
          var pos = posTbl && typeof posTbl.toObject === 'function' ? posTbl.toObject() : posTbl || [0, 0, 0];
          var cfg = cfgTbl && typeof cfgTbl.toObject === 'function' ? cfgTbl.toObject() : cfgTbl || {};
          if (engine.renderManager && engine.renderManager.particleManager) {
            // allow shorthand preset names
            if (cfg.preset) {
              var presetCfg = engine.renderManager.particleManager.preset(cfg.preset);
              if (presetCfg) Object.assign(cfg, presetCfg);
            }
            engine.renderManager.particleManager.emit(pos, cfg);
          }
        } catch (e) {
          console.warn('emit_particles failed', e);
        }
      },
      create_particles: function create_particles(posTbl, presetName) {
        try {
          var pos = posTbl && typeof posTbl.toObject === 'function' ? posTbl.toObject() : posTbl || [0, 0, 0];
          var preset = presetName || null;
          if (engine.renderManager && engine.renderManager.particleManager) {
            var cfg = preset ? engine.renderManager.particleManager.preset(preset) : {};
            engine.renderManager.particleManager.emit(pos, cfg || {});
          }
        } catch (e) {
          console.warn('create_particles failed', e);
        }
      },
      clear_particles: function clear_particles() {
        try {
          if (engine.renderManager && engine.renderManager.particleManager) {
            engine.renderManager.particleManager.particles = [];
          }
        } catch (e) {
          console.warn('clear_particles failed', e);
        }
      },
      get_particle_count: function get_particle_count() {
        try {
          if (engine.renderManager && engine.renderManager.particleManager) {
            return engine.renderManager.particleManager.particles.length;
          }
          return 0;
        } catch (e) {
          console.warn('get_particle_count failed', e);
          return 0;
        }
      }
    }));
  });
  this.pixoscript = pixoscript;
});