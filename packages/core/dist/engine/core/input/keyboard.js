"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _index = _interopRequireDefault(require("@Engine/core/index.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
/**
 * @callback KeyboardHookCallback
 * @param {KeyboardEvent} event - The raw keyboard event.
 * @param {'down'|'up'} type - The type of event ('down' for keydown, 'up' for keyup).
 */
/**
 * Keyboard - Manages keyboard input for the game engine.
 * This class tracks active keys, provides methods to check key states,
 * and allows for custom hooks to be registered for raw keyboard events.
 */
var Keyboard = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of Keyboard.
   * @param {GLEngine} engine - The main game engine instance.
   * @returns {Keyboard} The singleton instance of the Keyboard manager.
   */
  function Keyboard(engine) {
    _classCallCheck(this, Keyboard);
    // Ensure singleton instance
    if (!Keyboard._instance) {
      /** @type {string[]} */
      this.activeKeys = []; // Stores lowercase character codes of currently pressed keys
      /** @type {string[]} */
      this.activeCodes = []; // Stores `event.key` values of currently pressed keys
      /** @type {KeyboardHookCallback[]} */
      this.hooks = []; // Registered callbacks for raw key events
      /** @type {boolean} */
      this.shift = false; // True if Shift key is currently pressed
      /** @type {GLEngine} */
      this.engine = engine;
      Keyboard._instance = this;
    }
    return Keyboard._instance;
  }

  /**
   * Initializes keyboard event listeners on the window.
   * This should be called once during engine setup.
   */
  return _createClass(Keyboard, [{
    key: "init",
    value: function init() {
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('keyup', this.onKeyUp);
    }

    /**
     * Handles the `keydown` event. Adds the pressed key to active lists and notifies hooks.
     * @param {KeyboardEvent} e - The keyboard event.
     */
  }, {
    key: "onKeyDown",
    value: function onKeyDown(e) {
      e.preventDefault();
      var c = String.fromCharCode(e.keyCode).toLowerCase();
      if (Keyboard._instance.activeKeys.indexOf(c) < 0) {
        Keyboard._instance.activeKeys.push(c);
      }
      if (Keyboard._instance.activeCodes.indexOf(e.key) < 0) {
        Keyboard._instance.activeCodes.push(e.key);
      }
      Keyboard._instance.shift = e.shiftKey;
      // Notify hooks (debug / custom controls) about raw key event
      try {
        (Keyboard._instance.hooks || []).forEach(function (h) {
          return h(e, 'down');
        });
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error in keyboard hook (keydown):', err);
        }
      }
    }

    /**
     * Handles the `keyup` event. Removes the released key from active lists and notifies hooks.
     * @param {KeyboardEvent} e - The keyboard event.
     */
  }, {
    key: "onKeyUp",
    value: function onKeyUp(e) {
      var c = String.fromCharCode(e.keyCode).toLowerCase();
      var index = Keyboard._instance.activeKeys.indexOf(c);
      if (index > -1) {
        Keyboard._instance.activeKeys.splice(index, 1);
      }
      // Remove from activeCodes as well
      index = Keyboard._instance.activeCodes.indexOf(e.key);
      if (index > -1) {
        Keyboard._instance.activeCodes.splice(index, 1);
      }
      Keyboard._instance.shift = e.shiftKey;
      try {
        (Keyboard._instance.hooks || []).forEach(function (h) {
          return h(e, 'up');
        });
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error in keyboard hook (keyup):', err);
        }
      }
    }

    /**
     * Registers a raw key event hook.
     * @param {KeyboardHookCallback} cb - The callback function to register.
     */
  }, {
    key: "addHook",
    value: function addHook(cb) {
      if (!cb) return;
      this.hooks = this.hooks || []; // Ensure hooks is initialized
      this.hooks.push(cb);
    }

    /**
     * Removes a previously registered raw key event hook.
     * @param {KeyboardHookCallback} cb - The callback function to remove.
     */
  }, {
    key: "removeHook",
    value: function removeHook(cb) {
      if (!cb || !this.hooks) return;
      var i = this.hooks.indexOf(cb);
      if (i >= 0) {
        this.hooks.splice(i, 1);
      }
    }

    /**
     * Checks if a specific key (by character) is currently pressed.
     * @param {string} key - The character of the key to check (e.g., 'w').
     * @returns {boolean} True if the key is currently pressed.
     */
  }, {
    key: "isKeyPressed",
    value: function isKeyPressed(key) {
      return this.activeKeys.includes(key.toLowerCase());
    }

    /**
     * Checks if a specific key (by code, e.g., 'ArrowLeft') is currently pressed.
     * @param {string} code - The `key` property from a KeyboardEvent.
     * @returns {boolean} True if the key is currently pressed.
     */
  }, {
    key: "isCodePressed",
    value: function isCodePressed(code) {
      return this.activeCodes.includes(code);
    }

    /**
     * Returns the last pressed key from a provided list of keys.
     * @param {string} keys - A string of keys to check (e.g., 'wasd').
     * @returns {string|null} The last pressed key from the list, or null if none are pressed.
     */
  }, {
    key: "lastPressed",
    value: function lastPressed(keys) {
      var lower = keys.toLowerCase();
      var max = null;
      var maxI = -1;
      for (var i = 0; i < lower.length; i++) {
        var k = lower[i];
        var index = Keyboard._instance.activeKeys.indexOf(k);
        if (index > maxI) {
          max = k;
          maxI = index;
        }
      }
      return max;
    }

    /**
     * Returns the last pressed key code (from `event.key`) that is not in the ignore list.
     * Note: This method modifies `activeCodes` by popping elements. Consider `peekLastPressedCode` for non-destructive check.
     * @param {string} [ignore=''] - A string of key codes to ignore.
     * @returns {string|null} The last pressed key code, or null if none are found or all are ignored.
     */
  }, {
    key: "lastPressedCode",
    value: function lastPressedCode() {
      var ignore = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      // This method's logic seems to be intended to return the *most recently pressed* key
      // that is not in the ignore list, by repeatedly popping from `activeCodes`.
      // This is a destructive operation on `activeCodes`.
      var last = null;
      var lowerIgnore = ignore.toLowerCase();
      while (Keyboard._instance.activeCodes.length > 0) {
        last = Keyboard._instance.activeCodes.pop();
        if (lowerIgnore.indexOf(last.toLowerCase()) === -1) {
          return last;
        }
      }
      return null;
    }

    /**
     * Returns the last pressed key (from `String.fromCharCode(e.keyCode)`) from the active keys list.
     * @returns {string|null} The last pressed key, or null if no keys are active.
     */
  }, {
    key: "lastPressedKey",
    value: function lastPressedKey() {
      return Keyboard._instance.activeKeys[Keyboard._instance.activeKeys.length - 1] || null;
    }
  }]);
}();