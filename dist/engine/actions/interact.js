"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("@Engine/utils/math/vector.jsx");

var _enums = require("@Engine/utils/enums.jsx");

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var _default = {
  init: function init(from, facing, world) {
    var _this = this;

    this.world = world;
    this.from = _construct(_vector.Vector, _toConsumableArray(from));
    this.facing = facing;
    this.offset = _enums.Direction.toOffset(facing);
    this.lastKey = new Date().getTime();
    this.completed = false; // Determine Tile

    this.to = [from[0] + this.offset[0], from[1] + this.offset[1]]; // Check for Sprites at that point

    this.zone = world.zoneContaining.apply(world, _toConsumableArray(this.to)); // Trigger interaction on Sprite

    this.spriteList = this.zone.spriteList.filter(function (sprite) {
      return sprite.pos.x === _this.to[0] && sprite.pos.y === _this.to[1];
    });
    this.objectList = this.zone.objectList.filter(function (object) {
      return object.pos.x === _this.to[0] && object.pos.y === _this.to[1];
    }); // -- pass through reference to "finish()" callback

    this.finish = this.finish.bind(this); // Trigger

    this.interact();
  },
  // Trigger interactions in sprites
  interact: function interact() {
    var _this2 = this;

    if (this.spriteList.length === 0 && this.objectList.length === 0) this.completed = true; // objects

    this.objectList.forEach(function (object) {
      var faceChange = object.faceDir(_enums.Direction.reverse(_this2.facing));

      if (faceChange) {
        object.addAction(faceChange); // face towards avatar
      }

      return object.interact ? _this2.zone.objectDict[object.id].interact(_this2.sprite, _this2.finish) : null;
    }); // sprite

    this.spriteList.forEach(function (sprite) {
      var faceChange = sprite.faceDir(_enums.Direction.reverse(_this2.facing));

      if (faceChange) {
        sprite.addAction(faceChange); // face towards avatar
      }

      return sprite.interact ? _this2.zone.spriteDict[sprite.id].interact(_this2.sprite, _this2.finish) : null;
    });
  },
  // Callback to clear interaction
  finish: function finish(result) {
    if (result) this.completed = true;
  },
  // check input and completion
  tick: function tick(time) {
    if (!this.loaded) return;
    this.checkInput(time);
    return this.completed; // loop
  },
  // Handle Keyboard
  checkInput: function checkInput(time) {
    if (time > this.lastKey + this.length) {
      switch (this.sprite.engine.keyboard.lastPressed("q")) {
        // close dialogue on q key press
        case "q":
          // Needs to Cancel the Interaction on the Affected Sprite as well
          this.completed = true; // toggle

          break;

        default:
          this.lastKey = new Date().getTime();
          return null;
      }
    } // gamepad


    if (this.sprite.engine.gamepad.keyPressed("a")) {
      this.completed = true;
    }
  }
};
exports["default"] = _default;