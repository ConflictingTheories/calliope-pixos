"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = fs;
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

/** referenced from https://webgl2fundamentals.org/webgl/lessons/webgl-picking.html */
function fs() {
  return "\n    precision highp float;\n    \n    uniform vec4 u_id;\n    uniform float useSampler;\n    uniform sampler2D uSampler;\n\n    varying vec2 vTextureCoord;\n\n    void main() {\n        if(useSampler == 1.0) { // sampler\n            vec4 texelColors = texture2D(uSampler, vTextureCoord);\n            gl_FragColor= vec4(vec3(u_id),texelColors.a);\n        } else {\n            gl_FragColor = vec4(vec3(u_id),1.0);\n        }\n    }\n  ";
}