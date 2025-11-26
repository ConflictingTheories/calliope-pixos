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
  return "\n  precision mediump float;\n  uniform samplerCube uSkybox;\n  uniform mat4 uViewDirectionProjectionInverse;\n  varying vec4 vPosition;\n\n  // Simple hash for star placement\n  float hash(vec3 p) {\n    return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453);\n  }\n\n  void main() {\n    vec4 t = uViewDirectionProjectionInverse * vPosition;\n    vec3 dir = normalize(t.xyz / t.w);\n\n    // Starfield effect\n    float starDensity = 0.0007; // Lower = more stars\n    float brightness = 0.0;\n    float star = step(1.0 - starDensity, hash(dir * 100.0));\n    if (star > 0.0) {\n      brightness = 0.8 + 0.2 * hash(dir * 200.0);\n    }\n\n    // Nebula color (subtle blue/purple)\n    float nebula = pow(abs(dir.y), 2.0) * 0.3;\n    vec3 nebulaColor = mix(vec3(0.05,0.05,0.15), vec3(0.2,0.1,0.3), nebula);\n\n    // Combine star and nebula\n    vec3 color = nebulaColor + brightness * vec3(1.0, 1.0, 1.0);\n    gl_FragColor = vec4(color, 1.0);\n  }\n";
}