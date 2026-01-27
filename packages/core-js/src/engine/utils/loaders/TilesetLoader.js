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

import { debug } from '../debug-logger.js';
import Tileset from '@Engine/core/resource/tileset.js';
import { mergeDeep } from '@Engine/utils/enums.js';

// Helps Loads New Tileset Instance
export class TilesetLoader {
  constructor(engine) {
    this.engine = engine;
    this.tilesets = {};
  }

  // load from zip
  async loadFromZip(zip, type, spritzName) {
    debug('Loader', 'loading tileset from zip: ' + type + ' for ' + spritzName);
    let tileset = this.tilesets[type];
    if (tileset) return tileset;
    let instance = new Tileset(this.engine);
    this.tilesets[type] = instance;
    instance.name = type;

    // extract component json files from zip file and compile into single config
    let tilesetJson = JSON.parse(await zip.file(`tilesets/${type}/tileset.json`).async('string'));
    let tilesetData = await this.loadTilesetData(tilesetJson, zip);

    await instance.onJsonLoadedFromZip(tilesetData, zip);
    return instance;
  }

  // load tileset data components and merge into config
  async loadTilesetData(tilesetJson, zip) {
    const tilesetName = tilesetJson.name || 'common';

    // extend tileset
    if (tilesetJson.extends) {
      await Promise.all(
        tilesetJson.extends.map(async file => {
          let stringD = JSON.parse(
            await zip.file('tilesets/' + file + '/tileset.json').async('string')
          );
          tilesetJson = mergeDeep(tilesetJson, stringD);
        })
      );
      // unset
      tilesetJson.extends = null;
    }

    // Try to load separate tiles.json if tiles not in tileset.json
    if (!tilesetJson.tiles) {
      try {
        const tilesFile = zip.file(`tilesets/${tilesetName}/tiles.json`);
        if (tilesFile) {
          tilesetJson.tiles = JSON.parse(await tilesFile.async('string'));
          debug('Loader', `[TilesetLoader] Loaded separate tiles.json for ${tilesetName}`);
        }
      } catch (e) {
        console.warn(`[TilesetLoader] No tiles.json found for ${tilesetName}`);
      }
    }

    // Try to load separate geometry.json if geometry not in tileset.json
    if (!tilesetJson.geometry) {
      try {
        const geometryFile = zip.file(`tilesets/${tilesetName}/geometry.json`);
        if (geometryFile) {
          tilesetJson.geometry = JSON.parse(await geometryFile.async('string'));
          debug('Loader', `[TilesetLoader] Loaded separate geometry.json for ${tilesetName}`);
        }
      } catch (e) {
        console.warn(`[TilesetLoader] No geometry.json found for ${tilesetName}`);
      }
    }

    debug('Loader', { tilesetJson });

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
      geometry: tilesetJson.geometry,
      // tiles to use
      tiles: tilesetJson.tiles,
    };
  }
}
