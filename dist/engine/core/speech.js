"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _queue = _interopRequireDefault(require("@Engine/core/queue.jsx"));

var _hud = require("@Engine/core/hud.jsx");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Speech = /*#__PURE__*/function () {
  function Speech(canvas, engine, id) {
    _classCallCheck(this, Speech);

    this.id = id;
    this.engine = engine;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.glTexture = engine.gl.createTexture();
    this.loaded = false;
    this.onLoadActions = new _queue["default"]();
    this.loadImage();
  }

  _createClass(Speech, [{
    key: "runWhenLoaded",
    value: function runWhenLoaded(action) {
      if (this.loaded) action();else this.onLoadActions.add(action);
    } // Load Texture from Image

  }, {
    key: "loadImage",
    value: function loadImage() {
      var gl = this.engine.gl;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas); // This is the important line!

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
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
    } // clear HUD overlay

  }, {
    key: "clearHud",
    value: function clearHud() {
      var ctx = this.ctx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      this.loadImage();
    } // Write Text to HUD

  }, {
    key: "writeText",
    value: function writeText(text, x, y) {
      var ctx = this.ctx;
      ctx.save();
      ctx.font = "32px minecraftia";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(text, x !== null && x !== void 0 ? x : ctx.canvas.width / 2, y !== null && y !== void 0 ? y : ctx.canvas.height / 2);
      ctx.restore();
    } // Scrolling Textbox

  }, {
    key: "scrollText",
    value: function scrollText(text) {
      var scrolling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var txt = new _hud.textScrollBox(this.ctx);

      if (options.portrait) {
        txt.init(text, 10, 10, this.canvas.width - 20 - 84, 2 * this.canvas.height / 3 - 20, options);
      } else {
        txt.init(text, 10, 10, this.canvas.width - 20, 2 * this.canvas.height / 3 - 20, options);
      }

      txt.setOptions(options);

      if (scrolling) {
        txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5); // default oscillate
      }

      txt.render();
      return txt;
    }
  }]);

  return Speech;
}();

exports["default"] = Speech;