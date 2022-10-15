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
  init: function init(from, to, length, zone) {
    var _this = this;

    this.zone = zone;
    this.from = _construct(_vector.Vector, _toConsumableArray(from));
    this.to = _construct(_vector.Vector, _toConsumableArray(to));
    this.facing = _enums.Direction.fromOffset([Math.round(to.x - from.x), Math.round(to.y - from.y)]);
    this.length = length; // interactions

    console.log(this.zone);
    this.spriteList = this.zone.spriteList.filter(function (sprite) {
      return sprite.pos.x === _this.to.x && sprite.pos.y === _this.to.y;
    });
  },
  // move
  tick: function tick(time) {
    if (!this.loaded) return; // Set facing

    if (this.facing && this.facing != this.sprite.facing) this.sprite.setFacing(this.facing); // Transition & Move

    var endTime = this.startTime + this.length;
    var frac = (time - this.startTime) / this.length;

    if (time >= endTime) {
      (0, _vector.set)(this.to, this.sprite.pos);
      frac = 1;
      this.onStep();
    } else (0, _vector.lerp)(this.from, this.to, frac, this.sprite.pos); // Get next frame


    var newFrame = Math.floor(frac * 4);
    if (newFrame != this.sprite.animFrame) this.sprite.setFrame(newFrame); // Determine height

    var hx = this.sprite.pos.x + this.sprite.hotspotOffset.x;
    var hy = this.sprite.pos.y + this.sprite.hotspotOffset.y;
    this.sprite.pos.z = this.sprite.zone.getHeight(hx, hy);
    return time >= endTime;
  },
  // Trigger interactions in sprite when finished moving
  onStep: function onStep() {
    var _this2 = this;

    console.log("on steppping", this.spriteList);
    if (this.spriteList.length === 0) this.completed = true;
    this.spriteList.forEach(function (sprite) {
      return sprite.onStep ? _this2.zone.spriteDict[sprite.id].onStep(_this2.sprite) : null;
    });
  }
};
exports["default"] = _default;