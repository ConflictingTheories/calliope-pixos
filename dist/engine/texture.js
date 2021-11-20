"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _queue = _interopRequireDefault(require("./queue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
      console.log("loaded image '" + this.src + "'");
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

exports["default"] = Texture;