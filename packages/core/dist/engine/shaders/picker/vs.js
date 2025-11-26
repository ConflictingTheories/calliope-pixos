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

/** referenced from https://webgl2fundamentals.org/webgl/lessons/webgl-picking.html */
function vs() {
  return "\n    attribute vec3 aVertexPosition;\n    attribute vec2 aTextureCoord;\n    \n    uniform mat4 uModelMatrix;\n    uniform mat4 uViewMatrix;\n    uniform mat4 uProjectionMatrix;\n  \n    varying vec4 vWorldVertex;\n    varying vec4 vPosition;\n    varying vec2 vTextureCoord;\n\n    uniform vec3 u_scale;\n    \n    void main() {\n        // Multiply the position by the matrix.\n        vec3 scaledPosition = aVertexPosition * u_scale;\n        vTextureCoord = aTextureCoord;\n        \n        vWorldVertex = uModelMatrix * vec4(aVertexPosition, 1.0);\n        vPosition = uModelMatrix * vec4(scaledPosition, 1.0);\n\n        gl_Position = uProjectionMatrix * uViewMatrix * vPosition;\n    }\n  ";
}