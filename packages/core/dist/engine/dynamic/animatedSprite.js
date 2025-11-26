"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _sprite = _interopRequireDefault(require("@Engine/dynamic/sprite.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
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
/**
 * DynamicAnimatedSprite - A dynamic sprite with animation capabilities.
 */
var DynamicAnimatedSprite = exports["default"] = /*#__PURE__*/function (_DynamicSprite) {
  /**
   * Creates an instance of DynamicAnimatedSprite.
   * @param {GLEngine} engine - The game engine instance.
   * @param {Object} json - The JSON configuration.
   * @param {Object} zip - The zip file data.
   */
  function DynamicAnimatedSprite(engine, json, zip) {
    var _this;
    _classCallCheck(this, DynamicAnimatedSprite);
    // Initialize Sprite
    _this = _callSuper(this, DynamicAnimatedSprite, [engine, json, zip]);
    /**
     * Initializes the animated sprite, setting up framerate.
     */
    _defineProperty(_this, "init", function () {
      if (_this.json.randomJitter) {
        _this.triggerTime = _this.json.triggerTime + Math.floor(Math.random() * _this.json.randomJitter);
      } else {
        _this.triggerTime = _this.json.triggerTime;
      }
    });
    /**
     * Animates the sprite on ticks.
     * @param {number} time - The current time.
     */
    _defineProperty(_this, "tick", function (time) {
      if (_this.lastTime == 0) {
        _this.lastTime = time;
        return;
      }
      // wait enough time
      _this.accumTime += time - _this.lastTime;
      if (_this.accumTime < _this.frameTime || _this.animFrame == 0 && _this.accumTime < _this.triggerTime) return;
      // reset animation
      if (_this.animFrame == 5) {
        _this.setFrame(0);
        _this.triggerTime = 1000 + Math.floor(Math.random() * 4000);
      } else {
        _this.setFrame(_this.animFrame + 1);
        _this.accumTime = 0;
        _this.lastTime = time;
      }
    });
    return _this;
  }
  _inherits(DynamicAnimatedSprite, _DynamicSprite);
  return _createClass(DynamicAnimatedSprite);
}(_sprite["default"]);