"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/*                                                 *\
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
   * @typedef {object} ModeHandlers
   * @property {function(object): Promise<object|void>} [setup] - Function called when the mode is activated. Can return an object of additional handlers.
   * @property {function(object): Promise<void>} [teardown] - Function called when the mode is deactivated.
   * @property {function(number, object): Promise<void>} [update] - Function called every frame to update the mode's state.
   * @property {function(number, object): boolean} [checkInput] - Function to handle input events. Returns true if input was consumed.
   * @property {function(object, number, number, string, object): boolean} [onSelect] - Function to handle object selection events. Returns true to consume default selection.
   * @property {boolean} [picker] - Whether the mode should enable object picking.
   */
/**
 * ModeManager - manages game modes (explore, tactics, etc.).
 * Modes are backed by Lua scripts (setup & update) and can be attached
 * globally to the world or to individual zones. This manager allows for
 * dynamic switching between different game states, each with its own logic
 * for updates, input handling, and object selection.
 */
var ModeManager = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of ModeManager.
   * @param {import('../index.js').default} engine - The main game engine instance.
   */
  function ModeManager(engine) {
    _classCallCheck(this, ModeManager);
    /** @type {import('../index.js').default} */
    this.engine = engine;
    /** @type {object|null} */
    this.currentMode = null; // { name, handlers: ModeHandlers, params }
    /** @type {Object.<string, ModeHandlers>} */
    this.registered = Object.create(null);
  }

  /**
   * Registers a new game mode with its associated handlers.
   * If the mode being registered is currently active and its handlers were not
   * present at the time of activation, its setup function will be run immediately.
   * @param {string} name - The unique name of the mode.
   * @param {ModeHandlers} handlers - An object containing setup, teardown, update, and input handlers for the mode.
   */
  return _createClass(ModeManager, [{
    key: "register",
    value: function register(name, handlers) {
      var _this = this;
      if (process.env.NODE_ENV === 'development') {
        var _this$currentMode;
        console.log('ModeManager.register ->', name, 'hasSetup?', !!(handlers && handlers.setup), 'currentMode=', (_this$currentMode = this.currentMode) === null || _this$currentMode === void 0 ? void 0 : _this$currentMode.name);
      }
      this.registered[name] = handlers;
      // If this mode is currently active but handlers were not present at set-time,
      // run its setup now so late-registered modes still initialize correctly.
      if (this.currentMode && this.currentMode.name === name) {
        var params = this.currentMode.params || {};
        _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
          var h, res, _t;
          return _regenerator().w(function (_context) {
            while (1) switch (_context.p = _context.n) {
              case 0:
                _context.p = 0;
                h = _this.registered[name];
                _this.currentMode.handlers = h;
                if (!(h && h.setup)) {
                  _context.n = 2;
                  break;
                }
                _context.n = 1;
                return h.setup(params);
              case 1:
                res = _context.v;
                if (res && _typeof(res) === 'object') {
                  Object.assign(h, res);
                  _this.registered[name] = h;
                  _this.currentMode.handlers = h;
                }
              case 2:
                _context.n = 4;
                break;
              case 3:
                _context.p = 3;
                _t = _context.v;
                console.warn("Mode late-register setup failed for mode \"".concat(name, "\":"), _t);
              case 4:
                return _context.a(2);
            }
          }, _callee, null, [[0, 3]]);
        }))();
      }
    }

    /**
     * Sets the active game mode. This will tear down the previous mode (if any)
     * and set up the new mode.
     * @param {string} name - The name of the mode to activate.
     * @param {object} [params={}] - Parameters to pass to the mode's setup and update functions.
     * @returns {Promise<void>} A promise that resolves when the mode has been set up.
     */
  }, {
    key: "set",
    value:
    /**
     * Sets the active game mode.
     * @param {string} name - The name of the mode to activate.
     */
    function set(name) {
      var _this2 = this;
      if (this.registered[name]) {
        // Teardown current mode if exists
        if (this.currentMode && this.currentMode.handlers.teardown) {
          _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
            var _t2;
            return _regenerator().w(function (_context2) {
              while (1) switch (_context2.p = _context2.n) {
                case 0:
                  _context2.p = 0;
                  _context2.n = 1;
                  return _this2.currentMode.handlers.teardown(_this2.currentMode.params);
                case 1:
                  _context2.n = 3;
                  break;
                case 2:
                  _context2.p = 2;
                  _t2 = _context2.v;
                  console.warn("Mode teardown failed for mode \"".concat(_this2.currentMode.name, "\":"), _t2);
                case 3:
                  return _context2.a(2);
              }
            }, _callee2, null, [[0, 2]]);
          }))();
        }
        this.currentMode = {
          name: name,
          handlers: this.registered[name],
          params: {}
        };

        // Setup new mode
        if (this.currentMode.handlers.setup) {
          _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
            var additionalHandlers, _t3;
            return _regenerator().w(function (_context3) {
              while (1) switch (_context3.p = _context3.n) {
                case 0:
                  _context3.p = 0;
                  _context3.n = 1;
                  return _this2.currentMode.handlers.setup(_this2.currentMode.params);
                case 1:
                  additionalHandlers = _context3.v;
                  if (additionalHandlers) {
                    _this2.currentMode.handlers = _objectSpread(_objectSpread({}, _this2.currentMode.handlers), additionalHandlers);
                  }
                  _context3.n = 3;
                  break;
                case 2:
                  _context3.p = 2;
                  _t3 = _context3.v;
                  console.warn("Mode setup failed for mode \"".concat(name, "\":"), _t3);
                case 3:
                  return _context3.a(2);
              }
            }, _callee3, null, [[0, 2]]);
          }))();
        }
      } else {
        console.warn("Mode \"".concat(name, "\" not registered"));
      }
    }

    /**
     * Returns the name of the currently active game mode.
     * @returns {string|null} The name of the current mode, or null if no mode is active.
     */
  }, {
    key: "update",
    value: (
    /**
     * Updates the currently active game mode. This method should be called
     * once per frame by the game engine's main loop.
     * @param {number} time - The current game time.
     * @returns {Promise<void>} A promise that resolves after the mode's update function has run.
     */
    function () {
      var _update = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(time) {
        var h, _t4;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.p = _context4.n) {
            case 0:
              if (this.currentMode) {
                _context4.n = 1;
                break;
              }
              return _context4.a(2);
            case 1:
              h = this.currentMode.handlers;
              if (!(h && h.update)) {
                _context4.n = 5;
                break;
              }
              _context4.p = 2;
              _context4.n = 3;
              return h.update(time, this.currentMode.params);
            case 3:
              _context4.n = 5;
              break;
            case 4:
              _context4.p = 4;
              _t4 = _context4.v;
              console.warn("Mode update failed for mode \"".concat(this.currentMode.name, "\":"), _t4);
            case 5:
              return _context4.a(2);
          }
        }, _callee4, this, [[2, 4]]);
      }));
      function update(_x) {
        return _update.apply(this, arguments);
      }
      return update;
    }()
    /**
     * Allows the active mode to handle input events.
     * @param {number} time - The current game time.
     * @returns {boolean} True if the input was consumed by the mode, false otherwise.
     */
    )
  }, {
    key: "handleInput",
    value: function handleInput(time) {
      if (!this.currentMode) return false;
      var handlers = this.currentMode.handlers;
      if (process.env.NODE_ENV === 'development') {
        console.log('ModeManager.handleInput: current handlers ->', handlers);
      }
      try {
        if (handlers && handlers.checkInput) return !!handlers.checkInput(time, this.currentMode.params);
      } catch (e) {
        console.warn("Mode input handler failed for mode \"".concat(this.currentMode.name, "\":"), e);
      }
      return false;
    }

    /**
     * Allows the active mode to handle object selection events (tiles, sprites, etc.).
     * @param {object} zone - The zone object where the selection occurred.
     * @param {number} row - The row index of the selected tile/object.
     * @param {number} cell - The cell index of the selected tile/object.
     * @param {string} type - The type of object selected ('tile', 'sprite', 'object').
     * @returns {boolean} True if the selection was consumed by the mode, false otherwise.
     */
  }, {
    key: "handleSelect",
    value: function handleSelect(zone, row, cell, type) {
      if (!this.currentMode) return false;
      var handlers = this.currentMode.handlers;
      if (process.env.NODE_ENV === 'development') {
        console.log('ModeManager.handleSelect: current handlers ->', handlers);
      }
      try {
        if (handlers && handlers.onSelect) return !!handlers.onSelect(zone, row, cell, type, this.currentMode.params);
      } catch (e) {
        console.warn("Mode onSelect handler failed for mode \"".concat(this.currentMode.name, "\":"), e);
      }
      return false;
    }
  }, {
    key: "getMode",
    value: function getMode() {
      var _this$currentMode2;
      return ((_this$currentMode2 = this.currentMode) === null || _this$currentMode2 === void 0 ? void 0 : _this$currentMode2.name) || null;
    }

    /**
     * Checks if the current mode has picker enabled.
     * @returns {boolean} True if picker is enabled for the current mode.
     */
  }, {
    key: "hasPicker",
    value: function hasPicker() {
      var _this$currentMode3;
      return ((_this$currentMode3 = this.currentMode) === null || _this$currentMode3 === void 0 || (_this$currentMode3 = _this$currentMode3.handlers) === null || _this$currentMode3 === void 0 ? void 0 : _this$currentMode3.picker) === true;
    }
  }]);
}();