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
 * Handles particle positioning, scaling, billboarding, and passes texture coordinates and color to the fragment shader.
 * Uses camera-facing billboarding for proper particle display from any angle.
 * @returns {string} The GLSL vertex shader source code.
 */
function _default() {
  return "\n    attribute vec3 aVertexPosition;\n    attribute vec2 aTextureCoord;\n\n    uniform mat4 uProjectionMatrix;\n    uniform mat4 uModelMatrix;\n    uniform mat4 uViewMatrix;\n    uniform vec3 uScale;\n    uniform vec3 uParticleColor;\n    uniform float uAlpha;\n\n    varying vec2 vTextureCoord;\n    varying vec3 vColor;\n    varying float vAlpha;\n\n    void main(void) {\n      // Extract world position from model matrix (translation component)\n      vec3 particleWorldPos = vec3(uModelMatrix[3][0], uModelMatrix[3][1], uModelMatrix[3][2]);\n      \n      // Transform particle center to view space\n      vec4 viewPosition = uViewMatrix * vec4(particleWorldPos, 1.0);\n      \n      // Apply billboarding in view space - offset by scaled vertex position\n      // This keeps the quad always facing the camera\n      vec3 billboardOffset = vec3(\n        aVertexPosition.x * uScale.x,\n        aVertexPosition.y * uScale.y,\n        0.0  // No z offset - quad stays flat to camera\n      );\n      viewPosition.xyz += billboardOffset;\n\n      // Output position\n      gl_Position = uProjectionMatrix * viewPosition;\n\n      // Pass texture coordinates, color, and alpha to fragment shader\n      vTextureCoord = aTextureCoord;\n      vColor = uParticleColor;\n      vAlpha = uAlpha;\n    }\n  ";
}