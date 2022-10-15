"use strict";

var __read = void 0 && (void 0).__read || function (o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
      ar.push(r.value);
    }
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
};

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
exports.MaterialLibrary = exports.Material = void 0;
/**
 * The Material class.
 */

var Material =
/** @class */
function () {
  function Material(name) {
    this.name = name;
    /**
     * Constructor
     * @param {String} name the unique name of the material
     */
    // The values for the following attibutes
    // are an array of R, G, B normalized values.
    // Ka - Ambient Reflectivity

    this.ambient = [0, 0, 0]; // Kd - Defuse Reflectivity

    this.diffuse = [0, 0, 0]; // Ks

    this.specular = [0, 0, 0]; // Ke

    this.emissive = [0, 0, 0]; // Tf

    this.transmissionFilter = [0, 0, 0]; // d

    this.dissolve = 0; // valid range is between 0 and 1000

    this.specularExponent = 0; // either d or Tr; valid values are normalized

    this.transparency = 0; // illum - the enum of the illumination model to use

    this.illumination = 0; // Ni - Set to "normal" (air).

    this.refractionIndex = 1; // sharpness

    this.sharpness = 0; // map_Kd

    this.mapDiffuse = emptyTextureOptions(); // map_Ka

    this.mapAmbient = emptyTextureOptions(); // map_Ks

    this.mapSpecular = emptyTextureOptions(); // map_Ns

    this.mapSpecularExponent = emptyTextureOptions(); // map_d

    this.mapDissolve = emptyTextureOptions(); // map_aat

    this.antiAliasing = false; // map_bump or bump

    this.mapBump = emptyTextureOptions(); // disp

    this.mapDisplacement = emptyTextureOptions(); // decal

    this.mapDecal = emptyTextureOptions(); // map_Ke

    this.mapEmissive = emptyTextureOptions(); // refl - when the reflection type is a cube, there will be multiple refl
    //        statements for each side of the cube. If it's a spherical
    //        reflection, there should only ever be one.

    this.mapReflections = [];
  }

  return Material;
}();

exports.Material = Material;
var SENTINEL_MATERIAL = new Material("sentinel");
/**
 * https://en.wikipedia.org/wiki/Wavefront_.obj_file
 * http://paulbourke.net/dataformats/mtl/
 */

var MaterialLibrary =
/** @class */
function () {
  function MaterialLibrary(data) {
    this.data = data;
    /**
     * Constructs the Material Parser
     * @param mtlData the MTL file contents
     */

    this.currentMaterial = SENTINEL_MATERIAL;
    this.materials = {};
    this.parse();
  }
  /* eslint-disable camelcase */

  /* the function names here disobey camelCase conventions
     to make parsing/routing easier. see the parse function
     documentation for more information. */

  /**
   * Creates a new Material object and adds to the registry.
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_newmtl = function (tokens) {
    var name = tokens[0]; // console.info('Parsing new Material:', name);

    this.currentMaterial = new Material(name);
    this.materials[name] = this.currentMaterial;
  };
  /**
   * See the documenation for parse_Ka below for a better understanding.
   *
   * Given a list of possible color tokens, returns an array of R, G, and B
   * color values.
   *
   * @param tokens the tokens associated with the directive
   * @return {*} a 3 element array containing the R, G, and B values
   * of the color.
   */


  MaterialLibrary.prototype.parseColor = function (tokens) {
    if (tokens[0] == "spectral") {
      throw new Error("The MTL parser does not support spectral curve files. You will " + "need to convert the MTL colors to either RGB or CIEXYZ.");
    }

    if (tokens[0] == "xyz") {
      throw new Error("The MTL parser does not currently support XYZ colors. Either convert the " + "XYZ values to RGB or create an issue to add support for XYZ");
    } // from my understanding of the spec, RGB values at this point
    // will either be 3 floats or exactly 1 float, so that's the check
    // that i'm going to perform here


    if (tokens.length == 3) {
      var _a = __read(tokens, 3),
          x = _a[0],
          y = _a[1],
          z = _a[2];

      return [parseFloat(x), parseFloat(y), parseFloat(z)];
    } // Since tokens at this point has a length of 3, we're going to assume
    // it's exactly 1, skipping the check for 2.


    var value = parseFloat(tokens[0]); // in this case, all values are equivalent

    return [value, value, value];
  };
  /**
   * Parse the ambient reflectivity
   *
   * A Ka directive can take one of three forms:
   *   - Ka r g b
   *   - Ka spectral file.rfl
   *   - Ka xyz x y z
   * These three forms are mutually exclusive in that only one
   * declaration can exist per material. It is considered a syntax
   * error otherwise.
   *
   * The "Ka" form specifies the ambient reflectivity using RGB values.
   * The "g" and "b" values are optional. If only the "r" value is
   * specified, then the "g" and "b" values are assigned the value of
   * "r". Values are normally in the range 0.0 to 1.0. Values outside
   * of this range increase or decrease the reflectivity accordingly.
   *
   * The "Ka spectral" form specifies the ambient reflectivity using a
   * spectral curve. "file.rfl" is the name of the ".rfl" file containing
   * the curve data. "factor" is an optional argument which is a multiplier
   * for the values in the .rfl file and defaults to 1.0 if not specified.
   *
   * The "Ka xyz" form specifies the ambient reflectivity using CIEXYZ values.
   * "x y z" are the values of the CIEXYZ color space. The "y" and "z" arguments
   * are optional and take on the value of the "x" component if only "x" is
   * specified. The "x y z" values are normally in the range of 0.0 to 1.0 and
   * increase or decrease ambient reflectivity accordingly outside of that
   * range.
   *
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_Ka = function (tokens) {
    this.currentMaterial.ambient = this.parseColor(tokens);
  };
  /**
   * Diffuse Reflectivity
   *
   * Similar to the Ka directive. Simply replace "Ka" with "Kd" and the rules
   * are the same
   *
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_Kd = function (tokens) {
    this.currentMaterial.diffuse = this.parseColor(tokens);
  };
  /**
   * Spectral Reflectivity
   *
   * Similar to the Ka directive. Simply replace "Ks" with "Kd" and the rules
   * are the same
   *
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_Ks = function (tokens) {
    this.currentMaterial.specular = this.parseColor(tokens);
  };
  /**
   * Emissive
   *
   * The amount and color of light emitted by the object.
   *
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_Ke = function (tokens) {
    this.currentMaterial.emissive = this.parseColor(tokens);
  };
  /**
   * Transmission Filter
   *
   * Any light passing through the object is filtered by the transmission
   * filter, which only allows specific colors to pass through. For example, Tf
   * 0 1 0 allows all of the green to pass through and filters out all of the
   * red and blue.
   *
   * Similar to the Ka directive. Simply replace "Ks" with "Tf" and the rules
   * are the same
   *
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_Tf = function (tokens) {
    this.currentMaterial.transmissionFilter = this.parseColor(tokens);
  };
  /**
   * Specifies the dissolve for the current material.
   *
   * Statement: d [-halo] `factor`
   *
   * Example: "d 0.5"
   *
   * The factor is the amount this material dissolves into the background. A
   * factor of 1.0 is fully opaque. This is the default when a new material is
   * created. A factor of 0.0 is fully dissolved (completely transparent).
   *
   * Unlike a real transparent material, the dissolve does not depend upon
   * material thickness nor does it have any spectral character. Dissolve works
   * on all illumination models.
   *
   * The dissolve statement allows for an optional "-halo" flag which indicates
   * that a dissolve is dependent on the surface orientation relative to the
   * viewer. For example, a sphere with the following dissolve, "d -halo 0.0",
   * will be fully dissolved at its center and will appear gradually more opaque
   * toward its edge.
   *
   * "factor" is the minimum amount of dissolve applied to the material. The
   * amount of dissolve will vary between 1.0 (fully opaque) and the specified
   * "factor". The formula is:
   *
   *    dissolve = 1.0 - (N*v)(1.0-factor)
   *
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_d = function (tokens) {
    // this ignores the -halo option as I can't find any documentation on what
    // it's supposed to be.
    this.currentMaterial.dissolve = parseFloat(tokens.pop() || "0");
  };
  /**
   * The "illum" statement specifies the illumination model to use in the
   * material. Illumination models are mathematical equations that represent
   * various material lighting and shading effects.
   *
   * The illumination number can be a number from 0 to 10. The following are
   * the list of illumination enumerations and their summaries:
   * 0. Color on and Ambient off
   * 1. Color on and Ambient on
   * 2. Highlight on
   * 3. Reflection on and Ray trace on
   * 4. Transparency: Glass on, Reflection: Ray trace on
   * 5. Reflection: Fresnel on and Ray trace on
   * 6. Transparency: Refraction on, Reflection: Fresnel off and Ray trace on
   * 7. Transparency: Refraction on, Reflection: Fresnel on and Ray trace on
   * 8. Reflection on and Ray trace off
   * 9. Transparency: Glass on, Reflection: Ray trace off
   * 10. Casts shadows onto invisible surfaces
   *
   * Example: "illum 2" to specify the "Highlight on" model
   *
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_illum = function (tokens) {
    this.currentMaterial.illumination = parseInt(tokens[0]);
  };
  /**
   * Optical Density (AKA Index of Refraction)
   *
   * Statement: Ni `index`
   *
   * Example: Ni 1.0
   *
   * Specifies the optical density for the surface. `index` is the value
   * for the optical density. The values can range from 0.001 to 10.  A value of
   * 1.0 means that light does not bend as it passes through an object.
   * Increasing the optical_density increases the amount of bending. Glass has
   * an index of refraction of about 1.5. Values of less than 1.0 produce
   * bizarre results and are not recommended
   *
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_Ni = function (tokens) {
    this.currentMaterial.refractionIndex = parseFloat(tokens[0]);
  };
  /**
   * Specifies the specular exponent for the current material. This defines the
   * focus of the specular highlight.
   *
   * Statement: Ns `exponent`
   *
   * Example: "Ns 250"
   *
   * `exponent` is the value for the specular exponent. A high exponent results
   * in a tight, concentrated highlight. Ns Values normally range from 0 to
   * 1000.
   *
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_Ns = function (tokens) {
    this.currentMaterial.specularExponent = parseInt(tokens[0]);
  };
  /**
   * Specifies the sharpness of the reflections from the local reflection map.
   *
   * Statement: sharpness `value`
   *
   * Example: "sharpness 100"
   *
   * If a material does not have a local reflection map defined in its material
   * defintions, sharpness will apply to the global reflection map defined in
   * PreView.
   *
   * `value` can be a number from 0 to 1000. The default is 60. A high value
   * results in a clear reflection of objects in the reflection map.
   *
   * Tip: sharpness values greater than 100 introduce aliasing effects in
   * flat surfaces that are viewed at a sharp angle.
   *
   * @param tokens the tokens associated with the directive
   */


  MaterialLibrary.prototype.parse_sharpness = function (tokens) {
    this.currentMaterial.sharpness = parseInt(tokens[0]);
  };
  /**
   * Parses the -cc flag and updates the options object with the values.
   *
   * @param values the values passed to the -cc flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_cc = function (values, options) {
    options.colorCorrection = values[0] == "on";
  };
  /**
   * Parses the -blendu flag and updates the options object with the values.
   *
   * @param values the values passed to the -blendu flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_blendu = function (values, options) {
    options.horizontalBlending = values[0] == "on";
  };
  /**
   * Parses the -blendv flag and updates the options object with the values.
   *
   * @param values the values passed to the -blendv flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_blendv = function (values, options) {
    options.verticalBlending = values[0] == "on";
  };
  /**
   * Parses the -boost flag and updates the options object with the values.
   *
   * @param values the values passed to the -boost flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_boost = function (values, options) {
    options.boostMipMapSharpness = parseFloat(values[0]);
  };
  /**
   * Parses the -mm flag and updates the options object with the values.
   *
   * @param values the values passed to the -mm flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_mm = function (values, options) {
    options.modifyTextureMap.brightness = parseFloat(values[0]);
    options.modifyTextureMap.contrast = parseFloat(values[1]);
  };
  /**
   * Parses and sets the -o, -s, and -t  u, v, and w values
   *
   * @param values the values passed to the -o, -s, -t flag
   * @param {Object} option the Object of either the -o, -s, -t option
   * @param {Integer} defaultValue the Object of all image options
   */


  MaterialLibrary.prototype.parse_ost = function (values, option, defaultValue) {
    while (values.length < 3) {
      values.push(defaultValue.toString());
    }

    option.u = parseFloat(values[0]);
    option.v = parseFloat(values[1]);
    option.w = parseFloat(values[2]);
  };
  /**
   * Parses the -o flag and updates the options object with the values.
   *
   * @param values the values passed to the -o flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_o = function (values, options) {
    this.parse_ost(values, options.offset, 0);
  };
  /**
   * Parses the -s flag and updates the options object with the values.
   *
   * @param values the values passed to the -s flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_s = function (values, options) {
    this.parse_ost(values, options.scale, 1);
  };
  /**
   * Parses the -t flag and updates the options object with the values.
   *
   * @param values the values passed to the -t flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_t = function (values, options) {
    this.parse_ost(values, options.turbulence, 0);
  };
  /**
   * Parses the -texres flag and updates the options object with the values.
   *
   * @param values the values passed to the -texres flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_texres = function (values, options) {
    options.textureResolution = parseFloat(values[0]);
  };
  /**
   * Parses the -clamp flag and updates the options object with the values.
   *
   * @param values the values passed to the -clamp flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_clamp = function (values, options) {
    options.clamp = values[0] == "on";
  };
  /**
   * Parses the -bm flag and updates the options object with the values.
   *
   * @param values the values passed to the -bm flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_bm = function (values, options) {
    options.bumpMultiplier = parseFloat(values[0]);
  };
  /**
   * Parses the -imfchan flag and updates the options object with the values.
   *
   * @param values the values passed to the -imfchan flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_imfchan = function (values, options) {
    options.imfChan = values[0];
  };
  /**
   * This only exists for relection maps and denotes the type of reflection.
   *
   * @param values the values passed to the -type flag
   * @param options the Object of all image options
   */


  MaterialLibrary.prototype.parse_type = function (values, options) {
    options.reflectionType = values[0];
  };
  /**
   * Parses the texture's options and returns an options object with the info
   *
   * @param tokens all of the option tokens to pass to the texture
   * @return {Object} a complete object of objects to apply to the texture
   */


  MaterialLibrary.prototype.parseOptions = function (tokens) {
    var options = emptyTextureOptions();
    var option;
    var values;
    var optionsToValues = {};
    tokens.reverse();

    while (tokens.length) {
      // token is guaranteed to exists here, hence the explicit "as"
      var token = tokens.pop();

      if (token.startsWith("-")) {
        option = token.substr(1);
        optionsToValues[option] = [];
      } else if (option) {
        optionsToValues[option].push(token);
      }
    }

    for (option in optionsToValues) {
      if (!optionsToValues.hasOwnProperty(option)) {
        continue;
      }

      values = optionsToValues[option];
      var optionMethod = this["parse_".concat(option)];

      if (optionMethod) {
        optionMethod.bind(this)(values, options);
      }
    }

    return options;
  };
  /**
   * Parses the given texture map line.
   *
   * @param tokens all of the tokens representing the texture
   * @return a complete object of objects to apply to the texture
   */


  MaterialLibrary.prototype.parseMap = function (tokens) {
    var _a; // according to wikipedia:
    // (https://en.wikipedia.org/wiki/Wavefront_.obj_file#Vendor_specific_alterations)
    // there is at least one vendor that places the filename before the options
    // rather than after (which is to spec). All options start with a '-'
    // so if the first token doesn't start with a '-', we're going to assume
    // it's the name of the map file.


    var optionsString;
    var filename = "";

    if (!tokens[0].startsWith("-")) {
      _a = __read(tokens), filename = _a[0], optionsString = _a.slice(1);
    } else {
      filename = tokens.pop();
      optionsString = tokens;
    }

    var options = this.parseOptions(optionsString);
    options.filename = filename.replace(/\\/g, "/");
    return options;
  };
  /**
   * Parses the ambient map.
   *
   * @param tokens list of tokens for the map_Ka direcive
   */


  MaterialLibrary.prototype.parse_map_Ka = function (tokens) {
    this.currentMaterial.mapAmbient = this.parseMap(tokens);
  };
  /**
   * Parses the diffuse map.
   *
   * @param tokens list of tokens for the map_Kd direcive
   */


  MaterialLibrary.prototype.parse_map_Kd = function (tokens) {
    this.currentMaterial.mapDiffuse = this.parseMap(tokens);
  };
  /**
   * Parses the specular map.
   *
   * @param tokens list of tokens for the map_Ks direcive
   */


  MaterialLibrary.prototype.parse_map_Ks = function (tokens) {
    this.currentMaterial.mapSpecular = this.parseMap(tokens);
  };
  /**
   * Parses the emissive map.
   *
   * @param tokens list of tokens for the map_Ke direcive
   */


  MaterialLibrary.prototype.parse_map_Ke = function (tokens) {
    this.currentMaterial.mapEmissive = this.parseMap(tokens);
  };
  /**
   * Parses the specular exponent map.
   *
   * @param tokens list of tokens for the map_Ns direcive
   */


  MaterialLibrary.prototype.parse_map_Ns = function (tokens) {
    this.currentMaterial.mapSpecularExponent = this.parseMap(tokens);
  };
  /**
   * Parses the dissolve map.
   *
   * @param tokens list of tokens for the map_d direcive
   */


  MaterialLibrary.prototype.parse_map_d = function (tokens) {
    this.currentMaterial.mapDissolve = this.parseMap(tokens);
  };
  /**
   * Parses the anti-aliasing option.
   *
   * @param tokens list of tokens for the map_aat direcive
   */


  MaterialLibrary.prototype.parse_map_aat = function (tokens) {
    this.currentMaterial.antiAliasing = tokens[0] == "on";
  };
  /**
   * Parses the bump map.
   *
   * @param tokens list of tokens for the map_bump direcive
   */


  MaterialLibrary.prototype.parse_map_bump = function (tokens) {
    this.currentMaterial.mapBump = this.parseMap(tokens);
  };
  /**
   * Parses the bump map.
   *
   * @param tokens list of tokens for the bump direcive
   */


  MaterialLibrary.prototype.parse_bump = function (tokens) {
    this.parse_map_bump(tokens);
  };
  /**
   * Parses the disp map.
   *
   * @param tokens list of tokens for the disp direcive
   */


  MaterialLibrary.prototype.parse_disp = function (tokens) {
    this.currentMaterial.mapDisplacement = this.parseMap(tokens);
  };
  /**
   * Parses the decal map.
   *
   * @param tokens list of tokens for the map_decal direcive
   */


  MaterialLibrary.prototype.parse_decal = function (tokens) {
    this.currentMaterial.mapDecal = this.parseMap(tokens);
  };
  /**
   * Parses the refl map.
   *
   * @param tokens list of tokens for the refl direcive
   */


  MaterialLibrary.prototype.parse_refl = function (tokens) {
    this.currentMaterial.mapReflections.push(this.parseMap(tokens));
  };
  /**
   * Parses the MTL file.
   *
   * Iterates line by line parsing each MTL directive.
   *
   * This function expects the first token in the line
   * to be a valid MTL directive. That token is then used
   * to try and run a method on this class. parse_[directive]
   * E.g., the `newmtl` directive would try to call the method
   * parse_newmtl. Each parsing function takes in the remaining
   * list of tokens and updates the currentMaterial class with
   * the attributes provided.
   */


  MaterialLibrary.prototype.parse = function () {
    var e_1, _a;

    var lines = this.data.split(/\r?\n/);

    try {
      for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
        var line = lines_1_1.value;
        line = line.trim();

        if (!line || line.startsWith("#")) {
          continue;
        }

        var _b = __read(line.split(/\s/)),
            directive = _b[0],
            tokens = _b.slice(1);

        var parseMethod = this["parse_".concat(directive)];

        if (!parseMethod) {
          console.warn("Don't know how to parse the directive: \"".concat(directive, "\""));
          continue;
        }

        parseMethod.bind(this)(tokens);
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (lines_1_1 && !lines_1_1.done && (_a = lines_1["return"])) _a.call(lines_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    } // some cleanup. These don't need to be exposed as public data.


    delete this.data;
    this.currentMaterial = SENTINEL_MATERIAL;
  };

  return MaterialLibrary;
}();

exports.MaterialLibrary = MaterialLibrary;

function emptyTextureOptions() {
  return {
    colorCorrection: false,
    horizontalBlending: true,
    verticalBlending: true,
    boostMipMapSharpness: 0,
    modifyTextureMap: {
      brightness: 0,
      contrast: 1
    },
    offset: {
      u: 0,
      v: 0,
      w: 0
    },
    scale: {
      u: 1,
      v: 1,
      w: 1
    },
    turbulence: {
      u: 0,
      v: 0,
      w: 0
    },
    clamp: false,
    textureResolution: null,
    bumpMultiplier: 1,
    imfChan: null,
    filename: ""
  };
}