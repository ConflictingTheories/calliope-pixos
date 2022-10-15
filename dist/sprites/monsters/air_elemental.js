"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("@Engine/utils/math/vector.jsx");

var _resources = _interopRequireDefault(require("@Engine/utils/resources.jsx"));

var _sprite = _interopRequireDefault(require("@Engine/core/sprite.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var AirElemental = /*#__PURE__*/function (_Sprite) {
  _inherits(AirElemental, _Sprite);

  var _super = _createSuper(AirElemental);

  function AirElemental(engine) {
    var _this;

    _classCallCheck(this, AirElemental);

    // Initialize Sprite
    _this = _super.call(this, engine); // Character art from http://opengameart.org/content/chara-seth-scorpio

    _this.src = _resources["default"].artResourceUrl("elementals-2.gif");
    _this.sheetSize = [64, 128];
    _this.tileSize = [16, 18]; // Offsets

    _this.drawOffset = new _vector.Vector(0, 1, 0.2);
    _this.hotspotOffset = new _vector.Vector(0.5, 0.5, 0); // Frames & Faces

    _this.frames = {
      up: [[0, 0], [16, 0], [32, 0], [48, 0]],
      right: [[0, 18], [16, 18], [32, 18], [16, 18]],
      down: [[0, 36], [16, 36], [32, 36], [16, 36]],
      left: [[48, 0], [48, 18], [48, 36], [48, 18]]
    }; // Should the camera follow the avatar?

    _this.bindCamera = false; // enable speech

    _this.enableSpeech = true; // Interaction Management

    _this.state = "intro";
    return _this;
  }

  return _createClass(AirElemental);
}(_sprite["default"]);

exports["default"] = AirElemental;