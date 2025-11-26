"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _zone = _interopRequireDefault(require("./zone.js"));
var _manager = _interopRequireDefault(require("../mode/manager.js"));
var _index = _interopRequireDefault(require("../queue/index.js"));
var _enums = require("@Engine/utils/enums.js");
var _index2 = require("@Engine/utils/loaders/index.js");
var _avatar = _interopRequireDefault(require("./avatar.js"));
var _vector = require("@Engine/utils/math/vector.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
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
 * @fileoverview World class for Pixos game engine.
 * Manages zones, sprites, and game state.
 */
/**
 * @typedef {object} MenuConfig
 * @property {object} start - Start menu configuration.
 */
/**
 * World - Manages the game world including zones, sprites, and events.
 */
var World = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of World.
   * @param {object} spritz - The spritz instance.
   * @param {string} id - The world ID.
   */
  function World(spritz, _id) {
    var _this = this;
    _classCallCheck(this, World);
    /**
     * Creates an avatar in the world.
     * @param {object} avatarData - The avatar data.
     * @returns {Avatar|null} The created avatar or null.
     */
    _defineProperty(this, "createAvatar", function (avatarData) {
      var zone = _this.zoneContaining(avatarData.x, avatarData.y);
      if (zone) {
        var avatar = new _avatar["default"](_this.engine);
        // leave z undefined so Avatar.onLoad will compute using hotspotOffset
        avatar.onLoad(_objectSpread({
          zone: zone,
          id: avatarData.id,
          pos: new _vector.Vector(avatarData.x, avatarData.y)
        }, avatarData));
        zone.addSprite(avatar);
        return avatar;
      }
      return null;
    });
    /**
     * Removes an avatar from the world.
     * @param {Avatar} avatar - The avatar to remove.
     */
    _defineProperty(this, "removeAvatar", function (avatar) {
      var zone = avatar.zone;
      if (zone) {
        zone.removeSprite(avatar);
      }
    });
    /**
     * Gets the avatar sprite.
     * @returns {object|null} The avatar sprite.
     */
    _defineProperty(this, "getAvatar", function () {
      return _this.spriteDict['avatar'];
    });
    /**
     * Pushes an action to run after the current tick.
     * @param {function(): void} action - The action to run.
     */
    _defineProperty(this, "runAfterTick", function (action) {
      _this.afterTickActions.add(action);
    });
    /**
     * Sorts zones for correct render order.
     */
    _defineProperty(this, "sortZones", function () {
      _this.zoneList.sort(function (a, b) {
        return a.bounds[1] - b.bounds[1];
      });
    });
    /**
     * Loads a zone from a zip archive.
     * @param {string} zoneId - The zone ID.
     * @param {object} zip - The zip archive.
     * @param {boolean} [skipCache=false] - Whether to skip cache.
     * @param {object} [transitionParams={ effect: 'cross', duration: 500 }] - Transition parameters.
     * @returns {Promise<Zone>} The loaded zone.
     */
    _defineProperty(this, "loadZoneFromZip", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(zoneId, zip) {
        var skipCache,
          transitionParams,
          engine,
          useTransition,
          rm,
          now,
          timeSinceLast,
          _transitionParams$eff,
          effect,
          _transitionParams$dur,
          duration,
          zoneJson,
          cellJson,
          z,
          _transitionParams$eff2,
          _effect,
          _transitionParams$dur2,
          _duration,
          _args = arguments,
          _t,
          _t2;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              skipCache = _args.length > 2 && _args[2] !== undefined ? _args[2] : false;
              transitionParams = _args.length > 3 && _args[3] !== undefined ? _args[3] : {
                effect: 'cross',
                duration: 500
              };
              if (!(!skipCache && _this.zoneDict[zoneId])) {
                _context.n = 1;
                break;
              }
              return _context.a(2, _this.zoneDict[zoneId]);
            case 1:
              engine = _this.engine; // transition effects
              useTransition = false;
              if (transitionParams && engine !== null && engine !== void 0 && engine.renderManager) {
                rm = engine.renderManager;
                now = typeof performance !== 'undefined' ? performance.now() : Date.now(); // Compute time since the last transition started. We allow a small
                // grace period after a transition completes before a new one is
                // permitted. If a transition is still running (isTransitioning),
                // startTransition() will queue the next transition automatically.
                timeSinceLast = now - (rm.transitionStartTime + rm.transitionDuration);
                if (!rm.isTransitioning && timeSinceLast > 100) {
                  useTransition = true;
                }
              }
              if (!useTransition) {
                _context.n = 2;
                break;
              }
              _transitionParams$eff = transitionParams.effect, effect = _transitionParams$eff === void 0 ? 'cross' : _transitionParams$eff, _transitionParams$dur = transitionParams.duration, duration = _transitionParams$dur === void 0 ? 500 : _transitionParams$dur;
              _context.n = 2;
              return engine.renderManager.startTransition({
                effect: effect,
                direction: 'out',
                duration: duration
              });
            case 2:
              console.log('Loading Zone from Zip:', zoneId);
              _t = JSON;
              _context.n = 3;
              return zip.file('maps/' + zoneId + '/map.json').async('string');
            case 3:
              zoneJson = _t.parse.call(_t, _context.v);
              _t2 = JSON;
              _context.n = 4;
              return zip.file('maps/' + zoneId + '/cells.json').async('string');
            case 4:
              cellJson = _t2.parse.call(_t2, _context.v);
              // cells (/zip/maps/{zoneId}/cells.json)
              // Fetch Zone Remotely (allows for custom maps - with approved sprites / actions)
              z = new _zone["default"](zoneId, _this);
              _context.n = 5;
              return z.loadZoneFromZip(zoneJson, cellJson, zip);
            case 5:
              // audio
              _this.zoneList.map(function (x) {
                if (x.audio) {
                  x.audio.pauseAudio();
                }
              });
              if (z.audio) {
                z.audio.playAudio();
              }

              // add zone
              _this.zoneDict[zoneId] = z;
              _this.zoneList.push(z);

              // Sort for correct render order
              z.runWhenLoaded(_this.sortZones);

              // fade back in once the new zone has finished loading
              if (!useTransition) {
                _context.n = 6;
                break;
              }
              _transitionParams$eff2 = transitionParams.effect, _effect = _transitionParams$eff2 === void 0 ? 'cross' : _transitionParams$eff2, _transitionParams$dur2 = transitionParams.duration, _duration = _transitionParams$dur2 === void 0 ? 500 : _transitionParams$dur2;
              _context.n = 6;
              return engine.renderManager.startTransition({
                effect: _effect,
                direction: 'in',
                duration: _duration
              });
            case 6:
              return _context.a(2, z);
          }
        }, _callee);
      }));
      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
    /**
     * Loads a zone.
     * @param {string} zoneId - The zone ID.
     * @param {boolean} [remotely=false] - Whether to load remotely.
     * @param {boolean} [skipCache=false] - Whether to skip cache.
     * @param {object} [transitionParams={ effect: 'cross', duration: 500 }] - Transition parameters.
     * @returns {Promise<Zone>} The loaded zone.
     */
    _defineProperty(this, "loadZone", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(zoneId) {
        var remotely,
          skipCache,
          transitionParams,
          engine,
          useTransition,
          rm,
          now,
          timeSinceLast,
          _transitionParams$eff3,
          effect,
          _transitionParams$dur3,
          duration,
          z,
          _transitionParams$eff4,
          _effect2,
          _transitionParams$dur4,
          _duration2,
          _args2 = arguments;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              remotely = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : false;
              skipCache = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : false;
              transitionParams = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : {
                effect: 'cross',
                duration: 500
              };
              if (!(!skipCache && _this.zoneDict[zoneId])) {
                _context2.n = 1;
                break;
              }
              return _context2.a(2, _this.zoneDict[zoneId]);
            case 1:
              engine = _this.engine; // transition effects
              useTransition = false;
              if (transitionParams && engine !== null && engine !== void 0 && engine.renderManager) {
                rm = engine.renderManager;
                now = typeof performance !== 'undefined' ? performance.now() : Date.now();
                timeSinceLast = now - (rm.transitionStartTime + rm.transitionDuration);
                if (!rm.isTransitioning && timeSinceLast > 100) {
                  useTransition = true;
                }
              }
              if (!useTransition) {
                _context2.n = 2;
                break;
              }
              _transitionParams$eff3 = transitionParams.effect, effect = _transitionParams$eff3 === void 0 ? 'cross' : _transitionParams$eff3, _transitionParams$dur3 = transitionParams.duration, duration = _transitionParams$dur3 === void 0 ? 500 : _transitionParams$dur3;
              _context2.n = 2;
              return engine.renderManager.startTransition({
                effect: effect,
                direction: 'out',
                duration: duration
              });
            case 2:
              // Fetch Zone Remotely (allows for custom maps - with approved sprites / actions)
              z = new _zone["default"](zoneId, _this);
              if (!remotely) {
                _context2.n = 4;
                break;
              }
              _context2.n = 3;
              return z.loadRemote();
            case 3:
              _context2.n = 5;
              break;
            case 4:
              _context2.n = 5;
              return z.load();
            case 5:
              // audio
              _this.zoneList.map(function (x) {
                if (x.audio) {
                  x.audio.pauseAudio();
                }
              });
              if (z.audio) {
                console.log(z.audio);
                z.audio.playAudio();
              }

              // add zone
              _this.zoneDict[zoneId] = z;
              _this.zoneList.push(z);

              // Sort for correct render order
              z.runWhenLoaded(_this.sortZones);

              // fade back in once the new zone has finished loading
              if (!useTransition) {
                _context2.n = 6;
                break;
              }
              _transitionParams$eff4 = transitionParams.effect, _effect2 = _transitionParams$eff4 === void 0 ? 'cross' : _transitionParams$eff4, _transitionParams$dur4 = transitionParams.duration, _duration2 = _transitionParams$dur4 === void 0 ? 500 : _transitionParams$dur4;
              _context2.n = 6;
              return engine.renderManager.startTransition({
                effect: _effect2,
                direction: 'in',
                duration: _duration2
              });
            case 6:
              return _context2.a(2, z);
          }
        }, _callee2);
      }));
      return function (_x3) {
        return _ref2.apply(this, arguments);
      };
    }());
    /**
     * Removes a zone.
     * @param {string} zoneId - The zone ID to remove.
     */
    _defineProperty(this, "removeZone", function (zoneId) {
      _this.zoneList = _this.zoneList.filter(function (zone) {
        if (zone.id !== zoneId) {
          return true;
        } else {
          if (zone.audio) {
            zone.audio.pauseAudio();
          }
          zone.removeAllSprites();
          zone.runWhenDeleted();
        }
      });
      delete _this.zoneDict[zoneId];
    });
    /**
     * Removes all zones.
     */
    _defineProperty(this, "removeAllZones", function () {
      _this.zoneList.map(function (z) {
        if (z.audio) {
          z.audio.pauseAudio();
        }
        z.removeAllSprites();
        z.runWhenDeleted();
      });
      _this.zoneList = [];
      _this.zoneDict = {};
    });
    /**
     * Updates the world.
     * @param {number} time - The current time.
     */
    _defineProperty(this, "tick", function (time) {
      for (var z in _this.zoneDict) {
        var _this$zoneDict$z;
        (_this$zoneDict$z = _this.zoneDict[z]) === null || _this$zoneDict$z === void 0 || _this$zoneDict$z.tick(time, _this.isPaused);
      }
      _this.afterTickActions.run(time);
    });
    /**
     * Checks input at the world level.
     * @param {number} time - The current time.
     */
    _defineProperty(this, "checkInput", function (time) {
      if (time > _this.lastKey + 200) {
        _this.lastKey = time;
        if (_this.modeManager && _this.modeManager.handleInput) {
          try {
            if (_this.modeManager.handleInput(time)) return;
          } catch (e) {
            console.warn('mode input handler error', e);
          }
        }
        var touchmap = _this.engine.gamepad.checkInput();
        if (_this.engine.gamepad.keyPressed('start')) {
          touchmap['start'] = 0;
        }
        if (_this.engine.gamepad.keyPressed('select')) {
          touchmap['select'] = 0;
          _this.engine.toggleFullscreen();
        }
      }
    });
    /**
     * Opens the start menu.
     * @param {object} menuConfig - The menu configuration.
     * @param {string[]} [defaultMenus=['start']] - Default menus.
     */
    _defineProperty(this, "startMenu", function (menuConfig) {
      var defaultMenus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['start'];
      _this.addEvent(new _index2.EventLoader(_this.engine, 'menu', [menuConfig !== null && menuConfig !== void 0 ? menuConfig : _this.menuConfig, defaultMenus, false, {
        autoclose: false,
        closeOnEnter: true
      }], _this));
    });
    /**
     * Adds an event to the queue.
     * @param {object} event - The event to add.
     */
    _defineProperty(this, "addEvent", function (event) {
      if (_this.eventDict[event.id]) _this.removeAction(event.id);
      _this.eventDict[event.id] = event;
      _this.eventList.push(event);
    });
    /**
     * Removes an action.
     * @param {string} id - The action ID.
     */
    _defineProperty(this, "removeAction", function (id) {
      _this.eventList = _this.eventList.filter(function (event) {
        return event.id !== id;
      });
      delete _this.eventDict[id];
    });
    /**
     * Removes all actions.
     */
    _defineProperty(this, "removeAllActions", function () {
      _this.eventList = [];
      _this.eventDict = {};
    });
    /**
     * Handles outer tick logic for events and zones.
     * @param {number} time - The current time.
     */
    _defineProperty(this, "tickOuter", function (time) {
      _this.checkInput(time);
      _this.eventList.sort(function (a, b) {
        var dt = a.startTime - b.startTime;
        if (!dt) return dt;
        return a.id > b.id ? 1 : -1;
      });
      var toRemove = [];
      _this.eventList.forEach(function (event) {
        if (!event.loaded || event.startTime > time || event.pausable && _this.isPaused) return;
        if (event.tick(time)) {
          toRemove.push(event);
          event.onComplete();
        }
      });
      toRemove.forEach(function (event) {
        return _this.removeAction(event.id);
      });
      if (_this.tick && !_this.isPaused) _this.tick(time);
      if (!_this.isPaused && _this.modeManager && _this.modeManager.update) {
        try {
          _this.modeManager.update(time);
        } catch (e) {
          console.warn('mode update error', e);
        }
      }
    });
    /**
     * Draws each zone.
     */
    _defineProperty(this, "draw", function () {
      for (var z in _this.zoneDict) _this.zoneDict[z].draw(_this.engine);
    });
    /**
     * Finds the zone containing the given coordinates.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @returns {Zone|null} The zone containing the point.
     */
    _defineProperty(this, "zoneContaining", function (x, y) {
      for (var z in _this.zoneDict) {
        var zone = _this.zoneDict[z];
        if (zone.loaded && zone.isInZone(x, y)) return zone;
      }
      return null;
    });
    /**
     * Finds a path between two points.
     * @param {Array<number>} from - The starting point.
     * @param {Array<number>} to - The ending point.
     * @returns {Array} The path.
     */
    _defineProperty(this, "pathFind", function (from, to) {
      // memory
      var steps = [],
        visited = [],
        found = false,
        world = _this,
        x = from[0],
        y = from[1];
      // loop through tiles
      function buildPath(neighbour, path) {
        var jsonNeighbour = JSON.stringify([neighbour[0], neighbour[1]]);
        if (found) return false; // ignore anything further
        if (neighbour[0] == to[0] && neighbour[1] == to[1]) {
          // found it
          found = true;
          // if final location is blocked, stop in front
          if (!world.canWalk(neighbour, jsonNeighbour, visited)) {
            return [found, _toConsumableArray(path)];
          }
          // otherwise return whole path
          return [found, [].concat(_toConsumableArray(path), [to])];
        }
        // Check walkability
        if (!world.canWalk(neighbour, jsonNeighbour, visited)) return false;
        // Visit Node & continue Search
        visited.push(jsonNeighbour);
        return world.getNeighbours.apply(world, _toConsumableArray(neighbour)).sort(function (a, b) {
          return Math.min(Math.abs(to[0] - a[0]) - Math.abs(to[0] - b[0]), Math.abs(to[1] - a[1]) - Math.abs(to[1] - b[1]));
        }).map(function (neigh) {
          return buildPath(neigh, [].concat(_toConsumableArray(path), [[neighbour[0], neighbour[1], 600]]));
        }).filter(function (x) {
          return x;
        }).flat();
      }
      // Fetch Steps
      steps = world.getNeighbours(x, y).sort(function (a, b) {
        return Math.min(Math.abs(to[0] - a[0]) - Math.abs(to[0] - b[0]), Math.abs(to[1] - a[1]) - Math.abs(to[1] - b[1]));
      }).map(function (neighbour) {
        return buildPath(neighbour, [[from[0], from[1], 600]]);
      }).filter(function (x) {
        return x[0];
      });
      // Flatten Path from Segments
      return steps.flat();
    });
    /**
     * Gets a zone by ID.
     * @param {string} id - The zone ID.
     * @returns {Zone|null} The zone.
     */
    _defineProperty(this, "getZoneById", function (id) {
      return _this.zoneDict[id];
    });
    /**
     * Gets adjacent cells.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @returns {Array<Array<number>>} The neighbors.
     */
    _defineProperty(this, "getNeighbours", function (x, y) {
      var top = [x, y + 1, _enums.Direction.Up],
        bottom = [x, y - 1, _enums.Direction.Down],
        left = [x - 1, y, _enums.Direction.Left],
        right = [x + 1, y, _enums.Direction.Right];
      return [top, left, right, bottom];
    });
    /**
     * Checks if a cell can be walked on.
     * @param {Array<number>} neighbour - The neighbor cell.
     * @param {string} jsonNeighbour - The JSON string of the neighbor.
     * @param {Array<string>} visited - Visited cells.
     * @returns {boolean} Whether it can be walked.
     */
    _defineProperty(this, "canWalk", function (neighbour, jsonNeighbour, visited) {
      var zone = _this.zoneContaining.apply(_this, _toConsumableArray(neighbour));
      if (visited.indexOf(jsonNeighbour) >= 0 || !zone || !zone.isWalkable.apply(zone, _toConsumableArray(neighbour)) || !zone.isWalkable(neighbour[0], neighbour[1], _enums.Direction.reverse(neighbour[2]))) {
        return false;
      }
      return true;
    });
    /** @type {string} */
    this.id = _id;
    /** @type {object} */
    this.spritz = spritz;
    /** @type {number} */
    this.objId = Math.round(Math.random() * 1000) + 1;
    /** @type {import('../index.js').default} */
    this.engine = spritz.engine;
    /** @type {Object.<string, Zone>} */
    this.zoneDict = {};
    /** @type {Zone[]} */
    this.zoneList = [];
    /** @type {Object.<string, object>} */
    this.remoteAvatars = new Map();
    /** @type {Object.<string, object>} */
    this.spriteDict = {};
    /** @type {object[]} */
    this.spriteList = [];
    /** @type {Object.<string, object>} */
    this.objectDict = {};
    /** @type {object[]} */
    this.objectList = [];
    /** @type {Object.<string, object>} */
    this.tilesetDict = {};
    /** @type {object[]} */
    this.tilesetList = [];
    /** @type {object[]} */
    this.eventList = [];
    /** @type {Object.<string, object>} */
    this.eventDict = {};
    /** @type {number} */
    this.lastKey = new Date().getTime();
    /** @type {number} */
    this.lastZoneTransitionTime = 0;
    /** @type {boolean} */
    this.isPaused = true;
    /** @type {ModeManager} */
    this.modeManager = new _manager["default"](this);
    /** @type {ActionQueue} */
    this.afterTickActions = new _index["default"]();
    /** @type {MenuConfig} */
    this.menuConfig = {
      start: {
        onOpen: function onOpen(menu) {
          menu.completed = true;
        }
      }
    };
  }
  return _createClass(World, [{
    key: "addRemoteAvatar",
    value: function addRemoteAvatar(clientId, avatarData) {
      // Create and add a new avatar sprite for the remote player using engine Avatar class
      try {
        var _ref3, _avatarData$x, _ref4, _avatarData$y, _avatar$hotspotOffset, _avatar$hotspotOffset2, _avatar$hotspotOffset3, _avatar$hotspotOffset4;
        // If we already have this remote avatar, update and return it
        if (this.remoteAvatars.has(clientId)) {
          var existing = this.remoteAvatars.get(clientId);
          try {
            console.log("Remote avatar for ".concat(clientId, " already exists, updating instead"));
          } catch (e) {}
          if (avatarData.x != null) existing.pos.x = avatarData.x;
          if (avatarData.y != null) existing.pos.y = avatarData.y;
          if (avatarData.z != null) existing.pos.z = avatarData.z;
          if (avatarData.facing != null) existing.facing = avatarData.facing;
          return existing;
        }
        // Instantiate Avatar and try to copy template properties from the local player avatar
        var avatar = new _avatar["default"](this.engine);

        // Try to find a local avatar template to copy necessary rendering/template fields
        var localTemplate = this.getAvatar();
        if (localTemplate) {
          // Copy minimal template fields required by Sprite
          avatar.src = localTemplate.src;
          avatar.portraitSrc = localTemplate.portraitSrc;
          avatar.sheetSize = localTemplate.sheetSize;
          avatar.tileSize = localTemplate.tileSize;
          avatar.frames = localTemplate.frames;
          avatar.hotspotOffset = localTemplate.hotspotOffset;
          avatar.drawOffset = localTemplate.drawOffset;
          avatar.enableSpeech = localTemplate.enableSpeech;
          avatar.bindCamera = false; // remote avatars shouldn't bind camera
          // Copy runtime resources so remote avatar can render immediately
          if (localTemplate.texture) avatar.texture = localTemplate.texture;
          if (localTemplate.vertexTexBuf) avatar.vertexTexBuf = localTemplate.vertexTexBuf;
          if (localTemplate.vertexPosBuf) avatar.vertexPosBuf = localTemplate.vertexPosBuf;
          if (localTemplate.speech && localTemplate.speechTexBuf) avatar.speech = localTemplate.speech, avatar.speechTexBuf = localTemplate.speechTexBuf;
          // mark as loaded so draw will render without waiting for async onLoad
          avatar.loaded = true;
          avatar.templateLoaded = true;
        } else {
          console.warn('No local avatar template found; remote avatar may not render correctly');
        }

        // Ensure unique sprite id to avoid collisions with local 'avatar' id
        var baseId = avatarData.id || 'player';
        var spriteId = "".concat(baseId, "-").concat(clientId);

        // Set properties and create buffers synchronously
        var zone = this.getZoneById(avatarData.zone || avatarData.zoneId) || this.zoneContaining(avatarData.x || 0, avatarData.y || 0);
        avatar.zone = zone;
        avatar.id = spriteId;
        // compute z if not provided. Use hotspot offset so we sample tile height for avatar foot position.
        var rawX = (_ref3 = (_avatarData$x = avatarData.x) !== null && _avatarData$x !== void 0 ? _avatarData$x : avatarData.pos && avatarData.pos.x) !== null && _ref3 !== void 0 ? _ref3 : 0;
        var rawY = (_ref4 = (_avatarData$y = avatarData.y) !== null && _avatarData$y !== void 0 ? _avatarData$y : avatarData.pos && avatarData.pos.y) !== null && _ref4 !== void 0 ? _ref4 : 0;
        var hx = rawX + ((_avatar$hotspotOffset = (_avatar$hotspotOffset2 = avatar.hotspotOffset) === null || _avatar$hotspotOffset2 === void 0 ? void 0 : _avatar$hotspotOffset2.x) !== null && _avatar$hotspotOffset !== void 0 ? _avatar$hotspotOffset : 0);
        var hy = rawY + ((_avatar$hotspotOffset3 = (_avatar$hotspotOffset4 = avatar.hotspotOffset) === null || _avatar$hotspotOffset4 === void 0 ? void 0 : _avatar$hotspotOffset4.y) !== null && _avatar$hotspotOffset3 !== void 0 ? _avatar$hotspotOffset3 : 0);
        var zVal = typeof avatarData.z === 'number' ? avatarData.z : avatarData.pos && typeof avatarData.pos.z === 'number' ? avatarData.pos.z : zone ? zone.getHeight(hx, hy) : 0;
        avatar.pos = new _vector.Vector(rawX, rawY, zVal);
        avatar.facing = avatarData.facing || 0;
        avatar.isSelected = false; // remote avatars not selected

        // Create buffers synchronously with fallback tile size
        var tileSize = zone && zone.tileset && zone.tileset.tileSize ? zone.tileset.tileSize : 32;
        var normTile = [avatar.tileSize[0] / tileSize, avatar.tileSize[1] / tileSize];
        var verts = [[0, 0, 0], [normTile[0], 0, 0], [normTile[0], 0, normTile[1]], [0, 0, normTile[1]]];
        var poly = [[verts[2], verts[3], verts[0]], [verts[2], verts[0], verts[1]]].flat(3);
        avatar.vertexPosBuf = this.engine.renderManager.createBuffer(poly, this.engine.gl.STATIC_DRAW, 3);
        var texCoords = avatar.getTexCoords();
        avatar.vertexTexBuf = this.engine.renderManager.createBuffer(texCoords, this.engine.gl.DYNAMIC_DRAW, 2);
        if (avatar.enableSpeech) {
          avatar.speechVerBuf = this.engine.renderManager.createBuffer(avatar.getSpeechBubbleVertices(), this.engine.gl.STATIC_DRAW, 3);
          avatar.speechTexBuf = this.engine.renderManager.createBuffer(avatar.getSpeechBubbleTexture(), this.engine.gl.DYNAMIC_DRAW, 2);
        }

        // Add to the zone if available. Ensure id/zone registration happens *before* we store
        // this.remoteAvatars to avoid updates arriving before registration completes.
        if (zone) {
          // Ensure zone has spriteDict and spriteList
          if (!zone.spriteDict) zone.spriteDict = {};
          if (!zone.spriteList) zone.spriteList = [];
          // register in dictionaries and lists synchronously
          this.spriteDict[avatar.id] = avatar;
          zone.spriteDict[avatar.id] = avatar;
          if (!zone.spriteList.includes(avatar)) zone.spriteList.push(avatar);
          if (!this.spriteList.includes(avatar)) this.spriteList.push(avatar);
          console.log("Added remote avatar for client ".concat(clientId, " as sprite '").concat(avatar.id, "' to zone ").concat(zone.id, " at (").concat(avatar.pos.x, ",").concat(avatar.pos.y, ",").concat(avatar.pos.z, ")"));
        }

        // store mapping after registration
        this.remoteAvatars.set(clientId, avatar);
        try {
          console.log("Remote avatar map now has ".concat(this.remoteAvatars.size, " entries"));
        } catch (e) {}
        return avatar;
      } catch (e) {
        console.warn('Failed to add remote avatar', e);
        return null;
      }
    }
  }, {
    key: "removeRemoteAvatar",
    value: function removeRemoteAvatar(clientId) {
      var avatar = this.remoteAvatars.get(clientId);
      if (avatar) {
        try {
          if (avatar.zone) {
            // remove by id if possible
            var idToRemove = avatar.id || (avatar.objId ? avatar.objId : null);
            if (idToRemove) avatar.zone.removeSprite(idToRemove);else avatar.zone.removeSprite(avatar);
          }
        } catch (e) {
          try {
            if (avatar.zone) avatar.zone.removeSprite(avatar);
          } catch (e2) {}
        }
        this.remoteAvatars["delete"](clientId);
      }
    }
  }, {
    key: "updateRemoteAvatar",
    value: function updateRemoteAvatar(clientId, avatarData) {
      var avatar = this.remoteAvatars.get(clientId);
      if (avatar) {
        try {
          var _avatar$pos, _avatar$pos2, _avatar$pos3, _avatar$zone;
          console.log("updateRemoteAvatar: client=".concat(clientId, " pre pos=").concat((_avatar$pos = avatar.pos) === null || _avatar$pos === void 0 ? void 0 : _avatar$pos.x, ",").concat((_avatar$pos2 = avatar.pos) === null || _avatar$pos2 === void 0 ? void 0 : _avatar$pos2.y, ",").concat((_avatar$pos3 = avatar.pos) === null || _avatar$pos3 === void 0 ? void 0 : _avatar$pos3.z, " loaded=").concat(avatar.loaded, " id=").concat(avatar.id, " zone=").concat((_avatar$zone = avatar.zone) === null || _avatar$zone === void 0 ? void 0 : _avatar$zone.id));
        } catch (e) {}
        if (typeof avatar.setPosition === 'function') {
          avatar.setPosition(avatarData.x, avatarData.y, avatarData.z);
        } else if (avatar.pos) {
          avatar.pos.x = avatarData.x;
          avatar.pos.y = avatarData.y;
          avatar.pos.z = avatarData.z || avatar.pos.z;
        }
        if (typeof avatar.updateState === 'function') {
          avatar.updateState(avatarData);
        } else {
          // fallback: apply facing and animation frame
          if (avatarData.facing != null) avatar.facing = avatarData.facing;
          if (avatarData.animFrame != null) avatar.animFrame = avatarData.animFrame;
        }
        // Defensive: ensure sprite is marked loaded so draw will execute
        if (!avatar.loaded) {
          console.warn("Remote avatar ".concat(clientId, " was not loaded; forcing loaded=true so renderer will attempt to draw."));
          avatar.loaded = true;
          avatar.templateLoaded = true;
          if (!avatar.texture || typeof avatar.texture.attach !== 'function') avatar.texture = {
            loaded: true,
            attach: function attach() {}
          };
        }
        try {
          var _avatar$pos4, _avatar$pos5, _avatar$pos6, _avatar$zone2;
          console.log("updateRemoteAvatar: client=".concat(clientId, " post pos=").concat((_avatar$pos4 = avatar.pos) === null || _avatar$pos4 === void 0 ? void 0 : _avatar$pos4.x, ",").concat((_avatar$pos5 = avatar.pos) === null || _avatar$pos5 === void 0 ? void 0 : _avatar$pos5.y, ",").concat((_avatar$pos6 = avatar.pos) === null || _avatar$pos6 === void 0 ? void 0 : _avatar$pos6.z, " loaded=").concat(avatar.loaded, " id=").concat(avatar.id, " zone=").concat((_avatar$zone2 = avatar.zone) === null || _avatar$zone2 === void 0 ? void 0 : _avatar$zone2.id));
        } catch (e) {}
        return avatar;
      }
      return null;
    }
  }, {
    key: "applyRemoteAction",
    value: function applyRemoteAction(clientId, action, params, spriteId) {
      var avatar = this.remoteAvatars.get(clientId);
      if (avatar) {
        avatar.performAction(action, params); // implement this in your avatar class
      }
    }
  }]);
}();