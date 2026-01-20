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

import Resources from '../resources.js';
import ModelObject from '@Engine/core/resource/object.js';

//helps load models
export class ObjectLoader {
  constructor(engine) {
    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  }

  // Load 3d model
  async loadFromZip(zip, model) {
    let afterLoad = arguments[2];
    let runConfigure = arguments[3];
    if (!this.instances[model.id]) {
      this.instances[model.id] = [];
    }

    let instance = new ModelObject(this.engine);
    // Copy model properties to instance
    Object.assign(instance, model);
    instance.type = model.type;
    instance.id = model.id;
    // New Instance
    const objFilename = `models/${instance.type}.obj`;
    const mtlFilename = typeof model.mtl === 'string' ? `models/${model.mtl}` : null;

    // Extract OBJ text
    const objFile = zip.file(objFilename);
    if (!objFile) {
      console.error(`Failed to find OBJ file: ${objFilename}`);
      return null;
    }
    const objText = await objFile.async('string');

    // Parse OBJ
    const meshes = this.engine.resourceManager.objHelper.parseOBJ(objText);

    // Extract and parse MTL if present
    let materials = {};
    if (mtlFilename && typeof mtlFilename === 'string') {
      try {
        const mtlFile = zip.file(mtlFilename);
        if (mtlFile) {
          const mtlText = await mtlFile.async('string');
          materials = this.engine.resourceManager.objHelper.parseMTL(mtlText);
        } else {
          console.warn(`MTL file not found in zip: ${mtlFilename}`);
        }
      } catch (err) {
        console.warn(`Failed to load MTL ${mtlFilename}:`, err);
      }
    }

    // Assign materials to meshes
    this.engine.resourceManager.objHelper.assignMaterials(meshes, materials);

    // Load textures from zip
    await this.engine.resourceManager.objHelper.loadTextures(meshes, { zip, root: 'textures' });

    // Convert parseOBJ format to legacy format for compatibility
    // parseOBJ uses: positions, normals, uvs
    // legacy expects: vertices, vertexNormals, textures, indices
    meshes.forEach(mesh => {
      if (mesh.positions) {
        mesh.vertices = mesh.positions;
        mesh.vertexNormals = mesh.normals || [];
        mesh.textures = mesh.uvs || [];
        mesh.indices = mesh.indices || new Array(mesh.vertices.length / 3).fill(0).map((_, i) => i);
      }
    });

    // Initialize WebGL buffers for first mesh (or create composite mesh)
    let compositeMesh = meshes[0] || {};
    if (meshes.length > 1) {
      // Combine multiple meshes into one
      let totalVertices = 0;
      let allVertices = [];
      let allNormals = [];
      let allTextures = [];
      let allIndices = [];

      meshes.forEach(mesh => {
        if (mesh.vertices) {
          const vertexOffset = totalVertices;
          allVertices.push(...mesh.vertices);
          allNormals.push(...(mesh.vertexNormals || []));
          allTextures.push(...(mesh.textures || []));
          
          // Add indices with offset
          const meshIndices = mesh.indices || new Array(mesh.vertices.length / 3).fill(0).map((_, i) => i);
          allIndices.push(...meshIndices.map(i => i + vertexOffset));
          
          totalVertices += mesh.vertices.length / 3;
        }
      });

      compositeMesh = {
        vertices: allVertices,
        vertexNormals: allNormals,
        textures: allTextures,
        indices: allIndices,
        materials: materials
      };
    }

    // Initialize WebGL buffers
    this.engine.resourceManager.objHelper.initLegacyBuffers(compositeMesh);

    // Set the mesh on the instance
    instance.mesh = compositeMesh;

    instance.templateLoaded = true;

    // Update Existing
    this.instances[instance.id].forEach(function (instance) {
      if (instance.afterLoad) instance.afterLoad(instance.instance);
    });

    // Configure if needed
    if (runConfigure) runConfigure(instance);

    // once loaded
    if (afterLoad) {
      if (instance.templateLoaded) afterLoad(instance);
      else this.instances[instance.id].push({ instance, afterLoad });
    }

    instance.loaded = true;
    return instance;
  }
}
