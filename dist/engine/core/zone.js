"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _enums = require("@Engine/utils/enums.jsx");

var _resources = _interopRequireDefault(require("@Engine/utils/resources.jsx"));

var _queue = _interopRequireDefault(require("@Engine/core/queue.jsx"));

var _vector = require("@Engine/utils/math/vector.jsx");

var _index = require("@Engine/utils/loaders/index.jsx");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

// for dynamic loading -- todo
// import { loadMap } from "../../scenes/maps/dynamic/map";
// import { dynamicCells } from "../../scenes/maps/dynamic/cells";
var Zone = /*#__PURE__*/function () {
  function Zone(zoneId, world) {
    _classCallCheck(this, Zone);

    this.sceneName = world.id;
    this.id = zoneId;
    this.world = world;
    this.data = {};
    this.spriteDict = {};
    this.spriteList = [];
    this.objectDict = {};
    this.objectList = [];
    this.scenes = [];
    this.lastKey = Date.now();
    this.engine = world.engine;
    this.onLoadActions = new _queue["default"]();
    this.spriteLoader = new _index.SpriteLoader(world.engine);
    this.objectLoader = new _index.ObjectLoader(world.engine);
    this.tsLoader = new _index.TilesetLoader(world.engine);
    this.audio = null; // bind

    this.onTilesetDefinitionLoaded = this.onTilesetDefinitionLoaded.bind(this);
    this.onTilesetOrSpriteLoaded = this.onTilesetOrSpriteLoaded.bind(this);
    this.loadSprite = this.loadSprite.bind(this, this);
    this.loadObject = this.loadObject.bind(this, this);
    this.checkInput = this.checkInput.bind(this);
  } // Load Map Resource from URL


  _createClass(Zone, [{
    key: "loadRemote",
    value: function () {
      var _loadRemote = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var _this2 = this;

        var fileResponse, data;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fetch(_resources["default"].zoneRequestUrl(this.id));

              case 2:
                fileResponse = _context.sent;

                if (!fileResponse.ok) {
                  _context.next = 31;
                  break;
                }

                _context.prev = 4;
                _context.next = 7;
                return fileResponse.json();

              case 7:
                data = _context.sent;
                this.bounds = data.bounds;
                this.size = [data.bounds[2] - data.bounds[0], data.bounds[3] - data.bounds[1]];
                this.cells = typeof data.cells == "function" ? data.cells(this.bounds, this) : data.cells;
                this.sprites = typeof data.sprites == "function" ? data.sprites(this.bounds, this) : data.sprites; // Load tileset and create level geometry & trigger updates

                _context.next = 14;
                return this.tsLoader.load(data.tileset, this.sceneName);

              case 14:
                this.tileset = _context.sent;
                this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
                this.tileset.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this)); // Load sprites from tileset

                if (!data.sprites) {
                  _context.next = 20;
                  break;
                }

                _context.next = 20;
                return Promise.all(data.sprites.map(this.loadSprite.bind(this)));

              case 20:
                if (!data.objects) {
                  _context.next = 23;
                  break;
                }

                _context.next = 23;
                return Promise.all(data.objects.map(this.loadObject.bind(this)));

              case 23:
                // Notify the zone sprites when the new sprite has loaded
                this.spriteList.forEach(function (sprite) {
                  return sprite.runWhenLoaded(_this2.onTilesetOrSpriteLoaded.bind(_this2));
                });
                this.objectList.forEach(function (object) {
                  return object.runWhenLoaded(_this2.onTilesetOrSpriteLoaded.bind(_this2));
                });
                _context.next = 31;
                break;

              case 27:
                _context.prev = 27;
                _context.t0 = _context["catch"](4);
                console.error("Error parsing zone " + this.id);
                console.error(_context.t0);

              case 31:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 27]]);
      }));

      function loadRemote() {
        return _loadRemote.apply(this, arguments);
      }

      return loadRemote;
    }() // Load Tileset Directly (precompiled)

  }, {
    key: "load",
    value: function () {
      var _load = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        var data, self;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                // Extract and Read in Information
                data = require("@Scenes/" + this.sceneName + "/maps/" + this.id + "/map.jsx")["default"];
                Object.assign(this, data); // handle cells generator

                if (typeof this.cells == "function") {
                  this.cells = this.cells(this.bounds, this);
                } // audio loader


                if (this.audioSrc) {
                  this.audio = this.engine.audioLoader.load(this.audioSrc, true); // loop background music
                } // Load tileset and create level geometry & trigger updates


                this.size = [this.bounds[2] - this.bounds[0], this.bounds[3] - this.bounds[1]];
                _context2.next = 8;
                return this.tsLoader.load(this.tileset, this.sceneName);

              case 8:
                this.tileset = _context2.sent;
                this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
                this.tileset.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this)); // Load sprites

                if (typeof this.sprites == "function") {
                  this.sprites = this.sprites(this.bounds, this);
                }

                self = this;
                _context2.next = 15;
                return Promise.all(self.sprites.map(self.loadSprite));

              case 15:
                _context2.next = 17;
                return Promise.all(self.objects.map(self.loadObject));

              case 17:
                // Notify the zone sprites when the new sprite has loaded
                self.spriteList.forEach(function (sprite) {
                  return sprite.runWhenLoaded(self.onTilesetOrSpriteLoaded);
                });
                self.objectList.forEach(function (object) {
                  return object.runWhenLoaded(self.onTilesetOrSpriteLoaded);
                });
                _context2.next = 25;
                break;

              case 21:
                _context2.prev = 21;
                _context2.t0 = _context2["catch"](0);
                console.error("Error parsing zone " + this.id);
                console.error(_context2.t0);

              case 25:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 21]]);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }() // Actions to run when the map has loaded

  }, {
    key: "runWhenLoaded",
    value: function runWhenLoaded(action) {
      if (this.loaded) action();else this.onLoadActions.add(action);
    } // When tileset loads

  }, {
    key: "onTilesetDefinitionLoaded",
    value: function onTilesetDefinitionLoaded() {
      this.vertexPosBuf = [];
      this.vertexTexBuf = [];
      this.walkability = []; // Determine Walkability and Load Vertices

      for (var j = 0, k = 0; j < this.size[1]; j++) {
        var vertices = [];
        var vertexTexCoords = []; // Loop over Tiles

        for (var i = 0; i < this.size[0]; i++, k++) {
          var cell = this.cells[k];
          this.walkability[k] = _enums.Direction.All;
          var n = Math.floor(cell.length / 3); // Calc Walk, Vertex positions and Textures for each cell

          for (var l = 0; l < n; l++) {
            var tilePos = [this.bounds[0] + i, this.bounds[1] + j, cell[3 * l + 2]];
            this.walkability[k] &= this.tileset.getWalkability(cell[3 * l]);
            vertices = vertices.concat(this.tileset.getTileVertices(cell[3 * l], tilePos));
            vertexTexCoords = vertexTexCoords.concat(this.tileset.getTileTexCoords(cell[3 * l], cell[3 * l + 1]));
          } // Custom walkability


          if (cell.length == 3 * n + 1) this.walkability[k] = cell[3 * n];
        }

        this.vertexPosBuf[j] = this.engine.createBuffer(vertices, this.engine.gl.STATIC_DRAW, 3);
        this.vertexTexBuf[j] = this.engine.createBuffer(vertexTexCoords, this.engine.gl.STATIC_DRAW, 2);
      }
    } // run after each tileset / sprite is loaded

  }, {
    key: "onTilesetOrSpriteLoaded",
    value: function onTilesetOrSpriteLoaded() {
      var _this3 = this;

      if (this.loaded || !this.tileset.loaded || !this.spriteList.every(function (sprite) {
        return sprite.loaded;
      }) || !this.objectList.every(function (object) {
        return object.loaded;
      })) return; // Load Scene Triggers

      var zone = this;
      this.scripts.forEach(function (x) {
        if (x.id === "load-scene") {
          _this3.runWhenLoaded(x.trigger.bind(zone));
        }
      }); // loaded

      this.loaded = true;
      this.onLoadActions.run();
    } // load obj model

  }, {
    key: "loadObject",
    value: function () {
      var _loadObject = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(_this, data) {
        var newObject;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data.zone = _this;

                if (!(!this.objectDict[data.id] && !_this.objectDict[data.id])) {
                  _context3.next = 7;
                  break;
                }

                _context3.next = 4;
                return this.objectLoader.load(data, function (sprite) {
                  return sprite.onLoad(sprite);
                });

              case 4:
                newObject = _context3.sent;
                this.objectDict[data.id] = newObject;
                this.objectList.push(newObject);

              case 7:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function loadObject(_x, _x2) {
        return _loadObject.apply(this, arguments);
      }

      return loadObject;
    }() // Load Sprite

  }, {
    key: "loadSprite",
    value: function () {
      var _loadSprite = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(_this, data) {
        var newSprite;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                data.zone = _this;

                if (!(!this.spriteDict[data.id] && !_this.spriteDict[data.id])) {
                  _context4.next = 7;
                  break;
                }

                _context4.next = 4;
                return this.spriteLoader.load(data.type, this.sceneName, function (sprite) {
                  return sprite.onLoad(data);
                });

              case 4:
                newSprite = _context4.sent;
                this.spriteDict[data.id] = newSprite;
                this.spriteList.push(newSprite);

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function loadSprite(_x3, _x4) {
        return _loadSprite.apply(this, arguments);
      }

      return loadSprite;
    }() // Add an existing sprite to the zone

  }, {
    key: "addSprite",
    value: function addSprite(sprite) {
      sprite.zone = this;
      this.spriteDict[sprite.id] = sprite;
      this.spriteList.push(sprite);
    } // Remove an sprite from the zone

  }, {
    key: "removeSprite",
    value: function removeSprite(id) {
      this.spriteList = this.spriteList.filter(function (sprite) {
        if (sprite.id !== id) {
          return true;
        } else {
          sprite.removeAllActions();
        }
      });
      delete this.spriteDict[id];
    } // Remove all sprites from the zone

  }, {
    key: "removeAllSprites",
    value: function removeAllSprites() {
      this.spriteList = [];
      this.spriteDict = {};
    } // Remove an sprite from the zone

  }, {
    key: "getSpriteById",
    value: function getSpriteById(id) {
      return this.spriteDict[id];
    } // add portal to provide list of sprites

  }, {
    key: "addPortal",
    value: function addPortal(sprites, x, y) {
      if (this.portals.length > 0 && this.getHeight(x, y) === 0) {
        var portal = this.portals.pop();
        portal.pos = _construct(_vector.Vector, [x, y, this.getHeight(x, y)]);
        sprites.push(portal);
      } else if (this.portals.length > 0 && x * y % Math.abs(3) && this.getHeight(x, y) === 0) {
        var _portal = this.portals.shift();

        _portal.pos = _construct(_vector.Vector, [x, y, this.getHeight(x, y)]);
        sprites.push(_portal);
      }

      return sprites;
    } // Calculate the height of a point in the zone

  }, {
    key: "getHeight",
    value: function getHeight(x, y) {
      if (!this.isInZone(x, y)) {
        console.error("Requesting height for [" + x + ", " + y + "] outside zone bounds");
        return 0;
      }

      var i = Math.floor(x);
      var j = Math.floor(y);
      var dp = [x - i, y - j]; // Calculate point inside a triangle

      var getUV = function getUV(t, p) {
        // Vectors relative to first vertex
        var u = [t[1][0] - t[0][0], t[1][1] - t[0][1]];
        var v = [t[2][0] - t[0][0], t[2][1] - t[0][1]]; // Calculate basis transformation

        var d = 1 / (u[0] * v[1] - u[1] * v[0]);
        var T = [d * v[1], -d * v[0], -d * u[1], d * u[0]]; // Return new coords

        u = (p[0] - t[0][0]) * T[0] + (p[1] - t[0][1]) * T[1];
        v = (p[0] - t[0][0]) * T[2] + (p[1] - t[0][1]) * T[3];
        return [u, v];
      }; // Check if any of the tiles defines a custom walk polygon


      var cell = this.cells[(j - this.bounds[1]) * this.size[0] + i - this.bounds[0]];
      var n = Math.floor(cell.length / 3);

      for (var l = 0; l < n; l++) {
        var poly = this.tileset.getTileWalkPoly(cell[3 * l]);
        if (!poly) continue; // Loop over triangles

        for (var p = 0; p < poly.length; p++) {
          var uv = getUV(poly[p], dp);
          var w = uv[0] + uv[1];
          if (w <= 1) return cell[3 * l + 2] + (1 - w) * poly[p][0][2] + uv[0] * poly[p][1][2] + uv[1] * poly[p][2][2];
        }
      } // Use the height of the first tile in the cell


      return cell[2];
    } // Draw Row of Zone

  }, {
    key: "drawRow",
    value: function drawRow(row) {
      // vertice positions
      this.engine.bindBuffer(this.vertexPosBuf[row], this.engine.shaderProgram.aVertexPosition); // texture positions

      this.engine.bindBuffer(this.vertexTexBuf[row], this.engine.shaderProgram.aTextureCoord); // texturize

      this.tileset.texture.attach(); // set shader

      this.engine.shaderProgram.setMatrixUniforms(); // draw triangles

      this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.vertexPosBuf[row].numItems);
    } // Draw Frame

  }, {
    key: "draw",
    value: function draw() {
      var _this$spriteList, _this$objectList;

      if (!this.loaded) return; // Organize by Depth

      (_this$spriteList = this.spriteList) === null || _this$spriteList === void 0 ? void 0 : _this$spriteList.sort(function (a, b) {
        return a.pos.y - b.pos.y;
      });
      (_this$objectList = this.objectList) === null || _this$objectList === void 0 ? void 0 : _this$objectList.sort(function (a, b) {
        return a.pos.y - b.pos.y;
      });
      this.engine.mvPushMatrix();
      this.engine.setCamera(); // Draw tile terrain row by row (back to front)

      var k = 0;
      var z = 0;

      for (var j = 0; j < this.size[1]; j++) {
        this.drawRow(j);

        while (z < this.objectList.length && this.objectList[z].pos.y - this.bounds[1] <= j) {
          this.objectList[z++].draw();
        } // draw each sprite in front of floor tiles if positioned in front


        while (k < this.spriteList.length && this.spriteList[k].pos.y - this.bounds[1] <= j) {
          this.spriteList[k++].draw(this.engine);
        }
      }

      while (z < this.objectList.length) {
        this.objectList[z++].draw();
      } // draw each sprite (fixes tearing)


      while (k < this.spriteList.length) {
        this.spriteList[k++].draw(this.engine);
      }

      this.engine.mvPopMatrix();
    } // Update

  }, {
    key: "tick",
    value: function tick(time, isPaused) {
      if (!this.loaded || isPaused) return;
      this.checkInput(time);
      this.spriteList.forEach( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(sprite) {
          return _regeneratorRuntime().wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  return _context5.abrupt("return", sprite.tickOuter(time));

                case 1:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        }));

        return function (_x5) {
          return _ref.apply(this, arguments);
        };
      }());
    } // read input

  }, {
    key: "checkInput",
    value: function () {
      var _checkInput = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(time) {
        var touchmap;
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!(time > this.lastKey + 100)) {
                  _context6.next = 11;
                  break;
                }

                touchmap = this.engine.gamepad.checkInput();
                this.lastKey = time;
                _context6.t0 = this.engine.keyboard.lastPressedKey("o");
                _context6.next = _context6.t0 === "o" ? 6 : 11;
                break;

              case 6:
                console.log(this.audio);
                _context6.next = 9;
                return this.moveSprite("monster", [7, 7, this.getHeight(7, 7)], false);

              case 9:
                if (this.audio) this.audio.playAudio();
                return _context6.abrupt("break", 11);

              case 11:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function checkInput(_x6) {
        return _checkInput.apply(this, arguments);
      }

      return checkInput;
    }() // Check for zone inclusion

  }, {
    key: "isInZone",
    value: function isInZone(x, y) {
      return x >= this.bounds[0] && y >= this.bounds[1] && x < this.bounds[2] && y < this.bounds[3];
    } // Cell Walkable

  }, {
    key: "isWalkable",
    value: function isWalkable(x, y, direction) {
      if (!this.isInZone(x, y)) return null;
      console.log("check walk");

      for (var sprite in this.spriteDict) {
        if ( // if sprite bypass & override
        !this.spriteDict[sprite].walkable && this.spriteDict[sprite].pos.x === x && this.spriteDict[sprite].pos.y === y && !this.spriteDict[sprite].blocking && this.spriteDict[sprite].override) return true;
        if ( // else if sprite blocking
        !this.spriteDict[sprite].walkable && this.spriteDict[sprite].pos.x === x && this.spriteDict[sprite].pos.y === y && this.spriteDict[sprite].blocking) return false;
      }

      for (var object in this.objectDict) {
        if ( // if sprite bypass & override
        !this.objectDict[object].walkable && this.within(x, this.objectDict[object].pos.x - this.objectDict[object].scale.x * (this.objectDict[object].size.x / 2), this.objectDict[object].pos.x) && this.within(y, this.objectDict[object].pos.y - this.objectDict[object].scale.y * (this.objectDict[object].size.y / 2), this.objectDict[object].pos.y) && !this.objectDict[object].blocking && this.objectDict[object].override) return true;
        if ( // else if object blocking
        !this.objectDict[object].walkable && (this.objectDict[object].pos.x === x && this.objectDict[object].pos.y === y || this.within(x, this.objectDict[object].pos.x - this.objectDict[object].scale.x * (this.objectDict[object].size.x / 2), this.objectDict[object].pos.x, true) && this.within(y, this.objectDict[object].pos.y - this.objectDict[object].scale.y * (this.objectDict[object].size.y / 2), this.objectDict[object].pos.y, true)) && this.objectDict[object].blocking) return false;
      } // else tile specific


      return (this.walkability[(y - this.bounds[1]) * this.size[0] + x - this.bounds[0]] & direction) != 0;
    }
  }, {
    key: "within",
    value: function within(x, a, b) {
      var include = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      if (include && x >= a && x <= b) return true;
      if (!include && x > a && x < b) return true;
      return false;
    } // Trigger Script

  }, {
    key: "triggerScript",
    value: function triggerScript(id) {
      var _this4 = this;

      this.scripts.forEach(function (x) {
        if (x.id === id) {
          _this4.runWhenLoaded(x.trigger.bind(_this4));
        }
      });
    } // Move the sprite

  }, {
    key: "moveSprite",
    value: function () {
      var _moveSprite = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(id, location) {
        var _this5 = this;

        var running,
            _args7 = arguments;
        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                running = _args7.length > 2 && _args7[2] !== undefined ? _args7[2] : false;
                return _context7.abrupt("return", new Promise(function (resolve, reject) {
                  var sprite = _this5.getSpriteById(id);

                  sprite.addAction(new _index.ActionLoader(_this5.engine, "patrol", [sprite.pos.toArray(), location, running ? 200 : 600, _this5], sprite, resolve));
                }));

              case 2:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function moveSprite(_x7, _x8) {
        return _moveSprite.apply(this, arguments);
      }

      return moveSprite;
    }() // Sprite Dialogue

  }, {
    key: "spriteDialogue",
    value: function () {
      var _spriteDialogue = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(id, dialogue) {
        var _this6 = this;

        var options,
            _args8 = arguments;
        return _regeneratorRuntime().wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                options = _args8.length > 2 && _args8[2] !== undefined ? _args8[2] : {
                  autoclose: true
                };
                return _context8.abrupt("return", new Promise(function (resolve, reject) {
                  var sprite = _this6.getSpriteById(id);

                  sprite.addAction(new _index.ActionLoader(_this6.engine, "dialogue", [dialogue, false, options], sprite, resolve));
                }));

              case 2:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function spriteDialogue(_x9, _x10) {
        return _spriteDialogue.apply(this, arguments);
      }

      return spriteDialogue;
    }() // Run Action configuration from JSON description

  }, {
    key: "runActions",
    value: function () {
      var _runActions = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(actions) {
        var self;
        return _regeneratorRuntime().wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                self = this;
                _context11.next = 3;
                return actions.reduce( /*#__PURE__*/function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(prev, action) {
                    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
                      while (1) {
                        switch (_context10.prev = _context10.next) {
                          case 0:
                            _context10.next = 2;
                            return prev.then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
                              return _regeneratorRuntime().wrap(function _callee9$(_context9) {
                                while (1) {
                                  switch (_context9.prev = _context9.next) {
                                    case 0:
                                      return _context9.abrupt("return", new Promise(function (resolve, reject) {
                                        if (!action) resolve();

                                        try {
                                          if (!action.scope) action.scope = self;

                                          if (action.sprite) {
                                            var sprite = action.scope.getSpriteById(action.sprite); // apply action

                                            if (sprite && action.action) {
                                              var args = action.args;
                                              var options = args.pop();
                                              sprite.addAction(new _index.ActionLoader(self.engine, action.action, [].concat(_toConsumableArray(args), [_objectSpread({}, options)]), sprite, function () {
                                                return resolve(self);
                                              }));
                                            }
                                          } // trigger script


                                          if (action.trigger) {
                                            var _sprite = action.scope.getSpriteById("avatar");

                                            if (_sprite && action.trigger) {
                                              _sprite.addAction(new _index.ActionLoader(self.engine, "script", [action.trigger, action.scope, function () {
                                                return resolve(self);
                                              }], _sprite));
                                            }
                                          }
                                        } catch (e) {
                                          reject(e);
                                        }
                                      }));

                                    case 1:
                                    case "end":
                                      return _context9.stop();
                                  }
                                }
                              }, _callee9);
                            })))["catch"](function (err) {
                              console.warn("err", err.message);
                            });

                          case 2:
                            return _context10.abrupt("return", _context10.sent);

                          case 3:
                          case "end":
                            return _context10.stop();
                        }
                      }
                    }, _callee10);
                  }));

                  return function (_x12, _x13) {
                    return _ref2.apply(this, arguments);
                  };
                }(), Promise.resolve());

              case 3:
                return _context11.abrupt("return", _context11.sent);

              case 4:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function runActions(_x11) {
        return _runActions.apply(this, arguments);
      }

      return runActions;
    }() // Play a scene

  }, {
    key: "playScene",
    value: function () {
      var _playScene = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(id) {
        var scenes,
            self,
            _args13 = arguments;
        return _regeneratorRuntime().wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                scenes = _args13.length > 1 && _args13[1] !== undefined ? _args13[1] : null;
                self = this;

                if (!scenes) {
                  scenes = self.scenes;
                }

                scenes.forEach( /*#__PURE__*/function () {
                  var _runScene = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(x) {
                    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
                      while (1) {
                        switch (_context12.prev = _context12.next) {
                          case 0:
                            _context12.prev = 0;

                            if (!x.currentStep) {
                              x.currentStep = 0; // Starting
                            }

                            if (!(x.currentStep > scenes.length)) {
                              _context12.next = 4;
                              break;
                            }

                            return _context12.abrupt("return");

                          case 4:
                            if (!(x.id === id)) {
                              _context12.next = 7;
                              break;
                            }

                            _context12.next = 7;
                            return self.runActions(x.actions);

                          case 7:
                            _context12.next = 12;
                            break;

                          case 9:
                            _context12.prev = 9;
                            _context12.t0 = _context12["catch"](0);
                            console.error(_context12.t0);

                          case 12:
                          case "end":
                            return _context12.stop();
                        }
                      }
                    }, _callee12, null, [[0, 9]]);
                  }));

                  function runScene(_x15) {
                    return _runScene.apply(this, arguments);
                  }

                  return runScene;
                }());

              case 4:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function playScene(_x14) {
        return _playScene.apply(this, arguments);
      }

      return playScene;
    }()
  }]);

  return Zone;
}();

exports["default"] = Zone;