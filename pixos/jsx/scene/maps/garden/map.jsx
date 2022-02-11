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
import cells from "./cells.jsx";
// Use Tileset
// Map Information
export default {
  bounds: [0, 0, 17, 19],
  // Determines the tileset to load
  tileset: "jungle",
  // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
  cells: cells,
  // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
  sprites: [
    // Objects
    { id: "chest", type: "objects/chests/wood", pos: new Vector(...[8, 14, 0]), facing: Direction.Down },
    { id: "chestmetal", type: "objects/chests/metal", pos: new Vector(...[9, 13, 0]), facing: Direction.Right },
    // Tree
    { id: "tree", type: "furniture/tree", fixed: true, pos: new Vector(...[8, 13, 0]), facing: Direction.Up },
    // Presently - avatar is treated like a normal sprite (TODO - needs to be loaded dynamically via entry point)
    { id: "avatar", type: "characters/default", pos: new Vector(...[9, 2, 0]), facing: Direction.Down },
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
  ],
  // Scripts / Triggers for the Zone
  scripts: [
    {
      id: "load-scene", // **runs automatically when loaded
      trigger: async function () {
        await this.playScene("welcome");
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
