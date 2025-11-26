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
 * @callback TouchHookCallback
 * @param {TouchEvent} event - The raw touch event.
 * @param {'start'|'move'|'end'} type - The type of event.
 */
/**
 * Touch - Manages touch input for the game engine.
 * This class tracks touch positions, gestures, and allows for custom hooks.
 */
var Touch = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of Touch.
   * @param {GLEngine} engine - The main game engine instance.
   * @returns {Touch} The singleton instance of the Touch manager.
   */
  function Touch(engine) {
    _classCallCheck(this, Touch);
    if (!Touch._instance) {
      /** @type {GLEngine} */
      this.engine = engine;
      /** @type {Touch[]} */
      this.touches = [];
      /** @type {Object.<string, boolean>} */
      this.gestures = {}; // Active gestures
      /** @type {TouchHookCallback[]} */
      this.hooks = [];
      /** @type {number} */
      this.startTime = 0;
      /** @type {{x: number, y: number}} */
      this.startPos = {
        x: 0,
        y: 0
      };
      Touch._instance = this;
    }
    return Touch._instance;
  }

  /**
   * Initializes touch event listeners on the canvas.
   */
  return _createClass(Touch, [{
    key: "init",
    value: function init() {
      var canvas = this.engine.canvas;
      canvas.addEventListener('touchstart', this.onTouchStart.bind(this), {
        passive: false
      });
      canvas.addEventListener('touchmove', this.onTouchMove.bind(this), {
        passive: false
      });
      canvas.addEventListener('touchend', this.onTouchEnd.bind(this), {
        passive: false
      });
    }

    /**
     * Handles the `touchstart` event.
     * @param {TouchEvent} e - The touch event.
     */
  }, {
    key: "onTouchStart",
    value: function onTouchStart(e) {
      e.preventDefault();
      this.touches = Array.from(e.touches);
      if (this.touches.length === 1) {
        var touch = this.touches[0];
        this.startTime = Date.now();
        this.startPos = {
          x: touch.clientX,
          y: touch.clientY
        };
      }
      this._notifyHooks(e, 'start');
    }

    /**
     * Handles the `touchmove` event.
     * @param {TouchEvent} e - The touch event.
     */
  }, {
    key: "onTouchMove",
    value: function onTouchMove(e) {
      e.preventDefault();
      this.touches = Array.from(e.touches);
      this._notifyHooks(e, 'move');
    }

    /**
     * Handles the `touchend` event.
     * @param {TouchEvent} e - The touch event.
     */
  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(e) {
      var _this = this;
      e.preventDefault();
      this.touches = Array.from(e.touches);
      if (this.touches.length === 0 && this.startTime > 0) {
        var duration = Date.now() - this.startTime;
        var touch = e.changedTouches[0];
        var endPos = {
          x: touch.clientX,
          y: touch.clientY
        };
        var deltaX = endPos.x - this.startPos.x;
        var deltaY = endPos.y - this.startPos.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Detect gestures
        if (duration < 300 && distance < 10) {
          this.gestures['tap'] = true;
          setTimeout(function () {
            return delete _this.gestures['tap'];
          }, 100);
        } else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            this.gestures['swipe_right'] = true;
            setTimeout(function () {
              return delete _this.gestures['swipe_right'];
            }, 100);
          } else {
            this.gestures['swipe_left'] = true;
            setTimeout(function () {
              return delete _this.gestures['swipe_left'];
            }, 100);
          }
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
          if (deltaY > 0) {
            this.gestures['swipe_down'] = true;
            setTimeout(function () {
              return delete _this.gestures['swipe_down'];
            }, 100);
          } else {
            this.gestures['swipe_up'] = true;
            setTimeout(function () {
              return delete _this.gestures['swipe_up'];
            }, 100);
          }
        }
      }
      this._notifyHooks(e, 'end');
    }

    /**
     * Notifies registered hooks about a touch event.
     * @param {TouchEvent} event - The event object.
     * @param {'start'|'move'|'end'} type - The event type.
     * @private
     */
  }, {
    key: "_notifyHooks",
    value: function _notifyHooks(event, type) {
      try {
        this.hooks.forEach(function (h) {
          return h(event, type);
        });
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn("Error in touch hook (".concat(type, "):"), err);
        }
      }
    }

    /**
     * Checks if a specific gesture is currently active.
     * @param {string} gesture - The gesture to check (e.g., 'tap', 'swipe_left').
     * @returns {boolean} True if the gesture is active.
     */
  }, {
    key: "isGestureActive",
    value: function isGestureActive(gesture) {
      return !!this.gestures[gesture];
    }

    /**
     * Gets the current touches.
     * @returns {Touch[]} Array of current touches.
     */
  }, {
    key: "getTouches",
    value: function getTouches() {
      return this.touches;
    }

    /**
     * Registers a raw touch event hook.
     * @param {TouchHookCallback} cb - The callback function.
     */
  }, {
    key: "addHook",
    value: function addHook(cb) {
      if (cb) this.hooks.push(cb);
    }

    /**
     * Removes a raw touch event hook.
     * @param {TouchHookCallback} cb - The callback function.
     */
  }, {
    key: "removeHook",
    value: function removeHook(cb) {
      var i = this.hooks.indexOf(cb);
      if (i >= 0) this.hooks.splice(i, 1);
    }
  }]);
}();