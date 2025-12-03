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
  return "\n  precision mediump float;\n \n  uniform samplerCube uSkybox;\n  uniform mat4 uViewDirectionProjectionInverse;\n  uniform float uTime;\n  \n  varying vec4 vPosition;\n  \n  // Hash function for clouds\n  float hash(vec2 p) {\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\n  }\n  \n  // Value noise\n  float noise(vec2 p) {\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    f = f * f * (3.0 - 2.0 * f);\n    \n    float a = hash(i);\n    float b = hash(i + vec2(1.0, 0.0));\n    float c = hash(i + vec2(0.0, 1.0));\n    float d = hash(i + vec2(1.0, 1.0));\n    \n    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n  }\n  \n  // Fractal brownian motion for fluffy clouds\n  float fbm(vec2 p) {\n    float value = 0.0;\n    float amplitude = 0.5;\n    for (int i = 0; i < 5; i++) {\n      value += amplitude * noise(p);\n      amplitude *= 0.5;\n      p *= 2.0;\n    }\n    return value;\n  }\n  \n  void main() {\n    vec4 t = uViewDirectionProjectionInverse * vPosition;\n    vec3 dir = normalize(t.xyz / t.w);\n    \n    // Height-based gradient\n    float y = dir.y * 0.5 + 0.5;\n    \n    // Sun position (rising from the east)\n    vec3 sunDir = normalize(vec3(1.0, 0.3, 0.0));\n    float sunDot = dot(dir, sunDir);\n    \n    // Morning color palette - soft and fresh\n    vec3 horizonColor = vec3(1.0, 0.85, 0.7);    // Warm peachy horizon\n    vec3 skyColor = vec3(0.5, 0.7, 0.95);        // Soft blue sky\n    vec3 sunColor = vec3(1.0, 1.0, 0.9);         // Bright morning sun\n    vec3 glowColor = vec3(1.0, 0.9, 0.7);        // Warm glow\n    \n    // Base sky gradient - softer transition\n    vec3 color = mix(horizonColor, skyColor, pow(y, 0.6));\n    \n    // Morning sun glow\n    float glow = pow(max(0.0, sunDot), 8.0);\n    color = mix(color, glowColor, glow * 0.6);\n    \n    // Bright sun disc\n    float sun = pow(max(0.0, sunDot), 512.0) * 2.0;\n    color = mix(color, sunColor, min(1.0, sun));\n    \n    // Fluffy morning clouds\n    float time = uTime * 0.015;\n    vec2 cloudUV = dir.xz / (abs(dir.y) + 0.3) * 1.5 + vec2(time, 0.0);\n    float clouds = fbm(cloudUV * 2.0);\n    \n    // Shape clouds nicely\n    clouds = smoothstep(0.35, 0.65, clouds);\n    \n    // Clouds are bright white in morning light\n    vec3 cloudColor = mix(vec3(0.95, 0.95, 1.0), vec3(1.0, 0.98, 0.9), glow);\n    \n    // Apply clouds more in the upper sky\n    float cloudMask = smoothstep(0.1, 0.6, y) * (1.0 - smoothstep(0.7, 1.0, y));\n    color = mix(color, cloudColor, clouds * cloudMask * 0.7);\n    \n    // Soft atmospheric haze near horizon\n    float haze = exp(-y * 4.0);\n    color = mix(color, horizonColor * 1.1, haze * 0.25);\n    \n    // Add subtle light rays\n    float rays = pow(max(0.0, sunDot), 2.0) * noise(dir.xz * 10.0 + time * 0.5) * 0.15;\n    color += vec3(rays) * (1.0 - y);\n    \n    gl_FragColor = vec4(color, 1.0);\n  }\n";
}