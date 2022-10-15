"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("@Engine/utils/math/vector.jsx");

var _enums = require("@Engine/utils/enums.jsx");

var _queue = _interopRequireDefault(require("./queue.jsx"));

var _index = require("@Engine/utils/loaders/index.jsx");

var _matrix = require("@Engine/utils/math/matrix4.jsx");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Sprite = /*#__PURE__*/function () {
  function Sprite(engine) {
    _classCallCheck(this, Sprite);

    this.engine = engine;
    this.templateLoaded = false;
    this.drawOffset = new _vector.Vector(0, 0, 0);
    this.hotspotOffset = new _vector.Vector(0, 0, 0);
    this.animFrame = 0;
    this.fixed = false;
    this.pos = new _vector.Vector(0, 0, 0);
    this.scale = new _vector.Vector(1, 1, 1);
    this.facing = _enums.Direction.Right;
    this.actionDict = {};
    this.actionList = [];
    this.gender = null;
    this.speech = {};
    this.portrait = null;
    this.onLoadActions = new _queue["default"]();
    this.getTexCoords = this.getTexCoords.bind(this);
    this.inventory = [];
    this.onTilesetOrTextureLoaded = this.onTilesetOrTextureLoaded.bind(this);
    this.blocking = true; // default - cannot passthrough

    this.override = false;
    this.voice = new SpeechSynthesisUtterance();
  }

  _createClass(Sprite, [{
    key: "update",
    value: function update(data) {
      Object.assign(this, data);
    }
  }, {
    key: "runWhenLoaded",
    value: function runWhenLoaded(action) {
      if (this.loaded) action();else this.onLoadActions.add(action);
    } // Load Texture / Location

  }, {
    key: "onLoad",
    value: function onLoad(instanceData) {
      if (this.loaded) return;

      if (!this.src || !this.sheetSize || !this.tileSize || !this.frames) {
        console.error("Invalid sprite definition");
        return;
      } // Zone Information


      this.zone = instanceData.zone;
      if (instanceData.id) this.id = instanceData.id;
      if (instanceData.pos) (0, _vector.set)(instanceData.pos, this.pos);
      if (instanceData.facing && instanceData.facing !== 0) this.facing = instanceData.facing;
      if (instanceData.zones && instanceData.zones !== null) this.zones = instanceData.zones;

      if (instanceData.onStep && typeof instanceData.onStep == "function") {
        var stepParent = this.onStep.bind(this);

        this.onStep = function () {
          instanceData.onStep();
          stepParent();
        };
      } // Texture Buffer


      this.texture = this.engine.loadTexture(this.src);
      this.texture.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
      this.vertexTexBuf = this.engine.createBuffer(this.getTexCoords(), this.engine.gl.DYNAMIC_DRAW, 2); // // Speech bubble

      if (this.enableSpeech) {
        this.speech = this.engine.loadSpeech(this.id, this.engine.mipmap);
        this.speech.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
        this.speechTexBuf = this.engine.createBuffer(this.getSpeechBubbleTexture(), this.engine.gl.DYNAMIC_DRAW, 2);
      } // load Portrait


      if (this.portraitSrc) {
        this.portrait = this.engine.loadTexture(this.portraitSrc);
        this.portrait.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
      } //


      this.zone.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
    } // Definition Loaded

  }, {
    key: "onTilesetDefinitionLoaded",
    value: function onTilesetDefinitionLoaded() {
      var s = this.zone.tileset.tileSize;
      var ts = [this.tileSize[0] / s, this.tileSize[1] / s];
      var v = [[0, 0, 0], [ts[0], 0, 0], [ts[0], 0, ts[1]], [0, 0, ts[1]]];
      var poly = [[v[2], v[3], v[0]], [v[2], v[0], v[1]]].flat(3);
      this.vertexPosBuf = this.engine.createBuffer(poly, this.engine.gl.STATIC_DRAW, 3);

      if (this.enableSpeech) {
        this.speechVerBuf = this.engine.createBuffer(this.getSpeechBubbleVertices(), this.engine.gl.STATIC_DRAW, 3);
      }

      this.zone.tileset.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
    } // After Tileset / Texture Loaded

  }, {
    key: "onTilesetOrTextureLoaded",
    value: function onTilesetOrTextureLoaded() {
      if (!this || this.loaded || !this.zone.tileset.loaded || !this.texture.loaded || this.enableSpeech && this.speech && !this.speech.loaded || this.portrait && !this.portrait.loaded) return;
      this.init(); // Hook for sprite implementations

      if (this.enableSpeech && this.speech) {
        if (this.speech.clearHud) {
          this.speech.clearHud();
          this.speech.writeText(this.id);
          this.speech.loadImage();
        }
      }

      this.loaded = true;
      this.onLoadActions.run();
    } // Get Texture Coordinates

  }, {
    key: "getTexCoords",
    value: function getTexCoords() {
      var _this$frames$Directio;

      var frames = (_this$frames$Directio = this.frames[_enums.Direction.spriteSequence(this.facing)]) !== null && _this$frames$Directio !== void 0 ? _this$frames$Directio : this.frames["up"]; //default up

      var length = this.frames[_enums.Direction.spriteSequence(this.facing)].length;

      var t = frames[this.animFrame % length];
      var ss = this.sheetSize;
      var ts = this.tileSize;
      var bl = [(t[0] + ts[0]) / ss[0], t[1] / ss[1]];
      var tr = [t[0] / ss[0], (t[1] + ts[1]) / ss[1]];
      var v = [bl, [tr[0], bl[1]], tr, [bl[0], tr[1]]];
      var poly = [[v[0], v[1], v[2]], [v[0], v[2], v[3]]];
      return poly.flat(3);
    } // Speech Area texture

  }, {
    key: "getSpeechBubbleTexture",
    value: function getSpeechBubbleTexture() {
      return [[1.0, 1.0], [0.0, 1.0], [0.0, 0.0], [1.0, 1.0], [0.0, 0.0], [1.0, 0.0]].flat(3);
    } // speech bubble position

  }, {
    key: "getSpeechBubbleVertices",
    value: function getSpeechBubbleVertices() {
      return [_construct(_vector.Vector, [2, 0, 4]).toArray(), _construct(_vector.Vector, [0, 0, 4]).toArray(), _construct(_vector.Vector, [0, 0, 2]).toArray(), _construct(_vector.Vector, [2, 0, 4]).toArray(), _construct(_vector.Vector, [0, 0, 2]).toArray(), _construct(_vector.Vector, [2, 0, 2]).toArray()].flat(3);
    } // Draw Sprite Sprite

  }, {
    key: "draw",
    value: function draw() {
      if (!this.loaded) return; // this.engine.disableObjAttributes();

      this.engine.mvPushMatrix(); // Undo rotation so that character plane is normal to LOS

      (0, _matrix.translate)(this.engine.uViewMat, this.engine.uViewMat, this.drawOffset.toArray());
      (0, _matrix.translate)(this.engine.uViewMat, this.engine.uViewMat, this.pos.toArray()); // scale & rotate sprite to handle walls
      // if (!this.fixed) this.engine.shaderProgram.setMatrixUniforms(new Vector(1, Math.cos(this.engine.cameraAngle / 180), 1));

      (0, _matrix.rotate)(this.engine.uViewMat, this.engine.uViewMat, this.engine.degToRad(this.engine.cameraAngle), [1, 0, 0]); // Bind texture

      this.engine.bindBuffer(this.vertexPosBuf, this.engine.shaderProgram.aVertexPosition);
      this.engine.bindBuffer(this.vertexTexBuf, this.engine.shaderProgram.aTextureCoord);
      this.texture.attach(); // Draw
      // if (this.fixed)

      this.engine.shaderProgram.setMatrixUniforms();
      this.engine.gl.depthFunc(this.engine.gl.ALWAYS);
      this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.vertexPosBuf.numItems);
      this.engine.gl.depthFunc(this.engine.gl.LESS);
      this.engine.mvPopMatrix(); // Draw Speech

      if (this.enableSpeech) {
        this.engine.mvPushMatrix(); // Undo rotation so that character plane is normal to LOS

        (0, _matrix.translate)(this.engine.uViewMat, this.engine.uViewMat, this.drawOffset.toArray());
        (0, _matrix.translate)(this.engine.uViewMat, this.engine.uViewMat, this.pos.toArray());
        (0, _matrix.rotate)(this.engine.uViewMat, this.engine.uViewMat, this.engine.degToRad(this.engine.cameraAngle), [1, 0, 0]); // Bind texture for speech bubble

        this.engine.bindBuffer(this.speechVerBuf, this.engine.shaderProgram.aVertexPosition);
        this.engine.bindBuffer(this.speechTexBuf, this.engine.shaderProgram.aTextureCoord);
        this.speech.attach(); // // Draw Speech

        this.engine.shaderProgram.setMatrixUniforms();
        this.engine.gl.depthFunc(this.engine.gl.ALWAYS);
        this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.speechVerBuf.numItems);
        this.engine.gl.depthFunc(this.engine.gl.LESS);
        this.engine.mvPopMatrix();
      }
    } // Set Frame

  }, {
    key: "setFrame",
    value: function setFrame(frame) {
      this.animFrame = frame;
      this.engine.updateBuffer(this.vertexTexBuf, this.getTexCoords());
    } // Set Facing

  }, {
    key: "setFacing",
    value: function setFacing(facing) {
      if (facing) this.facing = facing;
      this.setFrame(this.animFrame);
    } // Add Action to Queue

  }, {
    key: "addAction",
    value: function addAction(action) {
      if (this.actionDict[action.id]) this.removeAction(action.id);
      this.actionDict[action.id] = action;
      this.actionList.push(action);
    } // Remove Action

  }, {
    key: "removeAction",
    value: function removeAction(id) {
      this.actionList = this.actionList.filter(function (action) {
        return action.id !== id;
      });
      delete this.actionDict[id];
    } // Remove Action

  }, {
    key: "removeAllActions",
    value: function removeAllActions() {
      this.actionList = [];
      this.actionDict = {};
    } // Tick

  }, {
    key: "tickOuter",
    value: function tickOuter(time) {
      var _this = this;

      if (!this.loaded) return; // Sort activities by increasing startTime, then by id

      this.actionList.sort(function (a, b) {
        var dt = a.startTime - b.startTime;
        if (!dt) return dt;
        return a.id > b.id ? 1 : -1;
      }); // Run & Queue for Removal when complete

      var toRemove = [];
      this.actionList.forEach(function (action) {
        if (!action.loaded || action.startTime > time) return;

        try {
          if (action.tick(time)) {
            toRemove.push(action); // remove from backlog

            action.onComplete(); // call completion handler
          }
        } catch (e) {
          console.error(e);
          toRemove.push(action);
        }
      }); // clear completed activities

      toRemove.forEach(function (action) {
        return _this.removeAction(action.id);
      }); // tick

      if (this.tick) this.tick(time);
    } // Hook for sprite implementations

  }, {
    key: "init",
    value: function init() {} // load from json specification

  }, {
    key: "loadRemote",
    value: function () {
      var _loadRemote = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(url) {
        var response;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fetch(url);

              case 2:
                response = _context.sent;

                if (response.ok) {
                  _context.next = 5;
                  break;
                }

                throw new Error();

              case 5:
                this.processJson(response.json());

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function loadRemote(_x) {
        return _loadRemote.apply(this, arguments);
      }

      return loadRemote;
    }() // process json object

  }, {
    key: "processJson",
    value: function processJson(json) {
      // TODO -- process json details
      //
      this.update(json);
    } // speak

  }, {
    key: "speak",
    value: function speak(text) {
      var showBubble = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var dialogue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (!text && this.speech.clearHud) this.speech.clearHud();else {
        var _this$portrait;

        if (dialogue.speechOutput) {
          this.speechSynthesis(text);
          dialogue.speechOutput = false;
        }

        this.textbox = this.engine.scrollText(this.id + ":> " + text, true, {
          portrait: (_this$portrait = this.portrait) !== null && _this$portrait !== void 0 ? _this$portrait : false
        });

        if (showBubble && this.speech) {
          var _this$portrait2;

          this.speech.scrollText(text, false, {
            portrait: (_this$portrait2 = this.portrait) !== null && _this$portrait2 !== void 0 ? _this$portrait2 : false
          });
          this.speech.loadImage();
        }
      }
    } // Text to Speech output

  }, {
    key: "speechSynthesis",
    value: function speechSynthesis(text) {
      var _window$speechSynthes;

      var voice = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var lang = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "en";
      var rate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var volume = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
      var pitch = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
      var speech = this.voice;
      var voices = (_window$speechSynthes = window.speechSynthesis.getVoices()) !== null && _window$speechSynthes !== void 0 ? _window$speechSynthes : [];
      console.log(this, this.gender, voices); // set voice

      speech.voice = this.gender ? this.gender == "male" ? voices[7] : voices[28] : voices[0];
      if (rate) speech.rate = rate;
      if (volume) speech.volume = volume;
      if (pitch) speech.pitch = pitch;
      speech.text = text;
      speech.lang = lang; // speak

      window.speechSynthesis.speak(speech);
    } // handles interaction -- default (should be overridden in definition)

  }, {
    key: "interact",
    value: function interact(sprite, finish) {
      var ret = null; // React based on internal state

      switch (this.state) {
        default:
          break;
      } // If completion handler passed through - call it when done


      if (finish) finish(true);
      return ret;
    } // Set Facing

  }, {
    key: "faceDir",
    value: function faceDir(facing) {
      if (this.facing == facing || facing === _enums.Direction.None) return null;
      return new _index.ActionLoader(this.engine, "face", [facing], this);
    } // set message (for chat bubbles)

  }, {
    key: "setGreeting",
    value: function setGreeting(greeting) {
      if (this.speech.clearHud) {
        this.speech.clearHud();
      }

      this.speech.writeText(greeting);
      this.speech.loadImage();
      return new _index.ActionLoader(this.engine, "greeting", [greeting, {
        autoclose: true
      }], this);
    }
  }]);

  return Sprite;
}();

exports["default"] = Sprite;