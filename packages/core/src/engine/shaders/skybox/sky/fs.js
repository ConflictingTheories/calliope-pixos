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
  
  // Hash function
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
  
  // FBM for clouds
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
    float time = uTime;
    
    // Height-based gradient for daytime sky
    float y = dir.y * 0.5 + 0.5;
    
    // Sun position (high in sky)
    vec3 sunDir = normalize(vec3(0.3, 0.8, 0.5));
    float sunDot = dot(dir, sunDir);
    
    // Daytime sky colors
    vec3 zenithColor = vec3(0.2, 0.4, 0.85);      // Deep blue at top
    vec3 horizonColor = vec3(0.6, 0.75, 0.95);    // Light blue at horizon
    vec3 sunColor = vec3(1.0, 1.0, 0.95);         // Bright white sun
    
    // Sky gradient using realistic Rayleigh scattering approximation
    vec3 color = mix(horizonColor, zenithColor, pow(y, 0.5));
    
    // Sun atmospheric scattering
    float scatter = pow(max(0.0, sunDot), 2.0);
    color = mix(color, vec3(0.9, 0.95, 1.0), scatter * 0.2);
    
    // Bright sun disc with soft edge
    float sun = smoothstep(0.9995, 1.0, sunDot);
    color = mix(color, sunColor, sun);
    
    // Sun glare
    float glare = pow(max(0.0, sunDot), 32.0) * 0.5;
    color += sunColor * glare;
    
    // Animated cumulus clouds
    vec2 cloudUV = dir.xz / (abs(dir.y) + 0.2) + time * 0.01;
    
    // Multiple cloud layers
    float clouds1 = fbm(cloudUV * 1.5);
    float clouds2 = fbm(cloudUV * 3.0 + vec2(100.0, 0.0));
    
    // Shape clouds
    clouds1 = smoothstep(0.4, 0.7, clouds1);
    clouds2 = smoothstep(0.5, 0.75, clouds2) * 0.5;
    float clouds = max(clouds1, clouds2);
    
    // Cloud color with some shading
    vec3 cloudLight = vec3(1.0, 1.0, 1.0);
    vec3 cloudShadow = vec3(0.7, 0.75, 0.85);
    vec3 cloudColor = mix(cloudShadow, cloudLight, fbm(cloudUV * 4.0));
    
    // Apply clouds more in middle sky
    float cloudMask = smoothstep(0.15, 0.5, y) * smoothstep(1.0, 0.6, y);
    color = mix(color, cloudColor, clouds * cloudMask * 0.85);
    
    // Atmospheric perspective (haze near horizon)
    float haze = exp(-y * 5.0);
    color = mix(color, horizonColor * 1.1, haze * 0.3);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
}
