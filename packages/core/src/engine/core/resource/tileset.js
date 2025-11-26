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

import ActionQueue from '@Engine/core/queue/index.js';
import Loadable from '@Engine/core/queue/loadable.js';
export default class Tileset extends Loadable {
  /**
   * Tileset geometry and tiles
   * @param {*} engine
   */
  constructor(engine) {
    super();
    this.engine = engine;
    this.src = null;
    this.sheetSize = [0, 0];
    this.tileSize = 0;
    this.tiles = {};
    this.tileMetadata = {}; // Metadata per tile (e.g., preserveHeightOnWalk)
    this.loaded = false;
    this.onLoadActions = new ActionQueue();
    this.onDefinitionLoadActions = new ActionQueue();
  }

  /**
   * Received tileset definition JSON
   * @param {*} data
   */
  onJsonLoaded = (data) => {
    // Merge tileset definition into this object
    Object.keys(data).map((k) => {
      this[k] = data[k];
    });
    // Definition actions must always run before loaded actions
    this.definitionLoaded = true;
    this.onDefinitionLoadActions.run();
    // load texture
    this.texture = this.engine.resourceManager.loadTexture(this.src);
    this.texture.runWhenLoaded(this.onTextureLoaded);
    // set background colour
    if (this.bgColor) this.engine.gl.clearColor(this.bgColor[0] / 255, this.bgColor[1] / 255, this.bgColor[2] / 255, 1.0);
  }

  /**
   * Received tileset definition JSON
   * @param {*} data
   * @param {*} zip
   */
  onJsonLoadedFromZip = async (data, zip) => {
    // Merge tileset definition into this object
    Object.keys(data).map((k) => {
      this[k] = data[k];
    });
    // Definition actions must always run before loaded actions
    this.definitionLoaded = true;
    this.onDefinitionLoadActions.run();
    // load texture
    this.texture = await this.engine.resourceManager.loadTextureFromZip(this.src, zip);
    this.texture.runWhenLoaded(this.onTextureLoaded);
    // set background colour
    if (this.bgColor) this.engine.gl.clearColor(this.bgColor[0] / 255, this.bgColor[1] / 255, this.bgColor[2] / 255, 1.0);
  }

  /**
   * run when loaded
   */
  onTextureLoaded = () => {
    this.loaded = true;
    this.onLoadActions.run();
  }

  /**
   * Actions to run after the tileset definition has loaded,
   * but before the texture is ready
   * @param {*} action
   */
  runWhenDefinitionLoaded = (action) => {
    if (this.definitionLoaded) action();
    else this.onDefinitionLoadActions.add(action);
  }

  /**
   * Get vertices for tile
   * @param {*} id - Tile geometry ID
   * @param {*} offset - Position offset [x, y, z]
   * @param {number} heightOverride - Optional height override for the tile
   * @returns {Array} Flattened array of vertices
   */
  getTileVertices = (id, offset, heightOverride = null) => {
    // The tile 'offset' is [x, y, z]. Height override refers to the vertical
    // elevation of the tile (z-offset). We must not override the Y grid offset.
    const xOffset = offset[0];
    const yOffset = offset[1];
    const zOffset = heightOverride !== null ? heightOverride : offset[2];

    // Debug logging for first few calls with height override
    if (heightOverride !== null) {
      console.log(`[Tileset.getTileVertices] tile=${id}, offset=[${offset}], heightOverride=${heightOverride}, zOffset=${zOffset}`);
    }

    if (!this.geometry[id] || !this.geometry[id].vertices) {
      // If geometry is missing for a tile, log a warning and fallback to either
      // geometry[0] or a simple flat quad to avoid blank spaces in the map.
      console.warn(`[Tileset.getTileVertices] Missing geometry for tile id ${id}. Attempting fallback.`);
      if (this.geometry[0] && this.geometry[0].vertices) {
        id = 0; // fallback to first geometry definition
      } else {
        // Simple fallback quad: [0,0,0], [1,0,0], [1,0,1], [0,0,1]
        const quad = [
          [[0, 0, 0], [1, 0, 0], [1, 0, 1]],
          [[0, 0, 0], [1, 0, 1], [0, 0, 1]],
        ];
        return quad
          .map((poly) => poly.map((vertex) => [vertex[0] + offset[0], vertex[1] + yOffset, vertex[2] + zOffset]))
          .flat(3);
      }
    }

    return this.geometry[id].vertices
      .map((poly) => poly.map((vertex) => [
        vertex[0] + xOffset,
        vertex[1] + yOffset,
        vertex[2] + zOffset,
      ]))
      .flat(3);
  }

  /**
   * get texture coordinates
   * @param {*} id
   * @param {*} texId
   * @returns
   */
  getTileTexCoords = (id, texId) => {
    let tileOffset = this.textures[texId];
    let size = [this.tileSize / this.sheetSize[0], this.tileSize / this.sheetSize[1]];
    return this.geometry[id].surfaces
      .map((poly) => poly.map((vertex) => [(vertex[0] + tileOffset[0]) * size[0], (vertex[1] + tileOffset[1]) * size[1]]))
      .flat(3);
  }

  /**
   * determine walkability
   * @param {*} tileId
   * @returns
   */
  getWalkability = (tileId) => {
    return this.geometry[tileId].type;
  }

  /**
   * get poly for walk
   * @param {*} tileId
   * @returns
   */
  getTileWalkPoly = (tileId) => {
    return this.geometry[tileId].walkPoly;
  }

  /**
   * Get metadata for a tile (e.g., preserveHeightOnWalk)
   * @param {string} tileName
   * @returns {object}
   */
  getTileMetadata = (tileName) => {
    return this.tileMetadata[tileName] || {};
  }
}
