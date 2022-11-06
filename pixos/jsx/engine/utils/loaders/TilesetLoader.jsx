/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import Resources from '@Engine/utils/resources.jsx';
import Tileset from '@Engine/core/tileset.jsx';

// Helps Loads New Tileset Instance
export class TilesetLoader {
  constructor(engine) {
    this.engine = engine;
    this.tilesets = {};
  }

  // load from zip
  async loadFromZip(type, sceneName, zip) {
    let tileset = this.tilesets[type];
    if (tileset) return tileset;
    let instance = new Tileset(this.engine);
    this.tilesets[type] = instance;
    instance.name = type;

    // extract component json files from zip file and compile into single config
    let tilesetJson = JSON.parse(await zip.file(`tilesets/${type}/tileset.json`).async('string'));
    let tilesetGeometry = JSON.parse(await zip.file(`tilesets/${type}/geometry.json`).async('string'));
    let tilesetTiles = JSON.parse(await zip.file(`tilesets/${type}/tiles.json`).async('string'));
    let tilesetData = this.loadTilesetData(tilesetJson, tilesetTiles, tilesetGeometry);

    await instance.onJsonLoadedFromZip(tilesetData, zip);
    return instance;
  }

  // load tileset data components and merge into config
  loadTilesetData(tilesetJson, Tiles, TilesetGeometry) {
    let geometry = {};
    Object.keys(tilesetJson.geometry).forEach((geo) => {
      geometry[geo] = TilesetGeometry[tilesetJson.geometry[geo]];
    });
    return {
      name: tilesetJson.name,
      src: tilesetJson.src,
      sheetSize: tilesetJson.sheetSize,
      sheetOffsetX: tilesetJson.sheetOffsetX,
      sheetOffsetY: tilesetJson.sheetOffsetY,
      tileSize: tilesetJson.tileSize,
      bgColor: tilesetJson.bgColor,
      // Tile Locations on resource (based on size)
      textures: tilesetJson.textures,
      // Geometries for the tileset
      // type --> walkability -- 1/0 --> [down,left,up,right]
      geometry: geometry,
      // tiles to use
      tiles: Tiles,
    };
  }
}
