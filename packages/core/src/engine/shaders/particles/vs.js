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
export default function() {
  return `
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform vec3 uScale;
    uniform vec3 uParticleColor;
    uniform float uAlpha;

    varying vec2 vTextureCoord;
    varying vec3 vColor;
    varying float vAlpha;

    void main(void) {
      // Extract world position from model matrix (translation component)
      vec3 particleWorldPos = vec3(uModelMatrix[3][0], uModelMatrix[3][1], uModelMatrix[3][2]);
      
      // Transform particle center to view space
      vec4 viewPosition = uViewMatrix * vec4(particleWorldPos, 1.0);
      
      // Apply billboarding in view space - offset by scaled vertex position
      // This keeps the quad always facing the camera
      vec3 billboardOffset = vec3(
        aVertexPosition.x * uScale.x,
        aVertexPosition.y * uScale.y,
        0.0  // No z offset - quad stays flat to camera
      );
      viewPosition.xyz += billboardOffset;

      // Output position
      gl_Position = uProjectionMatrix * viewPosition;

      // Pass texture coordinates, color, and alpha to fragment shader
      vTextureCoord = aTextureCoord;
      vColor = uParticleColor;
      vAlpha = uAlpha;
    }
  `;
}
