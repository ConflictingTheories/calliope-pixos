"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _loader = require("./loader");
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function main() {
  return _main.apply(this, arguments);
}
function _main() {
  _main = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var canvas, gl, vs, fs, meshProgramInfo, objHref, response, text, obj, baseHref, matTexts, materials, textures, _loop, _i, _Object$values, defaultMaterial, parts, getExtents, getGeometriesExtents, extents, range, objOffset, cameraTarget, radius, cameraPosition, zNear, zFar, degToRad, render;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
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
            var up = [0, 1, 0];
            // Compute the camera's matrix using look at.
            var camera = m4.lookAt(cameraPosition, cameraTarget, up);

            // Make a view matrix from the camera matrix.
            var view = m4.inverse(camera);
            var sharedUniforms = {
              u_lightDirection: m4.normalize([-1, 3, 5]),
              u_view: view,
              u_projection: projection,
              u_viewWorldPosition: cameraPosition
            };
            gl.useProgram(meshProgramInfo.program);

            // calls gl.uniform
            twgl.setUniforms(meshProgramInfo, sharedUniforms);

            // compute the world matrix once since all parts
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
                gl.bindVertexArray(vao);
                // calls gl.uniform
                twgl.setUniforms(meshProgramInfo, {
                  u_world: u_world
                }, material);
                // calls gl.drawArrays or gl.drawElements
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
            _context3.n = 1;
            break;
          }
          return _context3.a(2);
        case 1:
          // Tell the twgl to match position with a_position etc..
          twgl.setAttributePrefix("a_");
          vs = "#version 300 es\n    in vec4 a_position;\n    in vec3 a_normal;\n    in vec2 a_texcoord;\n    in vec4 a_color;\n  \n    uniform mat4 u_projection;\n    uniform mat4 u_view;\n    uniform mat4 u_world;\n    uniform vec3 u_viewWorldPosition;\n  \n    out vec3 v_normal;\n    out vec3 v_surfaceToView;\n    out vec2 v_texcoord;\n    out vec4 v_color;\n  \n    void main() {\n      vec4 worldPosition = u_world * a_position;\n      gl_Position = u_projection * u_view * worldPosition;\n      v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;\n      v_normal = mat3(u_world) * a_normal;\n      v_texcoord = a_texcoord;\n      v_color = a_color;\n    }\n    ";
          fs = "#version 300 es\n    precision highp float;\n  \n    in vec3 v_normal;\n    in vec3 v_surfaceToView;\n    in vec2 v_texcoord;\n    in vec4 v_color;\n  \n    uniform vec3 diffuse;\n    uniform sampler2D diffuseMap;\n    uniform vec3 ambient;\n    uniform vec3 emissive;\n    uniform vec3 specular;\n    uniform sampler2D specularMap;\n    uniform float shininess;\n    uniform float opacity;\n    uniform vec3 u_lightDirection;\n    uniform vec3 u_ambientLight;\n  \n    out vec4 outColor;\n  \n    void main () {\n      vec3 normal = normalize(v_normal);\n  \n      vec3 surfaceToViewDirection = normalize(v_surfaceToView);\n      vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);\n  \n      float fakeLight = dot(u_lightDirection, normal) * .5 + .5;\n      float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);\n      vec4 specularMapColor = texture(specularMap, v_texcoord);\n      vec3 effectiveSpecular = specular * specularMapColor.rgb;\n  \n      vec4 diffuseMapColor = texture(diffuseMap, v_texcoord);\n      vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;\n      float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;\n  \n      outColor = vec4(\n          emissive +\n          ambient * u_ambientLight +\n          effectiveDiffuse * fakeLight +\n          effectiveSpecular * pow(specularLight, shininess),\n          effectiveOpacity);\n    }\n    "; // compiles and links the shaders, looks up attribute and uniform locations
          meshProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);
          objHref = "https://webgl2fundamentals.org/webgl/resources/models/windmill/windmill.obj";
          _context3.n = 2;
          return fetch(objHref);
        case 2:
          response = _context3.v;
          _context3.n = 3;
          return response.text();
        case 3:
          text = _context3.v;
          obj = (0, _loader.parseOBJ)(text);
          baseHref = new URL(objHref, window.location.href);
          _context3.n = 4;
          return Promise.all(obj.materialLibs.map(/*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(filename) {
              var matHref, response;
              return _regenerator().w(function (_context) {
                while (1) switch (_context.n) {
                  case 0:
                    matHref = new URL(filename, baseHref).href;
                    _context.n = 1;
                    return fetch(matHref);
                  case 1:
                    response = _context.v;
                    _context.n = 2;
                    return response.text();
                  case 2:
                    return _context.a(2, _context.v);
                }
              }, _callee);
            }));
            return function (_x) {
              return _ref.apply(this, arguments);
            };
          }()));
        case 4:
          matTexts = _context3.v;
          materials = (0, _loader.parseMTL)(matTexts.join("\n"));
          textures = {
            defaultWhite: twgl.createTexture(gl, {
              src: [255, 255, 255, 255]
            })
          }; // load texture for materials
          _loop = /*#__PURE__*/_regenerator().m(function _loop() {
            var material;
            return _regenerator().w(function (_context2) {
              while (1) switch (_context2.n) {
                case 0:
                  material = _Object$values[_i];
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
                case 1:
                  return _context2.a(2);
              }
            }, _loop);
          });
          _i = 0, _Object$values = Object.values(materials);
        case 5:
          if (!(_i < _Object$values.length)) {
            _context3.n = 7;
            break;
          }
          return _context3.d(_regeneratorValues(_loop()), 6);
        case 6:
          _i++;
          _context3.n = 5;
          break;
        case 7:
          // hack the materials so we can see the specular map
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
            }

            // create a buffer for each array by calling
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
        case 8:
          return _context3.a(2);
      }
    }, _callee2);
  }));
  return _main.apply(this, arguments);
}
main();