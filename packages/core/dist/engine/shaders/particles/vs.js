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

/**
 * Vertex shader for particle rendering in the Pixos game engine.
 * Handles particle positioning, scaling, and passes texture coordinates and color to the fragment shader.
 * @returns {string} The GLSL vertex shader source code.
 */
function _default() {
  return "\n    attribute vec3 aVertexPosition;\n    attribute vec2 aTextureCoord;\n\n    uniform mat4 uProjectionMatrix;\n    uniform mat4 uModelMatrix;\n    uniform mat4 uViewMatrix;\n    uniform vec3 uScale;\n    uniform vec3 uParticleColor;\n\n    varying vec2 vTextureCoord;\n    varying vec3 vColor;\n\n    void main(void) {\n      // Apply model matrix for particle position and scale\n      vec4 worldPosition = uModelMatrix * vec4(aVertexPosition * uScale, 1.0);\n\n      // Output position\n      gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;\n\n      // Pass texture coordinates and color to fragment shader\n      vTextureCoord = aTextureCoord;\n      vColor = uParticleColor;\n    }\n  ";
}