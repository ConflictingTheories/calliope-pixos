"use strict";

exports.__esModule = true;
exports.version = exports.deleteMeshBuffers = exports.initMeshBuffers = exports.downloadMeshes = exports.downloadModels = exports.TYPES = exports.Mesh = exports.MaterialLibrary = exports.Material = exports.Layout = exports.DuplicateAttributeException = exports.Attribute = exports.OBJ = void 0;

var mesh_1 = require("./mesh");

exports.Mesh = mesh_1["default"];

var material_1 = require("./material");

exports.Material = material_1.Material;
exports.MaterialLibrary = material_1.MaterialLibrary;

var layout_1 = require("./layout");

exports.Layout = layout_1.Layout;
exports.TYPES = layout_1.TYPES;
exports.DuplicateAttributeException = layout_1.DuplicateAttributeException;
exports.Attribute = layout_1.Attribute;

var utils_1 = require("./utils");

exports.downloadModels = utils_1.downloadModels;
exports.downloadMeshes = utils_1.downloadMeshes;
exports.initMeshBuffers = utils_1.initMeshBuffers;
exports.deleteMeshBuffers = utils_1.deleteMeshBuffers;
var version = "2.0.3";
exports.version = version;
exports.OBJ = {
  Attribute: layout_1.Attribute,
  DuplicateAttributeException: layout_1.DuplicateAttributeException,
  Layout: layout_1.Layout,
  Material: material_1.Material,
  MaterialLibrary: material_1.MaterialLibrary,
  Mesh: mesh_1["default"],
  TYPES: layout_1.TYPES,
  downloadModels: utils_1.downloadModels,
  downloadMeshes: utils_1.downloadMeshes,
  initMeshBuffers: utils_1.initMeshBuffers,
  deleteMeshBuffers: utils_1.deleteMeshBuffers,
  version: version
};