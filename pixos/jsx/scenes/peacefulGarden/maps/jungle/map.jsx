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

import { store } from "react-recollect";
import { Vector } from "@Engine/utils/math/vector.jsx";
import { Direction } from "@Engine/utils/enums.jsx";
import { loadAvatar, generateZone, STORE_NAME } from "@Engine/utils/generator.jsx";
import T from "@Tilesets/jungle/tiles.jsx";

// Use Tileset
// Map Information
export default {
  bounds: [0, 0, 30, 50],
  // Determines the tileset to load
  tileset: "jungle",
  audioSrc: "/pixos/audio/blue-fields.mp3",
  // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
  cells: (bounds, zone) => {
    // clear out sprites
    zone.sprites = zone.defaultSprites ?? [];
    // generate based on bounds
    let x = bounds[0];
    let y = bounds[1];
    let width = bounds[2] - x;
    let height = bounds[3] - y;
    let portals = [
      {
        id: "door-l",
        type: "furniture/portal",
        pos: new Vector(...[5, 2, 0]),
        facing: Direction.Down,
        onStep: () => {
          store.pixos[STORE_NAME].position = new Vector(...[5, 3, 0]);
          store.pixos[STORE_NAME].selected += 3;
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
        zones: ["mountain"],
      },
    ];
    let a = new Array(height).fill(null).map((_, i) => {
      return new Array(width).fill(null).map((__, j) => {
        let posKey = (x + i) * (y + j) + Math.floor(i * Math.random()) - Math.floor(j * Math.random());
        // Edges
        if (i == y || i == bounds[3] - 1 || j == x || j == bounds[2] - 1) {
          let len = Math.floor(((posKey + 1) * 337) % 9);
          for (let m = 0; m < len; m++) {
            zone.sprites.push({
              id: "plt-" + posKey + m,
              type: "objects/plants/random",
              pos: new Vector(...[j, i, 2]),
              facing: Direction.Down,
            });
          }
          return T.PILLAR;
        }
        // return random tile based on location (x+i, y+j)
        // 66% of tiles are floor
        if (posKey % Math.abs(3 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) !== 0) {
          // add some random flower sprites on some of those tiles to decorate (upto 6 per tile)
          if (posKey % Math.abs(5 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) === 0) {
            // flowers
            // for (let m = 0; m < Math.floor(((posKey + 1) * 227) % 9); m++) {
            //   zone.sprites.push({
            //     id: "plt-" + posKey + m,
            //     type: "objects/plants/random",
            //     pos: new Vector(...[j, i, 0]),
            //     facing: Direction.Down,
            //   });
            // }

            // add Portals randomly around map on floor tiles
            if (portals.length > 0 && posKey % Math.abs(22)) {
              let portal = portals.pop();
              portal.pos = new Vector(...[j, i, 0]);
              posKey % Math.abs(zone.sprites.push(portal));
            } else if (portals.length > 0 && posKey % Math.abs(33)) {
              let portal = portals.shift();
              portal.pos = new Vector(...[j, i, 0]);
              posKey % Math.abs(zone.sprites.push(portal));
            }
          }
          return T.FLOOR;
        }

        // return random tile based on location (x+i, y+j)
        // 66% of tiles are floor
        if (posKey % Math.abs(7 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) !== 0) {
          // add some random flower sprites on some of those tiles to decorate (upto 6 per tile)
          if (posKey % Math.abs(5 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) === 0) {
            for (let m = 0; m < Math.floor(((posKey + 1) * 227) % 9); m++) {
              zone.sprites.push({
                id: "plt-" + posKey + m,
                type: "objects/plants/random",
                pos: new Vector(...[j, i, 2]),
                facing: Direction.Down,
              });
            }
          }
          return T.PILLAR;
        }

        // add some flowers to the remaining blocks
        if (posKey % Math.abs(5 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) === 0) {
          for (let m = 0; m < Math.floor(((posKey + 1) * 227) % 9); m++) {
            zone.sprites.push({
              id: "plt-" + posKey + m,
              type: "objects/plants/random",
              pos: new Vector(...[j, i, 1]),
              facing: Direction.Down,
            });
          }
        }

        // rest are random (for now just blocks)
        return T.BLOCK;
      });
    });
    return a.filter((x) => x).flat(1);
  },
  // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
  defaultSprites: [],
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
