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

import { Direction } from '../../../engine/utils/enums.jsx';
import { Vector } from '../../../engine/utils/math/vector.jsx';
// Map Information
export function loadMap(json, cells) {
  return {
    // size of map
    bounds: json.bound,
    // Determines the tileset to load
    tileset: json.tileset,
    // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
    cells: cells,
    // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
    sprites: json.sprites.map((sprite) => {
      return {
        id: sprite.id,
        type: sprite.type,
        pos: new Vector(...sprite.pos),
        facing: Direction[sprite.facing],
        zones: sprite.zones ?? null,
      };
    }),
    // Scenes + Scenarios
    scenes: json.scenes.map((scene) => {
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
            };
          }
        }),
        scope: this,
      };
    }),
    // Scripts / Triggers for the Zone
    scripts: json.scripts.map((script) => {
      return {
        id: script.id,
        trigger: eval.apply(this, script.trigger),
      };
    }),
    // objects // 3d
    objects: json.objects.map((object) => {
      return {
        id: object.id,
        type: object.type,
        mtl: object.mtl,
        useScale: object.useScale ? new Vector(...object.useScale) : null,
        pos: object.pos ? new Vector(...object.pos) : null,
        rotation: object.rotation ? new Vector(...object.rotation) : null,
      };
    }),
  };
}
