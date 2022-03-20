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

import Resources from "@Engine/utils/resources.jsx";
import TilesetGeometry from "@Tilesets/common/geometry.jsx";
// Tileset Schema
export default {
  name: "ice",
  src: Resources.artResourceUrl("tileset.png"),
  sheetSize: [512, 512],
  tileSize: 16,
  bgColor: [32, 62, 88],
  // Tile Locations on resource (based on size)
  textures: {
    FLOOR: [13, 1],
    FLOOR_BR: [14, 2],
    FLOOR_R: [14, 1],
    FLOOR_TR: [14, 0],
    FLOOR_T: [13, 0],
    FLOOR_TL: [12, 0],
    FLOOR_L: [12, 1],
    FLOOR_BL: [12, 2],
    FLOOR_B: [13, 2],
    //
    FLOOR_CBR: [13, 1],
    FLOOR_CTR: [13, 1],
    FLOOR_CTL: [13, 1],
    FLOOR_CBL: [13, 1],
    //
    FLOOR_V: [12, 3],
    FLOOR_H: [13, 3],
    FLOOR_C: [12, 4],
    STAIR: [14, 3],
    //
    WALL: [13, 5],
    WATER: [0, 28],
    WALL_WATER: [13, 15],
    WATER_WALL: [13, 16],
    //
    EMPTY: [13, 1],
    EMPTY_BR: [14, 2],
    EMPTY_R: [14, 1],
    EMPTY_TR: [14, 0],
    EMPTY_T: [13, 0],
    EMPTY_TL: [12, 0],
    EMPTY_L: [12, 1],
    EMPTY_BL: [12, 2],
    EMPTY_B: [13, 2],
    //
    EMPTY_CBR: [13, 1],
    EMPTY_CTR: [13, 1],
    EMPTY_CTL: [13, 1],
    EMPTY_CBL: [13, 1],
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
