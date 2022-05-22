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

import DefaultTileset from "@Tilesets/common/tileset.jsx";
// Tileset Schema
const _default = DefaultTileset(9, 0);
export default {
  ..._default,
  name: "jungle",
  bgColor: [32, 88, 62],
  // Tile Locations on resource (based on size)
  textures: {
    ..._default.textures,
  },
  // Geometries for the tileset
  geometry: {
    ..._default.geometry,
  },
};
