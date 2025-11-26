"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = vs;
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

function vs() {
  return "\n  precision mediump float;\n\n  attribute vec3 aVertexPosition;\n  attribute vec3 aVertexNormal;\n  attribute vec2 aTextureCoord;\n  \n  uniform mat4 uModelMatrix;\n  uniform mat4 uViewMatrix;\n  uniform mat4 uProjectionMatrix;\n  uniform mat3 uNormalMatrix;\n  uniform mat3 uCamPos;\n\n  uniform vec3 uLightDirection;\n  uniform vec3 uCameraPosition;\n  varying vec3 vFragPos;\n  varying vec3 vLightDir;\n  varying vec3 vViewDir;\n\n  varying vec4 vWorldVertex;\n  varying vec3 vWorldNormal;\n  varying vec3 vTransformedNormal;\n  varying vec4 vPosition;\n  varying vec2 vTextureCoord;\n\n  uniform vec3 u_scale;\n\n  void main(void) {\n    vec3 scaledPosition = aVertexPosition * u_scale;\n\n    vWorldVertex = uModelMatrix * vec4(aVertexPosition, 1.0);\n    vPosition = uModelMatrix * vec4(scaledPosition, 1.0);\n    vTextureCoord = aTextureCoord;\n    vTransformedNormal = uNormalMatrix * aVertexNormal;\n    vWorldNormal = normalize(mat3(uModelMatrix) * aVertexNormal);\n\n    // Pass fragment position to fragment shader\n    vFragPos = vec3(uModelMatrix * vec4(scaledPosition, 1.0));\n    \n    // Calculate view direction and pass to fragment shader\n    vViewDir = normalize(uCameraPosition - vFragPos);\n\n    gl_Position = uProjectionMatrix * uViewMatrix * vPosition;\n  }\n";
}