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
