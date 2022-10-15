"use strict";

var __extends = void 0 && (void 0).__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __values = void 0 && (void 0).__values || function (o) {
  var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function next() {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};

exports.__esModule = true;
exports.Layout = exports.Attribute = exports.DuplicateAttributeException = exports.TYPES = void 0;
var TYPES;

(function (TYPES) {
  TYPES["BYTE"] = "BYTE";
  TYPES["UNSIGNED_BYTE"] = "UNSIGNED_BYTE";
  TYPES["SHORT"] = "SHORT";
  TYPES["UNSIGNED_SHORT"] = "UNSIGNED_SHORT";
  TYPES["FLOAT"] = "FLOAT";
})(TYPES = exports.TYPES || (exports.TYPES = {}));
/**
 * An exception for when two or more of the same attributes are found in the
 * same layout.
 * @private
 */


var DuplicateAttributeException =
/** @class */
function (_super) {
  __extends(DuplicateAttributeException, _super);
  /**
   * Create a DuplicateAttributeException
   * @param {Attribute} attribute - The attribute that was found more than
   *        once in the {@link Layout}
   */


  function DuplicateAttributeException(attribute) {
    return _super.call(this, "found duplicate attribute: ".concat(attribute.key)) || this;
  }

  return DuplicateAttributeException;
}(Error);

exports.DuplicateAttributeException = DuplicateAttributeException;
/**
 * Represents how a vertex attribute should be packed into an buffer.
 * @private
 */

var Attribute =
/** @class */
function () {
  /**
   * Create an attribute. Do not call this directly, use the predefined
   * constants.
   * @param {string} key - The name of this attribute as if it were a key in
   *        an Object. Use the camel case version of the upper snake case
   *        const name.
   * @param {number} size - The number of components per vertex attribute.
   *        Must be 1, 2, 3, or 4.
   * @param {string} type - The data type of each component for this
   *        attribute. Possible values:<br/>
   *        "BYTE": signed 8-bit integer, with values in [-128, 127]<br/>
   *        "SHORT": signed 16-bit integer, with values in
   *            [-32768, 32767]<br/>
   *        "UNSIGNED_BYTE": unsigned 8-bit integer, with values in
   *            [0, 255]<br/>
   *        "UNSIGNED_SHORT": unsigned 16-bit integer, with values in
   *            [0, 65535]<br/>
   *        "FLOAT": 32-bit floating point number
   * @param {boolean} normalized - Whether integer data values should be
   *        normalized when being casted to a float.<br/>
   *        If true, signed integers are normalized to [-1, 1].<br/>
   *        If true, unsigned integers are normalized to [0, 1].<br/>
   *        For type "FLOAT", this parameter has no effect.
   */
  function Attribute(key, size, type, normalized) {
    if (normalized === void 0) {
      normalized = false;
    }

    this.key = key;
    this.size = size;
    this.type = type;
    this.normalized = normalized;

    switch (type) {
      case "BYTE":
      case "UNSIGNED_BYTE":
        this.sizeOfType = 1;
        break;

      case "SHORT":
      case "UNSIGNED_SHORT":
        this.sizeOfType = 2;
        break;

      case "FLOAT":
        this.sizeOfType = 4;
        break;

      default:
        throw new Error("Unknown gl type: ".concat(type));
    }

    this.sizeInBytes = this.sizeOfType * size;
  }

  return Attribute;
}();

exports.Attribute = Attribute;
/**
 * A class to represent the memory layout for a vertex attribute array. Used by
 * {@link Mesh}'s TBD(...) method to generate a packed array from mesh data.
 * <p>
 * Layout can sort of be thought of as a C-style struct declaration.
 * {@link Mesh}'s TBD(...) method will use the {@link Layout} instance to
 * pack an array in the given attribute order.
 * <p>
 * Layout also is very helpful when calling a WebGL context's
 * <code>vertexAttribPointer</code> method. If you've created a buffer using
 * a Layout instance, then the same Layout instance can be used to determine
 * the size, type, normalized, stride, and offset parameters for
 * <code>vertexAttribPointer</code>.
 * <p>
 * For example:
 * <pre><code>
 *
 * const index = glctx.getAttribLocation(shaderProgram, "pos");
 * glctx.vertexAttribPointer(
 *   layout.position.size,
 *   glctx[layout.position.type],
 *   layout.position.normalized,
 *   layout.position.stride,
 *   layout.position.offset);
 * </code></pre>
 * @see {@link Mesh}
 */

var Layout =
/** @class */
function () {
  /**
   * Create a Layout object. This constructor will throw if any duplicate
   * attributes are given.
   * @param {Array} ...attributes - An ordered list of attributes that
   *        describe the desired memory layout for each vertex attribute.
   *        <p>
   *
   * @see {@link Mesh}
   */
  function Layout() {
    var e_1, _a, e_2, _b;

    var attributes = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      attributes[_i] = arguments[_i];
    }

    this.attributes = attributes;
    this.attributeMap = {};
    var offset = 0;
    var maxStrideMultiple = 0;

    try {
      for (var attributes_1 = __values(attributes), attributes_1_1 = attributes_1.next(); !attributes_1_1.done; attributes_1_1 = attributes_1.next()) {
        var attribute = attributes_1_1.value;

        if (this.attributeMap[attribute.key]) {
          throw new DuplicateAttributeException(attribute);
        } // Add padding to satisfy WebGL's requirement that all
        // vertexAttribPointer calls have an offset that is a multiple of
        // the type size.


        if (offset % attribute.sizeOfType !== 0) {
          offset += attribute.sizeOfType - offset % attribute.sizeOfType;
          console.warn("Layout requires padding before " + attribute.key + " attribute");
        }

        this.attributeMap[attribute.key] = {
          attribute: attribute,
          size: attribute.size,
          type: attribute.type,
          normalized: attribute.normalized,
          offset: offset
        };
        offset += attribute.sizeInBytes;
        maxStrideMultiple = Math.max(maxStrideMultiple, attribute.sizeOfType);
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (attributes_1_1 && !attributes_1_1.done && (_a = attributes_1["return"])) _a.call(attributes_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    } // Add padding to the end to satisfy WebGL's requirement that all
    // vertexAttribPointer calls have a stride that is a multiple of the
    // type size. Because we're putting differently sized attributes into
    // the same buffer, it must be padded to a multiple of the largest
    // type size.


    if (offset % maxStrideMultiple !== 0) {
      offset += maxStrideMultiple - offset % maxStrideMultiple;
      console.warn("Layout requires padding at the back");
    }

    this.stride = offset;

    try {
      for (var attributes_2 = __values(attributes), attributes_2_1 = attributes_2.next(); !attributes_2_1.done; attributes_2_1 = attributes_2.next()) {
        var attribute = attributes_2_1.value;
        this.attributeMap[attribute.key].stride = this.stride;
      }
    } catch (e_2_1) {
      e_2 = {
        error: e_2_1
      };
    } finally {
      try {
        if (attributes_2_1 && !attributes_2_1.done && (_b = attributes_2["return"])) _b.call(attributes_2);
      } finally {
        if (e_2) throw e_2.error;
      }
    }
  } // Geometry attributes

  /**
   * Attribute layout to pack a vertex's x, y, & z as floats
   *
   * @see {@link Layout}
   */


  Layout.POSITION = new Attribute("position", 3, TYPES.FLOAT);
  /**
   * Attribute layout to pack a vertex's normal's x, y, & z as floats
   *
   * @see {@link Layout}
   */

  Layout.NORMAL = new Attribute("normal", 3, TYPES.FLOAT);
  /**
   * Attribute layout to pack a vertex's normal's x, y, & z as floats.
   * <p>
   * This value will be computed on-the-fly based on the texture coordinates.
   * If no texture coordinates are available, the generated value will default to
   * 0, 0, 0.
   *
   * @see {@link Layout}
   */

  Layout.TANGENT = new Attribute("tangent", 3, TYPES.FLOAT);
  /**
   * Attribute layout to pack a vertex's normal's bitangent x, y, & z as floats.
   * <p>
   * This value will be computed on-the-fly based on the texture coordinates.
   * If no texture coordinates are available, the generated value will default to
   * 0, 0, 0.
   * @see {@link Layout}
   */

  Layout.BITANGENT = new Attribute("bitangent", 3, TYPES.FLOAT);
  /**
   * Attribute layout to pack a vertex's texture coordinates' u & v as floats
   *
   * @see {@link Layout}
   */

  Layout.UV = new Attribute("uv", 2, TYPES.FLOAT); // Material attributes

  /**
   * Attribute layout to pack an unsigned short to be interpreted as a the index
   * into a {@link Mesh}'s materials list.
   * <p>
   * The intention of this value is to send all of the {@link Mesh}'s materials
   * into multiple shader uniforms and then reference the current one by this
   * vertex attribute.
   * <p>
   * example glsl code:
   *
   * <pre><code>
   *  // this is bound using MATERIAL_INDEX
   *  attribute int materialIndex;
   *
   *  struct Material {
   *    vec3 diffuse;
   *    vec3 specular;
   *    vec3 specularExponent;
   *  };
   *
   *  uniform Material materials[MAX_MATERIALS];
   *
   *  // ...
   *
   *  vec3 diffuse = materials[materialIndex];
   *
   * </code></pre>
   * TODO: More description & test to make sure subscripting by attributes even
   * works for webgl
   *
   * @see {@link Layout}
   */

  Layout.MATERIAL_INDEX = new Attribute("materialIndex", 1, TYPES.SHORT);
  Layout.MATERIAL_ENABLED = new Attribute("materialEnabled", 1, TYPES.UNSIGNED_SHORT);
  Layout.AMBIENT = new Attribute("ambient", 3, TYPES.FLOAT);
  Layout.DIFFUSE = new Attribute("diffuse", 3, TYPES.FLOAT);
  Layout.SPECULAR = new Attribute("specular", 3, TYPES.FLOAT);
  Layout.SPECULAR_EXPONENT = new Attribute("specularExponent", 3, TYPES.FLOAT);
  Layout.EMISSIVE = new Attribute("emissive", 3, TYPES.FLOAT);
  Layout.TRANSMISSION_FILTER = new Attribute("transmissionFilter", 3, TYPES.FLOAT);
  Layout.DISSOLVE = new Attribute("dissolve", 1, TYPES.FLOAT);
  Layout.ILLUMINATION = new Attribute("illumination", 1, TYPES.UNSIGNED_SHORT);
  Layout.REFRACTION_INDEX = new Attribute("refractionIndex", 1, TYPES.FLOAT);
  Layout.SHARPNESS = new Attribute("sharpness", 1, TYPES.FLOAT);
  Layout.MAP_DIFFUSE = new Attribute("mapDiffuse", 1, TYPES.SHORT);
  Layout.MAP_AMBIENT = new Attribute("mapAmbient", 1, TYPES.SHORT);
  Layout.MAP_SPECULAR = new Attribute("mapSpecular", 1, TYPES.SHORT);
  Layout.MAP_SPECULAR_EXPONENT = new Attribute("mapSpecularExponent", 1, TYPES.SHORT);
  Layout.MAP_DISSOLVE = new Attribute("mapDissolve", 1, TYPES.SHORT);
  Layout.ANTI_ALIASING = new Attribute("antiAliasing", 1, TYPES.UNSIGNED_SHORT);
  Layout.MAP_BUMP = new Attribute("mapBump", 1, TYPES.SHORT);
  Layout.MAP_DISPLACEMENT = new Attribute("mapDisplacement", 1, TYPES.SHORT);
  Layout.MAP_DECAL = new Attribute("mapDecal", 1, TYPES.SHORT);
  Layout.MAP_EMISSIVE = new Attribute("mapEmissive", 1, TYPES.SHORT);
  return Layout;
}();

exports.Layout = Layout;