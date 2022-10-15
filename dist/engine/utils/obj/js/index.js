"use strict";

var _loader = require("./loader");

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var canvas, gl, vs, fs, meshProgramInfo, objHref, response, text, obj, baseHref, matTexts, materials, textures, _loop, _i, _Object$values, defaultMaterial, parts, getExtents, getGeometriesExtents, extents, range, objOffset, cameraTarget, radius, cameraPosition, zNear, zFar, degToRad, render;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            render = function _render(time) {
              var _m;

              time *= 0.001; // convert to seconds

              twgl.resizeCanvasToDisplaySize(gl.canvas);
              gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
              gl.enable(gl.DEPTH_TEST);
              var fieldOfViewRadians = degToRad(60);
              var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
              var projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
              var up = [0, 1, 0]; // Compute the camera's matrix using look at.

              var camera = m4.lookAt(cameraPosition, cameraTarget, up); // Make a view matrix from the camera matrix.

              var view = m4.inverse(camera);
              var sharedUniforms = {
                u_lightDirection: m4.normalize([-1, 3, 5]),
                u_view: view,
                u_projection: projection,
                u_viewWorldPosition: cameraPosition
              };
              gl.useProgram(meshProgramInfo.program); // calls gl.uniform

              twgl.setUniforms(meshProgramInfo, sharedUniforms); // compute the world matrix once since all parts
              // are at the same space.

              var u_world = m4.yRotation(time);
              u_world = (_m = m4).translate.apply(_m, [u_world].concat(_toConsumableArray(objOffset)));

              var _iterator = _createForOfIteratorHelper(parts),
                  _step;

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  var _step$value = _step.value,
                      bufferInfo = _step$value.bufferInfo,
                      vao = _step$value.vao,
                      material = _step$value.material;
                  // set the attributes for this part.
                  gl.bindVertexArray(vao); // calls gl.uniform

                  twgl.setUniforms(meshProgramInfo, {
                    u_world: u_world
                  }, material); // calls gl.drawArrays or gl.drawElements

                  twgl.drawBufferInfo(gl, bufferInfo);
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }

              requestAnimationFrame(render);
            };

            degToRad = function _degToRad(deg) {
              return deg * Math.PI / 180;
            };

            getGeometriesExtents = function _getGeometriesExtents(geometries) {
              return geometries.reduce(function (_ref7, _ref8) {
                var min = _ref7.min,
                    max = _ref7.max;
                var data = _ref8.data;
                var minMax = getExtents(data.position);
                return {
                  min: min.map(function (min, ndx) {
                    return Math.min(minMax.min[ndx], min);
                  }),
                  max: max.map(function (max, ndx) {
                    return Math.max(minMax.max[ndx], max);
                  })
                };
              }, {
                min: Array(3).fill(Number.POSITIVE_INFINITY),
                max: Array(3).fill(Number.NEGATIVE_INFINITY)
              });
            };

            getExtents = function _getExtents(positions) {
              var min = positions.slice(0, 3);
              var max = positions.slice(0, 3);

              for (var i = 3; i < positions.length; i += 3) {
                for (var j = 0; j < 3; ++j) {
                  var v = positions[i + j];
                  min[j] = Math.min(v, min[j]);
                  max[j] = Math.max(v, max[j]);
                }
              }

              return {
                min: min,
                max: max
              };
            };

            // Get A WebGL context

            /** @type {HTMLCanvasElement} */
            canvas = document.querySelector("#canvas");
            gl = canvas.getContext("webgl2");

            if (gl) {
              _context2.next = 8;
              break;
            }

            return _context2.abrupt("return");

          case 8:
            // Tell the twgl to match position with a_position etc..
            twgl.setAttributePrefix("a_");
            vs = "#version 300 es\n    in vec4 a_position;\n    in vec3 a_normal;\n    in vec2 a_texcoord;\n    in vec4 a_color;\n  \n    uniform mat4 u_projection;\n    uniform mat4 u_view;\n    uniform mat4 u_world;\n    uniform vec3 u_viewWorldPosition;\n  \n    out vec3 v_normal;\n    out vec3 v_surfaceToView;\n    out vec2 v_texcoord;\n    out vec4 v_color;\n  \n    void main() {\n      vec4 worldPosition = u_world * a_position;\n      gl_Position = u_projection * u_view * worldPosition;\n      v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;\n      v_normal = mat3(u_world) * a_normal;\n      v_texcoord = a_texcoord;\n      v_color = a_color;\n    }\n    ";
            fs = "#version 300 es\n    precision highp float;\n  \n    in vec3 v_normal;\n    in vec3 v_surfaceToView;\n    in vec2 v_texcoord;\n    in vec4 v_color;\n  \n    uniform vec3 diffuse;\n    uniform sampler2D diffuseMap;\n    uniform vec3 ambient;\n    uniform vec3 emissive;\n    uniform vec3 specular;\n    uniform sampler2D specularMap;\n    uniform float shininess;\n    uniform float opacity;\n    uniform vec3 u_lightDirection;\n    uniform vec3 u_ambientLight;\n  \n    out vec4 outColor;\n  \n    void main () {\n      vec3 normal = normalize(v_normal);\n  \n      vec3 surfaceToViewDirection = normalize(v_surfaceToView);\n      vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);\n  \n      float fakeLight = dot(u_lightDirection, normal) * .5 + .5;\n      float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);\n      vec4 specularMapColor = texture(specularMap, v_texcoord);\n      vec3 effectiveSpecular = specular * specularMapColor.rgb;\n  \n      vec4 diffuseMapColor = texture(diffuseMap, v_texcoord);\n      vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;\n      float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;\n  \n      outColor = vec4(\n          emissive +\n          ambient * u_ambientLight +\n          effectiveDiffuse * fakeLight +\n          effectiveSpecular * pow(specularLight, shininess),\n          effectiveOpacity);\n    }\n    "; // compiles and links the shaders, looks up attribute and uniform locations

            meshProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);
            objHref = "https://webgl2fundamentals.org/webgl/resources/models/windmill/windmill.obj";
            _context2.next = 15;
            return fetch(objHref);

          case 15:
            response = _context2.sent;
            _context2.next = 18;
            return response.text();

          case 18:
            text = _context2.sent;
            obj = (0, _loader.parseOBJ)(text);
            baseHref = new URL(objHref, window.location.href);
            _context2.next = 23;
            return Promise.all(obj.materialLibs.map( /*#__PURE__*/function () {
              var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(filename) {
                var matHref, response;
                return _regeneratorRuntime().wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        matHref = new URL(filename, baseHref).href;
                        _context.next = 3;
                        return fetch(matHref);

                      case 3:
                        response = _context.sent;
                        _context.next = 6;
                        return response.text();

                      case 6:
                        return _context.abrupt("return", _context.sent);

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
            }()));

          case 23:
            matTexts = _context2.sent;
            materials = (0, _loader.parseMTL)(matTexts.join("\n"));
            textures = {
              defaultWhite: twgl.createTexture(gl, {
                src: [255, 255, 255, 255]
              })
            }; // load texture for materials

            _loop = function _loop() {
              var material = _Object$values[_i];
              Object.entries(material).filter(function (_ref2) {
                var _ref3 = _slicedToArray(_ref2, 1),
                    key = _ref3[0];

                return key.endsWith("Map");
              }).forEach(function (_ref4) {
                var _ref5 = _slicedToArray(_ref4, 2),
                    key = _ref5[0],
                    filename = _ref5[1];

                var texture = textures[filename];

                if (!texture) {
                  var textureHref = new URL(filename, baseHref).href;
                  texture = twgl.createTexture(gl, {
                    src: textureHref,
                    flipY: true
                  });
                  textures[filename] = texture;
                }

                material[key] = texture;
              });
            };

            for (_i = 0, _Object$values = Object.values(materials); _i < _Object$values.length; _i++) {
              _loop();
            } // hack the materials so we can see the specular map


            Object.values(materials).forEach(function (m) {
              m.shininess = 25;
              m.specular = [3, 2, 1];
            });
            defaultMaterial = {
              diffuse: [1, 1, 1],
              diffuseMap: textures.defaultWhite,
              ambient: [0, 0, 0],
              specular: [1, 1, 1],
              specularMap: textures.defaultWhite,
              shininess: 400,
              opacity: 1
            };
            parts = obj.geometries.map(function (_ref6) {
              var material = _ref6.material,
                  data = _ref6.data;

              // Because data is just named arrays like this
              //
              // {
              //   position: [...],
              //   texcoord: [...],
              //   normal: [...],
              // }
              //
              // and because those names match the attributes in our vertex
              // shader we can pass it directly into `createBufferInfoFromArrays`
              // from the article "less code more fun".
              if (data.color) {
                if (data.position.length === data.color.length) {
                  // it's 3. The our helper library assumes 4 so we need
                  // to tell it there are only 3.
                  data.color = {
                    numComponents: 3,
                    data: data.color
                  };
                }
              } else {
                // there are no vertex colors so just use constant white
                data.color = {
                  value: [1, 1, 1, 1]
                };
              } // create a buffer for each array by calling
              // gl.createBuffer, gl.bindBuffer, gl.bufferData


              var bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
              var vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
              return {
                material: _objectSpread(_objectSpread({}, defaultMaterial), materials[material]),
                bufferInfo: bufferInfo,
                vao: vao
              };
            });
            extents = getGeometriesExtents(obj.geometries);
            range = m4.subtractVectors(extents.max, extents.min); // amount to move the object so its center is at the origin

            objOffset = m4.scaleVector(m4.addVectors(extents.min, m4.scaleVector(range, 0.5)), -1);
            cameraTarget = [0, 0, 0]; // figure out how far away to move the camera so we can likely
            // see the object.

            radius = m4.length(range) * 1.2;
            cameraPosition = m4.addVectors(cameraTarget, [0, 0, radius]); // Set zNear and zFar to something hopefully appropriate
            // for the size of this object.

            zNear = radius / 100;
            zFar = radius * 3;
            requestAnimationFrame(render);

          case 40:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _main.apply(this, arguments);
}

main();