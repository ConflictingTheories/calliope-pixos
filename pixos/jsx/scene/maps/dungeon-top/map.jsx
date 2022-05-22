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
    // Doorway
    {
      id: "door",
      type: "furniture/door",
      pos: new Vector(...[2, 5, 0]),
      facing: Direction.Down,
      zones: ["room"],
    },
    // Effect tiles
    { id: "spurt1", type: "effects/waterspurt", pos: new Vector(...[10, 7, -1.5]), facing: Direction.Up },
    { id: "spurt2", type: "effects/waterspurt", pos: new Vector(...[9, 6, -1.5]), facing: Direction.Up },
    { id: "spurt3", type: "effects/waterspurt", pos: new Vector(...[10, 5, -1.5]), facing: Direction.Up },
    { id: "spurt4", type: "effects/waterspurt", pos: new Vector(...[7, 6, -1.5]), facing: Direction.Up },
    { id: "spurt5", type: "effects/waterspurt", pos: new Vector(...[6, 7, -1.5]), facing: Direction.Up },
    { id: "spurt6", type: "effects/waterspurt", pos: new Vector(...[6, 9, -1.5]), facing: Direction.Up },
    { id: "spurt7", type: "effects/waterspurt", pos: new Vector(...[9, 9, -1.5]), facing: Direction.Up },
    // avatar
    { id: "avatar", type: "characters/default", pos: new Vector(...[2, 6, 0]), facing: Direction.Down },
  ],
  // Scenes + Scenarios
  scenes: [],
  // Scripts / Triggers for the Zone
  scripts: [],
};
