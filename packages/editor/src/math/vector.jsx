/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

// Re-export all vector utilities from the shared math package
// This consolidates math code to a single source of truth
export {
  V3,
  Coord,
  Vector,
  Vector4,
  vec3,
  set,
  negate,
  lerp,
  degToRad,
  radToDeg,
  lineRectCollide,
  rectRectCollide,
  pushQuad,
} from 'pixospritz-math';
