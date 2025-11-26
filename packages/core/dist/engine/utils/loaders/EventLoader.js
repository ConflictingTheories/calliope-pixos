"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EventLoader = void 0;
var _event = _interopRequireDefault(require("@Engine/core/queue/event.js"));
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
// Helps Loads New Event Instance
var EventLoader = exports.EventLoader = /*#__PURE__*/function () {
  function EventLoader(engine, type, args, world, callback) {
    _classCallCheck(this, EventLoader);
    this.engine = engine;
    this.type = type;
    this.args = args;
    this.world = world;
    this.callback = callback;
    this.instances = {};
    this.definitions = [];
    this.assets = {};
    var time = new Date().getTime();
    var id = world.id + '-' + type + '-' + time;
    return this.load(type, function (event) {
      event.onLoad(args);
    }, function (event) {
      event.configure(type, world, id, time, args);
    });
  }
  // Load Internal Action
  return _createClass(EventLoader, [{
    key: "load",
    value: function load(type) {
      var afterLoad = arguments[1];
      var runConfigure = arguments[2];
      if (!this.instances[type]) {
        this.instances[type] = [];
      }
      // New Instance (assigns properties loaded by type)
      var instance = new _event["default"](this.type, this.world, this.callback);
      Object.assign(instance, require('@Engine/events/' + type + '.js')['default']);
      instance.templateLoaded = true;
      // Notify existing
      this.instances[type].forEach(function (instance) {
        if (instance.afterLoad) instance.afterLoad(instance.instance);
      });
      // construct
      if (runConfigure) runConfigure(instance);
      // load
      if (afterLoad) {
        if (instance.templateLoaded) afterLoad(instance);else this.instances[type].push({
          instance: instance,
          afterLoad: afterLoad
        });
      }
      return instance;
    }
  }]);
}();