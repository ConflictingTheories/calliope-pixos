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
  return "\n    precision mediump float;\n\n    varying vec2 vTextureCoord;\n    varying vec3 vColor;\n\n    void main(void) {\n      // Simple particle color (could be extended with texture sampling)\n      gl_FragColor = vec4(vColor, 1.0);\n    }\n  ";
}