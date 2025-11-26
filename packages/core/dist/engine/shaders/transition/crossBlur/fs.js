"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = fs;
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

// Fragment shader for a horizontal cross‑blur wipe. Progress moves the edge
// across X; we soften with smoothstep. uDirection > 0.5 = IN (wipe recedes).

function fs() {
  return "\n  precision mediump float;\n  varying vec2 vUV;\n  uniform float uProgress;\n  uniform float uDirection;\n\n  void main() {\n      // Determine wipe center position depending on direction\n      float pos = (uDirection > 0.5) ? (1.0 - uProgress) : uProgress;\n\n      // Feather width in UV space\n      float feather = 0.12;\n\n      // Distance from the moving edge (vertical line at x=pos)\n      float d = vUV.x - pos;\n\n      // Soft mask around the edge using smoothstep\n      float mask = smoothstep(-feather, feather, d);\n\n      // Black overlay with soft edge\n      gl_FragColor = vec4(0.0, 0.0, 0.0, mask);\n  }\n  ";
}