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

import { Vector } from "../../../engine/utils/math/vector.jsx";
import { Direction } from "../../../engine/utils/enums.jsx";
import { store } from "react-recollect";
import T from "../../tilesets/sewer/tiles.jsx";
// Use Tileset
// Map Information
export default {
  bounds: [0, 0, 30, 50],
  // Determines the tileset to load
  tileset: "jungle",
  // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
  cells: (bounds) => {
    let tiles = Object.keys(T);
    let x = bounds[0];
    let y = bounds[1];
    let width = bounds[2] - x;
    let height = bounds[3] - y;
    let a = new Array(height).fill(null).map((_, i) => {
      return new Array(width).fill(null).map((__, j) => {
        if(i == y || i == bounds[3]-1 || j == x || j == bounds[2]-1){
          return T.PILLAR;
        }
        // return random tile based on location (x+i, y+j)
        let posKey = (x + i) * (y + j) + Math.floor(i * Math.random()) - Math.floor(j * Math.random());
        // 66% of tiles are floor
        let random = posKey % Math.abs(3 + (store.pixos && store.pixos["garden-tome"] ? store.pixos["garden-tome"].selected : 7));
        if (random !== 0) return T.FLOOR;
        // rest are random (for now just pillars)
        let tileMod = posKey % (tiles.length - 1);
        return T.PILLAR; //T[tiles[tileMod]] ??
      });
    });
    return a.flat(1);
  },
  // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
  sprites: [
    // Objects
    { id: "chest", type: "objects/chests/wood", pos: new Vector(...[8, 14, 0]), facing: Direction.Down },
    { id: "chestmetal", type: "objects/chests/metal", pos: new Vector(...[9, 13, 0]), facing: Direction.Right },
    // Tree
    { id: "tree", type: "furniture/tree", fixed: true, pos: new Vector(...[8, 13, 0]), facing: Direction.Up },
    // Presently - avatar is treated like a normal sprite (TODO - needs to be loaded dynamically via entry point)
    {
      id: "avatar",
      type: "characters/default",
      pos:
        typeof store.pixos["garden-tome"]?.position !== "undefined"
          ? store.pixos["garden-tome"].position
          : new Vector(...[8, 8, 0]),
      facing: Direction.Down,
    },

    // Doors

    {
      id: "door-l",
      type: "furniture/portal",
      pos: new Vector(...[5, 2, 0]),
      facing: Direction.Down,
      onStep: () => {
        store.pixos["garden-tome"].position = new Vector(...[5, 3, 0]);
        store.pixos["garden-tome"].selected -= 3;
        console.log("steping left", store.pixos["garden-tome"]);
      },
      zones: ["dungeon-top", "dungeon-bottom"],
    },

    {
      id: "door-r",
      type: "furniture/portal",
      pos: new Vector(...[8, 2, 0]),
      facing: Direction.Down,
      onStep: () => {
        store.pixos["garden-tome"].position = new Vector(...[8, 3, 0]);
        store.pixos["garden-tome"].selected += 7;
        console.log("steping right", store.pixos["garden-tome"]);
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
    ,
  ],
  // Scripts / Triggers for the Zone
  scripts: [
    {
      id: "load-scene", // **runs automatically when loaded
      trigger: async function () {
        // load current scene or play welcome
        let tome = this.engine.fetchStore("garden-tome");

        console.log("welcome -- loading - found the following: ", tome);

        if (!tome) {
          // Initialize the garden
          tome = {
            position: new Vector(...[8, 3, 0]),
            selected: 0,
            rain: true,
            snow: false,
            scenes: [],
            sprites: [],
            objects: [],
          };
          this.engine.addStore("garden-tome", tome);

          // Generate a collection of scenes programmably
          // and append them to the scenes collection.

          // this.randomlyGenerateSprites();
          // this.randomlySprites();

          await this.playScene("welcome");
        } else {
          // load Sprites
          await Promise.all(
            tome.sprites
              .filter((x) => {
                return x.id == tome.selected;
              })
              .map(this.loadSprite.bind(this))
          );
          // Load Objects
          await Promise.all(
            tome.objects
              .filter((x) => {
                return x.id == tome.selected;
              })
              .map(this.loadObject.bind(this))
          );
          // Finally - Play appropriate scenes
          await Promise.all(
            tome.scenes
              .filter((x) => {
                return x.id == tome.selected;
              })
              .map(async (scene) => {
                await this.playScene(scene.id, tome.scenes);
              })
          );

          // run custom scene
          let scene = [
            {
              id: "new-space" + Math.random(),
              actions: [
                // manual actions
                // Scripted Dialogue Action Controls directly on sprites
                {
                  sprite: "avatar",
                  action: "dialogue",
                  args: [
                    [
                      "Welcome traveler... I see you are exploring. Good. Please continue to look",
                      "You have travelled into the the number " +
                        (store.pixos && store.pixos["garden-tome"] ? store.pixos["garden-tome"].selected : 0) +
                        " room",
                    ],
                    false,
                    { autoclose: true },
                  ],
                  scope: this, // scoped to the zone
                },
              ],
            },
          ];
          await this.playScene(scene[0].id, scene);
        }
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
