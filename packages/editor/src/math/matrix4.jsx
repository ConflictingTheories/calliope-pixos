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

// Re-export all matrix utilities from the shared math package
// This consolidates math code to a single source of truth
export {
  from,
  normalize,
  subtractVectors,
  normalFromMat4,
  create,
  create3,
  invert,
  lookAt,
  mul,
  identity,
  perspective,
  frustum,
  translate,
  rotate,
  isPowerOf2,
  setMatrix as set,
} from 'pixospritz-math';
