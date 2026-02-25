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
  
  // Value noise for clouds
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
  
  // Fractal brownian motion for realistic clouds
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  void main() {
    vec4 t = uViewDirectionProjectionInverse * vPosition;
    vec3 dir = normalize(t.xyz / t.w);
    
    // Height-based gradient for sunset colors
    float y = dir.y * 0.5 + 0.5; // Normalize to 0-1
    
    // Sun position (just above horizon)
    vec3 sunDir = normalize(vec3(0.0, 0.1, -1.0));
    float sunDot = dot(dir, sunDir);
    
    // Sunset color palette
    vec3 horizonColor = vec3(1.0, 0.3, 0.1);    // Orange-red at horizon
    vec3 skyColor = vec3(0.2, 0.1, 0.4);        // Deep purple up high
    vec3 sunColor = vec3(1.0, 0.9, 0.5);        // Bright yellow-white sun
    vec3 glowColor = vec3(1.0, 0.5, 0.2);       // Orange glow
    
    // Base sky gradient
    vec3 color = mix(horizonColor, skyColor, pow(y, 0.8));
    
    // Sun glow (larger soft glow)
    float glow = pow(max(0.0, sunDot), 4.0) * 1.5;
    color = mix(color, glowColor, glow);
    
    // Bright sun disc
    float sun = pow(max(0.0, sunDot), 256.0) * 2.0;
    color = mix(color, sunColor, min(1.0, sun));
    
    // Animated clouds (move slowly)
    float time = uTime * 0.02;
    vec2 cloudUV = dir.xz / (dir.y + 0.5) * 2.0 + time;
    float clouds = fbm(cloudUV * 3.0);
    clouds = smoothstep(0.4, 0.7, clouds);
    
    // Cloud color based on sun angle
    vec3 cloudColor = mix(vec3(0.3, 0.1, 0.15), vec3(1.0, 0.6, 0.3), glow + y * 0.5);
    color = mix(color, cloudColor, clouds * (1.0 - y) * 0.6);
    
    // Add atmospheric scattering near horizon
    float scatter = exp(-y * 3.0);
    color = mix(color, horizonColor, scatter * 0.3);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
}
