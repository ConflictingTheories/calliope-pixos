/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
import ActionQueue from '@Engine/core/queue.jsx';
import Loadable from '@Engine/core/loadable.jsx';
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
    this.loaded = false;
    this.onLoadActions = new ActionQueue();
    this.onDefinitionLoadActions = new ActionQueue();
    this.onTextureLoaded = this.onTextureLoaded.bind(this);
  }

  /**
   * Received tileset definition JSON
   * @param {*} data
   */
  onJsonLoaded(data) {
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
  async onJsonLoadedFromZip(data, zip) {
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
  onTextureLoaded() {
    this.loaded = true;
    this.onLoadActions.run();
  }

  /**
   * Actions to run after the tileset definition has loaded,
   * but before the texture is ready
   * @param {*} action
   */
  runWhenDefinitionLoaded(action) {
    if (this.definitionLoaded) action();
    else this.onDefinitionLoadActions.add(action);
  }

  /**
   * Get vertices for tile
   * @param {*} id
   * @param {*} offset
   * @returns
   */
  getTileVertices(id, offset) {
    return this.geometry[id].vertices
      .map((poly) => poly.map((vertex) => [vertex[0] + offset[0], vertex[1] + offset[1], vertex[2] + offset[2]]))
      .flat(3);
  }

  /**
   * get texture coordinates
   * @param {*} id
   * @param {*} texId
   * @returns
   */
  getTileTexCoords(id, texId) {
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
  getWalkability(tileId) {
    return this.geometry[tileId].type;
  }

  /**
   * get poly for walk
   * @param {*} tileId
   * @returns
   */
  getTileWalkPoly(tileId) {
    return this.geometry[tileId].walkPoly;
  }
}
