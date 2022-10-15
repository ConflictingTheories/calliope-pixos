"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("@Engine/utils/math/vector.jsx");

var _enums = require("@Engine/utils/enums.jsx");

var _index = require("@Engine/utils/loaders/index.jsx");

var _sprite = _interopRequireDefault(require("@Engine/core/sprite.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

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

// Special class of Sprite which is controlled by the player
//
// -- Additional methods such as saving / importing and input handling
//
var Avatar = /*#__PURE__*/function (_Sprite) {
  _inherits(Avatar, _Sprite);

  var _super = _createSuper(Avatar);

  function Avatar(engine) {
    var _this;

    _classCallCheck(this, Avatar);

    // Initialize Sprite
    _this = _super.call(this, engine);
    _this.handleWalk = _this.handleWalk.bind(_assertThisInitialized(_this));
    return _this;
  } // Initialization Hook


  _createClass(Avatar, [{
    key: "init",
    value: function init() {
      console.log("- avatar hook", this.id, this.pos);
    } // Update

  }, {
    key: "tick",
    value: function tick(time) {
      // ONLY ONE MOVE AT A TIME
      if (!this.actionList.length) {
        var ret = this.checkInput();

        if (ret) {
          this.addAction(ret);
        }
      }

      if (this.bindCamera) (0, _vector.set)(this.pos, this.engine.cameraPosition);
    } // open menu

  }, {
    key: "openMenu",
    value: function openMenu() {
      var menuConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var defaultMenus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      return new _index.ActionLoader(this.engine, "prompt", [menuConfig, defaultMenus, false, {
        autoclose: false
      }], this);
    } // Reads for Input to Respond to

  }, {
    key: "checkInput",
    value: function checkInput() {
      // Action Keys
      var key = this.engine.keyboard.lastPressedCode();
      var touchmap = this.engine.gamepad.checkInput(); // Keyboard

      switch (key) {
        // Bind Camera
        case "b":
          this.bindCamera = true;
          break;
        // Fixed Camera

        case "c":
          this.bindCamera = false;
          break;
        // show menu

        case "m":
          return this.openMenu({
            main: {
              text: "Close Menu",
              x: 100,
              y: 100,
              w: 150,
              h: 75,
              colours: {
                top: "#333",
                bottom: "#777",
                background: "#999"
              },
              trigger: function trigger(menu) {
                menu.completed = true;
              }
            }
          }, ["main"]);
          break;

        case "z":
          // this.zone.world.removeZone("room");
          this.zone.world.removeZone("room");
          this.zone.world.loadZone("dungeon-top");
          this.zone.world.loadZone("dungeon-bottom");
          break;

        case "y":
          this.zone.world.removeZone("dungeon-top");
          this.zone.world.removeZone("dungeon-bottom");
          this.zone.world.loadZone("room");
          break;
        // Interact with tile

        case "k":
        case "Enter":
          return new _index.ActionLoader(this.engine, "interact", [this.pos.toArray(), this.facing, this.zone.world], this);
        // Help Dialogue

        case "h":
          return new _index.ActionLoader(this.engine, "dialogue", ["Welcome! You pressed help! Press Escape to close", false, {
            autoclose: true
          }], this);
        // Chat Message

        case " ":
          return new _index.ActionLoader(this.engine, "chat", [">:", true, {
            autoclose: false
          }], this);
        // Clear Speech

        case "q":
        case "Escape":
          this.speech.clearHud();
          break;
      } // Gamepad controls - TODO


      if (this.engine.gamepad.keyPressed("a")) {
        // select
        return new _index.ActionLoader(this.engine, "interact", [this.pos.toArray(), this.facing, this.zone.world], this);
      } // camera


      if (touchmap["x"] === 1) {
        this.bindCamera = !this.bindCamera;
      } // menu


      if (touchmap["y"] === 1) {
        return this.openMenu({
          main: {
            text: "Close Menu",
            x: 100,
            y: 100,
            w: 150,
            h: 75,
            colours: {
              top: "#333",
              bottom: "#777",
              background: "#999"
            },
            trigger: function trigger(menu) {
              menu.completed = true;
            }
          }
        }, ["main"]);
      } // Walk


      return this.handleWalk(this.engine.keyboard.lastPressedKey(), touchmap);
    } // walk between tiles

  }, {
    key: "handleWalk",
    value: function handleWalk(key, touchmap) {
      var moveTime = 600; // move time in ms

      var facing = _enums.Direction.None; // Read Key presses

      switch (key) {
        // Movement
        case "w":
          facing = _enums.Direction.Up;
          break;

        case "s":
          facing = _enums.Direction.Down;
          break;

        case "a":
          facing = _enums.Direction.Left;
          break;

        case "d":
          facing = _enums.Direction.Right;
          break;
        // Patrol

        case "u":
          return new _index.ActionLoader(this.engine, "dance", [300, this.zone], this);
        // Patrol

        case "p":
          return new _index.ActionLoader(this.engine, "patrol", [this.pos.toArray(), new _vector.Vector(8, 13, this.pos.z).toArray(), 600, this.zone], this);
        // Run

        case "r":
          return new _index.ActionLoader(this.engine, "patrol", [this.pos.toArray(), new _vector.Vector(8, 13, this.pos.z).toArray(), 200, this.zone], this);
      } // Mobile Gamepad
      // X axis - joystick


      if (touchmap["x-dir"] === 1) {
        // right
        facing = _enums.Direction.Right;
      }

      if (touchmap["x-dir"] === -1) {
        // left
        facing = _enums.Direction.Left;
      } // Y axis - joystick


      if (touchmap["y-dir"] === 1) {
        // down
        facing = _enums.Direction.Down;
      }

      if (touchmap["y-dir"] === -1) {
        // up
        facing = _enums.Direction.Up;
      } // Running?


      if (this.engine.keyboard.shift || this.engine.gamepad.keyPressed("y")) {
        moveTime = 200;
      } else {
        moveTime = 600;
      } // Check Direction


      if (this.facing !== facing) {
        return this.faceDir(facing);
      } // Determine Location


      var from = this.pos;

      var dp = _enums.Direction.toOffset(facing);

      var to = _construct(_vector.Vector, [Math.round(from.x + dp[0]), Math.round(from.y + dp[1]), 0]); // Check zones if changing


      if (!this.zone.isInZone(to.x, to.y)) {
        var z = this.zone.world.zoneContaining(to.x, to.y);

        if (!z || !z.loaded || !z.isWalkable(to.x, to.y, _enums.Direction.reverse(facing))) {
          return this.faceDir(facing);
        }

        return new _index.ActionLoader(this.engine, "changezone", [this.zone.id, this.pos.toArray(), z.id, to.toArray(), moveTime], this);
      } // Check Walking


      if (!this.zone.isWalkable(to.x, to.y, _enums.Direction.reverse(facing))) {
        return this.faceDir(facing);
      }

      return new _index.ActionLoader(this.engine, "move", [this.pos.toArray(), to.toArray(), moveTime, this.zone], this);
    }
  }]);

  return Avatar;
}(_sprite["default"]);

exports["default"] = Avatar;