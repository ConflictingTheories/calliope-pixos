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
  return "\n  precision mediump float;\n  uniform samplerCube uSkybox;\n  varying vec4 vPosition;\n  uniform mat4 uViewDirectionProjectionInverse;\n  uniform float uTime;\n\n  // Hash function\n  float hash(vec2 p) {\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\n  }\n  \n  float hash3(vec3 p) {\n    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);\n  }\n\n  // Value noise\n  float noise(vec2 p) {\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    f = f * f * (3.0 - 2.0 * f);\n    \n    float a = hash(i);\n    float b = hash(i + vec2(1.0, 0.0));\n    float c = hash(i + vec2(0.0, 1.0));\n    float d = hash(i + vec2(1.0, 1.0));\n    \n    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n  }\n  \n  void main() {\n    vec4 t = uViewDirectionProjectionInverse * vPosition;\n    vec3 dir = normalize(t.xyz / t.w);\n    float time = uTime;\n    \n    // Dark base with subtle color\n    vec3 color = vec3(0.02, 0.01, 0.05);\n    \n    // Animated grid lines (synthwave style)\n    vec2 gridUV = dir.xz / (dir.y + 0.3);\n    \n    // Perspective grid\n    float gridX = abs(sin(gridUV.x * 8.0 + time * 0.5));\n    float gridZ = abs(sin(gridUV.y * 4.0 - time * 2.0));\n    \n    // Grid lines with glow\n    float lineX = pow(gridX, 20.0);\n    float lineZ = pow(gridZ, 20.0);\n    float grid = max(lineX, lineZ);\n    \n    // Only show grid below horizon\n    float belowHorizon = smoothstep(0.1, -0.3, dir.y);\n    grid *= belowHorizon;\n    \n    // Neon pink/cyan colors\n    vec3 neonPink = vec3(1.0, 0.1, 0.5);\n    vec3 neonCyan = vec3(0.1, 1.0, 0.8);\n    vec3 neonPurple = vec3(0.6, 0.1, 1.0);\n    \n    // Alternate line colors\n    vec3 gridColor = mix(neonPink, neonCyan, sin(time * 0.3) * 0.5 + 0.5);\n    color += gridColor * grid * 0.8;\n    \n    // Add horizon glow\n    float horizonGlow = exp(-abs(dir.y) * 5.0);\n    vec3 horizonColor = mix(neonPink, neonPurple, sin(time * 0.2) * 0.5 + 0.5);\n    color += horizonColor * horizonGlow * 0.6;\n    \n    // Animated neon sun\n    vec3 sunDir = normalize(vec3(sin(time * 0.1), 0.1, -1.0));\n    float sunDot = dot(dir, sunDir);\n    \n    // Segmented retro sun\n    float sunMask = step(0.9, sunDot);\n    float sunStripes = step(0.5, sin(dir.y * 40.0 - time * 2.0));\n    vec3 sunColor = mix(neonPink, vec3(1.0, 0.5, 0.0), (1.0 - dir.y) * 2.0);\n    color = mix(color, sunColor * (0.5 + sunStripes * 0.5), sunMask);\n    \n    // Sun glow\n    float sunGlow = pow(max(0.0, sunDot), 4.0) * (1.0 - sunMask);\n    color += sunColor * sunGlow * 0.5;\n    \n    // Scattered stars with chromatic aberration\n    float starDensity = 0.003;\n    vec3 starPos = dir * 50.0;\n    float star = step(1.0 - starDensity, hash3(floor(starPos)));\n    if (star > 0.0 && dir.y > 0.0) {\n      float twinkle = sin(time * 5.0 + hash3(floor(starPos)) * 6.28) * 0.3 + 0.7;\n      vec3 starColor = mix(neonCyan, neonPink, hash3(floor(starPos) + 1.0));\n      color += starColor * twinkle * 0.8;\n    }\n    \n    // Scanlines effect\n    float scanline = sin(gl_FragCoord.y * 2.0) * 0.03;\n    color *= 1.0 - scanline;\n    \n    // Vignette\n    vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0); // Approximate\n    float vignette = 1.0 - length(uv - 0.5) * 0.5;\n    color *= vignette;\n    \n    gl_FragColor = vec4(color, 1.0);\n  }\n";
}