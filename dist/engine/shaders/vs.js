"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = vs;

/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
function vs() {
  return "\n  attribute vec3 aVertexPosition;\n  attribute vec3 aVertexNormal;\n  attribute vec2 aTextureCoord;\n  \n  uniform mat4 uMVMatrix;\n  uniform mat4 uPMatrix;\n  uniform mat3 uNormalMatrix;\n  \n  varying vec2 vTextureCoord;\n  varying vec3 vTransformedNormal;\n  varying vec4 vPosition;\n\n  varying highp vec3 vLighting;\n  \n  uniform vec3 u_scale;\n\n  void main(void) {\n\n    vec3 scaledPosition = aVertexPosition * u_scale;\n    vPosition = uMVMatrix * vec4(scaledPosition, 1.0);\n    gl_Position = uPMatrix * vPosition;\n\n    vTextureCoord = aTextureCoord;\n\n    highp vec3 ambientLight = vec3(0.8, 0.8, 0.8);\n    highp vec3 directionalLightColor = vec3(1, 1, 1);\n    highp vec3 directionalVector = normalize(vec3(1, 1, 0.75));\n\n    highp vec3 transformedNormal = uNormalMatrix * aVertexNormal;\n\n    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.1);\n    vLighting = ambientLight + (directionalLightColor * directional);\n  }\n";
}