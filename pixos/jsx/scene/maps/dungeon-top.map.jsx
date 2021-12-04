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

// Use Tileset
import T from "../tilesets/sewer.tiles.jsx";
import { Vector } from "../../engine/utils/math/vector.jsx";
import { Direction } from "../../engine/utils/enums.jsx";
// Map Information
export default {
  bounds: [0, 0, 17, 10],
  tileset: "sewer",
  // (0,0) -> (17,10) (X, Y) (10 Rows x 17 Column)
  cells: [
    ...[
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.NLW_CORNER,
      T.N_WALL,
      T.N_WALL,
      T.N_WALL,
      T.NRW_CORNER,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
    ],
    ...[
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.NLW_CORNER,
      T.NLW_COLUMN,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.NRW_COLUMN,
      T.NRW_CORNER,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
    ],
    ...[
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.L_WALL,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.R_WALL,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
    ],
    ...[
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.L_WALL,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.R_WALL,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
    ],
    ...[
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.L_WALL,
      T.NW_NPIT,
      T.NW_NPIT,
      T.N_STAIRWALL,
      T.NW_NPIT,
      T.NW_NPIT,
      T.R_WALL,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
      T.EMPTY,
    ],
    ...[
      T.EMPTY,
      T.NLW_CORNER,
      T.N_WALL,
      T.N_WALL,
      T.N_WALL,
      T.NLW_LAVA_COLUMN,
      T.LAVA,
      T.LAVA,
      T.N_STAIR,
      T.LAVA,
      T.LAVA,
      T.NRW_LAVA_COLUMN,
      T.N_WALL,
      T.N_WALL,
      T.N_WALL,
      T.NRW_CORNER,
      T.EMPTY,
    ],
    ...[
      T.NLW_CORNER,
      T.NLW_COLUMN,
      T.FLOOR,
      T.FLOOR,
      T.LW_LPIT,
      T.LAVA,
      T.LAVA,
      T.LAVA,
      T.V_WALKWAY,
      T.LAVA,
      T.LAVA,
      T.LAVA,
      T.RW_RPIT,
      T.FLOOR,
      T.FLOOR,
      T.NRW_COLUMN,
      T.NRW_CORNER,
    ],
    ...[
      T.L_WALL,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.LW_LPIT,
      T.LAVA,
      T.LAVA,
      T.LAVA,
      T.V_WALKWAY,
      T.LAVA,
      T.LAVA,
      T.LAVA,
      T.RW_RPIT,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.R_WALL,
    ],
    ...[
      T.L_WALL,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.L_STAIRWALL,
      T.L_STAIR,
      T.H_WALKWAY,
      T.H_WALKWAY,
      T.C_WALKWAY,
      T.H_WALKWAY,
      T.H_WALKWAY,
      T.R_STAIR,
      T.R_STAIRWALL,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.R_WALL,
    ],
    ...[
      T.L_WALL,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.LW_LPIT,
      T.LAVA,
      T.LAVA,
      T.LAVA,
      T.V_WALKWAY,
      T.LAVA,
      T.LAVA,
      T.LAVA,
      T.RW_RPIT,
      T.FLOOR,
      T.FLOOR,
      T.FLOOR,
      T.R_WALL,
    ],
  ],
  // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
  sprites: [
    // NPCs
    { id: "darkness", type: "npc/darkness", pos: new Vector(...[10, 2, 0]), facing: Direction.Down },
    { id: "air", type: "npc/air-knight", pos: new Vector(...[8, 2, 0]), facing: Direction.Down },
    { id: "fire", type: "npc/fire-knight", pos: new Vector(...[2, 8, 0]), facing: Direction.Right },
    { id: "earth", type: "npc/earth-knight", pos: new Vector(...[14, 8, 0]), facing: Direction.Left },
    // Effect tiles
    { id: "spurt1", type: "effects/lavaspurt", pos: new Vector(...[10, 7, -1.5]), facing: Direction.Up },
    { id: "spurt2", type: "effects/lavaspurt", pos: new Vector(...[9, 6, -1.5]), facing: Direction.Up },
    { id: "spurt3", type: "effects/lavaspurt", pos: new Vector(...[10, 5, -1.5]), facing: Direction.Up },
    { id: "spurt4", type: "effects/lavaspurt", pos: new Vector(...[7, 6, -1.5]), facing: Direction.Up },
    { id: "spurt5", type: "effects/lavaspurt", pos: new Vector(...[6, 7, -1.5]), facing: Direction.Up },
    { id: "spurt6", type: "effects/lavaspurt", pos: new Vector(...[6, 9, -1.5]), facing: Direction.Up },
    { id: "spurt8", type: "effects/lavaspurt", pos: new Vector(...[9, 9, -1.5]), facing: Direction.Up },
    // Presently - player is treated like a normal sprite
    { id: "player", type: "characters/player", pos: new Vector(...[8, 8, -1]), facing: Direction.Down },
  ],
  // TODO - Add in Scenes / Dialogue
  //
  scenes: [
    {
      id: "strange-legend",
      actions: [ // manual actions
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
  // TODO - Add Scripts / Triggers for the Scene
  //
  scripts: [
    {
      id: "load-scene", // run automatically when loaded
      trigger: async function () {
        await this.moveSprite("darkness", [8, 6, 0], true);
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
