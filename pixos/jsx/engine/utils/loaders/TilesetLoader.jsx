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

import Resources from '@Engine/utils/resources.jsx';
import Tileset from '@Engine/core/tileset.jsx';
import { mergeDeep } from '@Engine/utils/enums.jsx';

// Helps Loads New Tileset Instance
export class TilesetLoader {
  constructor(engine) {
    this.engine = engine;
    this.tilesets = {};
  }

  // load from zip
  async loadFromZip(zip, type, spritzName) {
    console.log('loading tileset from zip: ' + type + ' for ' + spritzName);
    let tileset = this.tilesets[type];
    if (tileset) return tileset;
    let instance = new Tileset(this.engine);
    this.tilesets[type] = instance;
    instance.name = type;

    // extract component json files from zip file and compile into single config
    let tilesetJson = JSON.parse(await zip.file(`tilesets/${type}/tileset.json`).async('string'));
    let tilesetGeometry = JSON.parse(await zip.file(`tilesets/${type}/geometry.json`).async('string'));
    let tilesetTiles = JSON.parse(await zip.file(`tilesets/${type}/tiles.json`).async('string'));
    let tilesetData = await this.loadTilesetData(tilesetJson, tilesetTiles, tilesetGeometry, zip);

    await instance.onJsonLoadedFromZip(tilesetData, zip);
    return instance;
  }

  // load tileset data components and merge into config
  async loadTilesetData(tilesetJson, Tiles, TilesetGeometry, zip) {
    // extend tileset
    if (tilesetJson.extends) {
      await Promise.all(
        tilesetJson.extends.map(async (file) => {
          let stringD = JSON.parse(await zip.file('tilesets/' + file + '/tileset.json').async('string'));
          tilesetJson = mergeDeep(tilesetJson, stringD);
        })
      );
      // unset
      tilesetJson.extends = null;
    }
    console.log({ tilesetJson });
    // extend tiles
    if (Tiles.extends) {
      await Promise.all(
        Tiles.extends.map(async (file) => {
          let stringD = JSON.parse(await zip.file('tilesets/' + file + '/tiles.json').async('string'));
          Tiles = mergeDeep(Tiles, stringD);
        })
      );
      // unset
      Tiles.extends = null;
    }
    console.log({ Tiles });

    // extend geometry
    if (TilesetGeometry.extends) {
      await Promise.all(
        TilesetGeometry.extends.map(async (file) => {
          let stringD = JSON.parse(await zip.file('tilesets/' + file + '/geometry.json').async('string'));
          TilesetGeometry = mergeDeep(TilesetGeometry, stringD);
        })
      );
      // unset
      TilesetGeometry.extends = null;
    }
    console.log({ TilesetGeometry });

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
