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

import { Vector } from "@Engine/utils/math/vector.jsx";
import { Direction } from "@Engine/utils/enums.jsx";
import { loadAvatar, STORE_NAME } from "@Engine/utils/generator.jsx";
// Map Information
export default {
  bounds: [0, 0, 17, 19],
  // Determines the tileset to load
  tileset: "sewer",
  audioSrc: "/pixos/audio/calm-escape.mp3",
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
          return T.PILLAR;
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
    let portals = [
      {
        id: "door-l",
        type: "furniture/portal",
        facing: Direction.Down,
        onStep: () => {
          store.pixos[STORE_NAME].position = new Vector(...[5, 3, 0]);
          store.pixos[STORE_NAME].selected += 3;
        },
        zones: ["ice"],
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
    ];
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
            if (portals.length > 0 && posKey % Math.abs(22) && zone.getHeight(j, i) === 0) {
              let portal = portals.pop();
              portal.pos = new Vector(...[j, i, zone.getHeight(j, i)]);
              posKey % Math.abs(sprites.push(portal));
            } else if (portals.length > 0 && posKey % Math.abs(33) && zone.getHeight(j, i) === 0) {
              let portal = portals.shift();
              portal.pos = new Vector(...[j, i, zone.getHeight(j, i)]);
              posKey % Math.abs(sprites.push(portal));
            }
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
  defaultSprites: [
    // Objects
    { id: "chest", type: "objects/chests/wood", pos: new Vector(...[8, 14, 0]), facing: Direction.Down },
    { id: "chestmetal", type: "objects/chests/metal", pos: new Vector(...[9, 13, 0]), facing: Direction.Right },
    { id: "chestred", type: "objects/chests/red", pos: new Vector(...[9, 14, 0]), facing: Direction.Down },
    { id: "chestblue", type: "objects/chests/blue", pos: new Vector(...[7, 13, 0]), facing: Direction.Left },
    // Doorway
    {
      id: "door",
      type: "furniture/door",
      pos: new Vector(...[9, 1, 0]),
      facing: Direction.Down,
      zones: ["dungeon-top", "dungeon-bottom"],
    },
    // Tree
    { id: "tree", type: "furniture/tree", fixed: true, pos: new Vector(...[8, 13, 0]), facing: Direction.Up },
    // Furniture / Wall Decorations
    { id: "fireplace", type: "furniture/fireplace", fixed: true, pos: new Vector(...[11, 1, 0]), facing: Direction.Up },
    { id: "fireplace", type: "effects/fireplace", fixed: true, pos: new Vector(...[11, 1, 0]), facing: Direction.Up },
    // NPCs
    { id: "darkness", type: "npc/darkness", pos: new Vector(...[6, 5, 0]), facing: Direction.Down },
    { id: "air", type: "npc/air-knight", pos: new Vector(...[8, 2, 0]), facing: Direction.Down },
    { id: "fire", type: "npc/fire-knight", pos: new Vector(...[2, 8, 0]), facing: Direction.Right },
    { id: "earth", type: "npc/earth-knight", pos: new Vector(...[14, 8, 0]), facing: Direction.Left },
    // Presently - avatar is treated like a normal sprite (TODO - needs to be loaded dynamically via entry point)
    // { id: "avatar", type: "characters/default", pos: new Vector(...[9, 2, 0]), facing: Direction.Down },
  ],
  // Scenes + Scenarios
  scenes: [
    {
      id: "strange-legend",
      actions: [
        // manual actions
        // Scripted Dialogue Action Controls directly on sprites
        {
          sprite: "air",
          action: "dialogue",
          args: [
            [
              "Long ago, in a dungeon far far away",
              "The sewer was backing up, and well...everyone was losing their $%#t",
              "But one had a plan...",
            ],
            false,
            { autoclose: true },
          ],
          scope: this, // scoped to the zone
        },
        {
          sprite: "air",
          action: "dialogue",
          args: [["But what was that plan?..."], false, { autoclose: true }],
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
        await loadAvatar(this, STORE_NAME);
        await this.playScene("strange-legend");
      },
    },
    {
      id: "custom", // manually called custom script
      trigger: async function () {
        await this.spriteDialogue("earth", ["Lets get in there!"]);
      },
    },
    {
      id: "clear-path", // manually called custom script
      trigger: async function () {
        await this.moveSprite("darkness", [8, 3, 0], true);
      },
    },
  ],
  // objects // 3d
  objects: [
    {
      id: "test-obj",
      type: "person",
      mtl: false,
      useScale: new Vector(...[0.1, 0.1, 0.1]),
      pos: new Vector(...[10, 15, 0]),
    },
    {
      id: "test-bed",
      type: "bed",
      mtl: true,
      pos: new Vector(...[14, 10, 0]),
    },
    {
      id: "test-" + Math.random(),
      type: "chair",
      mtl: true,
      pos: new Vector(...[12, 6, 0]),
    },
    {
      id: "test" + Math.random(),
      type: "cactus_short",
      mtl: true,
      pos: new Vector(...[11, 6, 0]),
    },
    {
      id: "test-robot",
      type: "robot",
      mtl: false,
      pos: new Vector(...[7, 7, 1]),
      rotation: new Vector(...[0, 90, 0]),
    },
    {
      id: "test-cube",
      type: "die",
      mtl: true,
      pos: new Vector(...[6, 4, 1]),
    },
  ],
};
