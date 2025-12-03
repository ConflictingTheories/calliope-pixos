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
  return "\n  precision mediump float;\n \n  uniform samplerCube uSkybox;\n  uniform mat4 uViewDirectionProjectionInverse;\n  uniform float uTime;\n  \n  varying vec4 vPosition;\n  \n  // Hash function\n  float hash(vec2 p) {\n    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\n  }\n  \n  // Value noise\n  float noise(vec2 p) {\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    f = f * f * (3.0 - 2.0 * f);\n    \n    float a = hash(i);\n    float b = hash(i + vec2(1.0, 0.0));\n    float c = hash(i + vec2(0.0, 1.0));\n    float d = hash(i + vec2(1.0, 1.0));\n    \n    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n  }\n  \n  // FBM for clouds\n  float fbm(vec2 p) {\n    float value = 0.0;\n    float amplitude = 0.5;\n    for (int i = 0; i < 5; i++) {\n      value += amplitude * noise(p);\n      amplitude *= 0.5;\n      p *= 2.0;\n    }\n    return value;\n  }\n  \n  void main() {\n    vec4 t = uViewDirectionProjectionInverse * vPosition;\n    vec3 dir = normalize(t.xyz / t.w);\n    float time = uTime;\n    \n    // Height-based gradient for daytime sky\n    float y = dir.y * 0.5 + 0.5;\n    \n    // Sun position (high in sky)\n    vec3 sunDir = normalize(vec3(0.3, 0.8, 0.5));\n    float sunDot = dot(dir, sunDir);\n    \n    // Daytime sky colors\n    vec3 zenithColor = vec3(0.2, 0.4, 0.85);      // Deep blue at top\n    vec3 horizonColor = vec3(0.6, 0.75, 0.95);    // Light blue at horizon\n    vec3 sunColor = vec3(1.0, 1.0, 0.95);         // Bright white sun\n    \n    // Sky gradient using realistic Rayleigh scattering approximation\n    vec3 color = mix(horizonColor, zenithColor, pow(y, 0.5));\n    \n    // Sun atmospheric scattering\n    float scatter = pow(max(0.0, sunDot), 2.0);\n    color = mix(color, vec3(0.9, 0.95, 1.0), scatter * 0.2);\n    \n    // Bright sun disc with soft edge\n    float sun = smoothstep(0.9995, 1.0, sunDot);\n    color = mix(color, sunColor, sun);\n    \n    // Sun glare\n    float glare = pow(max(0.0, sunDot), 32.0) * 0.5;\n    color += sunColor * glare;\n    \n    // Animated cumulus clouds\n    vec2 cloudUV = dir.xz / (abs(dir.y) + 0.2) + time * 0.01;\n    \n    // Multiple cloud layers\n    float clouds1 = fbm(cloudUV * 1.5);\n    float clouds2 = fbm(cloudUV * 3.0 + vec2(100.0, 0.0));\n    \n    // Shape clouds\n    clouds1 = smoothstep(0.4, 0.7, clouds1);\n    clouds2 = smoothstep(0.5, 0.75, clouds2) * 0.5;\n    float clouds = max(clouds1, clouds2);\n    \n    // Cloud color with some shading\n    vec3 cloudLight = vec3(1.0, 1.0, 1.0);\n    vec3 cloudShadow = vec3(0.7, 0.75, 0.85);\n    vec3 cloudColor = mix(cloudShadow, cloudLight, fbm(cloudUV * 4.0));\n    \n    // Apply clouds more in middle sky\n    float cloudMask = smoothstep(0.15, 0.5, y) * smoothstep(1.0, 0.6, y);\n    color = mix(color, cloudColor, clouds * cloudMask * 0.85);\n    \n    // Atmospheric perspective (haze near horizon)\n    float haze = exp(-y * 5.0);\n    color = mix(color, horizonColor * 1.1, haze * 0.3);\n    \n    gl_FragColor = vec4(color, 1.0);\n  }\n";
}