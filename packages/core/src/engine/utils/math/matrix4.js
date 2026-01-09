/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine          **
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
 * Re-export all matrix utilities from the shared pixospritz-math package.
 * This file exists for backward compatibility with existing imports.
 * 
 * @module @Engine/utils/math/matrix4
 * @see pixospritz-math
 */

export {
  from,
  create,
  create3,
  perspective,
  frustum,
  translate,
  rotate,
  subtractVectors,
  normalize,
  normalFromMat4,
  setMatrix as set,
  isPowerOf2,
  lookAt,
  multiply,
  scale,
  identity,
  mul,
  invert,
} from 'pixospritz-math';
