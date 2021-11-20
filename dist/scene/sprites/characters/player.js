"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("../../../engine/utils/math/vector");

var _enums = require("../../../engine/utils/enums");

var _loaders = require("../../../engine/utils/loaders");

var _resources = _interopRequireDefault(require("../../../engine/utils/resources"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _default = {
  // Character art from http://opengameart.org/content/chara-seth-scorpio
  src: _resources["default"].artResourceUrl("player.gif"),
  sheetSize: [128, 256],
  tileSize: [24, 32],
  // Frames & Faces
  frames: {
    up: [[0, 0], [24, 0], [48, 0], [24, 0]],
    right: [[0, 32], [24, 32], [48, 32], [24, 32]],
    down: [[0, 64], [24, 64], [48, 64], [24, 64]],
    left: [[0, 96], [24, 96], [48, 96], [24, 96]]
  },
  // Offsets
  drawOffset: new _vector.Vector(-0.25, 1, 0.125),
  hotspotOffset: new _vector.Vector(0.5, 0.5, 0),
  // Should the camera follow the player?
  bindCamera: true,
  // Update
  tick: function tick(time) {
    if (!this.actionList.length) {
      var ret = this.checkInput();

      if (ret) {
        // Send action to the server
        // network.sendAction(ret);
        // Start running action locally to avoid latency
        // Local action will be replaced with a server-sanitised
        // version on the next update
        this.addAction(ret);
      }
    }

    if (this.bindCamera) (0, _vector.set)(this.pos, this.engine.cameraPosition);
  },
  // Reads for Input to Respond to
  checkInput: function checkInput() {
    var moveTime = 600; // move time in ms

    var facing = _enums.Direction.None; // Read Key presses

    switch (this.engine.keyboard.lastPressedKey("wsadhm")) {
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
      // Help Dialogue

      case "h":
        return new _loaders.ActionLoader(this.engine, "dialogue", ["Welcome! You pressed help!", false, {
          autoclose: true
        }], this);
      // Chat Message

      case "m":
        return new _loaders.ActionLoader(this.engine, "chat", [">:", true, {
          autoclose: false
        }], this);

      default:
        return null;
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

      return new _loaders.ActionLoader(this.engine, "changezone", [this.zone.id, this.pos.toArray(), z.id, to.toArray(), moveTime], this);
    } // Check Walking


    if (!this.zone.isWalkable(this.pos.x, this.pos.y, facing) || !this.zone.isWalkable(to.x, to.y, _enums.Direction.reverse(facing))) {
      return this.faceDir(facing);
    }

    return new _loaders.ActionLoader(this.engine, "move", [this.pos.toArray(), to.toArray(), moveTime], this);
  },
  // Set Facing
  faceDir: function faceDir(facing) {
    if (this.facing == facing || facing === _enums.Direction.None) return null;
    return new _loaders.ActionLoader(this.engine, "face", [facing], this);
  },
  // set message (for chat bubbles)
  setGreeting: function setGreeting(greeting) {
    return new _loaders.ActionLoader(this.engine, "greeting", [greeting, {
      autoclose: true
    }], this);
  }
};
exports["default"] = _default;