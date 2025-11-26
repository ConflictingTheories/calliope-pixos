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

// Fragment shader for a radial blur‑mask transition. The edge is softened
// with smoothstep. uDirection > 0.5 = IN (mask shrinks), else OUT (mask grows).

function fs() {
  return "\n  precision mediump float;\n  varying vec2 vUV;\n  uniform float uProgress;\n  uniform float uDirection;\n\n  void main() {\n      vec2 center = vec2(0.5, 0.5);\n      float dist = distance(vUV, center);\n\n      // Radius grows [0..1] for OUT, shrinks for IN\n      float radius = (uDirection > 0.5) ? (1.0 - uProgress) : uProgress;\n\n      // Blur width relative to screen; tweak for softer/harder edge\n      float feather = 0.20; // 20% of radius as feather\n      float edge0 = radius - feather * 0.5;\n      float edge1 = radius + feather * 0.5;\n\n      float mask = smoothstep(edge0, edge1, dist);\n\n      // Black overlay with soft edge\n      gl_FragColor = vec4(0.0, 0.0, 0.0, mask);\n  }\n  ";
}