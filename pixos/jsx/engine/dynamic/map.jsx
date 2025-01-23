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
import PixosLuaInterpreter from '@Engine/scripting/PixosLuaInterpreter.jsx';

/**
 * Load Map Information
 * @param {*} json
 * @param {*} cells
 * @param {*} zip
 * @returns
 */
export async function loadMap(json, cells, zip) {
  console.log('loading map....');

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
  console.log('loading map....');

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
  console.log('loading map....');

  let $scripts = await Promise.all(
    json.scripts.map(async (script) => {
      try {
        // Lua Scripting
        try {
          let luaScript = await zip.file(`triggers/${script.trigger}.lua`).async('string');
          console.log({ msg: 'lua script', luaScript });

          // defer execution of lua until trigger is called
          let result = ((_this) => {
            let interpreter = new PixosLuaInterpreter(this.engine);
            interpreter.setScope({ _this });
            interpreter.initLibrary();
            interpreter.run('print("hello world lua - zone")');
            return {
              id: script.id,
              trigger: async () => {
                console.log('running actual trigger');
                return interpreter.run(luaScript);
              },
            };
          }).call(this, this);
          console.log({ msg: 'zone trigger Lua eval response', result });

          return result;
        } catch (e) {
          console.error(e);
        }

        // JS scripting
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
        console.log({ msg: 'zone trigger JS eval statement', $statement });

        let result = eval.call(this, $statement).call(this, this);
        console.log({ msg: 'zone trigger JS eval response', result });

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

  // let $lights = json.lights.map((light) => {
  //   console.log(light);
  //   return {
  //     id: light.id,
  //     pos: light.pos ? new Vector(...light.pos) : null,
  //     color: light.color ? new Vector(...light.color) : null,
  //     direction: light.direction ? new Vector(...light.direction) : null,
  //     attentuation: light.attentuation ? new Vector(...light.attentuation) : null,
  //     enabled: light.enabled ?? false,
  //   };
  // });
  // console.log('adding lights....' + $lights.length);

  console.log('loading map....');

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
    // lights
    lights: json.lights,
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
