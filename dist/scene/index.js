"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fs = _interopRequireDefault(require("./shaders/fs"));

var _vs = _interopRequireDefault(require("./shaders/vs"));

var _world = _interopRequireDefault(require("../engine/world"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Scene Object
var Scene = function Scene() {
  var _this = this;

  _classCallCheck(this, Scene);

  _defineProperty(this, "init", /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(engine) {
      var world;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // game Engine & Timing
              Scene._instance.engine = engine; // Init Game Engine Components

              world = Scene._instance.world = new _world["default"](engine);
              _context.next = 4;
              return world.loadZone("dungeon-top");

            case 4:
              _context.next = 6;
              return world.loadZone("dungeon-bottom");

            case 6:
              world.zoneList.forEach(function (z) {
                return z.runWhenLoaded(function () {
                  return console.log("loading...done");
                });
              });

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  _defineProperty(this, "render", function (engine, now) {
    // Build
    Scene._instance.world.tick(now); // Draw Frame


    _this.draw(engine);
  });

  _defineProperty(this, "draw", function (engine) {
    Scene._instance.world.draw(engine);
  });

  _defineProperty(this, "onKeyEvent", function (e) {
    if (e.type === "keydown") {
      Scene._instance.engine.keyboard.onKeyDown(e);
    } else Scene._instance.engine.keyboard.onKeyUp(e);
  });

  _defineProperty(this, "onMouseEvent", function (x, y, type, rmb, e) {// console.log(`pos -- ${x}, ${y}`, rmb, e);
    //
    // TODO
  });

  // Shaders
  this.shaders = {
    fs: (0, _fs["default"])(),
    vs: (0, _vs["default"])()
  }; // Singleton

  if (!Scene._instance) {
    Scene._instance = this;
  }

  return Scene._instance;
} // Init Scene
;

exports["default"] = Scene;