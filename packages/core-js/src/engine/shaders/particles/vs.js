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
export default function () {
  return `
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    // Instanced attributes
    attribute vec3 aInstancePosition;
    attribute vec4 aInstanceColor;
    attribute float aInstanceSize;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform vec3 uScale;
    uniform vec3 uParticleColor;
    uniform float uAlpha;
    uniform bool uInstanced;

    varying vec2 vTextureCoord;
    varying vec3 vColor;
    varying float vAlpha;

    void main(void) {
      vec3 pos;
      vec3 scale;
      vec3 color;
      float alpha;

      if (uInstanced) {
        pos = aInstancePosition;
        scale = vec3(aInstanceSize);
        color = aInstanceColor.rgb;
        alpha = aInstanceColor.a;
      } else {
        // Extract world position from model matrix (translation component)
        pos = vec3(uModelMatrix[3][0], uModelMatrix[3][1], uModelMatrix[3][2]);
        scale = uScale;
        color = uParticleColor;
        alpha = uAlpha;
      }
      
      // Transform particle center to view space
      vec4 viewPosition = uViewMatrix * vec4(pos, 1.0);
      
      // Apply billboarding in view space - offset by scaled vertex position
      // This keeps the quad always facing the camera
      vec3 billboardOffset = vec3(
        aVertexPosition.x * scale.x,
        aVertexPosition.y * scale.y,
        0.0  // No z offset - quad stays flat to camera
      );
      viewPosition.xyz += billboardOffset;

      // Output position
      gl_Position = uProjectionMatrix * viewPosition;

      // Pass texture coordinates, color, and alpha to fragment shader
      vTextureCoord = aTextureCoord;
      vColor = color;
      vAlpha = alpha;
    }
  `;
}
