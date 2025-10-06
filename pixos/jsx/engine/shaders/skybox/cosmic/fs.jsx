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
  uniform mat4 uViewDirectionProjectionInverse;
  varying vec4 vPosition;

  // Simple hash for star placement
  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453);
  }

  void main() {
    vec4 t = uViewDirectionProjectionInverse * vPosition;
    vec3 dir = normalize(t.xyz / t.w);

    // Starfield effect
    float starDensity = 0.0007; // Lower = more stars
    float brightness = 0.0;
    float star = step(1.0 - starDensity, hash(dir * 100.0));
    if (star > 0.0) {
      brightness = 0.8 + 0.2 * hash(dir * 200.0);
    }

    // Nebula color (subtle blue/purple)
    float nebula = pow(abs(dir.y), 2.0) * 0.3;
    vec3 nebulaColor = mix(vec3(0.05,0.05,0.15), vec3(0.2,0.1,0.3), nebula);

    // Combine star and nebula
    vec3 color = nebulaColor + brightness * vec3(1.0, 1.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;
}
