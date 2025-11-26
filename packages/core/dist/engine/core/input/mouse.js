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
 * @typedef {object} MousePosition
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 */
/**
 * @typedef {object} MouseMovement
 * @property {number} x - X movement delta.
 * @property {number} y - Y movement delta.
 */
/**
 * @callback MouseHookCallback
 * @param {MouseEvent} event - The raw mouse event.
 * @param {'down'|'up'|'move'} type - The type of event.
 * @returns {void}
 */
/**
 * Mouse - Manages mouse input for the Pixos game engine.
 * Tracks button states, position, and movement, and allows custom hooks for raw events.
 */
var Mouse = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of Mouse.
   * @param {import('../index.js').default} engine - The main game engine instance.
   * @returns {Mouse} The singleton instance of the Mouse manager.
   */
  function Mouse(engine) {
    _classCallCheck(this, Mouse);
    if (!Mouse._instance) {
      /** @type {import('../index.js').default} */
      this.engine = engine;
      /** @type {boolean[]} */
      this.buttons = [false, false, false]; // Left, Middle, Right
      /** @type {MousePosition} */
      this.position = {
        x: 0,
        y: 0
      };
      /** @type {MouseMovement} */
      this.movement = {
        x: 0,
        y: 0
      };
      /** @type {MouseHookCallback[]} */
      this._hooks = []; // raw mouse event hooks
      Mouse._instance = this;
    }
    return Mouse._instance;
  }

  /**
   * Initializes mouse event listeners on the canvas.
   * @returns {void}
   */
  return _createClass(Mouse, [{
    key: "init",
    value: function init() {
      /** @type {HTMLCanvasElement} */
      var canvas = this.engine.canvas;
      canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
      canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
      canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
      // Prevent context menu on right click
      canvas.addEventListener('contextmenu', function (e) {
        return e.preventDefault();
      });
    }

    /**
     * Handles the `mousedown` event.
     * @param {MouseEvent} e - The mouse event.
     * @returns {void}
     */
  }, {
    key: "onMouseDown",
    value: function onMouseDown(e) {
      e.preventDefault();
      var canvas = e.target; // Use the actual event target
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      this.position.x = (e.clientX - rect.left) * scaleX;
      this.position.y = (e.clientY - rect.top) * scaleY;
      if (e.button >= 0 && e.button < 3) {
        this.buttons[e.button] = true;
        if (process.env.NODE_ENV === 'development') console.log('mouse:onMouseDown', e.button, this.position);
      }
      this._notifyHooks(e, 'down');
    }

    /**
     * Handles the `mouseup` event.
     * @param {MouseEvent} e - The mouse event.
     * @returns {void}
     */
  }, {
    key: "onMouseUp",
    value: function onMouseUp(e) {
      e.preventDefault();
      var canvas = e.target; // Use the actual event target
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      this.position.x = (e.clientX - rect.left) * scaleX;
      this.position.y = (e.clientY - rect.top) * scaleY;
      if (e.button >= 0 && e.button < 3) {
        this.buttons[e.button] = false;
        if (process.env.NODE_ENV === 'development') console.log('mouse:onMouseUp', e.button, this.position);
      }
      this._notifyHooks(e, 'up');
    }

    /**
     * Handles the `mousemove` event.
     * @param {MouseEvent} e - The mouse event.
     * @returns {void}
     */
  }, {
    key: "onMouseMove",
    value: function onMouseMove(e) {
      var canvas = e.target; // Use the actual event target
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      var newX = (e.clientX - rect.left) * scaleX;
      var newY = (e.clientY - rect.top) * scaleY;
      this.movement.x = newX - this.position.x;
      this.movement.y = newY - this.position.y;
      this.position.x = newX;
      this.position.y = newY;
      this._notifyHooks(e, 'move');
    }

    /**
     * Notifies registered hooks about a mouse event.
     * @param {MouseEvent} event - The event object.
     * @param {'down'|'up'|'move'} type - The event type.
     * @private
     * @returns {void}
     */
  }, {
    key: "_notifyHooks",
    value: function _notifyHooks(event, type) {
      try {
        this._hooks.forEach(function (h) {
          try {
            h(event, type);
          } catch (errInner) {
            if (process.env.NODE_ENV === 'development') console.warn('Error in mouse hook callback:', errInner);
          }
        });
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn("Error while notifying mouse hooks (".concat(type, "):"), err);
        }
      }
    }

    /**
     * Checks if a specific mouse button is currently pressed.
     * @param {number|string} button - The button to check (0 for left, 1 for middle, 2 for right, or 'left', 'middle', 'right').
     * @returns {boolean} True if the button is pressed.
     */
  }, {
    key: "isButtonPressed",
    value: function isButtonPressed(button) {
      var buttonMap = {
        'left': 0,
        'middle': 1,
        'right': 2
      };
      if (typeof button === 'string') {
        button = buttonMap[button];
      }
      return this.buttons[button] || false;
    }

    /**
     * Gets the current mouse position.
     * @returns {MousePosition} The current position.
     */
  }, {
    key: "getPosition",
    value: function getPosition() {
      return this.position;
    }

    /**
     * Gets the latest mouse movement delta.
     * @returns {MouseMovement} The movement delta.
     */
  }, {
    key: "getMovement",
    value: function getMovement() {
      return this.movement;
    }

    /**
     * Registers a raw mouse event hook.
     * @param {MouseHookCallback} cb - The callback function.
     * @returns {void}
     */
  }, {
    key: "addHook",
    value: function addHook(cb) {
      if (typeof cb === 'function') this._hooks.push(cb);
    }

    /**
     * Removes a raw mouse event hook.
     * @param {MouseHookCallback} cb - The callback function.
     * @returns {void}
     */
  }, {
    key: "removeHook",
    value: function removeHook(cb) {
      var i = this._hooks.indexOf(cb);
      if (i >= 0) this._hooks.splice(i, 1);
    }
  }]);
}();