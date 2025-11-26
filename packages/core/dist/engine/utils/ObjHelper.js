"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vec3 = exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/**
 * ObjHelper - A clean, modern OBJ/MTL parser and loader
 * 
 * Based on the patterns from ObjModelViewer.jsx, this helper provides:
 * - Simple OBJ parsing with face triangulation
 * - MTL material parsing with texture support
 * - Automatic face normal calculation when vertex normals are missing
 * - Per-mesh material assignment
 * - WebGL buffer initialization
 * 
 * @example
 * const helper = new ObjHelper(gl);
 * const meshes = helper.parseOBJ(objText);
 * const materials = helper.parseMTL(mtlText);
 * helper.assignMaterials(meshes, materials);
 * await helper.loadTextures(meshes, textureMap);
 * helper.initBuffers(meshes);
 */

/**
 * Simple vec3 math utilities
 */
var vec3 = exports.vec3 = {
  sub: function sub(a, b) {
    var out = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0, 0];
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  },
  cross: function cross(a, b) {
    var out = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0, 0];
    var ax = a[0],
      ay = a[1],
      az = a[2];
    var bx = b[0],
      by = b[1],
      bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  },
  length: function length(v) {
    return Math.hypot(v[0], v[1], v[2]);
  },
  normalize: function normalize(v) {
    var out = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 0];
    var len = vec3.length(v);
    if (len === 0) return out;
    out[0] = v[0] / len;
    out[1] = v[1] / len;
    out[2] = v[2] / len;
    return out;
  }
};

/**
 * Parsed mesh structure
 * @typedef {Object} ParsedMesh
 * @property {number[]} positions - Flat array of vertex positions (x,y,z,...)
 * @property {number[]} normals - Flat array of vertex normals (nx,ny,nz,...)
 * @property {number[]} uvs - Flat array of texture coordinates (u,v,...)
 * @property {string} material - Material name from usemtl directive
 * @property {Object} [materialProps] - Material properties after assignment
 * @property {WebGLTexture} [texture] - Loaded texture after texture loading
 * @property {boolean} [hasTexture] - Whether mesh has a texture
 * @property {WebGLVertexArrayObject} [vao] - Vertex array object after buffer init
 * @property {number} [count] - Number of vertices for drawArrays
 * @property {WebGLBuffer} [vertexBuffer] - Position buffer (for legacy compatibility)
 * @property {WebGLBuffer} [normalBuffer] - Normal buffer (for legacy compatibility)
 * @property {WebGLBuffer} [textureBuffer] - UV buffer (for legacy compatibility)
 */

/**
 * Parsed material structure
 * @typedef {Object} ParsedMaterial
 * @property {number[]} Ka - Ambient color [r,g,b]
 * @property {number[]} Kd - Diffuse color [r,g,b]
 * @property {number[]} Ks - Specular color [r,g,b]
 * @property {number} Ns - Specular exponent
 * @property {string} [map_Kd] - Diffuse texture filename
 */
var ObjHelper = exports["default"] = /*#__PURE__*/function () {
  /**
   * @param {WebGL2RenderingContext} gl - WebGL context
   */
  function ObjHelper(gl) {
    _classCallCheck(this, ObjHelper);
    this.gl = gl;
  }

  /**
   * Parse OBJ file text into mesh arrays
   * Supports:
   * - v (vertex positions)
   * - vt (texture coordinates)
   * - vn (vertex normals)
   * - f (faces with triangulation)
   * - usemtl (material assignment)
   * 
   * @param {string} text - OBJ file content
   * @returns {ParsedMesh[]} Array of parsed meshes, one per material group
   */
  return _createClass(ObjHelper, [{
    key: "parseOBJ",
    value: function parseOBJ(text) {
      var lines = text.split(/\r?\n/);

      // Global vertex data (1-indexed in OBJ format)
      var positions = [];
      var uvs = [];
      var normals = [];

      // Meshes split by material
      var meshes = [];
      var currentMesh = {
        positions: [],
        uvs: [],
        normals: [],
        material: 'default'
      };
      var currentMaterial = 'default';
      var _iterator = _createForOfIteratorHelper(lines),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var line = _step.value;
          line = line.trim();
          if (!line || line[0] === '#') continue;
          var parts = line.split(/\s+/);
          switch (parts[0]) {
            case 'v':
              // Vertex position
              positions.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
              break;
            case 'vt':
              // Texture coordinate (flip Y for OpenGL convention)
              uvs.push(parseFloat(parts[1]), 1.0 - parseFloat(parts[2]));
              break;
            case 'vn':
              // Vertex normal
              normals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
              break;
            case 'f':
              // Face - triangulate if more than 3 vertices
              var faceVerts = parts.slice(1).map(function (v) {
                var idx = v.split('/');
                return {
                  v: idx[0] ? parseInt(idx[0]) : null,
                  vt: idx[1] && idx[1] !== '' ? parseInt(idx[1]) : null,
                  vn: idx[2] && idx[2] !== '' ? parseInt(idx[2]) : null
                };
              });

              // Triangulate face (fan triangulation)
              for (var i = 1; i < faceVerts.length - 1; i++) {
                var fv = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];

                // Get positions for this triangle
                var triPos = fv.map(function (f) {
                  if (!f.v) return [0, 0, 0];
                  var idx = f.v > 0 ? f.v - 1 : positions.length / 3 + f.v;
                  var off = idx * 3;
                  return [positions[off], positions[off + 1], positions[off + 2]];
                });

                // Get UVs for this triangle
                var triUv = fv.map(function (f) {
                  if (!f.vt) return [0, 0];
                  var idx = f.vt > 0 ? f.vt - 1 : uvs.length / 2 + f.vt;
                  var off = idx * 2;
                  return [uvs[off], uvs[off + 1]];
                });

                // Calculate face normal if vertex normals are missing
                var useFaceNormal = fv[0].vn == null && fv[1].vn == null && fv[2].vn == null;
                var faceNormal = [0, 0, 0];
                if (useFaceNormal) {
                  var e1 = vec3.sub(triPos[1], triPos[0]);
                  var e2 = vec3.sub(triPos[2], triPos[0]);
                  vec3.cross(e1, e2, faceNormal);
                  vec3.normalize(faceNormal, faceNormal);
                }

                // Add each vertex of the triangle
                for (var k = 0; k < 3; k++) {
                  currentMesh.positions.push(triPos[k][0], triPos[k][1], triPos[k][2]);
                  currentMesh.uvs.push(triUv[k][0], triUv[k][1]);
                  if (fv[k].vn != null) {
                    var idx = fv[k].vn > 0 ? fv[k].vn - 1 : normals.length / 3 + fv[k].vn;
                    var off = idx * 3;
                    currentMesh.normals.push(normals[off], normals[off + 1], normals[off + 2]);
                  } else {
                    currentMesh.normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
                  }
                }
              }
              break;
            case 'usemtl':
              // Start new mesh for new material
              if (currentMesh.positions.length > 0) {
                meshes.push(currentMesh);
              }
              currentMaterial = parts[1];
              currentMesh = {
                positions: [],
                uvs: [],
                normals: [],
                material: currentMaterial
              };
              break;
          }
        }

        // Don't forget the last mesh
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (currentMesh.positions.length > 0) {
        meshes.push(currentMesh);
      }
      return meshes;
    }

    /**
     * Parse MTL file text into material definitions
     * Supports:
     * - newmtl (new material)
     * - Ka, Kd, Ks (ambient, diffuse, specular colors)
     * - Ns (specular exponent)
     * - map_Kd (diffuse texture map)
     * 
     * @param {string} text - MTL file content
     * @returns {Object.<string, ParsedMaterial>} Material definitions keyed by name
     */
  }, {
    key: "parseMTL",
    value: function parseMTL(text) {
      var materials = {};
      var current = null;
      var lines = text.split(/\r?\n/);
      var _iterator2 = _createForOfIteratorHelper(lines),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var line = _step2.value;
          line = line.trim();
          if (!line || line.startsWith('#')) continue;
          var parts = line.split(/\s+/);
          switch (parts[0]) {
            case 'newmtl':
              current = parts[1];
              materials[current] = {
                Ka: [1, 1, 1],
                Kd: [0.8, 0.8, 0.8],
                Ks: [1, 1, 1],
                Ns: 50
              };
              break;
            case 'Ka':
            case 'Kd':
            case 'Ks':
              if (current) {
                var vals = parts.slice(1).map(parseFloat);
                materials[current][parts[0]] = vals.length === 1 ? [vals[0], vals[0], vals[0]] : vals;
              }
              break;
            case 'Ns':
              if (current) {
                materials[current].Ns = parseFloat(parts[1]);
              }
              break;
            case 'map_Kd':
              if (current) {
                // Handle paths with spaces
                materials[current].map_Kd = parts.slice(1).join(' ');
              }
              break;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return materials;
    }

    /**
     * Assign material properties to meshes
     * @param {ParsedMesh[]} meshes - Parsed meshes
     * @param {Object.<string, ParsedMaterial>} materials - Parsed materials
     * @param {Object.<string, WebGLTexture>} [textures={}] - Pre-loaded textures keyed by filename
     */
  }, {
    key: "assignMaterials",
    value: function assignMaterials(meshes, materials) {
      var textures = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var defaultMaterial = {
        Ka: [0.25, 0.25, 0.3],
        Kd: [0.75, 0.75, 0.75],
        Ks: [1, 1, 1],
        Ns: 50
      };
      meshes.forEach(function (mesh) {
        mesh.materialProps = materials[mesh.material] || defaultMaterial;

        // Look for texture
        var tex = null;
        if (mesh.materialProps.map_Kd) {
          // Extract filename from path
          var texName = mesh.materialProps.map_Kd.split('/').pop();
          tex = textures[texName] || null;
        }
        mesh.texture = tex;
        mesh.hasTexture = !!tex;
      });
    }

    /**
     * Load a texture from an image source
     * @param {string|HTMLImageElement|Blob} source - Image URL, Image element, or Blob
     * @returns {Promise<WebGLTexture>} Loaded texture
     */
  }, {
    key: "loadTexture",
    value: (function () {
      var _loadTexture = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(source) {
        var gl;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              gl = this.gl;
              return _context.a(2, new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                  var tex = gl.createTexture();
                  gl.bindTexture(gl.TEXTURE_2D, tex);
                  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

                  // Power of 2 textures get mipmaps
                  if ((img.width & img.width - 1) === 0 && (img.height & img.height - 1) === 0) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                  } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                  }
                  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

                  // Clean up blob URL if used
                  if (typeof source !== 'string' && !(source instanceof HTMLImageElement)) {
                    URL.revokeObjectURL(img.src);
                  }
                  resolve(tex);
                };
                img.onerror = function () {
                  if (typeof source !== 'string' && !(source instanceof HTMLImageElement)) {
                    URL.revokeObjectURL(img.src);
                  }
                  reject(new Error("Failed to load texture"));
                };

                // Set source
                if (typeof source === 'string') {
                  img.src = source;
                } else if (source instanceof HTMLImageElement) {
                  // Already an image
                  img.src = source.src;
                } else if (source instanceof Blob) {
                  img.src = URL.createObjectURL(source);
                }
              }));
          }
        }, _callee, this);
      }));
      function loadTexture(_x) {
        return _loadTexture.apply(this, arguments);
      }
      return loadTexture;
    }()
    /**
     * Create a 1x1 placeholder texture
     * @param {number[]} color - RGBA color [r,g,b,a] 0-255
     * @returns {WebGLTexture} Placeholder texture
     */
    )
  }, {
    key: "createPlaceholderTexture",
    value: function createPlaceholderTexture() {
      var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [128, 128, 128, 255];
      var gl = this.gl;
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(color));
      return tex;
    }

    /**
     * Initialize WebGL buffers for meshes
     * Creates VAO with position, normal, and UV buffers
     * Also creates legacy-compatible separate buffer references
     * 
     * @param {ParsedMesh[]} meshes - Parsed meshes to initialize
     */
  }, {
    key: "initBuffers",
    value: function initBuffers(meshes) {
      var gl = this.gl;
      meshes.forEach(function (mesh) {
        // Create VAO for modern WebGL2 approach
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // Position buffer (attribute 0)
        var posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // Normal buffer (attribute 1)
        var normBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        // UV buffer (attribute 2)
        var uvBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.uvs), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

        // Store references
        mesh.vao = vao;
        mesh.count = mesh.positions.length / 3;

        // Legacy compatibility - store buffer references for existing engine code
        mesh.vertexBuffer = posBuf;
        mesh.vertexBuffer.numItems = mesh.count;
        mesh.normalBuffer = normBuf;
        mesh.normalBuffer.numItems = mesh.count;
        mesh.textureBuffer = uvBuf;
        mesh.textureBuffer.numItems = mesh.count;

        // Unbind VAO
        gl.bindVertexArray(null);
      });
    }

    /**
     * Initialize buffers in legacy format for compatibility with existing engine
     * This creates buffers compatible with the existing OBJ library interface
     * 
     * @param {Object} mesh - Legacy mesh object with vertices, vertexNormals, textures arrays
     * @returns {Object} Mesh with initialized buffers
     */
  }, {
    key: "initLegacyBuffers",
    value: function initLegacyBuffers(mesh) {
      var gl = this.gl;

      // Vertex positions
      mesh.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
      mesh.vertexBuffer.itemSize = 3;
      mesh.vertexBuffer.numItems = mesh.vertices.length / 3;

      // Vertex normals
      if (mesh.vertexNormals && mesh.vertexNormals.length > 0) {
        mesh.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW);
        mesh.normalBuffer.itemSize = 3;
        mesh.normalBuffer.numItems = mesh.vertexNormals.length / 3;
      }

      // Texture coordinates
      if (mesh.textures && mesh.textures.length > 0) {
        mesh.textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.textures), gl.STATIC_DRAW);
        mesh.textureBuffer.itemSize = 2;
        mesh.textureBuffer.numItems = mesh.textures.length / 2;
      }

      // Indices
      if (mesh.indices && mesh.indices.length > 0) {
        mesh.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);
        mesh.indexBuffer.itemSize = 1;
        mesh.indexBuffer.numItems = mesh.indices.length;
      }
      return mesh;
    }

    /**
     * Calculate bounding box for a mesh
     * @param {ParsedMesh|{vertices: number[]}} mesh - Mesh with positions or vertices
     * @returns {{min: number[], max: number[], size: number[], center: number[]}}
     */
  }, {
    key: "calculateBounds",
    value: function calculateBounds(mesh) {
      var positions = mesh.positions || mesh.vertices;
      if (!positions || positions.length === 0) {
        return {
          min: [0, 0, 0],
          max: [0, 0, 0],
          size: [0, 0, 0],
          center: [0, 0, 0]
        };
      }
      var minX = Infinity,
        maxX = -Infinity;
      var minY = Infinity,
        maxY = -Infinity;
      var minZ = Infinity,
        maxZ = -Infinity;
      for (var i = 0; i < positions.length; i += 3) {
        var x = positions[i];
        var y = positions[i + 1];
        var z = positions[i + 2];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }
      return {
        min: [minX, minY, minZ],
        max: [maxX, maxY, maxZ],
        size: [maxX - minX, maxY - minY, maxZ - minZ],
        center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2]
      };
    }

    /**
     * Clean up WebGL resources for meshes
     * @param {ParsedMesh[]} meshes - Meshes to clean up
     */
  }, {
    key: "deleteMeshBuffers",
    value: function deleteMeshBuffers(meshes) {
      var gl = this.gl;
      meshes.forEach(function (mesh) {
        if (mesh.vao) gl.deleteVertexArray(mesh.vao);
        if (mesh.vertexBuffer) gl.deleteBuffer(mesh.vertexBuffer);
        if (mesh.normalBuffer) gl.deleteBuffer(mesh.normalBuffer);
        if (mesh.textureBuffer) gl.deleteBuffer(mesh.textureBuffer);
        if (mesh.texture) gl.deleteTexture(mesh.texture);
      });
    }
  }]);
}(); // Export vec3 utilities for external use