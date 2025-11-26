"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = fs;
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

function fs() {
  return "\n  precision mediump float;\n  uniform samplerCube uSkybox;\n  varying vec4 vPosition;  // Interpolated position of the vertex in world space.\n  uniform mat4 uViewDirectionProjectionInverse;  // Matrix to transform view direction into projection space for texture lookup.\n  uniform float uTime;  // Time uniform, if you want to animate your noise pattern\n\n  // Simplex noise function (you can use a different type of noise if you prefer)\n  float simplexNoise(vec3 p) {\n      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.123))) * 43758.5453);\n  }\n\n  void main() {\n      // Transform the view direction to projection space for texture lookup\n      vec4 t = uViewDirectionProjectionInverse * vPosition;\n      vec3 dir = normalize(t.xyz / t.w);\n      \n      // Generate a simple abstract pattern based on noise and time\n      float n = simplexNoise(vec3(vPosition.x, vPosition.y, uTime));  // Using the current time for animation\n      \n      // Map the noise value to a color: white for high values, black for low values\n      vec3 skyColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), n);\n      \n      // Apply the calculated color to the fragment\n      gl_FragColor = vec4(skyColor, 1.0);\n  }\n\n";
}