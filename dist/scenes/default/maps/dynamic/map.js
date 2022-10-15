"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadMap = loadMap;

var _enums = require("../../../engine/utils/enums.jsx");

var _vector = require("../../../engine/utils/math/vector.jsx");

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// Map Information
function loadMap(json, cells) {
  var _this = this;

  return {
    // size of map
    bounds: json.bound,
    // Determines the tileset to load
    tileset: json.tileset,
    // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
    cells: cells,
    // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
    sprites: json.sprites.map(function (sprite) {
      var _sprite$zones;

      return {
        id: sprite.id,
        type: sprite.type,
        pos: _construct(_vector.Vector, _toConsumableArray(sprite.pos)),
        facing: _enums.Direction[sprite.facing],
        zones: (_sprite$zones = sprite.zones) !== null && _sprite$zones !== void 0 ? _sprite$zones : null
      };
    }),
    // Scenes + Scenarios
    scenes: json.scenes.map(function (scene) {
      return {
        id: scene.id,
        actions: scene.actions.map(function (action) {
          if (action.trigger) {
            return {
              trigger: action.trigger,
              scope: _this
            };
          } else {
            return {
              sprite: action.sprite,
              action: action.action,
              args: action.args
            };
          }
        }),
        scope: _this
      };
    }),
    // Scripts / Triggers for the Zone
    scripts: json.scripts.map(function (script) {
      return {
        id: script.id,
        trigger: eval.apply(_this, script.trigger)
      };
    }),
    // objects // 3d
    objects: json.objects.map(function (object) {
      return {
        id: object.id,
        type: object.type,
        mtl: object.mtl,
        useScale: object.useScale ? _construct(_vector.Vector, _toConsumableArray(object.useScale)) : null,
        pos: object.pos ? _construct(_vector.Vector, _toConsumableArray(object.pos)) : null,
        rotation: object.rotation ? _construct(_vector.Vector, _toConsumableArray(object.rotation)) : null
      };
    })
  };
}