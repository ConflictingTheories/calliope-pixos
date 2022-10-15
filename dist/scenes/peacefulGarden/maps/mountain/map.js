"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _reactRecollect = require("react-recollect");

var _vector = require("@Engine/utils/math/vector.jsx");

var _enums = require("@Engine/utils/enums.jsx");

var _generator = require("@Engine/utils/generator.jsx");

var _tiles = _interopRequireDefault(require("@Tilesets/mountain/tiles.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

// Use Tileset
// Map Information
var _default = {
  bounds: [0, 0, 30, 50],
  // Determines the tileset to load
  tileset: "mountain",
  audioSrc: "/pixos/audio/lonely-mountain.mp3",
  portals: [{
    id: "door-l",
    type: "furniture/portal",
    facing: _enums.Direction.Down,
    onStep: function onStep() {
      _reactRecollect.store.pixos[_generator.STORE_NAME].position = _construct(_vector.Vector, [5, 3, 0]);
      _reactRecollect.store.pixos[_generator.STORE_NAME].selected += 3;
    },
    zones: ["jungle"]
  }, {
    id: "door-r",
    type: "furniture/portal",
    facing: _enums.Direction.Down,
    onStep: function onStep() {
      _reactRecollect.store.pixos[_generator.STORE_NAME].position = _construct(_vector.Vector, [8, 3, 0]);
      _reactRecollect.store.pixos[_generator.STORE_NAME].selected += 7;
    },
    zones: ["ice"]
  }],
  // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
  cells: function cells(bounds, zone) {
    // generate based on bounds
    var x = bounds[0];
    var y = bounds[1];
    var width = bounds[2] - x;
    var height = bounds[3] - y;
    var cells = new Array(height).fill(null).map(function (_, i) {
      return new Array(width).fill(null).map(function (__, j) {
        var posKey = (x + i) * (y + j) + Math.floor(i * Math.random()) - Math.floor(j * Math.random()); // Edges

        if (i == y || i == bounds[3] - 1 || j == x || j == bounds[2] - 1) {
          return _tiles["default"].EDGE;
        } // return random tile based on location (x+i, y+j)
        // 66% of tiles are floor


        if (posKey % Math.abs(3 + (_reactRecollect.store.pixos && _reactRecollect.store.pixos[_generator.STORE_NAME] ? _reactRecollect.store.pixos[_generator.STORE_NAME].selected : 7)) !== 0) {
          return _tiles["default"].FLOOR;
        } // return random tile based on location (x+i, y+j)
        // 66% of tiles are floor


        if (posKey % Math.abs(7 + (_reactRecollect.store.pixos && _reactRecollect.store.pixos[_generator.STORE_NAME] ? _reactRecollect.store.pixos[_generator.STORE_NAME].selected : 7)) !== 0) {
          return _tiles["default"].PILLAR;
        } // rest are random (for now just blocks)


        return _tiles["default"].BLOCK;
      });
    });
    return cells.filter(function (x) {
      return x;
    }).flat(1);
  },
  // sprites
  sprites: function sprites(bounds, zone) {
    var _zone$defaultSprites;

    // clear out sprites
    var sprites = (_zone$defaultSprites = zone.defaultSprites) !== null && _zone$defaultSprites !== void 0 ? _zone$defaultSprites : []; // generate based on bounds

    var x = bounds[0];
    var y = bounds[1];
    var width = bounds[2] - x;
    var height = bounds[3] - y;
    new Array(height).fill(null).map(function (_, i) {
      return new Array(width).fill(null).map(function (__, j) {
        var posKey = (x + i) * (y + j) + Math.floor(i * Math.random()) - Math.floor(j * Math.random()); // Edges

        if (i == y || i == bounds[3] - 1 || j == x || j == bounds[2] - 1) {
          // edge sprites
          for (var m = 0; m < Math.floor((posKey + 1) * 227 % 9); m++) {
            sprites.push({
              id: "plt-" + posKey + m,
              type: "objects/plants/random",
              pos: _construct(_vector.Vector, [j, i, 2]),
              facing: _enums.Direction.Down
            });
          }
        } // return random tile based on location (x+i, y+j)
        // 66% of tiles are floor


        if (posKey % Math.abs(3 + (_reactRecollect.store.pixos && _reactRecollect.store.pixos[_generator.STORE_NAME] ? _reactRecollect.store.pixos[_generator.STORE_NAME].selected : 7)) !== 0) {
          // add some random flower sprites on some of those tiles to decorate (upto 6 per tile)
          if (posKey % Math.abs(5 + (_reactRecollect.store.pixos && _reactRecollect.store.pixos[_generator.STORE_NAME] ? _reactRecollect.store.pixos[_generator.STORE_NAME].selected : 7)) === 0) {
            // add Portals randomly around map on floor tiles
            sprites = zone.addPortal(sprites, j, i);
          }
        } // return random tile based on location (x+i, y+j) -- TODO - Add check for tile type through method
        // 66% of tiles are floor


        if (posKey % Math.abs(7 + (_reactRecollect.store.pixos && _reactRecollect.store.pixos[_generator.STORE_NAME] ? _reactRecollect.store.pixos[_generator.STORE_NAME].selected : 7)) !== 0) {
          // add some random flower sprites on some of those tiles to decorate (upto 6 per tile)
          if (posKey % Math.abs(5 + (_reactRecollect.store.pixos && _reactRecollect.store.pixos[_generator.STORE_NAME] ? _reactRecollect.store.pixos[_generator.STORE_NAME].selected : 7)) === 0) {
            for (var _m = 0; _m < Math.floor((posKey + 1) * 227 % 9); _m++) {
              sprites.push({
                id: "plt-" + posKey + _m,
                type: "objects/plants/random",
                pos: _construct(_vector.Vector, [j, i, zone.getHeight(j, i)]),
                facing: _enums.Direction.Down
              });
            }
          }
        } // add some flowers to the remaining blocks


        if (posKey % Math.abs(5 + (_reactRecollect.store.pixos && _reactRecollect.store.pixos[_generator.STORE_NAME] ? _reactRecollect.store.pixos[_generator.STORE_NAME].selected : 7)) === 0) {
          for (var _m2 = 0; _m2 < Math.floor((posKey + 1) * 227 % 9); _m2++) {
            sprites.push({
              id: "plt-" + posKey + _m2,
              type: "objects/plants/random",
              pos: _construct(_vector.Vector, [j, i, zone.getHeight(j, i)]),
              facing: _enums.Direction.Down
            });
          }
        }
      });
    });
    return sprites;
  },
  // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
  defaultSprites: [],
  // Scenes + Scenarios
  scenes: [{
    id: "welcome",
    actions: [// manual actions
    // Scripted Dialogue Action Controls directly on sprites
    {
      sprite: "avatar",
      action: "dialogue",
      args: [["Welcome to the Peaceful Garden.", "May your anxieties melt away and your inner spirit find balance and a sense of calm.", "Feel free to take a look around and explore."], false, {
        autoclose: true
      }],
      scope: void 0 // scoped to the zone

    }, // or call premade events and bundle many things and trigger them
    {
      trigger: "custom",
      scope: void 0
    }]
  }],
  // Scripts / Triggers for the Zone
  scripts: [{
    id: "load-scene",
    // **runs automatically when loaded
    trigger: function () {
      var _trigger = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var gender;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _generator.loadAvatar)(this, _generator.STORE_NAME);

              case 2:
                gender = _context.sent;
                _context.next = 5;
                return (0, _generator.generateZone)(this, gender, _generator.STORE_NAME, require("../../dialogues/cyoa.json"));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function trigger() {
        return _trigger.apply(this, arguments);
      }

      return trigger;
    }()
  }],
  // objects // 3d
  objects: [{
    id: "test" + Math.random(),
    type: "cactus_short",
    mtl: true,
    pos: _construct(_vector.Vector, [11, 6, 0])
  }]
};
exports["default"] = _default;