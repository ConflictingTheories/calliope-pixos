/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { Direction } from '@Engine/utils/enums.js';
import { Vector } from '@Engine/utils/math/vector.js';
import PixoScriptInterpreter from '@Engine/scripting/PixoScriptInterpreter.js';
import { debug, debugError } from '@Engine/utils/debug-logger.js';

/**
 * Loads map information from JSON, cells, and zip data.
 * @param {Object} json - The JSON configuration.
 * @param {Array|string} cells - The cells data.
 * @param {Object} zip - The zip file data.
 * @param {Array} heights - Optional heights data for tile elevation.
 * @returns {Promise<Object>} The loaded map data.
 */
export async function loadMap(json, cells, zip, heights = null) {
  debug('Map', 'loading map....');
  if (heights) {
    debug('Map', 'Using heights data:', heights.length, 'rows');
  }

  // read sprites & handle functions
  let $sprites =
    typeof json.sprites === 'string'
      ? json.sprites
      : json.sprites.map((sprite) => {
        return {
          id: sprite.id,
          type: sprite.type,
          pos: new Vector(...sprite.pos),
          facing: Direction[sprite.facing],
          zones: sprite.zones ?? null,
        };
      });

  let $scenes = (json.scenes ?? []).map((scene) => {
    return {
      id: scene.id,
      actions: scene.actions.map((action) => {
        if (action.trigger) {
          return { trigger: action.trigger, scope: this };
        } else {
          return {
            sprite: action.sprite,
            action: action.action,
            args: action.args,
            scope: this,
          };
        }
      }),
      scope: this,
    };
  });

  let $scripts = await Promise.all(
    (json.scripts ?? []).map(async (script) => {
      // Lua Scripting
      try {
        let file = zip.file(`triggers/${script.trigger}.pxs`);
        if (!file) file = zip.file(`triggers/${script.trigger}.pxs`);
        let luaScript = await file.async('string');
        debug('Map', 'lua script', luaScript);

        // defer execution of lua until trigger is called
        let result = ((_this) => {
          let interpreter = new PixoScriptInterpreter(_this.engine);
          interpreter.setScope({ _this, zone: this, subject: _this });
          interpreter.initLibrary();
          interpreter.run('print("hello world lua - zone")');
          return {
            id: script.id,
            trigger: async () => {
              debug('Map', 'running actual trigger');
              return interpreter.run(luaScript);
            },
          };
        }).bind(this)(this);
        debug('Map', 'zone trigger Lua eval response', result);

        return result;
      } catch (e) {
        console.error(e);
      }
    })
  );

  let $objects = (json.objects ?? []).map((object) => {
    return {
      id: object.id,
      type: object.type,
      mtl: object.mtl,
      useScale: object.useScale ? new Vector(...object.useScale) : null,
      pos: object.pos ? new Vector(...object.pos) : null,
      rotation: object.rotation ? new Vector(...object.rotation) : null,
    };
  });

  return {
    // size of map
    bounds: json.bounds,
    // Determines the tileset to load
    tileset: json.tileset,
    // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
    cells: cells,
    // Heights data for each cell (optional)
    heights: heights,
    // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
    sprites: $sprites,
    // Scenes + Scenarios
    scenes: $scenes,
    // Scripts / Triggers for the Zone
    scripts: $scripts,
    // objects // 3d
    objects: $objects,
    // lights
    lights: json.lights,
    // select Trigger
    selectTrigger: json.selectTrigger,
  };
}

/**
 * Generates map cells from a tileset.
 * @param {Array|string} cells - The cells data.
 * @param {Object} Tileset - The tileset mapping.
 * @returns {Array|string} The generated cells.
 */
export function dynamicCells(cells, Tileset) {
  // handle cells generator
  if (typeof cells === 'string') {
    return cells;
  }
  
  // Guard: Check if Tileset is valid
  if (!Tileset || typeof Tileset !== 'object') {
    console.error('[dynamicCells] Tileset is undefined or invalid - tiles.json may be missing from tileset');
    return [];
  }
  
  let result = [];
  let missingTiles = new Set();
  
  cells.forEach((row, i) => {
    let len = row.length;
    row.forEach((cell, j) => {
      const tileData = Tileset[cell];
      if (!tileData) {
        missingTiles.add(cell);
        // Provide a fallback empty tile
        result[i * len + j] = ['FLAT_ALL', 'FLOOR', 0];
      } else {
        result[i * len + j] = tileData;
      }
    });
  });
  
  // Log missing tiles once
  if (missingTiles.size > 0) {
    console.warn('[dynamicCells] Missing tile definitions:', Array.from(missingTiles).join(', '));
  }
  
  return result;
}
