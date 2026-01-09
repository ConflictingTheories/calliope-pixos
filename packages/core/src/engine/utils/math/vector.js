/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/**
 * Re-export all vector utilities from the shared pixospritz-math package.
 * This file exists for backward compatibility with existing imports.
 * 
 * @module @Engine/utils/math/vector
 * @see pixospritz-math
 */

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
