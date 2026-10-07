/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
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
