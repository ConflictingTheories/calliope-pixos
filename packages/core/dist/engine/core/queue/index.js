"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
 * ActionQueue - Manages a queue of actions or events for sequential execution.
 */
var ActionQueue = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of ActionQueue.
   */
  function ActionQueue() {
    _classCallCheck(this, ActionQueue);
    /** @type {Array<Function>} */
    this.actions = [];
  }

  /**
   * Adds an action to the queue.
   * @param {Function} action - The action function to add.
   */
  return _createClass(ActionQueue, [{
    key: "add",
    value: function add(action) {
      this.actions.push(action);
    }

    /**
     * Runs all actions in the queue, filtering out completed ones.
     * @param {...any} args - Arguments to pass to each action.
     */
  }, {
    key: "run",
    value: function run() {
      var args = arguments;
      this.actions = this.actions.filter(function (action) {
        return action(args);
      });
    }
  }]);
}();