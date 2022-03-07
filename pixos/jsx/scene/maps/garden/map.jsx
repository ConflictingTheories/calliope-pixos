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

import { store } from "react-recollect";
import { Vector } from "../../../engine/utils/math/vector.jsx";
import { Direction } from "../../../engine/utils/enums.jsx";
import { loadAvatar, generateZone, STORE_NAME } from "../../../engine/utils/generator.jsx";
import T from "../../tilesets/sewer/tiles.jsx";

// Use Tileset
// Map Information
export default {
  bounds: [0, 0, 30, 50],
  // Determines the tileset to load
  tileset: "jungle",
  audioSrc: "/pixos/audio/blue-fields.mp3",
  // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
  cells: (bounds, zone) => {
    let x = bounds[0];
    let y = bounds[1];
    let width = bounds[2] - x;
    let height = bounds[3] - y;
    let a = new Array(height).fill(null).map((_, i) => {
      return new Array(width).fill(null).map((__, j) => {
        if (i == y || i == bounds[3] - 1 || j == x || j == bounds[2] - 1) {
          console.log("PILLAR TIME");
          // let len = Math.floor(Math.random() * 3);
          // while (len--) {
          // zone.loadSprite(zone, {
          //   id: "plt-" + Math.random(),
          //   type: "objects/plants/random",
          //   pos: new Vector(...[i, j, 2]),
          //   facing: Direction.Down,
          // });
          // }
          return T.PILLAR;
        }
        // return random tile based on location (x+i, y+j)
        let posKey = (x + i) * (y + j) + Math.floor(i * Math.random()) - Math.floor(j * Math.random());
        // 66% of tiles are floor
        let random = posKey % Math.abs(3 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7));
        if (random !== 0) {
          // add some random flower sprites on some of those tiles to decorate (upto 6 per tile)
          let random = posKey % Math.abs(3 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7));
          if (random !== 0) {
            let len = Math.floor((random * 6)%9);
            for (let m = 0; m < len; m++) {
              zone.sprites.push({
                id: "plt-" + Math.random(),
                type: "objects/plants/random",
                pos: new Vector(...[i, j, 0]),
                facing: Direction.Down,
              });
            }
          }
          return T.FLOOR;
        }

        // let len = Math.floor(Math.random() * 6);
        // for (let m = 0; m < len; m++) {
        //   zone.sprites.push({
        //     id: "plt-" + Math.random(),
        //     type: "objects/plants/random",
        //     pos: new Vector(...[i, j, 2]),
        //     facing: Direction.Down,
        //   });
        // }
        // rest are random (for now just pillars)
        return T.PILLAR;
      });
    });
    return a.filter((x) => x).flat(1);
  },
  // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
  sprites: [
    // Objects
    // { id: "chest", type: "objects/chests/wood", pos: new Vector(...[8, 14, 0]), facing: Direction.Down },
    // { id: "chestmetal", type: "objects/chests/metal", pos: new Vector(...[9, 13, 0]), facing: Direction.Right },
    // Tree
    // { id: "tree", type: "furniture/tree", fixed: true, pos: new Vector(...[8, 13, 0]), facing: Direction.Up },
    // Doors
    {
      id: "door-l",
      type: "furniture/portal",
      pos: new Vector(...[5, 2, 0]),
      facing: Direction.Down,
      onStep: () => {
        store.pixos[STORE_NAME].position = new Vector(...[5, 3, 0]);
        store.pixos[STORE_NAME].selected -= 3;
      },
      zones: ["room"],
    },

    {
      id: "door-r",
      type: "furniture/portal",
      pos: new Vector(...[8, 2, 0]),
      facing: Direction.Down,
      onStep: () => {
        store.pixos[STORE_NAME].position = new Vector(...[8, 3, 0]);
        store.pixos[STORE_NAME].selected += 7;
      },
      zones: ["garden"],
    },
  ],
  // Scenes + Scenarios
  scenes: [
    {
      id: "welcome",
      actions: [
        // manual actions
        // Scripted Dialogue Action Controls directly on sprites
        {
          sprite: "avatar",
          action: "dialogue",
          args: [
            [
              "Welcome to the Peaceful Garden.",
              "May your anxieties melt away and your inner spirit find balance and a sense of calm.",
              "Feel free to take a look around and explore.",
            ],
            false,
            { autoclose: true },
          ],
          scope: this, // scoped to the zone
        },
        // or call premade events and bundle many things and trigger them
        { trigger: "custom", scope: this },
      ],
    },
    ,
  ],
  // Scripts / Triggers for the Zone
  scripts: [
    {
      id: "load-scene", // **runs automatically when loaded
      trigger: async function () {
        // randomly pick gender & store
        let gender = await loadAvatar(this, STORE_NAME);
        // generate the zone procedurally
        await generateZone(this, gender, STORE_NAME, require("../../dialogues/cyoa.json"));
      },
    },
  ],
  // objects // 3d
  objects: [
    {
      id: "test" + Math.random(),
      type: "cactus_short",
      mtl: true,
      pos: new Vector(...[11, 6, 0]),
    },
  ],
};
