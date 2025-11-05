"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var layout_1 = require("./layout");
/**
 * The main Mesh class. The constructor will parse through the OBJ file data
 * and collect the vertex, vertex normal, texture, and face information. This
 * information can then be used later on when creating your VBOs. See
 * OBJ.initMeshBuffers for an example of how to use the newly created Mesh
 */
var Mesh = /** @class */ (function () {
    /**
     * Create a Mesh
     * @param {String} objectData - a string representation of an OBJ file with
     *     newlines preserved.
     * @param {Object} options - a JS object containing valid options. See class
     *     documentation for options.
     * @param {bool} options.enableWTextureCoord - Texture coordinates can have
     *     an optional "w" coordinate after the u and v coordinates. This extra
     *     value can be used in order to perform fancy transformations on the
     *     textures themselves. Default is to truncate to only the u an v
     *     coordinates. Passing true will provide a default value of 0 in the
     *     event that any or all texture coordinates don't provide a w value.
     *     Always use the textureStride attribute in order to determine the
     *     stride length of the texture coordinates when rendering the element
     *     array.
     * @param {bool} options.calcTangentsAndBitangents - Calculate the tangents
     *     and bitangents when loading of the OBJ is completed. This adds two new
     *     attributes to the Mesh instance: `tangents` and `bitangents`.
     */
    function Mesh(objectData, options) {
        var e_1, _a, e_2, _b;
        this.name = "";
        this.indicesPerMaterial = [];
        this.materialsByIndex = {};
        this.tangents = [];
        this.bitangents = [];
        options = options || {};
        options.materials = options.materials || {};
        options.enableWTextureCoord = !!options.enableWTextureCoord;
        // the list of unique vertex, normal, texture, attributes
        this.vertexNormals = [];
        this.textures = [];
        // the indicies to draw the faces
        this.indices = [];
        this.textureStride = options.enableWTextureCoord ? 3 : 2;
        /*
            The OBJ file format does a sort of compression when saving a model in a
            program like Blender. There are at least 3 sections (4 including textures)
            within the file. Each line in a section begins with the same string:
              * 'v': indicates vertex section
              * 'vn': indicates vertex normal section
              * 'f': indicates the faces section
              * 'vt': indicates vertex texture section (if textures were used on the model)
            Each of the above sections (except for the faces section) is a list/set of
            unique vertices.
    
            Each line of the faces section contains a list of
            (vertex, [texture], normal) groups.
    
            **Note:** The following documentation will use a capital "V" Vertex to
            denote the above (vertex, [texture], normal) groups whereas a lowercase
            "v" vertex is used to denote an X, Y, Z coordinate.
    
            Some examples:
                // the texture index is optional, both formats are possible for models
                // without a texture applied
                f 1/25 18/46 12/31
                f 1//25 18//46 12//31
    
                // A 3 vertex face with texture indices
                f 16/92/11 14/101/22 1/69/1
    
                // A 4 vertex face
                f 16/92/11 40/109/40 38/114/38 14/101/22
    
            The first two lines are examples of a 3 vertex face without a texture applied.
            The second is an example of a 3 vertex face with a texture applied.
            The third is an example of a 4 vertex face. Note: a face can contain N
            number of vertices.
    
            Each number that appears in one of the groups is a 1-based index
            corresponding to an item from the other sections (meaning that indexing
            starts at one and *not* zero).
    
            For example:
                `f 16/92/11` is saying to
                  - take the 16th element from the [v] vertex array
                  - take the 92nd element from the [vt] texture array
                  - take the 11th element from the [vn] normal array
                and together they make a unique vertex.
            Using all 3+ unique Vertices from the face line will produce a polygon.
    
            Now, you could just go through the OBJ file and create a new vertex for
            each face line and WebGL will draw what appears to be the same model.
            However, vertices will be overlapped and duplicated all over the place.
    
            Consider a cube in 3D space centered about the origin and each side is
            2 units long. The front face (with the positive Z-axis pointing towards
            you) would have a Top Right vertex (looking orthogonal to its normal)
            mapped at (1,1,1) The right face would have a Top Left vertex (looking
            orthogonal to its normal) at (1,1,1) and the top face would have a Bottom
            Right vertex (looking orthogonal to its normal) at (1,1,1). Each face
            has a vertex at the same coordinates, however, three distinct vertices
            will be drawn at the same spot.
    
            To solve the issue of duplicate Vertices (the `(vertex, [texture], normal)`
            groups), while iterating through the face lines, when a group is encountered
            the whole group string ('16/92/11') is checked to see if it exists in the
            packed.hashindices object, and if it doesn't, the indices it specifies
            are used to look up each attribute in the corresponding attribute arrays
            already created. The values are then copied to the corresponding unpacked
            array (flattened to play nice with WebGL's ELEMENT_ARRAY_BUFFER indexing),
            the group string is added to the hashindices set and the current unpacked
            index is used as this hashindices value so that the group of elements can
            be reused. The unpacked index is incremented. If the group string already
            exists in the hashindices object, its corresponding value is the index of
            that group and is appended to the unpacked indices array.
           */
        var verts = [];
        var vertNormals = [];
        var textures = [];
        var materialNamesByIndex = [];
        var materialIndicesByName = {};
        // keep track of what material we've seen last
        var currentMaterialIndex = -1;
        var currentObjectByMaterialIndex = 0;
        // unpacking stuff
        var unpacked = {
            verts: [],
            norms: [],
            textures: [],
            hashindices: {},
            indices: [[]],
            materialIndices: [],
            index: 0
        };
        var VERTEX_RE = /^v\s/;
        var NORMAL_RE = /^vn\s/;
        var TEXTURE_RE = /^vt\s/;
        var FACE_RE = /^f\s/;
        var WHITESPACE_RE = /\s+/;
        var USE_MATERIAL_RE = /^usemtl/;
        // array of lines separated by the newline
        var lines = objectData.split("\n");
        try {
            for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
                var line = lines_1_1.value;
                line = line.trim();
                if (!line || line.startsWith("#")) {
                    continue;
                }
                var elements = line.split(WHITESPACE_RE);
                elements.shift();
                if (VERTEX_RE.test(line)) {
                    // if this is a vertex
                    verts.push.apply(verts, __spreadArray([], __read(elements), false));
                }
                else if (NORMAL_RE.test(line)) {
                    // if this is a vertex normal
                    vertNormals.push.apply(vertNormals, __spreadArray([], __read(elements), false));
                }
                else if (TEXTURE_RE.test(line)) {
                    var coords = elements;
                    // by default, the loader will only look at the U and V
                    // coordinates of the vt declaration. So, this truncates the
                    // elements to only those 2 values. If W texture coordinate
                    // support is enabled, then the texture coordinate is
                    // expected to have three values in it.
                    if (elements.length > 2 && !options.enableWTextureCoord) {
                        coords = elements.slice(0, 2);
                    }
                    else if (elements.length === 2 && options.enableWTextureCoord) {
                        // If for some reason W texture coordinate support is enabled
                        // and only the U and V coordinates are given, then we supply
                        // the default value of 0 so that the stride length is correct
                        // when the textures are unpacked below.
                        coords.push("0");
                    }
                    textures.push.apply(textures, __spreadArray([], __read(coords), false));
                }
                else if (USE_MATERIAL_RE.test(line)) {
                    var materialName = elements[0];
                    // check to see if we've ever seen it before
                    if (!(materialName in materialIndicesByName)) {
                        // new material we've never seen
                        materialNamesByIndex.push(materialName);
                        materialIndicesByName[materialName] = materialNamesByIndex.length - 1;
                        // push new array into indices
                        // already contains an array at index zero, don't add
                        if (materialIndicesByName[materialName] > 0) {
                            unpacked.indices.push([]);
                        }
                    }
                    // keep track of the current material index
                    currentMaterialIndex = materialIndicesByName[materialName];
                    // update current index array
                    currentObjectByMaterialIndex = currentMaterialIndex;
                }
                else if (FACE_RE.test(line)) {
                    // if this is a face
                    /*
                            split this face into an array of Vertex groups
                            for example:
                               f 16/92/11 14/101/22 1/69/1
                            becomes:
                              ['16/92/11', '14/101/22', '1/69/1'];
                            */
                    var triangles = triangulate(elements);
                    try {
                        for (var triangles_1 = (e_2 = void 0, __values(triangles)), triangles_1_1 = triangles_1.next(); !triangles_1_1.done; triangles_1_1 = triangles_1.next()) {
                            var triangle = triangles_1_1.value;
                            for (var j = 0, eleLen = triangle.length; j < eleLen; j++) {
                                var hash = triangle[j] + "," + currentMaterialIndex;
                                if (hash in unpacked.hashindices) {
                                    unpacked.indices[currentObjectByMaterialIndex].push(unpacked.hashindices[hash]);
                                }
                                else {
                                    /*
                                              Each element of the face line array is a Vertex which has its
                                              attributes delimited by a forward slash. This will separate
                                              each attribute into another array:
                                                  '19/92/11'
                                              becomes:
                                                  Vertex = ['19', '92', '11'];
                                              where
                                                  Vertex[0] is the vertex index
                                                  Vertex[1] is the texture index
                                                  Vertex[2] is the normal index
                                               Think of faces having Vertices which are comprised of the
                                               attributes location (v), texture (vt), and normal (vn).
                                               */
                                    var vertex = triangle[j].split("/");
                                    // it's possible for faces to only specify the vertex
                                    // and the normal. In this case, vertex will only have
                                    // a length of 2 and not 3 and the normal will be the
                                    // second item in the list with an index of 1.
                                    var normalIndex = vertex.length - 1;
                                    /*
                                               The verts, textures, and vertNormals arrays each contain a
                                               flattend array of coordinates.
                      
                                               Because it gets confusing by referring to Vertex and then
                                               vertex (both are different in my descriptions) I will explain
                                               what's going on using the vertexNormals array:
                      
                                               vertex[2] will contain the one-based index of the vertexNormals
                                               section (vn). One is subtracted from this index number to play
                                               nice with javascript's zero-based array indexing.
                      
                                               Because vertexNormal is a flattened array of x, y, z values,
                                               simple pointer arithmetic is used to skip to the start of the
                                               vertexNormal, then the offset is added to get the correct
                                               component: +0 is x, +1 is y, +2 is z.
                      
                                               This same process is repeated for verts and textures.
                                               */
                                    // Vertex position
                                    unpacked.verts.push(+verts[(+vertex[0] - 1) * 3 + 0]);
                                    unpacked.verts.push(+verts[(+vertex[0] - 1) * 3 + 1]);
                                    unpacked.verts.push(+verts[(+vertex[0] - 1) * 3 + 2]);
                                    // Vertex textures
                                    if (textures.length) {
                                        var stride = options.enableWTextureCoord ? 3 : 2;
                                        unpacked.textures.push(+textures[(+vertex[1] - 1) * stride + 0]);
                                        unpacked.textures.push(+textures[(+vertex[1] - 1) * stride + 1]);
                                        if (options.enableWTextureCoord) {
                                            unpacked.textures.push(+textures[(+vertex[1] - 1) * stride + 2]);
                                        }
                                    }
                                    // Vertex normals
                                    unpacked.norms.push(+vertNormals[(+vertex[normalIndex] - 1) * 3 + 0]);
                                    unpacked.norms.push(+vertNormals[(+vertex[normalIndex] - 1) * 3 + 1]);
                                    unpacked.norms.push(+vertNormals[(+vertex[normalIndex] - 1) * 3 + 2]);
                                    // Vertex material indices
                                    unpacked.materialIndices.push(currentMaterialIndex);
                                    // add the newly created Vertex to the list of indices
                                    unpacked.hashindices[hash] = unpacked.index;
                                    unpacked.indices[currentObjectByMaterialIndex].push(unpacked.hashindices[hash]);
                                    // increment the counter
                                    unpacked.index += 1;
                                }
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (triangles_1_1 && !triangles_1_1.done && (_b = triangles_1["return"])) _b.call(triangles_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (lines_1_1 && !lines_1_1.done && (_a = lines_1["return"])) _a.call(lines_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.vertices = unpacked.verts;
        this.vertexNormals = unpacked.norms;
        this.textures = unpacked.textures;
        this.vertexMaterialIndices = unpacked.materialIndices;
        this.indices = unpacked.indices[currentObjectByMaterialIndex];
        this.indicesPerMaterial = unpacked.indices;
        this.materialNames = materialNamesByIndex;
        this.materialIndices = materialIndicesByName;
        this.materialsByIndex = {};
        if (options.calcTangentsAndBitangents) {
            this.calculateTangentsAndBitangents();
        }
    }
    /**
     * Calculates the tangents and bitangents of the mesh that forms an orthogonal basis together with the
     * normal in the direction of the texture coordinates. These are useful for setting up the TBN matrix
     * when distorting the normals through normal maps.
     * Method derived from: http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-13-normal-mapping/
     *
     * This method requires the normals and texture coordinates to be parsed and set up correctly.
     * Adds the tangents and bitangents as members of the class instance.
     */
    Mesh.prototype.calculateTangentsAndBitangents = function () {
        console.assert(!!(this.vertices &&
            this.vertices.length &&
            this.vertexNormals &&
            this.vertexNormals.length &&
            this.textures &&
            this.textures.length), "Missing attributes for calculating tangents and bitangents");
        var unpacked = {
            tangents: __spreadArray([], __read(new Array(this.vertices.length)), false).map(function (_) { return 0; }),
            bitangents: __spreadArray([], __read(new Array(this.vertices.length)), false).map(function (_) { return 0; })
        };
        // Loop through all faces in the whole mesh
        var indices = this.indices;
        var vertices = this.vertices;
        var normals = this.vertexNormals;
        var uvs = this.textures;
        for (var i = 0; i < indices.length; i += 3) {
            var i0 = indices[i + 0];
            var i1 = indices[i + 1];
            var i2 = indices[i + 2];
            var x_v0 = vertices[i0 * 3 + 0];
            var y_v0 = vertices[i0 * 3 + 1];
            var z_v0 = vertices[i0 * 3 + 2];
            var x_uv0 = uvs[i0 * 2 + 0];
            var y_uv0 = uvs[i0 * 2 + 1];
            var x_v1 = vertices[i1 * 3 + 0];
            var y_v1 = vertices[i1 * 3 + 1];
            var z_v1 = vertices[i1 * 3 + 2];
            var x_uv1 = uvs[i1 * 2 + 0];
            var y_uv1 = uvs[i1 * 2 + 1];
            var x_v2 = vertices[i2 * 3 + 0];
            var y_v2 = vertices[i2 * 3 + 1];
            var z_v2 = vertices[i2 * 3 + 2];
            var x_uv2 = uvs[i2 * 2 + 0];
            var y_uv2 = uvs[i2 * 2 + 1];
            var x_deltaPos1 = x_v1 - x_v0;
            var y_deltaPos1 = y_v1 - y_v0;
            var z_deltaPos1 = z_v1 - z_v0;
            var x_deltaPos2 = x_v2 - x_v0;
            var y_deltaPos2 = y_v2 - y_v0;
            var z_deltaPos2 = z_v2 - z_v0;
            var x_uvDeltaPos1 = x_uv1 - x_uv0;
            var y_uvDeltaPos1 = y_uv1 - y_uv0;
            var x_uvDeltaPos2 = x_uv2 - x_uv0;
            var y_uvDeltaPos2 = y_uv2 - y_uv0;
            var rInv = x_uvDeltaPos1 * y_uvDeltaPos2 - y_uvDeltaPos1 * x_uvDeltaPos2;
            var r = 1.0 / Math.abs(rInv < 0.0001 ? 1.0 : rInv);
            // Tangent
            var x_tangent = (x_deltaPos1 * y_uvDeltaPos2 - x_deltaPos2 * y_uvDeltaPos1) * r;
            var y_tangent = (y_deltaPos1 * y_uvDeltaPos2 - y_deltaPos2 * y_uvDeltaPos1) * r;
            var z_tangent = (z_deltaPos1 * y_uvDeltaPos2 - z_deltaPos2 * y_uvDeltaPos1) * r;
            // Bitangent
            var x_bitangent = (x_deltaPos2 * x_uvDeltaPos1 - x_deltaPos1 * x_uvDeltaPos2) * r;
            var y_bitangent = (y_deltaPos2 * x_uvDeltaPos1 - y_deltaPos1 * x_uvDeltaPos2) * r;
            var z_bitangent = (z_deltaPos2 * x_uvDeltaPos1 - z_deltaPos1 * x_uvDeltaPos2) * r;
            // Gram-Schmidt orthogonalize
            //t = glm::normalize(t - n * glm:: dot(n, t));
            var x_n0 = normals[i0 * 3 + 0];
            var y_n0 = normals[i0 * 3 + 1];
            var z_n0 = normals[i0 * 3 + 2];
            var x_n1 = normals[i1 * 3 + 0];
            var y_n1 = normals[i1 * 3 + 1];
            var z_n1 = normals[i1 * 3 + 2];
            var x_n2 = normals[i2 * 3 + 0];
            var y_n2 = normals[i2 * 3 + 1];
            var z_n2 = normals[i2 * 3 + 2];
            // Tangent
            var n0_dot_t = x_tangent * x_n0 + y_tangent * y_n0 + z_tangent * z_n0;
            var n1_dot_t = x_tangent * x_n1 + y_tangent * y_n1 + z_tangent * z_n1;
            var n2_dot_t = x_tangent * x_n2 + y_tangent * y_n2 + z_tangent * z_n2;
            var x_resTangent0 = x_tangent - x_n0 * n0_dot_t;
            var y_resTangent0 = y_tangent - y_n0 * n0_dot_t;
            var z_resTangent0 = z_tangent - z_n0 * n0_dot_t;
            var x_resTangent1 = x_tangent - x_n1 * n1_dot_t;
            var y_resTangent1 = y_tangent - y_n1 * n1_dot_t;
            var z_resTangent1 = z_tangent - z_n1 * n1_dot_t;
            var x_resTangent2 = x_tangent - x_n2 * n2_dot_t;
            var y_resTangent2 = y_tangent - y_n2 * n2_dot_t;
            var z_resTangent2 = z_tangent - z_n2 * n2_dot_t;
            var magTangent0 = Math.sqrt(x_resTangent0 * x_resTangent0 + y_resTangent0 * y_resTangent0 + z_resTangent0 * z_resTangent0);
            var magTangent1 = Math.sqrt(x_resTangent1 * x_resTangent1 + y_resTangent1 * y_resTangent1 + z_resTangent1 * z_resTangent1);
            var magTangent2 = Math.sqrt(x_resTangent2 * x_resTangent2 + y_resTangent2 * y_resTangent2 + z_resTangent2 * z_resTangent2);
            // Bitangent
            var n0_dot_bt = x_bitangent * x_n0 + y_bitangent * y_n0 + z_bitangent * z_n0;
            var n1_dot_bt = x_bitangent * x_n1 + y_bitangent * y_n1 + z_bitangent * z_n1;
            var n2_dot_bt = x_bitangent * x_n2 + y_bitangent * y_n2 + z_bitangent * z_n2;
            var x_resBitangent0 = x_bitangent - x_n0 * n0_dot_bt;
            var y_resBitangent0 = y_bitangent - y_n0 * n0_dot_bt;
            var z_resBitangent0 = z_bitangent - z_n0 * n0_dot_bt;
            var x_resBitangent1 = x_bitangent - x_n1 * n1_dot_bt;
            var y_resBitangent1 = y_bitangent - y_n1 * n1_dot_bt;
            var z_resBitangent1 = z_bitangent - z_n1 * n1_dot_bt;
            var x_resBitangent2 = x_bitangent - x_n2 * n2_dot_bt;
            var y_resBitangent2 = y_bitangent - y_n2 * n2_dot_bt;
            var z_resBitangent2 = z_bitangent - z_n2 * n2_dot_bt;
            var magBitangent0 = Math.sqrt(x_resBitangent0 * x_resBitangent0 + y_resBitangent0 * y_resBitangent0 + z_resBitangent0 * z_resBitangent0);
            var magBitangent1 = Math.sqrt(x_resBitangent1 * x_resBitangent1 + y_resBitangent1 * y_resBitangent1 + z_resBitangent1 * z_resBitangent1);
            var magBitangent2 = Math.sqrt(x_resBitangent2 * x_resBitangent2 + y_resBitangent2 * y_resBitangent2 + z_resBitangent2 * z_resBitangent2);
            unpacked.tangents[i0 * 3 + 0] += x_resTangent0 / magTangent0;
            unpacked.tangents[i0 * 3 + 1] += y_resTangent0 / magTangent0;
            unpacked.tangents[i0 * 3 + 2] += z_resTangent0 / magTangent0;
            unpacked.tangents[i1 * 3 + 0] += x_resTangent1 / magTangent1;
            unpacked.tangents[i1 * 3 + 1] += y_resTangent1 / magTangent1;
            unpacked.tangents[i1 * 3 + 2] += z_resTangent1 / magTangent1;
            unpacked.tangents[i2 * 3 + 0] += x_resTangent2 / magTangent2;
            unpacked.tangents[i2 * 3 + 1] += y_resTangent2 / magTangent2;
            unpacked.tangents[i2 * 3 + 2] += z_resTangent2 / magTangent2;
            unpacked.bitangents[i0 * 3 + 0] += x_resBitangent0 / magBitangent0;
            unpacked.bitangents[i0 * 3 + 1] += y_resBitangent0 / magBitangent0;
            unpacked.bitangents[i0 * 3 + 2] += z_resBitangent0 / magBitangent0;
            unpacked.bitangents[i1 * 3 + 0] += x_resBitangent1 / magBitangent1;
            unpacked.bitangents[i1 * 3 + 1] += y_resBitangent1 / magBitangent1;
            unpacked.bitangents[i1 * 3 + 2] += z_resBitangent1 / magBitangent1;
            unpacked.bitangents[i2 * 3 + 0] += x_resBitangent2 / magBitangent2;
            unpacked.bitangents[i2 * 3 + 1] += y_resBitangent2 / magBitangent2;
            unpacked.bitangents[i2 * 3 + 2] += z_resBitangent2 / magBitangent2;
            // TODO: check handedness
        }
        this.tangents = unpacked.tangents;
        this.bitangents = unpacked.bitangents;
    };
    /**
     * @param layout - A {@link Layout} object that describes the
     * desired memory layout of the generated buffer
     * @return The packed array in the ... TODO
     */
    Mesh.prototype.makeBufferData = function (layout) {
        var e_3, _a;
        var numItems = this.vertices.length / 3;
        var buffer = new ArrayBuffer(layout.stride * numItems);
        buffer.numItems = numItems;
        var dataView = new DataView(buffer);
        for (var i = 0, vertexOffset = 0; i < numItems; i++) {
            vertexOffset = i * layout.stride;
            try {
                // copy in the vertex data in the order and format given by the
                // layout param
                for (var _b = (e_3 = void 0, __values(layout.attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var attribute = _c.value;
                    var offset = vertexOffset + layout.attributeMap[attribute.key].offset;
                    switch (attribute.key) {
                        case layout_1.Layout.POSITION.key:
                            dataView.setFloat32(offset, this.vertices[i * 3], true);
                            dataView.setFloat32(offset + 4, this.vertices[i * 3 + 1], true);
                            dataView.setFloat32(offset + 8, this.vertices[i * 3 + 2], true);
                            break;
                        case layout_1.Layout.UV.key:
                            dataView.setFloat32(offset, this.textures[i * 2], true);
                            dataView.setFloat32(offset + 4, this.textures[i * 2 + 1], true);
                            break;
                        case layout_1.Layout.NORMAL.key:
                            dataView.setFloat32(offset, this.vertexNormals[i * 3], true);
                            dataView.setFloat32(offset + 4, this.vertexNormals[i * 3 + 1], true);
                            dataView.setFloat32(offset + 8, this.vertexNormals[i * 3 + 2], true);
                            break;
                        case layout_1.Layout.MATERIAL_INDEX.key:
                            dataView.setInt16(offset, this.vertexMaterialIndices[i], true);
                            break;
                        case layout_1.Layout.AMBIENT.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setFloat32(offset, material.ambient[0], true);
                            dataView.setFloat32(offset + 4, material.ambient[1], true);
                            dataView.setFloat32(offset + 8, material.ambient[2], true);
                            break;
                        }
                        case layout_1.Layout.DIFFUSE.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setFloat32(offset, material.diffuse[0], true);
                            dataView.setFloat32(offset + 4, material.diffuse[1], true);
                            dataView.setFloat32(offset + 8, material.diffuse[2], true);
                            break;
                        }
                        case layout_1.Layout.SPECULAR.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setFloat32(offset, material.specular[0], true);
                            dataView.setFloat32(offset + 4, material.specular[1], true);
                            dataView.setFloat32(offset + 8, material.specular[2], true);
                            break;
                        }
                        case layout_1.Layout.SPECULAR_EXPONENT.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setFloat32(offset, material.specularExponent, true);
                            break;
                        }
                        case layout_1.Layout.EMISSIVE.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setFloat32(offset, material.emissive[0], true);
                            dataView.setFloat32(offset + 4, material.emissive[1], true);
                            dataView.setFloat32(offset + 8, material.emissive[2], true);
                            break;
                        }
                        case layout_1.Layout.TRANSMISSION_FILTER.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setFloat32(offset, material.transmissionFilter[0], true);
                            dataView.setFloat32(offset + 4, material.transmissionFilter[1], true);
                            dataView.setFloat32(offset + 8, material.transmissionFilter[2], true);
                            break;
                        }
                        case layout_1.Layout.DISSOLVE.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setFloat32(offset, material.dissolve, true);
                            break;
                        }
                        case layout_1.Layout.ILLUMINATION.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setInt16(offset, material.illumination, true);
                            break;
                        }
                        case layout_1.Layout.REFRACTION_INDEX.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setFloat32(offset, material.refractionIndex, true);
                            break;
                        }
                        case layout_1.Layout.SHARPNESS.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setFloat32(offset, material.sharpness, true);
                            break;
                        }
                        case layout_1.Layout.ANTI_ALIASING.key: {
                            var materialIndex = this.vertexMaterialIndices[i];
                            var material = this.materialsByIndex[materialIndex];
                            if (!material) {
                                console.warn('Material "' +
                                    this.materialNames[materialIndex] +
                                    '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                                break;
                            }
                            dataView.setInt16(offset, material.antiAliasing ? 1 : 0, true);
                            break;
                        }
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        return buffer;
    };
    Mesh.prototype.makeIndexBufferData = function () {
        var buffer = new Uint16Array(this.indices);
        buffer.numItems = this.indices.length;
        return buffer;
    };
    Mesh.prototype.makeIndexBufferDataForMaterials = function () {
        var _a;
        var _this = this;
        var materialIndices = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            materialIndices[_i] = arguments[_i];
        }
        var indices = (_a = new Array()).concat.apply(_a, __spreadArray([], __read(materialIndices.map(function (mtlIdx) { return _this.indicesPerMaterial[mtlIdx]; })), false));
        var buffer = new Uint16Array(indices);
        buffer.numItems = indices.length;
        return buffer;
    };
    Mesh.prototype.addMaterialLibrary = function (mtl) {
        for (var name_1 in mtl.materials) {
            if (!(name_1 in this.materialIndices)) {
                // This material is not referenced by the mesh
                continue;
            }
            var material = mtl.materials[name_1];
            // Find the material index for this material
            var materialIndex = this.materialIndices[material.name];
            // Put the material into the materialsByIndex object at the right
            // spot as determined when the obj file was parsed
            this.materialsByIndex[materialIndex] = material;
        }
    };
    return Mesh;
}());
exports["default"] = Mesh;
function triangulate(elements) {
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(elements.length <= 3)) return [3 /*break*/, 2];
                return [4 /*yield*/, elements];
            case 1:
                _a.sent();
                return [3 /*break*/, 9];
            case 2:
                if (!(elements.length === 4)) return [3 /*break*/, 5];
                return [4 /*yield*/, [elements[0], elements[1], elements[2]]];
            case 3:
                _a.sent();
                return [4 /*yield*/, [elements[2], elements[3], elements[0]]];
            case 4:
                _a.sent();
                return [3 /*break*/, 9];
            case 5:
                i = 1;
                _a.label = 6;
            case 6:
                if (!(i < elements.length - 1)) return [3 /*break*/, 9];
                return [4 /*yield*/, [elements[0], elements[i], elements[i + 1]]];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8:
                i++;
                return [3 /*break*/, 6];
            case 9: return [2 /*return*/];
        }
    });
}
