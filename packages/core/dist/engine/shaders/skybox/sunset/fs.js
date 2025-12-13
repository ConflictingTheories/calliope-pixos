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
  return "\n  precision mediump float;\n \n  uniform samplerCube uSkybox;\n  uniform mat4 uViewDirectionProjectionInverse;\n  uniform float uTime;\n  \n  varying vec4 vPosition;\n  \n  // Hash function for clouds\n  float hash(vec2 p) {\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\n  }\n  \n  // Value noise for clouds\n  float noise(vec2 p) {\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    f = f * f * (3.0 - 2.0 * f);\n    \n    float a = hash(i);\n    float b = hash(i + vec2(1.0, 0.0));\n    float c = hash(i + vec2(0.0, 1.0));\n    float d = hash(i + vec2(1.0, 1.0));\n    \n    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n  }\n  \n  // Fractal brownian motion for realistic clouds\n  float fbm(vec2 p) {\n    float value = 0.0;\n    float amplitude = 0.5;\n    float frequency = 1.0;\n    for (int i = 0; i < 4; i++) {\n      value += amplitude * noise(p * frequency);\n      amplitude *= 0.5;\n      frequency *= 2.0;\n    }\n    return value;\n  }\n  \n  void main() {\n    vec4 t = uViewDirectionProjectionInverse * vPosition;\n    vec3 dir = normalize(t.xyz / t.w);\n    \n    // Height-based gradient for sunset colors\n    float y = dir.y * 0.5 + 0.5; // Normalize to 0-1\n    \n    // Sun position (just above horizon)\n    vec3 sunDir = normalize(vec3(0.0, 0.1, -1.0));\n    float sunDot = dot(dir, sunDir);\n    \n    // Sunset color palette\n    vec3 horizonColor = vec3(1.0, 0.3, 0.1);    // Orange-red at horizon\n    vec3 skyColor = vec3(0.2, 0.1, 0.4);        // Deep purple up high\n    vec3 sunColor = vec3(1.0, 0.9, 0.5);        // Bright yellow-white sun\n    vec3 glowColor = vec3(1.0, 0.5, 0.2);       // Orange glow\n    \n    // Base sky gradient\n    vec3 color = mix(horizonColor, skyColor, pow(y, 0.8));\n    \n    // Sun glow (larger soft glow)\n    float glow = pow(max(0.0, sunDot), 4.0) * 1.5;\n    color = mix(color, glowColor, glow);\n    \n    // Bright sun disc\n    float sun = pow(max(0.0, sunDot), 256.0) * 2.0;\n    color = mix(color, sunColor, min(1.0, sun));\n    \n    // Animated clouds (move slowly)\n    float time = uTime * 0.02;\n    vec2 cloudUV = dir.xz / (dir.y + 0.5) * 2.0 + time;\n    float clouds = fbm(cloudUV * 3.0);\n    clouds = smoothstep(0.4, 0.7, clouds);\n    \n    // Cloud color based on sun angle\n    vec3 cloudColor = mix(vec3(0.3, 0.1, 0.15), vec3(1.0, 0.6, 0.3), glow + y * 0.5);\n    color = mix(color, cloudColor, clouds * (1.0 - y) * 0.6);\n    \n    // Add atmospheric scattering near horizon\n    float scatter = exp(-y * 3.0);\n    color = mix(color, horizonColor, scatter * 0.3);\n    \n    gl_FragColor = vec4(color, 1.0);\n  }\n";
}