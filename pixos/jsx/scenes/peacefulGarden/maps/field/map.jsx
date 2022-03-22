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
import T from "@Tilesets/field/tiles.jsx";

// Use Tileset
// Map Information
export default {
  bounds: [0, 0, 30, 50],
  // Determines the tileset to load
  tileset: "field",
  audioSrc: "/pixos/audio/calm-escape.mp3",
  portals: [
    {
      id: "door-l",
      type: "furniture/portal",
      facing: Direction.Down,
      onStep: () => {
        store.pixos[STORE_NAME].position = new Vector(...[5, 3, 0]);
        store.pixos[STORE_NAME].selected += 3;
      },
      zones: ["mountain"],
    },
    {
      id: "door-r",
      type: "furniture/portal",
      facing: Direction.Down,
      onStep: () => {
        store.pixos[STORE_NAME].position = new Vector(...[8, 3, 0]);
        store.pixos[STORE_NAME].selected += 7;
      },
      zones: ["jungle"],
    },
  ],
  // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
  cells: (bounds, zone) => {
    // generate based on bounds
    let x = bounds[0];
    let y = bounds[1];
    let width = bounds[2] - x;
    let height = bounds[3] - y;
    let cells = new Array(height).fill(null).map((_, i) => {
      return new Array(width).fill(null).map((__, j) => {
        let posKey = (x + i) * (y + j) + Math.floor(i * Math.random()) - Math.floor(j * Math.random());
        // Edges
        if (i == y || i == bounds[3] - 1 || j == x || j == bounds[2] - 1) {
          return T.EDGE;
        }
        // return random tile based on location (x+i, y+j)
        // 66% of tiles are floor
        if (posKey % Math.abs(3 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) !== 0) {
          return T.FLOOR;
        }

        // return random tile based on location (x+i, y+j)
        // 66% of tiles are floor
        if (posKey % Math.abs(7 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) !== 0) {
          return T.PILLAR;
        }

        // rest are random (for now just blocks)
        return T.BLOCK;
      });
    });
    return cells.filter((x) => x).flat(1);
  },
  // sprites
  sprites: (bounds, zone) => {
    // clear out sprites
    let sprites = zone.defaultSprites ?? [];
    // generate based on bounds
    let x = bounds[0];
    let y = bounds[1];
    let width = bounds[2] - x;
    let height = bounds[3] - y;
    new Array(height).fill(null).map((_, i) => {
      return new Array(width).fill(null).map((__, j) => {
        let posKey = (x + i) * (y + j) + Math.floor(i * Math.random()) - Math.floor(j * Math.random());
        // Edges
        if (i == y || i == bounds[3] - 1 || j == x || j == bounds[2] - 1) {
          // edge sprites
          for (let m = 0; m < Math.floor(((posKey + 1) * 227) % 9); m++) {
            sprites.push({
              id: "plt-" + posKey + m,
              type: "objects/plants/random",
              pos: new Vector(...[j, i, 2]),
              facing: Direction.Down,
            });
          }
        }

        // return random tile based on location (x+i, y+j)
        // 66% of tiles are floor
        if (posKey % Math.abs(3 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) !== 0) {
          // add some random flower sprites on some of those tiles to decorate (upto 6 per tile)
          if (posKey % Math.abs(5 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) === 0) {
            // add Portals randomly around map on floor tiles
            sprites = zone.addPortal(sprites, j, i);
          }
        }

        // return random tile based on location (x+i, y+j) -- TODO - Add check for tile type through method
        // 66% of tiles are floor
        if (posKey % Math.abs(7 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) !== 0) {
          // add some random flower sprites on some of those tiles to decorate (upto 6 per tile)
          if (posKey % Math.abs(5 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) === 0) {
            for (let m = 0; m < Math.floor(((posKey + 1) * 227) % 9); m++) {
              sprites.push({
                id: "plt-" + posKey + m,
                type: "objects/plants/random",
                pos: new Vector(...[j, i, zone.getHeight(j, i)]),
                facing: Direction.Down,
              });
            }
          }
        }

        // add some flowers to the remaining blocks
        if (posKey % Math.abs(5 + (store.pixos && store.pixos[STORE_NAME] ? store.pixos[STORE_NAME].selected : 7)) === 0) {
          for (let m = 0; m < Math.floor(((posKey + 1) * 227) % 9); m++) {
            sprites.push({
              id: "plt-" + posKey + m,
              type: "objects/plants/random",
              pos: new Vector(...[j, i, zone.getHeight(j, i)]),
              facing: Direction.Down,
            });
          }
        }
      });
    });
    return sprites;
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
