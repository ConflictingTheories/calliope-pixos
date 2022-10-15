"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _matrix = require("@Engine/utils/math/matrix4.jsx");

var _sprite = _interopRequireDefault(require("@Engine/core/sprite.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var AnimatedTile = /*#__PURE__*/function (_Sprite) {
  _inherits(AnimatedTile, _Sprite);

  var _super = _createSuper(AnimatedTile);

  function AnimatedTile(engine) {
    var _this;

    _classCallCheck(this, AnimatedTile);

    // Initialize Sprite
    _this = _super.call(this, engine);
    _this.enableSpeech = false;
    _this.lastTime = 0;
    _this.accumTime = 0;
    _this.triggerTime = 400;
    _this.frameTime = 250;
    _this.blocking = false; // can passthrough

    return _this;
  } // Initialize


  _createClass(AnimatedTile, [{
    key: "init",
    value: function init() {
      this.triggerTime = 2000;
    } // Update each frame

  }, {
    key: "tick",
    value: function tick(time) {
      if (this.lastTime == 0) {
        this.lastTime = time;
        return;
      } // wait enough time


      this.accumTime += time - this.lastTime;
      if (this.accumTime < this.frameTime || this.animFrame == 0 && this.accumTime < this.triggerTime) return; // reset animation

      if (this.animFrame == 4) {
        this.setFrame(0);
        this.triggerTime = 2000 + Math.floor(Math.random() * 4000);
      } else {
        this.setFrame(this.animFrame + 1);
        this.accumTime = 0;
        this.lastTime = time;
      }
    } // Draw Frame

  }, {
    key: "draw",
    value: function draw(engine) {
      if (!this.loaded) return;
      engine.mvPushMatrix();
      (0, _matrix.translate)(engine.uViewMat, engine.uViewMat, this.pos.toArray()); // Lie flat on the ground

      (0, _matrix.translate)(engine.uViewMat, engine.uViewMat, this.drawOffset.toArray());
      (0, _matrix.rotate)(engine.uViewMat, engine.uViewMat, engine.degToRad(90), [1, 0, 0]);
      engine.bindBuffer(this.vertexPosBuf, engine.shaderProgram.aVertexPosition);
      engine.bindBuffer(this.vertexTexBuf, engine.shaderProgram.aTextureCoord);
      this.texture.attach(); // Draw

      engine.shaderProgram.setMatrixUniforms();
      engine.gl.drawArrays(engine.gl.TRIANGLES, 0, this.vertexPosBuf.numItems);
      engine.mvPopMatrix();
    }
  }]);

  return AnimatedTile;
}(_sprite["default"]);

exports["default"] = AnimatedTile;