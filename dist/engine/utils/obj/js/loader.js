"use strict"; // This is not a full .obj parser.
// see http://paulbourke.net/dataformats/obj/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeIndexedIndicesFn = makeIndexedIndicesFn;
exports.parseMTL = parseMTL;
exports.parseMapArgs = parseMapArgs;
exports.parseOBJ = parseOBJ;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function parseOBJ(text) {
  // because indices are base 1 let's just fill in the 0th data
  var objPositions = [[0, 0, 0]];
  var objTexcoords = [[0, 0]];
  var objNormals = [[0, 0, 0]];
  var objColors = [[0, 0, 0]]; // same order as `f` indices

  var objVertexData = [objPositions, objTexcoords, objNormals, objColors]; // same order as `f` indices

  var webglVertexData = [[], // positions
  [], // texcoords
  [], // normals
  [] // colors
  ];
  var materialLibs = [];
  var geometries = [];
  var geometry;
  var groups = ['default'];
  var material = 'default';
  var object = 'default';

  var noop = function noop() {};

  function newGeometry() {
    // If there is an existing geometry and it's
    // not empty then start a new one.
    if (geometry && geometry.data.position.length) {
      geometry = undefined;
    }
  }

  function setGeometry() {
    if (!geometry) {
      var position = [];
      var texcoord = [];
      var normal = [];
      var color = [];
      webglVertexData = [position, texcoord, normal, color];
      geometry = {
        object: object,
        groups: groups,
        material: material,
        data: {
          position: position,
          texcoord: texcoord,
          normal: normal,
          color: color
        }
      };
      geometries.push(geometry);
    }
  }

  function addVertex(vert) {
    var ptn = vert.split('/');
    ptn.forEach(function (objIndexStr, i) {
      var _webglVertexData$i;

      if (!objIndexStr) {
        return;
      }

      var objIndex = parseInt(objIndexStr);
      var index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);

      (_webglVertexData$i = webglVertexData[i]).push.apply(_webglVertexData$i, _toConsumableArray(objVertexData[i][index])); // if this is the position index (index 0) and we parsed
      // vertex colors then copy the vertex colors to the webgl vertex color data


      if (i === 0 && objColors.length > 1) {
        var _geometry$data$color;

        (_geometry$data$color = geometry.data.color).push.apply(_geometry$data$color, _toConsumableArray(objColors[index]));
      }
    });
  }

  var keywords = {
    v: function v(parts) {
      // if there are more than 3 values here they are vertex colors
      if (parts.length > 3) {
        objPositions.push(parts.slice(0, 3).map(parseFloat));
        objColors.push(parts.slice(3).map(parseFloat));
      } else {
        objPositions.push(parts.map(parseFloat));
      }
    },
    vn: function vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt: function vt(parts) {
      // should check for missing v and extra w?
      objTexcoords.push(parts.map(parseFloat));
    },
    f: function f(parts) {
      setGeometry();
      var numTriangles = parts.length - 2;

      for (var tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
    s: noop,
    // smoothing group
    mtllib: function mtllib(parts, unparsedArgs) {
      // the spec says there can be multiple filenames here
      // but many exist with spaces in a single filename
      materialLibs.push(unparsedArgs);
    },
    usemtl: function usemtl(parts, unparsedArgs) {
      material = unparsedArgs;
      newGeometry();
    },
    g: function g(parts) {
      groups = parts;
      newGeometry();
    },
    o: function o(parts, unparsedArgs) {
      object = unparsedArgs;
      newGeometry();
    }
  };
  var keywordRE = /(\w*)(?: )*(.*)/;
  var lines = text.split('\n');

  for (var lineNo = 0; lineNo < lines.length; ++lineNo) {
    var line = lines[lineNo].trim();

    if (line === '' || line.startsWith('#')) {
      continue;
    }

    var m = keywordRE.exec(line);

    if (!m) {
      continue;
    }

    var _m = _slicedToArray(m, 3),
        keyword = _m[1],
        unparsedArgs = _m[2];

    var parts = line.split(/\s+/).slice(1);
    var handler = keywords[keyword];

    if (!handler) {
      console.warn('unhandled keyword:', keyword); // eslint-disable-line no-console

      continue;
    }

    handler(parts, unparsedArgs);
  } // remove any arrays that have no entries.


  for (var _i2 = 0, _geometries = geometries; _i2 < _geometries.length; _i2++) {
    var _geometry = _geometries[_i2];
    _geometry.data = Object.fromEntries(Object.entries(_geometry.data).filter(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          array = _ref2[1];

      return array.length > 0;
    }));
  }

  return {
    geometries: geometries,
    materialLibs: materialLibs
  };
}

function parseMapArgs(unparsedArgs) {
  // TODO: handle options
  return unparsedArgs;
}

function parseMTL(text) {
  var materials = {};
  var material;
  var keywords = {
    newmtl: function newmtl(parts, unparsedArgs) {
      material = {};
      materials[unparsedArgs] = material;
    },

    /* eslint brace-style:0 */
    Ns: function Ns(parts) {
      material.shininess = parseFloat(parts[0]);
    },
    Ka: function Ka(parts) {
      material.ambient = parts.map(parseFloat);
    },
    Kd: function Kd(parts) {
      material.diffuse = parts.map(parseFloat);
    },
    Ks: function Ks(parts) {
      material.specular = parts.map(parseFloat);
    },
    Ke: function Ke(parts) {
      material.emissive = parts.map(parseFloat);
    },
    map_Kd: function map_Kd(parts, unparsedArgs) {
      material.diffuseMap = parseMapArgs(unparsedArgs);
    },
    map_Ns: function map_Ns(parts, unparsedArgs) {
      material.specularMap = parseMapArgs(unparsedArgs);
    },
    map_Bump: function map_Bump(parts, unparsedArgs) {
      material.normalMap = parseMapArgs(unparsedArgs);
    },
    Ni: function Ni(parts) {
      material.opticalDensity = parseFloat(parts[0]);
    },
    d: function d(parts) {
      material.opacity = parseFloat(parts[0]);
    },
    illum: function illum(parts) {
      material.illum = parseInt(parts[0]);
    }
  };
  var keywordRE = /(\w*)(?: )*(.*)/;
  var lines = text.split('\n');

  for (var lineNo = 0; lineNo < lines.length; ++lineNo) {
    var line = lines[lineNo].trim();

    if (line === '' || line.startsWith('#')) {
      continue;
    }

    var m = keywordRE.exec(line);

    if (!m) {
      continue;
    }

    var _m2 = _slicedToArray(m, 3),
        keyword = _m2[1],
        unparsedArgs = _m2[2];

    var parts = line.split(/\s+/).slice(1);
    var handler = keywords[keyword];

    if (!handler) {
      console.warn('unhandled keyword:', keyword); // eslint-disable-line no-console

      continue;
    }

    handler(parts, unparsedArgs);
  }

  return materials;
}

function makeIndexedIndicesFn(arrays) {
  var indices = arrays.indices;
  var ndx = 0;

  var fn = function fn() {
    return indices[ndx++];
  };

  fn.reset = function () {
    ndx = 0;
  };

  fn.numElements = indices.length;
  return fn;
}