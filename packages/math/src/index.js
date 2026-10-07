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

// Vector exports
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
  identity,
  mul,
  invert,
} from './matrix4.js';

// Canonical vector contract (P4-01)
export { VECTOR_CONTRACT } from './contract.js';
