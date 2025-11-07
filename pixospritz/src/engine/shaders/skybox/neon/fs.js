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

export default function fs() {
  return `
  precision mediump float;
  uniform samplerCube uSkybox;
  varying vec4 vPosition;  // Interpolated position of the vertex in world space.
  uniform mat4 uViewDirectionProjectionInverse;  // Matrix to transform view direction into projection space for texture lookup.
  uniform float uTime;  // Time uniform, if you want to animate your noise pattern

  // Simplex noise function (you can use a different type of noise if you prefer)
  float simplexNoise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.123))) * 43758.5453);
  }

  void main() {
      // Transform the view direction to projection space for texture lookup
      vec4 t = uViewDirectionProjectionInverse * vPosition;
      vec3 dir = normalize(t.xyz / t.w);
      
      // Generate a simple abstract pattern based on noise and time
      float n = simplexNoise(vec3(vPosition.x, vPosition.y, uTime));  // Using the current time for animation
      
      // Map the noise value to a color: white for high values, black for low values
      vec3 skyColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), n);
      
      // Apply the calculated color to the fragment
      gl_FragColor = vec4(skyColor, 1.0);
  }

`;
}
