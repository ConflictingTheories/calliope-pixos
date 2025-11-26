"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = vs;
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
*                                                 */

// Vertex shader for full‑screen transitions. It passes the clip‑space
// position directly and computes UV coordinates from the position. This
// shader is used by all transition effects.

function vs() {
  return "\n  attribute vec2 aPosition;\n  varying vec2 vUV;\n  void main() {\n      vUV = (aPosition + 1.0) * 0.5;\n      gl_Position = vec4(aPosition, 0.0, 1.0);\n  }\n  ";
}