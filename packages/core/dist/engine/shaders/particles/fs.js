"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;
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

function _default() {
  return "\n    precision mediump float;\n\n    varying vec2 vTextureCoord;\n    varying vec3 vColor;\n    varying float vAlpha;\n\n    void main(void) {\n      // Calculate distance from center for soft circular particles\n      vec2 center = vTextureCoord - vec2(0.5);\n      float dist = length(center) * 2.0;\n      \n      // Soft falloff from center - creates a glowing effect\n      float softEdge = 1.0 - smoothstep(0.0, 1.0, dist);\n      \n      // Apply color with soft edge and alpha fade\n      float alpha = softEdge * vAlpha;\n      \n      // Discard fully transparent pixels for performance\n      if (alpha < 0.01) discard;\n      \n      // Output with glow effect - slightly brighter in center\n      vec3 glowColor = vColor * (1.0 + (1.0 - dist) * 0.5);\n      gl_FragColor = vec4(glowColor, alpha);\n    }\n  ";
}