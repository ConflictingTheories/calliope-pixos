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
export default (sheetOffsetX, sheetOffsetY) => {
  return {
    name: "default",
    src: Resources.artResourceUrl("tileset.png"),
    sheetSize: [512, 512],
    sheetOffsetX,
    sheetOffsetY,
    tileSize: 16,
    bgColor: [32, 62, 88],
    // Tile Locations on resource (based on size)
    textures: {
      FLOOR: [1 + sheetOffsetX, 1],
      FLOOR_BR: [2 + sheetOffsetX, 2],
      FLOOR_R: [2 + sheetOffsetX, 1],
      FLOOR_TR: [2 + sheetOffsetX, 0],
      FLOOR_T: [1 + sheetOffsetX, 0],
      FLOOR_TL: [0 + sheetOffsetX, 0],
      FLOOR_L: [0 + sheetOffsetX, 1],
      FLOOR_BL: [0 + sheetOffsetX, 2],
      FLOOR_B: [1 + sheetOffsetX, 2],
      //
      FLOOR_CBR: [1 + sheetOffsetX, 1],
      FLOOR_CTR: [1 + sheetOffsetX, 1],
      FLOOR_CTL: [1 + sheetOffsetX, 1],
      FLOOR_CBL: [1 + sheetOffsetX, 1],
      //
      FLOOR_V: [0 + sheetOffsetX, 3],
      FLOOR_H: [1 + sheetOffsetX, 3],
      FLOOR_C: [0 + sheetOffsetX, 4],
      STAIR: [2 + sheetOffsetX, 3],
      //
      WALL: [1 + sheetOffsetX, 5],
      WATER: [0, 23 + sheetOffsetY],
      WALL_WATER: [1 + sheetOffsetX, 5 + sheetOffsetY * 2],
      WATER_WALL: [1 + sheetOffsetX, 5 + sheetOffsetY * 2],
      //
      EMPTY: [1 + sheetOffsetX, 1],
      EMPTY_BR: [2 + sheetOffsetX, 2],
      EMPTY_R: [2 + sheetOffsetX, 1],
      EMPTY_TR: [2 + sheetOffsetX, 0],
      EMPTY_T: [1 + sheetOffsetX, 0],
      EMPTY_TL: [0 + sheetOffsetX, 0],
      EMPTY_L: [0 + sheetOffsetX, 1],
      EMPTY_BL: [0 + sheetOffsetX, 2],
      EMPTY_B: [1 + sheetOffsetX, 2],
      //
      EMPTY_CBR: [1 + sheetOffsetX, 1],
      EMPTY_CTR: [1 + sheetOffsetX, 1],
      EMPTY_CTL: [1 + sheetOffsetX, 1],
      EMPTY_CBL: [1 + sheetOffsetX, 1],
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
};
