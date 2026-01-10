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
  varying vec4 vPosition;
  uniform mat4 uViewDirectionProjectionInverse;
  uniform float uTime;

  // Hash function
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  float hash3(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
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
  
  void main() {
    vec4 t = uViewDirectionProjectionInverse * vPosition;
    vec3 dir = normalize(t.xyz / t.w);
    float time = uTime;
    
    // Dark base with subtle color
    vec3 color = vec3(0.02, 0.01, 0.05);
    
    // Animated grid lines (synthwave style)
    vec2 gridUV = dir.xz / (dir.y + 0.3);
    
    // Perspective grid
    float gridX = abs(sin(gridUV.x * 8.0 + time * 0.5));
    float gridZ = abs(sin(gridUV.y * 4.0 - time * 2.0));
    
    // Grid lines with glow
    float lineX = pow(gridX, 20.0);
    float lineZ = pow(gridZ, 20.0);
    float grid = max(lineX, lineZ);
    
    // Only show grid below horizon
    float belowHorizon = smoothstep(0.1, -0.3, dir.y);
    grid *= belowHorizon;
    
    // Neon pink/cyan colors
    vec3 neonPink = vec3(1.0, 0.1, 0.5);
    vec3 neonCyan = vec3(0.1, 1.0, 0.8);
    vec3 neonPurple = vec3(0.6, 0.1, 1.0);
    
    // Alternate line colors
    vec3 gridColor = mix(neonPink, neonCyan, sin(time * 0.3) * 0.5 + 0.5);
    color += gridColor * grid * 0.8;
    
    // Add horizon glow
    float horizonGlow = exp(-abs(dir.y) * 5.0);
    vec3 horizonColor = mix(neonPink, neonPurple, sin(time * 0.2) * 0.5 + 0.5);
    color += horizonColor * horizonGlow * 0.6;
    
    // Animated neon sun
    vec3 sunDir = normalize(vec3(sin(time * 0.1), 0.1, -1.0));
    float sunDot = dot(dir, sunDir);
    
    // Segmented retro sun
    float sunMask = step(0.9, sunDot);
    float sunStripes = step(0.5, sin(dir.y * 40.0 - time * 2.0));
    vec3 sunColor = mix(neonPink, vec3(1.0, 0.5, 0.0), (1.0 - dir.y) * 2.0);
    color = mix(color, sunColor * (0.5 + sunStripes * 0.5), sunMask);
    
    // Sun glow
    float sunGlow = pow(max(0.0, sunDot), 4.0) * (1.0 - sunMask);
    color += sunColor * sunGlow * 0.5;
    
    // Scattered stars with chromatic aberration
    float starDensity = 0.003;
    vec3 starPos = dir * 50.0;
    float star = step(1.0 - starDensity, hash3(floor(starPos)));
    if (star > 0.0 && dir.y > 0.0) {
      float twinkle = sin(time * 5.0 + hash3(floor(starPos)) * 6.28) * 0.3 + 0.7;
      vec3 starColor = mix(neonCyan, neonPink, hash3(floor(starPos) + 1.0));
      color += starColor * twinkle * 0.8;
    }
    
    // Scanlines effect
    float scanline = sin(gl_FragCoord.y * 2.0) * 0.03;
    color *= 1.0 - scanline;
    
    // Vignette
    vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0); // Approximate
    float vignette = 1.0 - length(uv - 0.5) * 0.5;
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
}
