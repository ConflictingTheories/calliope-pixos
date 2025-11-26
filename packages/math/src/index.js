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

// Vector exports
export {
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
} from './vector.js';

// Matrix4 exports
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
  set as setMatrix,
  isPowerOf2,
  lookAt,
  multiply,
  scale,
} from './matrix4.js';
