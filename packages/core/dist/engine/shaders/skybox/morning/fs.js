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

function fs() {
  return "\n  precision mediump float;\n \n  uniform samplerCube uSkybox;\n  uniform mat4 uViewDirectionProjectionInverse;\n  \n  varying vec4 vPosition;\n  void main() {\n    vec4 t = uViewDirectionProjectionInverse * vPosition;\n    gl_FragColor = textureCube(uSkybox, normalize(t.xyz / t.w));\n  }\n";
}