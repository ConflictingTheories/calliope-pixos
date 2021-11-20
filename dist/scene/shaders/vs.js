"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = vs;

/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
function vs() {
  return "\n  attribute vec3 aVertexPosition;\n  attribute vec2 aTextureCoord;\n  \n  uniform mat4 uMVMatrix;\n  uniform mat4 uPMatrix;\n  \n  varying vec2 vTextureCoord;\n  \n  void main(void) {\n    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n    vTextureCoord = aTextureCoord;\n  }\n";
}