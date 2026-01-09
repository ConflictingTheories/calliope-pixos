/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
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
 * OBJ/MTL file parser and loader for WebGL
 * Based on webgl-obj-loader
 *
 * @module @Engine/utils/obj
 */

// Import CommonJS modules with namespace import for babel interop
import * as meshModule from './mesh.js';
import * as materialModule from './material.js';
import * as layoutModule from './layout.js';
import * as utilsModule from './utils.js';

// Extract exports (handle both ESM default and CJS module.exports patterns)
const Mesh = meshModule.default || meshModule;
const Material = materialModule.Material;
const MaterialLibrary = materialModule.MaterialLibrary;
const Layout = layoutModule.Layout;
const TYPES = layoutModule.TYPES;
const DuplicateAttributeException = layoutModule.DuplicateAttributeException;
const Attribute = layoutModule.Attribute;
const downloadModelsFromZip = utilsModule.downloadModelsFromZip;
const downloadModels = utilsModule.downloadModels;
const downloadMeshes = utilsModule.downloadMeshes;
const initMeshBuffers = utilsModule.initMeshBuffers;
const deleteMeshBuffers = utilsModule.deleteMeshBuffers;
const _buildBuffer = utilsModule._buildBuffer;

const version = '2.0.3';

// Create OBJ namespace object
const OBJ = {
  Attribute,
  DuplicateAttributeException,
  Layout,
  Material,
  MaterialLibrary,
  Mesh,
  TYPES,
  downloadModelsFromZip,
  downloadModels,
  downloadMeshes,
  initMeshBuffers,
  deleteMeshBuffers,
  _buildBuffer,
  version,
};

// Named exports
export {
  Mesh,
  Material,
  MaterialLibrary,
  Layout,
  TYPES,
  DuplicateAttributeException,
  Attribute,
  downloadModelsFromZip,
  downloadModels,
  downloadMeshes,
  initMeshBuffers,
  deleteMeshBuffers,
  _buildBuffer,
  version,
  OBJ,
};

// Default export
export default OBJ;
