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

// Tet
import { Vector } from "@Engine/utils/math/vector.jsx";
import { Direction } from "@Engine/utils/enums.jsx";
import { loadAvatar, STORE_NAME } from "@Engine/utils/generator.jsx";
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
  ],
  // Scripts / Triggers
  scripts: [
    {
      id: "load-scene",
      trigger: async function () {
        await loadAvatar(this, STORE_NAME);
      },
    },
  ],
  // TODO - Add in Scenes / Dialogue
  //
  scenes: [],
  //
  // objects // 3d
  objects: [],
};
