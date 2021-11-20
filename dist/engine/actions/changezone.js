"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("../../engine/utils/math/vector");

var _enums = require("../../engine/utils/enums");

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _default = {
  init: function () {
    var _init = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fromZoneId, from, toZoneId, to, length) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log("loading - change zone");
              _context.next = 3;
              return this.sprite.zone.world.loadZone(fromZoneId);

            case 3:
              this.fromZone = _context.sent;
              _context.next = 6;
              return this.sprite.zone.world.loadZone(toZoneId);

            case 6:
              this.toZone = _context.sent;
              this.from = _construct(_vector.Vector, _toConsumableArray(from));
              this.to = _construct(_vector.Vector, _toConsumableArray(to));
              this.facing = _enums.Direction.fromOffset([Math.round(to.x - from.x), Math.round(to.y - from.y)]);
              this.length = length;

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function init(_x, _x2, _x3, _x4, _x5) {
      return _init.apply(this, arguments);
    }

    return init;
  }(),
  tick: function tick(time) {
    if (!this.toZone.loaded || !this.fromZone.loaded) return; // Set facing

    if (this.facing && this.facing != this.sprite.facing) {
      this.sprite.facing = this.facing;
      this.sprite.setFrame(0);
    } // Time Animation


    var endTime = this.startTime + this.length;
    var frac = (time - this.startTime) / this.length;

    if (time >= endTime) {
      (0, _vector.set)(this.to, this.sprite.pos);
      frac = 1;
    } else (0, _vector.lerp)(this.from, this.to, frac, this.sprite.pos); // New Frame


    var newFrame = Math.floor(frac * 4);
    if (newFrame != this.sprite.animFrame) this.sprite.setFrame(newFrame); // Move into the new zone

    if (!this.sprite.zone.isInZone(this.sprite.pos.x, this.sprite.pos.y)) {
      this.fromZone.removeSprite(this.sprite.id); // Defer until aftertick to stop the sprite being ticked twice

      this.sprite.zone.world.runAfterTick(function () {
        this.toZone.addSprite(this.sprite);
        console.log("sprite '" + this.sprite.id + "' changed zone from '" + this.fromZone.id + "' to '" + this.toZone.id + "'");
      }.bind(this));
    } // Calculate new height


    var hx = this.sprite.pos.x + this.sprite.hotspotOffset.x;
    var hy = this.sprite.pos.y + this.sprite.hotspotOffset.y;

    if (!this.switchRenderZone && !this.fromZone.isInZone(hx, hy)) {
      this.switchRenderZone = true;
    }

    this.sprite.pos.z = (this.switchRenderZone ? this.toZone : this.fromZone).getHeight(hx, hy);
    return time >= endTime;
  }
};
exports["default"] = _default;