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

// Fragment shader for a radial “swirl” transition. This effect creates a
// growing or shrinking circular wipe based on the distance from the
// screen center. While not a true rotational swirl, it produces an
// interesting radial transition and avoids sampling textures.

function fs() {
  return "\n  precision mediump float;\n  varying vec2 vUV;\n  uniform float uProgress;\n  uniform float uDirection;\n  void main() {\n      vec2 center = vec2(0.5, 0.5);\n      float dist = distance(vUV, center);\n      float mask;\n      if (uDirection > 0.5) {\n          // transition in: shrink the black disc\n          mask = step(uProgress, dist);\n      } else {\n          // transition out: grow the black disc\n          mask = step(dist, uProgress);\n      }\n      gl_FragColor = vec4(0.0, 0.0, 0.0, mask);\n  }\n  ";
}