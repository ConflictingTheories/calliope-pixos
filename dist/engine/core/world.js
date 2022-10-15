"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _zone = _interopRequireDefault(require("./zone.jsx"));

var _queue = _interopRequireDefault(require("./queue.jsx"));

var _enums = require("@Engine/utils/enums.jsx");

var _index = require("@Engine/utils/loaders/index.jsx");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var World = /*#__PURE__*/function () {
  function World(engine, id) {
    _classCallCheck(this, World);

    this.id = id;
    this.engine = engine;
    this.zoneDict = {};
    this.zoneList = [];
    this.eventList = [];
    this.eventDict = {};
    this.lastKey = new Date().getTime();
    this.isPaused = true;
    this.afterTickActions = new _queue["default"]();
    this.sortZones = this.sortZones.bind(this);
    this.canWalk = this.canWalk.bind(this);
    this.pathFind = this.pathFind.bind(this);
    this.menuConfig = {
      start: {
        onOpen: function onOpen(menu) {
          // auto-close - do nothing
          menu.completed = true;
        }
      }
    };
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
      var _loadZone = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(zoneId) {
        var remotely,
            z,
            _args = arguments;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                remotely = _args.length > 1 && _args[1] !== undefined ? _args[1] : false;

                if (!this.zoneDict[zoneId]) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return", this.zoneDict[zoneId]);

              case 3:
                // Fetch Zone Remotely (allows for custom maps - with approved sprites / actions)
                z = new _zone["default"](zoneId, this);

                if (!remotely) {
                  _context.next = 9;
                  break;
                }

                _context.next = 7;
                return z.loadRemote();

              case 7:
                _context.next = 11;
                break;

              case 9:
                _context.next = 11;
                return z.load();

              case 11:
                // audio
                this.zoneList.map(function (x) {
                  return x.audio.pauseAudio();
                });
                if (z.audio) z.audio.playAudio(); // add zone

                this.zoneDict[zoneId] = z;
                this.zoneList.push(z); // Sort for correct render order

                z.runWhenLoaded(this.sortZones);
                return _context.abrupt("return", z);

              case 17:
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
        if (zone.id !== zoneId) {
          return true;
        } else {
          zone.audio.pauseAudio();
          zone.removeAllSprites();
        }
      });
      delete this.zoneDict[zoneId];
    } // Remove Zones

  }, {
    key: "removeAllZones",
    value: function removeAllZones() {
      this.zoneList.map(function (z) {
        z.audio.pauseAudio();
        z.removeAllSprites();
      });
      this.zoneList = [];
      this.zoneDict = {};
    } // Update

  }, {
    key: "tick",
    value: function tick(time) {
      for (var z in this.zoneDict) {
        var _this$zoneDict$z;

        (_this$zoneDict$z = this.zoneDict[z]) === null || _this$zoneDict$z === void 0 ? void 0 : _this$zoneDict$z.tick(time, this.isPaused);
      }

      this.afterTickActions.run(time);
    } // read input (HIGHEST LEVEL)

  }, {
    key: "checkInput",
    value: function checkInput(time) {
      if (time > this.lastKey + 200) {
        var touchmap = this.engine.gamepad.checkInput();
        this.lastKey = time; // start

        if (this.engine.gamepad.keyPressed("start")) {
          touchmap["start"] = 0;
        } // select


        if (this.engine.gamepad.keyPressed("select")) {
          touchmap["select"] = 0;
          this.engine.toggleFullscreen();
        }
      }
    } // open start menu

  }, {
    key: "startMenu",
    value: function startMenu(menuConfig) {
      var defaultMenus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ["start"];
      this.addEvent(new _index.EventLoader(this.engine, "menu", [menuConfig !== null && menuConfig !== void 0 ? menuConfig : this.menuConfig, defaultMenus, false, {
        autoclose: false,
        closeOnEnter: true
      }], this));
    } // Add Event to Queue

  }, {
    key: "addEvent",
    value: function addEvent(event) {
      if (this.eventDict[event.id]) this.removeAction(event.id);
      this.eventDict[event.id] = event;
      this.eventList.push(event);
    } // Remove Action

  }, {
    key: "removeAction",
    value: function removeAction(id) {
      this.eventList = this.eventList.filter(function (event) {
        return event.id !== id;
      });
      delete this.eventDict[id];
    } // Remove Action

  }, {
    key: "removeAllActions",
    value: function removeAllActions() {
      this.eventList = [];
      this.eventDict = {};
    } // Tick

  }, {
    key: "tickOuter",
    value: function tickOuter(time) {
      var _this = this;

      // read input
      this.checkInput(time); // Sort activities by increasing startTime, then by id

      this.eventList.sort(function (a, b) {
        var dt = a.startTime - b.startTime;
        if (!dt) return dt;
        return a.id > b.id ? 1 : -1;
      }); // Run & Queue for Removal when complete

      var toRemove = [];
      this.eventList.forEach(function (event) {
        if (!event.loaded || event.startTime > time) return;

        if (event.tick(time)) {
          toRemove.push(event); // remove from backlog

          event.onComplete(); // call completion handler
        }
      }); // clear completed activities

      toRemove.forEach(function (event) {
        return _this.removeAction(event.id);
      }); // tick

      if (this.tick && !this.isPaused) this.tick(time);
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
    /**
     * Finds a path if one exists between two points on the world
     * @param Vector from
     * @param Vector to
     */

  }, {
    key: "pathFind",
    value: function pathFind(from, to) {
      // memory
      var steps = [],
          visited = [],
          found = false,
          world = this,
          x = from[0],
          y = from[1]; // loop through tiles

      function buildPath(neighbour, path) {
        var jsonNeighbour = JSON.stringify([neighbour[0], neighbour[1]]);
        if (found) return false; // ignore anything further

        if (neighbour[0] == to[0] && neighbour[1] == to[1]) {
          // found it
          found = true; // if final location is blocked, stop in front

          if (!world.canWalk(neighbour, jsonNeighbour, visited)) {
            return [found, _toConsumableArray(path)];
          } // otherwise return whole path


          return [found, [].concat(_toConsumableArray(path), [to])];
        } // Check walkability


        if (!world.canWalk(neighbour, jsonNeighbour, visited)) return false; // Visit Node & continue Search

        visited.push(jsonNeighbour);
        return world.getNeighbours.apply(world, _toConsumableArray(neighbour)).sort(function (a, b) {
          return Math.min(Math.abs(to[0] - a[0]) - Math.abs(to[0] - b[0]), Math.abs(to[1] - a[1]) - Math.abs(to[1] - b[1]));
        }).map(function (neigh) {
          return buildPath(neigh, [].concat(_toConsumableArray(path), [[neighbour[0], neighbour[1], 600]]));
        }).filter(function (x) {
          return x;
        }).flat();
      } // Fetch Steps


      steps = world.getNeighbours(x, y).sort(function (a, b) {
        return Math.min(Math.abs(to[0] - a[0]) - Math.abs(to[0] - b[0]), Math.abs(to[1] - a[1]) - Math.abs(to[1] - b[1]));
      }).map(function (neighbour) {
        return buildPath(neighbour, [[from[0], from[1], 600]]);
      }).filter(function (x) {
        return x[0];
      }); // Flatten Path from Segments

      console.log("pathing", world, world.getNeighbours(x, y), visited, found, x, y, from, to, steps);
      return steps.flat();
    }
    /**
     *  Gets adjacencies
     * @param int x
     * @param int y
     */

  }, {
    key: "getNeighbours",
    value: function getNeighbours(x, y) {
      var top = [x, y + 1, _enums.Direction.Up],
          bottom = [x, y - 1, _enums.Direction.Down],
          left = [x - 1, y, _enums.Direction.Left],
          right = [x + 1, y, _enums.Direction.Right];
      return [top, left, right, bottom];
    } // Should we skip?

  }, {
    key: "canWalk",
    value: function canWalk(neighbour, jsonNeighbour, visited) {
      var zone = this.zoneContaining.apply(this, _toConsumableArray(neighbour));

      if (visited.indexOf(jsonNeighbour) >= 0 || !zone || !zone.isWalkable.apply(zone, _toConsumableArray(neighbour)) || !zone.isWalkable(neighbour[0], neighbour[1], _enums.Direction.reverse(neighbour[2]))) {
        return false;
      }

      return true;
    }
  }]);

  return World;
}(); // Pathfinding Algorithm
// ---------------------
// Start Point
// Goal
// Path []
// Current Point
// --- Func
//
// Get Neighbours - Foreach Neighbour
//  - Check Neighbour
//    - Check Goal
//        - Found it - Return Path
//        - Else
//          - Get Neighbours
// ----
// GetNeighbours (x, y){
//    results = []
//    top = (x,y+1)
//    bottom = (x,y-1)
//    left = (x-1,y)
//    right = (x+1,y)
//
//    for each above
//      if (isWalkable()) add to results
//
//    return results
// }
// ----


exports["default"] = World;