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

import Tiles from "@Tilesets/common/tiles.jsx";

// Tile Types Supported (Labels for Easy Use) [[geometry, texture, height], walkability?]
export default Object.create(
  // Common tile
  Tiles,
  // Custom Tile Types & Overrides (if appl.)
  {
    FLOOR: ["FLAT_ALL", "FLOOR", 0],
    WATER: ["FLAT_NONE", "WATER", -1.65],
    EMPTY: ["FLAT_ALL", "EMPTY", 2],
  }
);
