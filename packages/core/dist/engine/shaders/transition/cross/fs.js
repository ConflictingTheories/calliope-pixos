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

// Fragment shader for a horizontal cross‑wipe transition. A black
// rectangle slides across the screen. The direction uniform controls
// whether the wipe grows from the left (out) or shrinks from the right (in).

function fs() {
  return "\n  precision mediump float;\n  varying vec2 vUV;\n  uniform float uProgress;\n  uniform float uDirection;\n  void main() {\n      float mask;\n      // When uDirection == 1.0 (transition in), the black area shrinks\n      // from right to left. Otherwise, it grows from left to right.\n      if (uDirection > 0.5) {\n          mask = step(1.0 - uProgress, vUV.x);\n      } else {\n          mask = step(vUV.x, uProgress);\n      }\n      gl_FragColor = vec4(0.0, 0.0, 0.0, mask);\n  }\n  ";
}