"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _zone = _interopRequireDefault(require("./zone.jsx"));

var _queue = _interopRequireDefault(require("./queue.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var World = /*#__PURE__*/function () {
  function World(engine) {
    _classCallCheck(this, World);

    this.engine = engine;
    this.zoneDict = {};
    this.zoneList = [];
    this.afterTickActions = new _queue["default"]();
    this.sortZones = this.sortZones.bind(this);
  } // push action into next frame


  _createClass(World, [{
    key: "runAfterTick",
    value: function runAfterTick(action) {
      this.afterTickActions.add(action);
    } // Sort zones for correct render order

  }, {
    key: "sortZones",
    value: function sortZones() {
      this.zoneList.sort(function (a, b) {
        return a.bounds[1] - b.bounds[1];
      });
    } // Fetch and Load Zone

  }, {
    key: "loadZone",
    value: function () {
      var _loadZone = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(zoneId) {
        var z;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.zoneDict[zoneId]) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", this.zoneDict[zoneId]);

              case 2:
                // Fetch Zone Remotely (allows for custom maps - with approved sprites / actions)
                z = new _zone["default"](zoneId, this);
                _context.next = 5;
                return z.load();

              case 5:
                this.zoneDict[zoneId] = z;
                this.zoneList.push(z); // Sort for correct render order

                z.runWhenLoaded(this.sortZones);
                return _context.abrupt("return", z);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function loadZone(_x) {
        return _loadZone.apply(this, arguments);
      }

      return loadZone;
    }() // Remove Zone

  }, {
    key: "removeZone",
    value: function removeZone(zoneId) {
      this.zoneList = this.zoneList.filter(function (zone) {
        return zone.id !== zoneId;
      });
      delete this.zoneDict[zoneId];
    } // Update

  }, {
    key: "tick",
    value: function tick(time) {
      for (var z in this.zoneDict) {
        this.zoneDict[z].tick(time);
      }

      this.afterTickActions.run(time);
    } // Draw Each Zone

  }, {
    key: "draw",
    value: function draw() {
      for (var z in this.zoneDict) {
        this.zoneDict[z].draw(this.engine);
      }
    } // Check for Cell inclusion

  }, {
    key: "zoneContaining",
    value: function zoneContaining(x, y) {
      for (var z in this.zoneDict) {
        var zone = this.zoneDict[z];
        if (zone.loaded && zone.isInZone(x, y)) return zone;
      }

      return null;
    }
  }]);

  return World;
}();

exports["default"] = World;