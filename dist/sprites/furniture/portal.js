"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("@Engine/utils/math/vector.jsx");

var _resources = _interopRequireDefault(require("@Engine/utils/resources.jsx"));

var _animatedSprite = _interopRequireDefault(require("../effects/base/animatedSprite.jsx"));

var _index = require("@Engine/utils/loaders/index.jsx");

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

var Portal = /*#__PURE__*/function (_AnimatedSprite) {
  _inherits(Portal, _AnimatedSprite);

  var _super = _createSuper(Portal);

  function Portal(engine) {
    var _this;

    _classCallCheck(this, Portal);

    // Initialize Sprite
    _this = _super.call(this, engine);
    _this.src = _resources["default"].artResourceUrl("room.png");
    _this.sheetSize = [256, 256];
    _this.tileSize = [16, 32]; // this.fixed = true;
    // Frames

    _this.frames = {
      up: [[0, 210], [18, 210], [36, 210], [54, 210]],
      left: [[0, 210], [18, 210], [36, 210], [54, 210]],
      right: [[0, 210], [18, 210], [36, 210], [54, 210]],
      down: [[0, 210], [18, 210], [36, 210], [54, 210]]
    };
    _this.drawOffset = new _vector.Vector(0, 1.001, 0.001);
    _this.hotspotOffset = new _vector.Vector(0.5, 0.5, 0);
    _this.frameTime = 150;
    _this.state = "closed";
    return _this;
  } // Initialize


  _createClass(Portal, [{
    key: "init",
    value: function init() {
      this.triggerTime = 1000;
    } // Interact

  }, {
    key: "interact",
    value: function interact(sprite, finish) {
      var ret = null;
      this.startTime = Date.now(); // React based on internal state

      switch (this.state) {
        case "closed":
          this.state = "open";
          this.blocking = false;
          this.override = true;
          this.frames = {
            up: [[96, 210], [114, 210], [132, 210], [150, 210]],
            right: [[96, 210], [114, 210], [132, 210], [150, 210]],
            left: [[96, 210], [114, 210], [132, 210], [150, 210]],
            down: [[96, 210], [114, 210], [132, 210], [150, 210]]
          };
          ret = new _index.ActionLoader(this.engine, "dialogue", ["The portal is Open.", false, {
            autoclose: true,
            onClose: function onClose() {
              return finish(true);
            }
          }], this);
          break;

        case "open":
          this.state = "closed";
          this.blocking = true;
          this.override = false;
          ret = new _index.ActionLoader(this.engine, "dialogue", ["The portal is Closed.", false, {
            autoclose: true,
            onClose: function onClose() {
              return finish(true);
            }
          }], this);
          this.frames = {
            up: [[0, 210], [18, 210], [36, 210], [54, 210]],
            left: [[0, 210], [18, 210], [36, 210], [54, 210]],
            right: [[0, 210], [18, 210], [36, 210], [54, 210]],
            down: [[0, 210], [18, 210], [36, 210], [54, 210]]
          };
          break;

        default:
          break;
      }

      if (ret) this.addAction(ret); // If completion handler passed through - call it when done

      if (finish) finish(false);
      return ret;
    } // when stepping on tile position (if not blocking)

  }, {
    key: "onStep",
    value: function onStep(sprite) {
      var world = this.zone.world;
      world.removeAllZones();
      if (this.zones) this.zones.forEach(function (z) {
        return world.loadZone(z);
      });
      return null;
    }
  }]);

  return Portal;
}(_animatedSprite["default"]);

exports["default"] = Portal;