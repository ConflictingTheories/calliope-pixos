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
  uniform float uTime;
  
  varying vec4 vPosition;
  
  // Hash function for clouds
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  // Value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  // Fractal brownian motion for fluffy clouds
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      amplitude *= 0.5;
      p *= 2.0;
    }
    return value;
  }
  
  void main() {
    vec4 t = uViewDirectionProjectionInverse * vPosition;
    vec3 dir = normalize(t.xyz / t.w);
    
    // Height-based gradient
    float y = dir.y * 0.5 + 0.5;
    
    // Sun position (rising from the east)
    vec3 sunDir = normalize(vec3(1.0, 0.3, 0.0));
    float sunDot = dot(dir, sunDir);
    
    // Morning color palette - soft and fresh
    vec3 horizonColor = vec3(1.0, 0.85, 0.7);    // Warm peachy horizon
    vec3 skyColor = vec3(0.5, 0.7, 0.95);        // Soft blue sky
    vec3 sunColor = vec3(1.0, 1.0, 0.9);         // Bright morning sun
    vec3 glowColor = vec3(1.0, 0.9, 0.7);        // Warm glow
    
    // Base sky gradient - softer transition
    vec3 color = mix(horizonColor, skyColor, pow(y, 0.6));
    
    // Morning sun glow
    float glow = pow(max(0.0, sunDot), 8.0);
    color = mix(color, glowColor, glow * 0.6);
    
    // Bright sun disc
    float sun = pow(max(0.0, sunDot), 512.0) * 2.0;
    color = mix(color, sunColor, min(1.0, sun));
    
    // Fluffy morning clouds
    float time = uTime * 0.015;
    vec2 cloudUV = dir.xz / (abs(dir.y) + 0.3) * 1.5 + vec2(time, 0.0);
    float clouds = fbm(cloudUV * 2.0);
    
    // Shape clouds nicely
    clouds = smoothstep(0.35, 0.65, clouds);
    
    // Clouds are bright white in morning light
    vec3 cloudColor = mix(vec3(0.95, 0.95, 1.0), vec3(1.0, 0.98, 0.9), glow);
    
    // Apply clouds more in the upper sky
    float cloudMask = smoothstep(0.1, 0.6, y) * (1.0 - smoothstep(0.7, 1.0, y));
    color = mix(color, cloudColor, clouds * cloudMask * 0.7);
    
    // Soft atmospheric haze near horizon
    float haze = exp(-y * 4.0);
    color = mix(color, horizonColor * 1.1, haze * 0.25);
    
    // Add subtle light rays
    float rays = pow(max(0.0, sunDot), 2.0) * noise(dir.xz * 10.0 + time * 0.5) * 0.15;
    color += vec3(rays) * (1.0 - y);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
}
