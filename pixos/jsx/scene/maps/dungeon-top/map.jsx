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
import cells from './cells.jsx';
// Use Tileset
// Map Information
export default {
  bounds: [0, 0, 17, 10],
  // Determines the tileset to load
  tileset: "sewer",
  // (0,0) -> (17,10) (X, Y) (10 Rows x 17 Column)
  cells: cells,
  // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
  sprites: [
    // NPCs
    { id: "darkness", type: "npc/darkness", pos: new Vector(...[10, 4, 0]), facing: Direction.Down },
    { id: "air", type: "npc/air-knight", pos: new Vector(...[8, 4, 0]), facing: Direction.Down },
    { id: "fire", type: "npc/fire-knight", pos: new Vector(...[2, 9, 0]), facing: Direction.Right },
    { id: "earth", type: "npc/earth-knight", pos: new Vector(...[14, 7, 0]), facing: Direction.Left },
    // Effect tiles
    { id: "spurt1", type: "effects/waterspurt", pos: new Vector(...[10, 7, -1.5]), facing: Direction.Up },
    { id: "spurt2", type: "effects/waterspurt", pos: new Vector(...[9, 6, -1.5]), facing: Direction.Up },
    { id: "spurt3", type: "effects/waterspurt", pos: new Vector(...[10, 5, -1.5]), facing: Direction.Up },
    { id: "spurt4", type: "effects/waterspurt", pos: new Vector(...[7, 6, -1.5]), facing: Direction.Up },
    { id: "spurt5", type: "effects/waterspurt", pos: new Vector(...[6, 7, -1.5]), facing: Direction.Up },
    { id: "spurt6", type: "effects/waterspurt", pos: new Vector(...[6, 9, -1.5]), facing: Direction.Up },
    { id: "spurt7", type: "effects/waterspurt", pos: new Vector(...[9, 9, -1.5]), facing: Direction.Up },
    // // Presently - avatar is treated like a normal sprite (TODO - needs to be loaded dynamically via entry point)
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
