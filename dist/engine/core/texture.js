"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Texture = exports.ColorTexture = void 0;

var _queue = _interopRequireDefault(require("@Engine/core/queue.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Texture = /*#__PURE__*/function () {
  function Texture(src, engine) {
    _classCallCheck(this, Texture);

    this.engine = engine;
    this.src = src;
    this.glTexture = engine.gl.createTexture();
    this.image = new Image();
    this.image.onload = this.onImageLoaded.bind(this);
    this.image.src = src;
    this.loaded = false;
    this.onLoadActions = new _queue["default"]();
  }

  _createClass(Texture, [{
    key: "runWhenLoaded",
    value: function runWhenLoaded(action) {
      if (this.loaded) action();else this.onLoadActions.add(action);
    } // Load Texture from Image

  }, {
    key: "onImageLoaded",
    value: function onImageLoaded() {
      var gl = this.engine.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.bindTexture(gl.TEXTURE_2D, null);
      this.loaded = true;
      this.onLoadActions.run();
    } // Bind texture to Uniform

  }, {
    key: "attach",
    value: function attach() {
      var gl = this.engine.gl;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
      gl.uniform1i(this.engine.shaderProgram.samplerUniform, 0);
    }
  }]);

  return Texture;
}();

exports.Texture = Texture;

var ColorTexture = /*#__PURE__*/function () {
  function ColorTexture(color, engine) {
    _classCallCheck(this, ColorTexture);

    this.engine = engine;
    this.color = color;
    this.glTexture = engine.gl.createTexture();
    this.loaded = false;
    this.onLoadActions = new _queue["default"]();
    this.loadTexture();
  }

  _createClass(ColorTexture, [{
    key: "runWhenLoaded",
    value: function runWhenLoaded(action) {
      if (this.loaded) action();else this.onLoadActions.add(action);
    } // Load Texture from Image

  }, {
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
    } // Bind texture to Uniform

  }, {
    key: "attach",
    value: function attach() {
      var gl = this.engine.gl;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
      gl.uniform1i(this.engine.shaderProgram.samplerUniform, 0);
    }
  }]);

  return ColorTexture;
}();

exports.ColorTexture = ColorTexture;