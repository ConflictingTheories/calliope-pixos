"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Texture = exports.ColorTexture = void 0;
var _index = _interopRequireDefault(require("@Engine/core/queue/index.js"));
var _loadable = _interopRequireDefault(require("@Engine/core/queue/loadable.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); } /*                                                 *\
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
var Texture = exports.Texture = /*#__PURE__*/function (_Loadable) {
  /**
   * Texture objects for use with the pixos engine
   * @param {string} src
   * @param {} engine
   */
  function Texture(src, engine) {
    var _this;
    _classCallCheck(this, Texture);
    _this = _callSuper(this, Texture);
    _this.engine = engine;
    _this.src = src;
    _this.glTexture = engine.gl.createTexture();
    _this.image = new Image();
    _this.image.onload = _this._onImageLoaded.bind(_this);
    _this.image.src = src;
    _this.loaded = false;
    _this.onLoadActions = new _index["default"]();
    return _this;
  }

  /**
   * Load Texture from Image
   */
  _inherits(Texture, _Loadable);
  return _createClass(Texture, [{
    key: "_onImageLoaded",
    value: function _onImageLoaded() {
      var gl = this.engine.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.bindTexture(gl.TEXTURE_2D, null);
      this.loaded = true;
      this.onLoadActions.run();
    }

    /**
     * Bind texture to Uniform
     */
  }, {
    key: "attach",
    value: function attach() {
      var gl = this.engine.gl;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
      gl.uniform1i(this.engine.renderManager.shaderProgram.samplerUniform, 0);
    }
  }]);
}(_loadable["default"]);
var ColorTexture = exports.ColorTexture = /*#__PURE__*/function (_Loadable2) {
  /**
   * Solid colour texture to use in engine
   * @param {number[]} color
   * @param {*} engine
   */
  function ColorTexture(color, engine) {
    var _this2;
    _classCallCheck(this, ColorTexture);
    _this2.engine = engine;
    _this2.color = color;
    _this2.glTexture = engine.gl.createTexture();
    _this2.loaded = false;
    _this2.onLoadActions = new _index["default"]();
    _this2.loadTexture();
    return _assertThisInitialized(_this2);
  }

  /**
   * Load Texture from Image
   */
  _inherits(ColorTexture, _Loadable2);
  return _createClass(ColorTexture, [{
    key: "loadTexture",
    value: function loadTexture() {
      var gl = this.engine.gl;
      var level = 0;
      var internalFormat = gl.RGBA;
      var width = 1;
      var height = 1;
      var border = 0;
      var srcFormat = gl.RGBA;
      var srcType = gl.UNSIGNED_BYTE;
      var pixel = new Uint8Array(_toConsumableArray(this.color));
      gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
      this.loaded = true;
      this.onLoadActions.run();
    }

    /**
     * Bind texture to Uniform
     */
  }, {
    key: "attach",
    value: function attach() {
      var gl = this.engine.gl;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
      gl.uniform1i(this.engine.renderManager.shaderProgram.samplerUniform, 0);
    }
  }]);
}(_loadable["default"]);