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
  tileset: "sewer",
  // (0,0) -> (17,19) (X, Y) (20 Rows x 17 Column)
  cells: cells,
  // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
  sprites: [
    // Objects
    { id: "chest", type: "objects/chests/wood", pos: new Vector(...[8, 9, 0]), facing: Direction.Down },
    { id: "chestmetal", type: "objects/chests/metal", pos: new Vector(...[9, 8, 0]), facing: Direction.Right },
    { id: "chestred", type: "objects/chests/red", pos: new Vector(...[9, 9, 0]), facing: Direction.Down },
    { id: "chestblue", type: "objects/chests/blue", pos: new Vector(...[7, 8, 0]), facing: Direction.Left },
    // Doorway
    {
      id: "door",
      type: "furniture/door",
      pos: new Vector(...[9, 1, 0]),
      facing: Direction.Down,
      zones: ["dungeon-top", "dungeon-bottom"],
    },
    // Tree
    { id: "tree", type: "furniture/tree", pos: new Vector(...[8, 8, 0]), facing: Direction.Up },
    // Furniture / Wall Decorations
    { id: "fireplace", type: "furniture/fireplace", pos: new Vector(...[11, 1, 0]), facing: Direction.Up },
    { id: "fireplace", type: "effects/fireplace", pos: new Vector(...[11, 1, 0]), facing: Direction.Up },
    // NPCs
    { id: "darkness", type: "npc/darkness", pos: new Vector(...[6, 2, 0]), facing: Direction.Down },
    { id: "air", type: "npc/air-knight", pos: new Vector(...[8, 2, 0]), facing: Direction.Down },
    { id: "fire", type: "npc/fire-knight", pos: new Vector(...[2, 8, 0]), facing: Direction.Right },
    { id: "earth", type: "npc/earth-knight", pos: new Vector(...[14, 8, 0]), facing: Direction.Left },
    // Presently - avatar is treated like a normal sprite (TODO - needs to be loaded dynamically via entry point)
    { id: "avatar", type: "characters/default", pos: new Vector(...[10, 10, 0]), facing: Direction.Down },
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
        // or call premade events and bundle many things and trigger them
        { trigger: "clear-path", scope: this },
        { trigger: "custom", scope: this },
      ],
    },
  ],
  // Scripts / Triggers for the Zone
  scripts: [
    {
      id: "load-scene", // **runs automatically when loaded
      trigger: async function () {
        this.playScene("strange-legend");
      },
    },
    {
      id: "clear-path", // manually called custom script
      trigger: async function () {
        await this.moveSprite("darkness", [10, 2, 0], true);
        await this.spriteDialogue("darkness", ["Hi there!", "Can I help you?"]);
      },
    },
    {
      id: "custom", // manually called custom script
      trigger: async function () {
        await this.spriteDialogue("darkness", ["Hi there!", "Can I help you?"]);
      },
    },
  ],
};
