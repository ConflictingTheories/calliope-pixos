"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _index = require("@Engine/utils/loaders/index.jsx");

var _waterKnight = _interopRequireDefault(require("@Sprites/npc/water-knight.jsx"));

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

var MyWaterKnight = /*#__PURE__*/function (_WaterKnight) {
  _inherits(MyWaterKnight, _WaterKnight);

  var _super = _createSuper(MyWaterKnight);

  function MyWaterKnight(engine) {
    _classCallCheck(this, MyWaterKnight);

    // Initialize Sprite
    return _super.call(this, engine);
  } // Interaction


  _createClass(MyWaterKnight, [{
    key: "interact",
    value: function interact(sprite, finish) {
      var ret = null; // React based on internal state

      switch (this.state) {
        case "intro":
          this.state = "loop";
          ret = new _index.ActionLoader(this.engine, "dialogue", [["I am the Water Knight!", "Here is my home.", "yo"], false, {
            autoclose: false,
            onClose: function onClose() {
              return finish(true);
            }
          }], this);
          break;

        case "loop":
          this.state = "loop2";
          ret = new _index.ActionLoader(this.engine, "dialogue", ["I heard about a strange legend once.", false, {
            autoclose: true,
            onClose: function onClose() {
              return finish(true);
            }
          }], this);
          break;

        case "loop2":
          this.state = "loop";
          ret = new _index.ActionLoader(this.engine, "dialogue", ["Sorry, I don't remember the story at the moment", false, {
            autoclose: true,
            onClose: function onClose() {
              return finish(true);
            }
          }], this);
          break;

        default:
          break;
      }

      if (ret) this.addAction(ret); // If completion handler passed through - call it when done

      if (finish) finish(false);
      return ret;
    }
  }]);

  return MyWaterKnight;
}(_waterKnight["default"]);

exports["default"] = MyWaterKnight;