"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("@Engine/utils/math/vector.jsx");

var _enums = require("@Engine/utils/enums.jsx");

var _index = require("@Engine/utils/loaders/index.jsx");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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
  init: function init(from, to, moveLength, zone) {
    this.zone = zone;
    this.from = _construct(_vector.Vector, _toConsumableArray(from));
    this.to = _construct(_vector.Vector, _toConsumableArray(to));
    this.lastKey = new Date().getTime();
    this.completed = false;
    this.direction = 1;
    this.audio = this.zone.engine.audioLoader.load("/pixos/audio/sewer-beat.mp3"); // Determine Path to Walk

    var _this$sprite$zone$wor = this.sprite.zone.world.pathFind(from, to);

    var _this$sprite$zone$wor2 = _slicedToArray(_this$sprite$zone$wor, 2);

    this.hasMoves = _this$sprite$zone$wor2[0];
    this.moveList = _this$sprite$zone$wor2[1];

    if (!this.hasMoves) {
      this.completed = true; // no path - do not patrol
    }

    this.moveIndex = 1; // holds index position

    this.moveLength = moveLength; // length of time per move

    if (this.zone.audio) this.zone.audio.pauseAudio();
    this.audio.playAudio();
  },
  tick: function tick(time) {
    if (!this.loaded) return;
    this.checkInput(time); // load up moves - todo (improve this and make it less manual)

    var endTime = this.startTime + this.moveLength;

    if (time > endTime) {
      var move = this.moveList[this.moveIndex];

      if (this.moveList.length > 2) {
        // last position (for facing)
        var last = this.moveIndex == 0 ? this.moveList[this.moveIndex + 1] : this.moveIndex + 1 >= this.moveList.length ? this.moveList[this.moveList.length - 1] : this.moveList[this.moveIndex - 1];

        var facing = _enums.Direction.fromOffset([Math.round(move[0] - last[0]), Math.round(move[1] - last[1])]); // Check for zone change


        if (!this.sprite.zone.isInZone(move[0], move[1])) {
          var zone = this.sprite.zone.world.zoneContaining(move[0], move[1]);

          if (!zone || !zone.loaded || !zone.isWalkable(move[0], move[1], _enums.Direction.reverse(facing))) {
            this.currentAction = this.sprite.faceDir(facing);
          } else {
            this.currentAction = new _index.ActionLoader(this.sprite.engine, "changezone", [this.sprite.zone.id, this.sprite.pos.toArray(), zone.id, move, this.moveLength], this.sprite);
          }
        } else {
          // Load Next move
          this.currentAction = new _index.ActionLoader(this.sprite.engine, "move", [last, move, this.moveLength, this.zone], this.sprite);
        } // set facing


        if (this.currentAction) {
          this.currentAction.facing = facing;
          this.sprite.addAction(this.currentAction);
        }
      } // stop when done


      if (this.moveIndex + this.direction >= this.moveList.length) {
        this.direction *= -1;
        this.completed = true;
        if (this.zone.audio) this.zone.audio.playAudio();
        this.audio.pauseAudio();
      }

      this.moveIndex += this.direction;
      this.startTime = time;
    }

    return this.completed; // loop
  },
  // Handle Keyboard
  checkInput: function checkInput(time) {
    if (time > this.lastKey + this.moveLength) {
      switch (this.sprite.engine.keyboard.lastPressed("q")) {
        // close dialogue on q key press
        case "q":
          this.audio.pauseAudio();
          this.completed = true;
        // toggle

        default:
          this.lastKey = new Date().getTime();
          return null;
      }
    }
  }
};
exports["default"] = _default;