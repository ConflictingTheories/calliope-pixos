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

// Tet
import { Vector } from "../../../engine/utils/math/vector.jsx";
import { Direction } from "../../../engine/utils/enums.jsx";
import cells from "./cells.jsx";
// Map
export default {
  bounds: [0, 10, 17, 19],
  tileset: "sewer",
  audioSrc: "/pixos/audio/blue-fields.mp3",
  // (0,10) -> (17,19) (X, Y) (9 Rows x 17 Column)
  cells: cells,
  // Sprites and Objects to be Loaded in the Scene & their Starting Points
  sprites: [
    { id: "water", type: "npc/water-knight", pos: new Vector(...[8, 13, 0]), facing: Direction.Up },
    { id: "spurt8", type: "effects/waterspurt", pos: new Vector(...[7, 10, -1.5]), facing: Direction.Up },
    { id: "spurt9", type: "effects/waterspurt", pos: new Vector(...[10, 10, -1.5]), facing: Direction.Up },
    { id: "avatar2", type: "characters/copy", pos: new Vector(...[8, 8, -1]), facing: Direction.Down },
  ],
  // Scripts / Triggers
  scripts: [
    {
      id: "load-scene",
      trigger: () => {
        console.log("Triggered");
      },
    },
  ],
  // TODO - Add in Scenes / Dialogue
  //
  scenes: [],
};
