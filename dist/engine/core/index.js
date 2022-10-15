"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _reactRecollect = require("react-recollect");

var _dexie = _interopRequireDefault(require("dexie"));

var _matrix = require("@Engine/utils/math/matrix4.jsx");

var _vector = require("@Engine/utils/math/vector.jsx");

var _texture = require("@Engine/core/texture.jsx");

var _hud = require("@Engine/core/hud.jsx");

var _index = require("@Engine/utils/gamepad/index.jsx");

var _speech = _interopRequireDefault(require("@Engine/core/speech.jsx"));

var _obj = require("@Engine/utils/obj");

var _AudioLoader = require("../utils/loaders/AudioLoader.jsx");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var GLEngine = /*#__PURE__*/function () {
  function GLEngine(canvas, hud, mipmap, gamepadcanvas, width, height) {
    var _this = this;

    _classCallCheck(this, GLEngine);

    _defineProperty(this, "initShaderProgram", function (gl, _ref) {
      var vsSource = _ref.vs,
          fsSource = _ref.fs;
      var self = _this;

      var vertexShader = _this.loadShader(gl, gl.VERTEX_SHADER, vsSource);

      var fragmentShader = _this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource); // generate shader


      var shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error("WebGL unable to initialize the shader program: ".concat(shaderProgram));
      } // Configure Shader


      gl.useProgram(shaderProgram); // Normals (needs work)

      shaderProgram.aVertexNormal = gl.getAttribLocation(shaderProgram, "aVertexNormal");
      gl.enableVertexAttribArray(shaderProgram.aVertexNormal); // Vertices

      shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
      gl.enableVertexAttribArray(shaderProgram.aVertexPosition); // Texture Coord

      shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
      gl.enableVertexAttribArray(shaderProgram.aTextureCoord); // Uniform Locations

      shaderProgram.uDiffuse = gl.getUniformLocation(shaderProgram, "uDiffuse");
      shaderProgram.uSpecular = gl.getUniformLocation(shaderProgram, "uSpecular");
      shaderProgram.uSpecularExponent = gl.getUniformLocation(shaderProgram, "uSpecularExponent");
      shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
      shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
      shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
      shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
      shaderProgram.diffuseMapUniform = gl.getUniformLocation(shaderProgram, "uDiffuseMap");
      shaderProgram.scale = gl.getUniformLocation(shaderProgram, "u_scale");
      shaderProgram.useSampler = gl.getUniformLocation(shaderProgram, "useSampler");
      shaderProgram.useDiffuse = gl.getUniformLocation(shaderProgram, "useDiffuse"); // Uniform apply

      shaderProgram.setMatrixUniforms = function () {
        var scale = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var sampler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;
        gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
        gl.uniformMatrix4fv(this.mvMatrixUniform, false, self.uViewMat); // normal

        self.normalMat = (0, _matrix.create3)();
        (0, _matrix.normalFromMat4)(self.normalMat, self.uViewMat);
        gl.uniformMatrix3fv(this.nMatrixUniform, false, self.normalMat); // scale

        gl.uniform3fv(this.scale, scale ? scale.toArray() : self.scale.toArray()); // use sampler or materials?

        gl.uniform1f(this.useSampler, sampler);
      };

      var attrs = {
        aVertexPosition: _obj.OBJ.Layout.POSITION.key,
        aVertexNormal: _obj.OBJ.Layout.NORMAL.key,
        aTextureCoord: _obj.OBJ.Layout.UV.key
      };

      shaderProgram.applyAttributePointers = function (mesh) {
        var layout = mesh.vertexBuffer.layout;

        for (var attrName in attrs) {
          if (!attrs.hasOwnProperty(attrName) || shaderProgram[attrName] == -1) {
            continue;
          }

          var layoutKey = attrs[attrName];

          if (shaderProgram[attrName] != -1) {
            var attr = layout.attributeMap[layoutKey];
            gl.vertexAttribPointer(shaderProgram[attrName], attr.size, gl[attr.type], attr.normalized, attr.stride, attr.offset);
          }
        }
      };

      gl.disableVertexAttribArray(shaderProgram.aVertexNormal); // return

      _this.shaderProgram = shaderProgram;
      return shaderProgram;
    });

    this.uViewMat = (0, _matrix.create)();
    this.uProjMat = (0, _matrix.create)();
    this.normalMat = (0, _matrix.create3)();
    this.scale = new _vector.Vector(1, 1, 1);
    this.canvas = canvas;
    this.hud = hud;
    this.gamepadcanvas = gamepadcanvas;
    this.mipmap = mipmap;
    this.width = width;
    this.height = height;
    this.modelViewMatrixStack = [];
    this.globalStore = {};
    this.textures = [];
    this.speeches = [];
    this.cameraAngle = 45;
    this.fov = 45;
    this.cameraPosition = new _vector.Vector(8, 8, -1);
    this.cameraOffset = new _vector.Vector(0, 0, 0);
    this.setCamera = this.setCamera.bind(this);
    this.render = this.render.bind(this);
    this.objLoader = _obj.OBJ;
    this.voice = new SpeechSynthesisUtterance();
    this.audioLoader = new _AudioLoader.AudioLoader(this); // database

    this.db = new _dexie["default"]("hyperspace");
    this.db.version(1).stores({
      tileset: "++id, name, creator, type, checksum, signature, timestamp",
      // Primary key and indexed props
      inventory: "++id, name, creator, type, checksum, signature, timestamp",
      // Primary key and indexed props
      spirits: "++id, name, creator, type, checksum, signature, timestamp",
      // Primary key and indexed props
      abilities: "++id, name, creator, type checksum, signature, timestamp",
      // Primary key and indexed props
      models: "++id, name, creator, type, checksum, signature, timestamp",
      // Primary key and indexed props
      accounts: "++id, name, type, checksum, signature, timestamp",
      // Primary key and indexed props
      dht: "++id, name, type, ip, checksum, signature, timestamp",
      // Primary key and indexed props
      msg: "++id, name, type, ip, checksum, signature, timestamp",
      // Primary key and indexed props
      tmp: "++id, key, value, timestamp" // key-store

    }); // Store setup - session based

    _reactRecollect.store.pixos = {};
    this.store = _reactRecollect.store.pixos;
  } // Initialize a Scene object


  _createClass(GLEngine, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(scene, keyboard) {
        var ctx, gl, gp, gamepad;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // set up canvas
                ctx = this.hud.getContext("2d");
                gl = this.canvas.getContext("webgl");
                gp = this.gamepadcanvas.getContext("2d");

                if (gl) {
                  _context.next = 5;
                  break;
                }

                throw new Error("WebGL : unable to initialize");

              case 5:
                if (ctx) {
                  _context.next = 7;
                  break;
                }

                throw new Error("Canvas : unable to initialize HUD");

              case 7:
                if (gp) {
                  _context.next = 9;
                  break;
                }

                throw new Error("Gamepad : unable to initialize Mobile Canvas");

              case 9:
                this.gl = gl;
                this.ctx = ctx;
                this.gp = gp;
                this.time = new Date().getTime();
                this.scene = scene;
                this.keyboard = keyboard;
                this.fullscreen = false; // Configure Mobile Gamepad (if Mobile)

                gamepad = new _index.GamePad(gp);
                gamepad.init();
                this.touch = gamepad.listen.bind(gamepad);
                this.gamepad = gamepad; // Configure HUD

                ctx.canvas.width = gl.canvas.clientWidth;
                ctx.canvas.height = gl.canvas.clientHeight; // Configure GL

                gl.clearColor(0, 1.0, 0, 1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.enable(gl.BLEND);
                this.initializedWebGl = true; // flag
                // Initialize Shader

                this.initShaderProgram(gl, scene.shaders); // Initialize Project Matrix

                this.initProjection(gl); // Initialize Scene

                _context.next = 32;
                return scene.init(this);

              case 32:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x, _x2) {
        return _init.apply(this, arguments);
      }

      return init;
    }() // fetch value

  }, {
    key: "dbGet",
    value: function () {
      var _dbGet = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(store, key) {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.db[store].get(key);

              case 2:
                return _context2.abrupt("return", _context2.sent);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function dbGet(_x3, _x4) {
        return _dbGet.apply(this, arguments);
      }

      return dbGet;
    }() // add key to db store and returns id

  }, {
    key: "dbAdd",
    value: function () {
      var _dbAdd = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(store, value) {
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.db[store].add(_objectSpread({}, value));

              case 2:
                return _context3.abrupt("return", _context3.sent);

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function dbAdd(_x5, _x6) {
        return _dbAdd.apply(this, arguments);
      }

      return dbAdd;
    }() // update key to db store returns number of rows

  }, {
    key: "dbUpdate",
    value: function () {
      var _dbUpdate = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(store, id, changes) {
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.db[store].update(id, _objectSpread({}, changes));

              case 2:
                return _context4.abrupt("return", _context4.sent);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function dbUpdate(_x7, _x8, _x9) {
        return _dbUpdate.apply(this, arguments);
      }

      return dbUpdate;
    }() // update key to db store returns number of rows

  }, {
    key: "dbRemove",
    value: function () {
      var _dbRemove = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(store, id) {
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.db[store]["delete"](id);

              case 2:
                return _context5.abrupt("return", _context5.sent);

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function dbRemove(_x10, _x11) {
        return _dbRemove.apply(this, arguments);
      }

      return dbRemove;
    }() // fetch value from store

  }, {
    key: "fetchStore",
    value: function fetchStore(key) {
      return this.store[key];
    } // add key to store and returns id

  }, {
    key: "addStore",
    value: function addStore(key, value) {
      return this.store[key] = _objectSpread({}, value);
    } // update key in store returns number of rows

  }, {
    key: "updateStore",
    value: function updateStore(key, changes) {
      return this.store[key] = _objectSpread({}, changes);
    } // delete key from store returns number of rows

  }, {
    key: "delStore",
    value: function delStore(key) {
      return this.store[key] = null;
    } // Load and Compile Shader Source

  }, {
    key: "loadShader",
    value: function loadShader(gl, type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader); // if error clear

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shaders: ".concat(log));
      }

      return shader;
    } // Initialize Shader Program

  }, {
    key: "initProjection",
    value: // Set FOV and Perspective
    function initProjection(gl) {
      var fieldOfView = this.degToRad(this.fov);
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var zNear = 0.1;
      var zFar = 100.0;
      this.uProjMat = (0, _matrix.perspective)(fieldOfView, aspect, zNear, zFar);
      this.uViewMat = (0, _matrix.create)();
      this.uProjMat[5] *= -1;
    } // Set Camera Pos & Angle

  }, {
    key: "setCamera",
    value: function setCamera() {
      (0, _matrix.translate)(this.uViewMat, this.uViewMat, [0.0, 0.0, -15.0]);
      (0, _matrix.rotate)(this.uViewMat, this.uViewMat, this.degToRad(this.cameraAngle), [1, 0, 0]);
      (0, _vector.negate)(this.cameraPosition, this.cameraOffset);
      (0, _matrix.translate)(this.uViewMat, this.uViewMat, this.cameraOffset.toArray());
    } // Clear Screen with Color (RGBA)

  }, {
    key: "clearScreen",
    value: function clearScreen() {
      var gl = this.gl;
      gl.viewport(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      (0, _matrix.perspective)(this.degToRad(this.fov), this.ctx.canvas.clientWidth / this.ctx.canvas.clientHeight, 0.1, 100.0, this.uProjMat);
      this.uViewMat = (0, _matrix.create)();
    } // clear HUD overlay

  }, {
    key: "clearHud",
    value: function clearHud() {
      var ctx = this.ctx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    } // Write Text to HUD

  }, {
    key: "writeText",
    value: function writeText(text, x, y) {
      var src = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var ctx = this.ctx;
      ctx.save();
      ctx.font = "20px invasion2000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";

      if (src) {
        // draw portrait if set
        ctx.fillText(text, x !== null && x !== void 0 ? x : ctx.canvas.width / 2 + 76, y !== null && y !== void 0 ? y : ctx.canvas.height / 2);
        ctx.drawImage(src, x !== null && x !== void 0 ? x : ctx.canvas.width / 2, y !== null && y !== void 0 ? y : ctx.canvas.height / 2, 76, 76);
      } else {
        ctx.fillText(text, x !== null && x !== void 0 ? x : ctx.canvas.width / 2, y !== null && y !== void 0 ? y : ctx.canvas.height / 2);
      }

      ctx.restore();
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
      console.log(voices); // set voice

      speech.voice = voices[0];
      if (rate) speech.rate = rate;
      if (volume) speech.volume = volume;
      if (pitch) speech.pitch = pitch;
      speech.text = text;
      speech.lang = lang; // speak

      window.speechSynthesis.speak(speech);
    } // Greeting Text

  }, {
    key: "setGreeting",
    value: function setGreeting(text) {
      this.globalStore.greeting = text;
    } // Scrolling Textbox

  }, {
    key: "scrollText",
    value: function scrollText(text) {
      var scrolling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var txt = new _hud.textScrollBox(this.ctx);
      txt.init(text, 10, 2 * this.canvas.clientHeight / 3, this.canvas.clientWidth - 20, this.canvas.clientHeight / 3 - 20, options);
      txt.setOptions(options);

      if (scrolling) {
        txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5); // default oscillate
      }

      txt.render();
      return txt;
    } // Screensize

  }, {
    key: "screenSize",
    value: function screenSize() {
      return {
        width: this.canvas.clientWidth,
        height: this.canvas.clientHeight
      };
    } // Draws a button

  }, {
    key: "drawButton",
    value: function drawButton(text, x, y, w, h, colours) {
      var ctx = this.ctx;
      var halfHeight = h / 2;
      ctx.save(); // draw the button

      ctx.fillStyle = colours.background;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.clip(); // light gradient

      var grad = ctx.createLinearGradient(x, y, x, y + halfHeight);
      grad.addColorStop(0, "rgb(221,181,155)");
      grad.addColorStop(1, "rgb(22,13,8)");
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x, y, w, h); // draw the top half of the button

      ctx.fillStyle = colours.top; // draw the top and bottom particles

      for (var i = 0; i < h; i += halfHeight) {
        ctx.fillStyle = i === 0 ? colours.top : colours.bottom;

        for (var j = 0; j < 50; j++) {
          // get random values for particle
          var partX = x + Math.random() * w;
          var partY = y + i + Math.random() * halfHeight;
          var width = Math.random() * 10;
          var height = Math.random() * 10;
          var rotation = Math.random() * 360;
          var alpha = Math.random();
          ctx.save(); // rotate the canvas by 'rotation'

          ctx.translate(partX, partY);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.translate(-partX, -partY); // set alpha transparency to 'alpha'

          ctx.globalAlpha = alpha;
          ctx.fillRect(partX, partY, width, height);
          ctx.restore();
        }
      }

      ctx.font = "20px invasion2000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(text, x + w / 2, y + h / 2, w);
      ctx.restore();
    } // Render Frame

  }, {
    key: "render",
    value: function render() {
      this.requestId = requestAnimationFrame(this.render);
      this.clearScreen();
      this.clearHud();
      this.gamepad.render();
      this.scene.render(this, new Date().getTime());
    }
  }, {
    key: "toggleFullscreen",
    value: function toggleFullscreen() {
      if (!this.fullscreen) {
        try {
          this.gamepadcanvas.parentElement.requestFullscreen();
          this.fullscreen = true;
        } catch (e) {//
        }
      } else {
        try {
          document.exitFullscreen();
        } catch (e) {//
        }

        this.fullscreen = false;
      }
    } // individual buffer

  }, {
    key: "createBuffer",
    value: function createBuffer(contents, type, itemSize) {
      var gl = this.gl;
      var buf = gl.createBuffer();
      buf.itemSize = itemSize;
      buf.numItems = contents.length / itemSize;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(contents), type);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return buf;
    } // update buffer

  }, {
    key: "updateBuffer",
    value: function updateBuffer(buffer, contents) {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(contents));
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    } // bind buffer

  }, {
    key: "bindBuffer",
    value: function bindBuffer(buffer, attribute) {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
    } // load texture

  }, {
    key: "loadTexture",
    value: function loadTexture(src) {
      if (this.textures[src]) return this.textures[src];
      this.textures[src] = new _texture.Texture(src, this);
      return this.textures[src];
    } // load texture

  }, {
    key: "loadSpeech",
    value: function loadSpeech(src, canvas) {
      if (this.speeches[src]) return this.speeches[src];
      this.speeches[src] = new _speech["default"](canvas, this, src);
      return this.speeches[src];
    } // push new matrix to model stack

  }, {
    key: "mvPushMatrix",
    value: function mvPushMatrix() {
      var copy = (0, _matrix.create)();
      (0, _matrix.set)(this.uViewMat, copy);
      this.modelViewMatrixStack.push(copy);
    } // Initalize Canvas from HUD and load as WebGL texture (TODO - make separate canvases)

  }, {
    key: "initCanvasTexture",
    value: function initCanvasTexture() {
      var gl = this.gl;
      var canvasTexture = gl.createTexture();
      this.handleLoadedTexture(canvasTexture, this.mipmap);
      return canvasTexture;
    } // Load canvas as texture

  }, {
    key: "handleLoadedTexture",
    value: function handleLoadedTexture(texture, textureCanvas) {
      var gl = this.gl;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas); // This is the important line!

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
    } // pop model stack and apply view

  }, {
    key: "mvPopMatrix",
    value: function mvPopMatrix() {
      if (this.modelViewMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
      }

      this.uViewMat = this.modelViewMatrixStack.pop();
    } // Clear Render Loop

  }, {
    key: "close",
    value: function close() {
      cancelAnimationFrame(this.requestId);
    } // Degrees to Radians

  }, {
    key: "degToRad",
    value: function degToRad(degrees) {
      return degrees * Math.PI / 180;
    }
  }]);

  return GLEngine;
}();

exports["default"] = GLEngine;