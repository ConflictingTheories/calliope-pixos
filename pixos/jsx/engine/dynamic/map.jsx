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

import { Direction } from '@Engine/utils/enums.jsx';
import { Vector } from '@Engine/utils/math/vector.jsx';
/**
 * Load Map Information
 * @param {*} json
 * @param {*} cells
 * @param {*} zip
 * @returns
 */
export async function loadMap(json, cells, zip) {
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

  let $scenes = json.scenes.map((scene) => {
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
    json.scripts.map(async (script) => {
      try {
        let triggerScript = (await zip.file(`triggers/${script.trigger}.js`).async('string')).replace(/\};/, '}');
        let $statement =
          `
        ((_this)=>{return{
          id: '` +
          script.id +
          `',
          trigger: ` +
          triggerScript +
          `,
        }})
      `;
        let result = eval.call(this, $statement).call(this, this);
        return result;
      } catch (e) {
        console.error(e);
      }
    })
  );

  let $objects = json.objects.map((object) => {
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
    // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
    sprites: $sprites,
    // Scenes + Scenarios
    scenes: $scenes,
    // Scripts / Triggers for the Zone
    scripts: $scripts,
    // objects // 3d
    objects: $objects,
  };
}

/**
 * Generate Map Cells from Tileset
 * @param {*} cells
 * @param {*} Tileset
 * @returns
 */
export function dynamicCells(cells, Tileset) {
  // handle cells generator
  if (typeof cells === 'string') {
    return cells;
  }
  let result = [];
  cells.forEach((row, i) => {
    let len = row.length;
    row.forEach((cell, j) => {
      result[i * len + j] = Tileset[cell];
    });
  });
  return result;
}
