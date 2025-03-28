'use strict';
var __values =
  (this && this.__values) ||
  function (o) {
    var s = typeof Symbol === 'function' && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === 'number')
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.');
  };
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
exports.__esModule = true;
exports.deleteMeshBuffers =
  exports.initMeshBuffers =
  exports._buildBuffer =
  exports.downloadMeshes =
  exports.downloadModels =
  exports.downloadModelsFromZip =
    void 0;
var mesh_1 = require('./mesh');
var material_1 = require('./material');
function create1PixelTexture(gl, pixel) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(pixel));
  return texture;
}
function downloadMtlTextures(gl, mtl, root) {
  var e_1, _a;
  var mapAttributes = ['mapDiffuse', 'mapAmbient', 'mapSpecular', 'mapDissolve', 'mapBump', 'mapDisplacement', 'mapDecal', 'mapEmissive'];
  if (!root.endsWith('/')) {
    root += '/';
  }
  var textures = [];
  for (var materialName in mtl.materials) {
    if (!mtl.materials.hasOwnProperty(materialName)) {
      continue;
    }
    var material = mtl.materials[materialName];
    var _loop_1 = function (attr) {
      var mapData = material[attr];
      if (!mapData || !mapData.filename) {
        return 'continue';
      }
      var url = root + mapData.filename;
      textures.push(
        fetch(url)
          .then(function (response) {
            if (!response.ok) {
              throw new Error();
            }
            return response.blob();
          })
          .then(function (data) {
            var image = new Image();
            image.src = URL.createObjectURL(data);
            mapData.texture = image;
            var texture = create1PixelTexture(gl, [128, 192, 86, 255]);
            mapData.glTexture = texture;
            // Set the parameters so we can render any size image.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D, mapData.glTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mapData.texture);
            // Upload the image into the texture.
            image.onload = function () {
              gl.bindTexture(gl.TEXTURE_2D, mapData.glTexture);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mapData.texture);
            };
            return new Promise(function (resolve) {
              return (image.onload = function () {
                return resolve(mapData);
              });
            });
          })
          ['catch'](function () {
            console.error('Unable to download texture: '.concat(url));
          })
      );
    };
    try {
      for (
        var mapAttributes_1 = ((e_1 = void 0), __values(mapAttributes)), mapAttributes_1_1 = mapAttributes_1.next();
        !mapAttributes_1_1.done;
        mapAttributes_1_1 = mapAttributes_1.next()
      ) {
        var attr = mapAttributes_1_1.value;
        _loop_1(attr);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (mapAttributes_1_1 && !mapAttributes_1_1.done && (_a = mapAttributes_1['return'])) _a.call(mapAttributes_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  }
  return Promise.all(textures);
}
function downloadMtlTexturesFromZip(gl, mtl, root, zip) {
  var e_1, _a;
  var mapAttributes = ['mapDiffuse', 'mapAmbient', 'mapSpecular', 'mapDissolve', 'mapBump', 'mapDisplacement', 'mapDecal', 'mapEmissive'];
  if (!root.endsWith('/')) {
    root += '/';
  }
  var textures = [];
  for (var materialName in mtl.materials) {
    if (!mtl.materials.hasOwnProperty(materialName)) {
      continue;
    }
    var material = mtl.materials[materialName];
    var _loop_1 = function (attr) {
      var mapData = material[attr];
      if (!mapData || !mapData.filename) {
        return 'continue';
      }
      var url = root + mapData.filename;
      textures.push(
        zip
          .file(url)
          .async('arrayBuffer')
          .then(function (imageData) {
            let buffer = new Uint8Array(imageData);
            return new Blob([buffer.buffer]);
          })
          .then(function (data) {
            var image = new Image();
            image.src = URL.createObjectURL(data);
            mapData.texture = image;
            var texture = create1PixelTexture(gl, [128, 192, 86, 255]);
            mapData.glTexture = texture;
            // Set the parameters so we can render any size image.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D, mapData.glTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mapData.texture);
            // Upload the image into the texture.
            image.onload = function () {
              gl.bindTexture(gl.TEXTURE_2D, mapData.glTexture);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mapData.texture);
            };
            return new Promise(function (resolve) {
              return (image.onload = function () {
                return resolve(mapData);
              });
            });
          })
          ['catch'](function () {
            console.error('Unable to download texture from zip: '.concat(url));
          })
      );
    };
    try {
      for (
        var mapAttributes_1 = ((e_1 = void 0), __values(mapAttributes)), mapAttributes_1_1 = mapAttributes_1.next();
        !mapAttributes_1_1.done;
        mapAttributes_1_1 = mapAttributes_1.next()
      ) {
        var attr = mapAttributes_1_1.value;
        _loop_1(attr);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (mapAttributes_1_1 && !mapAttributes_1_1.done && (_a = mapAttributes_1['return'])) _a.call(mapAttributes_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  }
  return Promise.all(textures);
}
function getMtl(modelOptions) {
  if (!(typeof modelOptions.mtl === 'string')) {
    return modelOptions.obj.replace(/\.obj$/, '.mtl');
  }
  return modelOptions.mtl;
}
/**
 * Accepts a list of model request objects and returns a Promise that
 * resolves when all models have been downloaded and parsed.
 *
 * The list of model objects follow this interface:
 * {
 *  obj: 'path/to/model.obj',
 *  mtl: true | 'path/to/model.mtl',
 *  downloadMtlTextures: true | false
 *  mtlTextureRoot: '/models/suzanne/maps'
 *  name: 'suzanne'
 * }
 *
 * The `obj` attribute is required and should be the path to the
 * model's .obj file relative to the current repo (absolute URLs are
 * suggested).
 *
 * The `mtl` attribute is optional and can either be a boolean or
 * a path to the model's .mtl file relative to the current URL. If
 * the value is `true`, then the path and basename given for the `obj`
 * attribute is used replacing the .obj suffix for .mtl
 * E.g.: {obj: 'models/foo.obj', mtl: true} would search for 'models/foo.mtl'
 *
 * The `name` attribute is optional and is a human friendly name to be
 * included with the parsed OBJ and MTL files. If not given, the base .obj
 * filename will be used.
 *
 * The `downloadMtlTextures` attribute is a flag for automatically downloading
 * any images found in the MTL file and attaching them to each Material
 * created from that file. For example, if material.mapDiffuse is set (there
 * was data in the MTL file), then material.mapDiffuse.texture will contain
 * the downloaded image. This option defaults to `true`. By default, the MTL's
 * URL will be used to determine the location of the images.
 *
 * The `mtlTextureRoot` attribute is optional and should point to the location
 * on the server that this MTL's texture files are located. The default is to
 * use the MTL file's location.
 *
 * @returns {Promise} the result of downloading the given list of models. The
 * promise will resolve with an object whose keys are the names of the models
 * and the value is its Mesh object. Each Mesh object will automatically
 * have its addMaterialLibrary() method called to set the given MTL data (if given).
 */
function downloadModels(gl, models) {
  var e_2, _a;
  var finished = [];
  var _loop_2 = function (model) {
    if (!model.obj) {
      throw new Error('"obj" attribute of model object not set. The .obj file is required to be set ' + 'in order to use downloadModels()');
    }
    var options = {
      indicesPerMaterial: !!model.indicesPerMaterial,
      calcTangentsAndBitangents: !!model.calcTangentsAndBitangents,
    };
    // if the name is not provided, dervive it from the given OBJ
    var name_1 = model.name;
    if (!name_1) {
      var parts = model.obj.split('/');
      name_1 = parts[parts.length - 1].replace('.obj', '');
    }
    var namePromise = Promise.resolve(name_1);
    var meshPromise = fetch(model.obj)
      .then(function (response) {
        return response.text();
      })
      .then(function (data) {
        return new mesh_1['default'](data, options);
      });
    var mtlPromise = void 0;
    // Download MaterialLibrary file?
    if (model.mtl) {
      var mtl_1 = getMtl(model);
      mtlPromise = fetch(mtl_1)
        .then(function (response) {
          return response.text();
        })
        .then(function (data) {
          var material = new material_1.MaterialLibrary(data);
          if (model.downloadMtlTextures !== false) {
            var root = model.mtlTextureRoot;
            if (!root) {
              // get the directory of the MTL file as default
              root = mtl_1.substr(0, mtl_1.lastIndexOf('/'));
            }
            // downloadMtlTextures returns a Promise that
            // is resolved once all of the images it
            // contains are downloaded. These are then
            // attached to the map data objects
            return Promise.all([Promise.resolve(material), downloadMtlTextures(gl, material, root)]);
          }
          return Promise.all([Promise.resolve(material), undefined]);
        })
        .then(function (value) {
          return value;
        });
    }
    var parsed = [namePromise, meshPromise, mtlPromise];
    finished.push(Promise.all(parsed));
  };
  try {
    for (var models_1 = __values(models), models_1_1 = models_1.next(); !models_1_1.done; models_1_1 = models_1.next()) {
      var model = models_1_1.value;
      _loop_2(model);
    }
  } catch (e_2_1) {
    e_2 = { error: e_2_1 };
  } finally {
    try {
      if (models_1_1 && !models_1_1.done && (_a = models_1['return'])) _a.call(models_1);
    } finally {
      if (e_2) throw e_2.error;
    }
  }
  return Promise.all(finished).then(function (ms) {
    var e_3, _a;
    // the "finished" promise is a list of name, Mesh instance,
    // and MaterialLibary instance. This unpacks and returns an
    // object mapping name to Mesh (Mesh points to MTL).
    var models = {};
    try {
      for (var ms_1 = __values(ms), ms_1_1 = ms_1.next(); !ms_1_1.done; ms_1_1 = ms_1.next()) {
        var model = ms_1_1.value;
        var _b = __read(model, 3),
          name_2 = _b[0],
          mesh = _b[1],
          mtl = _b[2];
        mesh.name = name_2;
        if (mtl) {
          mesh.addMaterialLibrary(mtl[0]);
        }
        models[name_2] = mesh;
      }
    } catch (e_3_1) {
      e_3 = { error: e_3_1 };
    } finally {
      try {
        if (ms_1_1 && !ms_1_1.done && (_a = ms_1['return'])) _a.call(ms_1);
      } finally {
        if (e_3) throw e_3.error;
      }
    }
    return models;
  });
}
function downloadModelsFromZip(gl, models, zip) {
  var e_2, _a;
  var finished = [];
  var _loop_2 = function (model) {
    if (!model.obj) {
      throw new Error('"obj" attribute of model object not set. The .obj file is required to be set ' + 'in order to use downloadModels()');
    }
    var options = {
      indicesPerMaterial: !!model.indicesPerMaterial,
      calcTangentsAndBitangents: !!model.calcTangentsAndBitangents,
    };
    // if the name is not provided, dervive it from the given OBJ
    var parts = model.obj.split('/');
    var name_1 = parts[parts.length - 1].replace('.obj', '');
    var namePromise = Promise.resolve(name_1);
    var meshPromise = zip
      .file(`models/${name_1}.obj`)
      .async('string')
      .then(function (data) {
        return new mesh_1['default'](data, options);
      });
    var mtlPromise = void 0;
    // Download MaterialLibrary file?
    if (model.mtl) {
      var mtl_1 = getMtl(model);
      mtlPromise = zip
        .file(`models/${name_1}.mtl`)
        .async('string')
        .then(function (data) {
          var material = new material_1.MaterialLibrary(data);
          if (model.downloadMtlTextures !== false) {
            var root = model.mtlTextureRoot;
            if (!root) {
              // get the directory of the MTL file as default
              root = mtl_1.substr(0, mtl_1.lastIndexOf('/'));
            }
            // downloadMtlTextures returns a Promise that
            // is resolved once all of the images it
            // contains are downloaded. These are then
            // attached to the map data objects
            return Promise.all([Promise.resolve(material), downloadMtlTexturesFromZip(gl, material, root, zip)]);
          }
          return Promise.all([Promise.resolve(material), undefined]);
        })
        .then(function (value) {
          return value;
        });
    }
    var parsed = [namePromise, meshPromise, mtlPromise];
    finished.push(Promise.all(parsed));
  };
  try {
    for (var models_1 = __values(models), models_1_1 = models_1.next(); !models_1_1.done; models_1_1 = models_1.next()) {
      var model = models_1_1.value;
      _loop_2(model);
    }
  } catch (e_2_1) {
    e_2 = { error: e_2_1 };
  } finally {
    try {
      if (models_1_1 && !models_1_1.done && (_a = models_1['return'])) _a.call(models_1);
    } finally {
      if (e_2) throw e_2.error;
    }
  }
  return Promise.all(finished).then(function (ms) {
    var e_3, _a;
    // the "finished" promise is a list of name, Mesh instance,
    // and MaterialLibary instance. This unpacks and returns an
    // object mapping name to Mesh (Mesh points to MTL).
    var models = {};
    try {
      for (var ms_1 = __values(ms), ms_1_1 = ms_1.next(); !ms_1_1.done; ms_1_1 = ms_1.next()) {
        var model = ms_1_1.value;
        var _b = __read(model, 3),
          name_2 = _b[0],
          mesh = _b[1],
          mtl = _b[2];
        mesh.name = name_2;
        if (mtl) {
          mesh.addMaterialLibrary(mtl[0]);
        }
        models[name_2] = mesh;
      }
    } catch (e_3_1) {
      e_3 = { error: e_3_1 };
    } finally {
      try {
        if (ms_1_1 && !ms_1_1.done && (_a = ms_1['return'])) _a.call(ms_1);
      } finally {
        if (e_3) throw e_3.error;
      }
    }
    return models;
  });
}
exports.downloadModelsFromZip = downloadModelsFromZip;
exports.downloadModels = downloadModels;
/**
 * Takes in an object of `mesh_name`, `'/url/to/OBJ/file'` pairs and a callback
 * function. Each OBJ file will be ajaxed in and automatically converted to
 * an OBJ.Mesh. When all files have successfully downloaded the callback
 * function provided will be called and passed in an object containing
 * the newly created meshes.
 *
 * **Note:** In order to use this function as a way to download meshes, a
 * webserver of some sort must be used.
 *
 * @param {Object} nameAndAttrs an object where the key is the name of the mesh and the value is the url to that mesh's OBJ file
 *
 * @param {Function} completionCallback should contain a function that will take one parameter: an object array where the keys will be the unique object name and the value will be a Mesh object
 *
 * @param {Object} meshes In case other meshes are loaded separately or if a previously declared variable is desired to be used, pass in a (possibly empty) json object of the pattern: { '<mesh_name>': OBJ.Mesh }
 *
 */
function downloadMeshes(nameAndURLs, completionCallback, meshes) {
  if (meshes === undefined) {
    meshes = {};
  }
  var completed = [];
  var _loop_3 = function (mesh_name) {
    if (!nameAndURLs.hasOwnProperty(mesh_name)) {
      return 'continue';
    }
    var url = nameAndURLs[mesh_name];
    completed.push(
      fetch(url)
        .then(function (response) {
          return response.text();
        })
        .then(function (data) {
          return [mesh_name, new mesh_1['default'](data)];
        })
    );
  };
  for (var mesh_name in nameAndURLs) {
    _loop_3(mesh_name);
  }
  Promise.all(completed).then(function (ms) {
    var e_4, _a;
    try {
      for (var ms_2 = __values(ms), ms_2_1 = ms_2.next(); !ms_2_1.done; ms_2_1 = ms_2.next()) {
        var _b = __read(ms_2_1.value, 2),
          name_3 = _b[0],
          mesh = _b[1];
        meshes[name_3] = mesh;
      }
    } catch (e_4_1) {
      e_4 = { error: e_4_1 };
    } finally {
      try {
        if (ms_2_1 && !ms_2_1.done && (_a = ms_2['return'])) _a.call(ms_2);
      } finally {
        if (e_4) throw e_4.error;
      }
    }
    return completionCallback(meshes);
  });
}
exports.downloadMeshes = downloadMeshes;
function _buildBuffer(gl, type, data, itemSize) {
  var buffer = gl.createBuffer();
  var arrayView = type === gl.ARRAY_BUFFER ? Float32Array : Uint16Array;
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, new arrayView(data), gl.STATIC_DRAW);
  buffer.itemSize = itemSize;
  buffer.numItems = data.length / itemSize;
  return buffer;
}
exports._buildBuffer = _buildBuffer;
/**
 * Takes in the WebGL context and a Mesh, then creates and appends the buffers
 * to the mesh object as attributes.
 *
 * @param {WebGLRenderingContext} gl the `canvas.getContext('webgl')` context instance
 * @param {Mesh} mesh a single `OBJ.Mesh` instance
 *
 * The newly created mesh attributes are:
 *
 * Attrbute | Description
 * :--- | ---
 * **normalBuffer**       |contains the model&#39;s Vertex Normals
 * normalBuffer.itemSize  |set to 3 items
 * normalBuffer.numItems  |the total number of vertex normals
 * |
 * **textureBuffer**      |contains the model&#39;s Texture Coordinates
 * textureBuffer.itemSize |set to 2 items
 * textureBuffer.numItems |the number of texture coordinates
 * |
 * **vertexBuffer**       |contains the model&#39;s Vertex Position Coordinates (does not include w)
 * vertexBuffer.itemSize  |set to 3 items
 * vertexBuffer.numItems  |the total number of vertices
 * |
 * **indexBuffer**        |contains the indices of the faces
 * indexBuffer.itemSize   |is set to 1
 * indexBuffer.numItems   |the total number of indices
 *
 * A simple example (a lot of steps are missing, so don't copy and paste):
 *
 *     const gl   = canvas.getContext('webgl'),
 *         mesh = OBJ.Mesh(obj_file_data);
 *     // compile the shaders and create a shader program
 *     const shaderProgram = gl.createProgram();
 *     // compilation stuff here
 *     ...
 *     // make sure you have vertex, vertex normal, and texture coordinate
 *     // attributes located in your shaders and attach them to the shader program
 *     shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
 *     gl.enableVertexAttribArray(shaderProgram.aVertexPosition);
 *
 *     shaderProgram.aVertexNormal = gl.getAttribLocation(shaderProgram, "aVertexNormal");
 *     gl.enableVertexAttribArray(shaderProgram.aVertexNormal);
 *
 *     shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
 *     gl.enableVertexAttribArray(shaderProgram.aTextureCoord);
 *
 *     // create and initialize the vertex, vertex normal, and texture coordinate buffers
 *     // and save on to the mesh object
 *     OBJ.initMeshBuffers(gl, mesh);
 *
 *     // now to render the mesh
 *     gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
 *     gl.vertexAttribPointer(shaderProgram.aVertexPosition, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
 *     // it's possible that the mesh doesn't contain
 *     // any texture coordinates (e.g. suzanne.obj in the development branch).
 *     // in this case, the texture vertexAttribArray will need to be disabled
 *     // before the call to drawElements
 *     if(!mesh.textures.length){
 *       gl.disableVertexAttribArray(shaderProgram.aTextureCoord);
 *     }
 *     else{
 *       // if the texture vertexAttribArray has been previously
 *       // disabled, then it needs to be re-enabled
 *       gl.enableVertexAttribArray(shaderProgram.aTextureCoord);
 *       gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
 *       gl.vertexAttribPointer(shaderProgram.aTextureCoord, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
 *     }
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
 *     gl.vertexAttribPointer(shaderProgram.aVertexNormal, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
 *
 *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.mesh.indexBuffer);
 *     gl.drawElements(gl.TRIANGLES, model.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
 */
function initMeshBuffers(gl, mesh) {
  mesh.normalBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, mesh.vertexNormals, 3);
  mesh.textureBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, mesh.textures, mesh.textureStride);
  mesh.vertexBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, mesh.vertices, 3);
  mesh.indexBuffer = _buildBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, mesh.indices, 1);
  return mesh;
}
exports.initMeshBuffers = initMeshBuffers;
function deleteMeshBuffers(gl, mesh) {
  gl.deleteBuffer(mesh.normalBuffer);
  gl.deleteBuffer(mesh.textureBuffer);
  gl.deleteBuffer(mesh.vertexBuffer);
  gl.deleteBuffer(mesh.indexBuffer);
}
exports.deleteMeshBuffers = deleteMeshBuffers;
