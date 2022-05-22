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

// Tile Types Supported (Labels for Easy Use) [[geometry, texture, height], walkability?]
export default {
  FLOOR: ["FLAT_ALL", "FLOOR", 0],
  WATER: ["FLAT_NONE", "WATER", -1.5],
  EMPTY: ["FLAT_ALL", "EMPTY", 2],
  // Stairs
  N_STAIR: ["FLAT_ALL", "FLOOR_V", -1, "WALL_R", "WATER_WALL", -1, "WALL_L", "WATER_WALL", -1, "STAIR_T", "STAIR", -1],
  N_STAIRWALL: ["FLAT_ALL", "FLOOR_B", 0, "WALL_T", "WALL_WATER", 0, 15],
  S_STAIR: ["FLAT_ALL", "FLOOR_V", -1, "WALL_R", "WATER_WALL", -1, "WALL_L", "WATER_WALL", -1, "STAIR_B", "STAIR", -1],
  S_STAIRWALL: ["FLAT_ALL", "FLOOR_T", 0, "WALL_B", "WALL", 0, 15],
  L_STAIR: ["FLAT_ALL", "FLOOR_H", -1, "WALL_T", "WATER_WALL", -1, "WALL_B", "WATER_WALL", -1, "STAIR_L", "STAIR", -1],
  L_STAIRWALL: ["FLAT_ALL", "FLOOR_R", 0, "WALL_L", "WALL_WATER", 0, 15],
  R_STAIR: ["FLAT_ALL", "FLOOR_H", -1, "WALL_T", "WATER_WALL", -1, "WALL_B", "WATER_WALL", -1, "STAIR_R", "STAIR", -1],
  R_STAIRWALL: ["FLAT_ALL", "FLOOR_L", 0, "WALL_R", "WALL_WATER", 0, 15],
  // Walls
  N_WALL: ["WALL_T", "WALL", 2, "FLAT_ALL", "EMPTY_B", 2],
  S_WALL: ["WALL_B", "WALL", 2, "FLAT_ALL", "EMPTY_T", 2],
  L_WALL: ["WALL_L", "WALL", 2, "FLAT_ALL", "EMPTY_R", 2],
  R_WALL: ["WALL_R", "WALL", 2, "FLAT_ALL", "EMPTY_L", 2],
  EDGE: ["WALL_R", "WALL", 2, "WALL_B", "WALL", 2, "WALL_L", "WALL", 2, "WALL_T", "WALL", 2, "FLAT_ALL", "FLOOR", 2],
  PILLAR: ["WALL_R", "WALL", 2, "WALL_B", "WALL", 2, "WALL_L", "WALL", 2, "WALL_T", "WALL", 2, "FLAT_ALL", "EMPTY", 2],
  BLOCK: ["WALL_R", "WALL", 1, "WALL_B", "WALL", 1, "WALL_L", "WALL", 1, "WALL_T", "WALL", 1, "FLAT_ALL", "EMPTY", 1],
  // Corner Blend Empty
  NLW_CORNER: ["FLAT_ALL", "EMPTY_CTL", 2],
  NRW_CORNER: ["FLAT_ALL", "EMPTY_CTR", 2],
  SLW_CORNER: ["FLAT_ALL", "EMPTY_CBL", 2],
  SRW_CORNER: ["FLAT_ALL", "EMPTY_CBR", 2],
  // Columns (Wall Corners)
  NLW_COLUMN: ["WALL_T", "WALL", 2, "WALL_L", "WALL", 2, "FLAT_NONE", "EMPTY_BR", 2],
  NRW_COLUMN: ["WALL_R", "WALL", 2, "WALL_T", "WALL", 2, "FLAT_NONE", "EMPTY_BL", 2],
  SLW_COLUMN: ["WALL_L", "WALL", 2, "WALL_B", "WALL", 2, "FLAT_NONE", "EMPTY_TR", 2],
  SRW_COLUMN: ["WALL_R", "WALL", 2, "WALL_B", "WALL", 2, "FLAT_NONE", "EMPTY_TL", 2],
  // Columns over WATER
  NRW_WATER_COLUMN: ["WALL_R", "WALL", 2, "WALL_R", "WALL_WATER", 0, "WALL_T", "WALL", 2, "WALL_T", "WALL_WATER", 0, "FLAT_ALL", "EMPTY_BL", 2],
  NLW_WATER_COLUMN: ["WALL_T", "WALL", 2, "WALL_L", "WALL", 2, "FLAT_ALL", "EMPTY_BR", 2, "WALL_L", "WALL_WATER", 0, "WALL_T", "WALL_WATER", 0],
  SLW_WATER_COLUMN: ["WALL_L", "WALL", 2, "WALL_B", "WALL", 2, "FLAT_ALL", "EMPTY_TR", 2, "WALL_L", "WALL_WATER", 0, "WALL_B", "WALL_WATER", 0],
  SRW_WATER_COLUMN: ["WALL_R", "WALL", 2, "WALL_R", "WALL_WATER", 0, "WALL_B", "WALL", 2, "WALL_B", "WALL_WATER", 0, "FLAT_ALL", "EMPTY_TL", 2],
  // Pits
  NW_NPIT: ["FLAT_ALL", "FLOOR_B", 0, "WALL_T", "WALL_WATER", 0],
  LW_LPIT: ["FLAT_ALL", "FLOOR_R", 0, "WALL_L", "WALL_WATER", 0],
  RW_RPIT: ["FLAT_ALL", "FLOOR_L", 0, "WALL_R", "WALL_WATER", 0],
  SW_SPIT: ["FLAT_ALL", "FLOOR_T", 0, "WALL_B", "WALL_WATER", 0],
  // Walkway rampart
  C_WALKWAY: ["FLAT_ALL", "FLOOR_C", -1],
  V_WALKWAY: ["FLAT_ALL", "FLOOR_V", -1, "WALL_R", "WATER_WALL", -1, "WALL_L", "WATER_WALL", -1],
  H_WALKWAY: ["FLAT_ALL", "FLOOR_H", -1, "WALL_T", "WATER_WALL", -1, "WALL_B", "WATER_WALL", -1],
};
