/**
 * Vertex shader for particle rendering in the Pixos game engine.
 * Handles particle positioning, scaling, and passes texture coordinates and color to the fragment shader.
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

    varying vec2 vTextureCoord;
    varying vec3 vColor;

    void main(void) {
      // Apply model matrix for particle position and scale
      vec4 worldPosition = uModelMatrix * vec4(aVertexPosition * uScale, 1.0);

      // Output position
      gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;

      // Pass texture coordinates and color to fragment shader
      vTextureCoord = aTextureCoord;
      vColor = uParticleColor;
    }
  `;
}
