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

import Resources from "@Engine/utils/resources.jsx";
import TilesetGeometry from "@Engine/tilesets/common/geometry.jsx";
// Tileset Schema
export default {
  src: Resources.artResourceUrl("jungle.gif"),
  sheetSize: [256, 256],
  tileSize: 16,
  bgColor: [88, 62, 36],
  // Tile Locations on resource (based on size)
  textures: {
    FLOOR: [1, 1],
    FLOOR_BR: [2, 2],
    FLOOR_R: [2, 1],
    FLOOR_TR: [2, 0],
    FLOOR_T: [1, 0],
    FLOOR_TL: [0, 0],
    FLOOR_L: [0, 1],
    FLOOR_BL: [0, 2],
    FLOOR_B: [1, 2],
    FLOOR_CBR: [4, 1],
    FLOOR_CTR: [4, 0],
    FLOOR_CTL: [3, 0],
    FLOOR_CBL: [3, 1],
    FLOOR_V: [3, 2],
    WATER: [0.5, 7.5],
    FLOOR_H: [4, 2],
    FLOOR_C: [3, 3],
    EMPTY: [6, 1],
    EMPTY_BR: [7, 2],
    EMPTY_R: [7, 1],
    EMPTY_TR: [7, 0],
    EMPTY_T: [6, 0],
    EMPTY_TL: [5, 0],
    EMPTY_L: [5, 1],
    EMPTY_BL: [5, 2],
    EMPTY_B: [6, 2],
    EMPTY_CBR: [6, 1],
    EMPTY_CTR: [6, 1],
    EMPTY_CTL: [6, 1],
    EMPTY_CBL: [6, 1],
    STAIR: [5, 3],
    WALL: [0, 3],
    WALL_WATER: [0, 5],
    WATER_WALL: [0, 6],
  },
  // Geometries for the tileset
  // type --> walkability -- 1/0 --> [down,left,up,right]
  geometry: {
    // Flat - Walkability -- All
    FLAT_ALL: TilesetGeometry.FLAT_ALL,
    // Flat - Walkability -- None
    FLAT_NONE: TilesetGeometry.FLAT_NONE,
    // Stairs
    STAIR_R: TilesetGeometry.STAIR_R,
    STAIR_T: TilesetGeometry.STAIR_T,
    STAIR_L: TilesetGeometry.STAIR_L,
    STAIR_B: TilesetGeometry.STAIR_B,
    // Wall
    WALL_R: TilesetGeometry.WALL_R,
    WALL_T: TilesetGeometry.WALL_T,
    WALL_L: TilesetGeometry.WALL_L,
    WALL_B: TilesetGeometry.WALL_B,
  },
};
