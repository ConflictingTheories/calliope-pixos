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

  // Hash functions
  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
  
  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal brownian motion for nebulae
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
      value += amplitude * noise(p);
      amplitude *= 0.5;
      p *= 2.0;
    }
    return value;
  }

  void main() {
    vec4 t = uViewDirectionProjectionInverse * vPosition;
    vec3 dir = normalize(t.xyz / t.w);
    float time = uTime * 0.05;

    // Deep space black base
    vec3 color = vec3(0.01, 0.01, 0.02);
    
    // Multiple star layers with different densities
    // Close bright stars
    float starDensity1 = 0.0015;
    vec3 starPos1 = dir * 80.0;
    float star1 = step(1.0 - starDensity1, hash(floor(starPos1)));
    if (star1 > 0.0) {
      float twinkle = sin(time * 20.0 + hash(floor(starPos1)) * 6.28) * 0.2 + 0.8;
      float brightness = (0.7 + 0.3 * hash(floor(starPos1) + 1.0)) * twinkle;
      vec3 starColor = mix(vec3(1.0, 0.9, 0.8), vec3(0.8, 0.9, 1.0), hash(floor(starPos1) + 2.0));
      color += starColor * brightness;
    }
    
    // Medium distant stars
    float starDensity2 = 0.003;
    vec3 starPos2 = dir * 150.0;
    float star2 = step(1.0 - starDensity2, hash(floor(starPos2)));
    if (star2 > 0.0) {
      float brightness = 0.4 + 0.3 * hash(floor(starPos2) + 1.0);
      color += vec3(brightness);
    }
    
    // Far dim stars (star dust)
    float starDensity3 = 0.008;
    vec3 starPos3 = dir * 300.0;
    float star3 = step(1.0 - starDensity3, hash(floor(starPos3)));
    if (star3 > 0.0) {
      color += vec3(0.15 + 0.1 * hash(floor(starPos3)));
    }

    // Nebula layer 1 - Blue/purple
    vec2 nebulaUV1 = dir.xy + dir.z * 0.5;
    float nebula1 = fbm(nebulaUV1 * 2.0 + time * 0.1);
    nebula1 = smoothstep(0.3, 0.8, nebula1);
    vec3 nebulaColor1 = mix(vec3(0.1, 0.05, 0.2), vec3(0.2, 0.1, 0.4), nebula1);
    color += nebulaColor1 * nebula1 * 0.4;
    
    // Nebula layer 2 - Pink/red (different orientation)
    vec2 nebulaUV2 = dir.xz + dir.y * 0.5 + vec2(100.0);
    float nebula2 = fbm(nebulaUV2 * 1.5 + time * 0.08);
    nebula2 = smoothstep(0.4, 0.85, nebula2);
    vec3 nebulaColor2 = mix(vec3(0.15, 0.02, 0.05), vec3(0.3, 0.05, 0.15), nebula2);
    color += nebulaColor2 * nebula2 * 0.3;
    
    // Nebula layer 3 - Teal emission nebula
    vec2 nebulaUV3 = dir.yz + dir.x * 0.5 + vec2(50.0, 200.0);
    float nebula3 = fbm(nebulaUV3 * 2.5 + time * 0.12);
    nebula3 = smoothstep(0.5, 0.9, nebula3);
    vec3 nebulaColor3 = vec3(0.05, 0.15, 0.2) * nebula3;
    color += nebulaColor3 * 0.25;

    // Milky Way band (follows a curved path)
    float milkyWay = abs(dir.y - sin(dir.x * 0.5) * 0.3);
    milkyWay = 1.0 - smoothstep(0.0, 0.4, milkyWay);
    float milkyNoise = fbm(dir.xz * 8.0 + time * 0.05);
    color += vec3(0.1, 0.1, 0.12) * milkyWay * milkyNoise;
    
    // Add some extra star density in milky way
    float milkyStars = step(0.97, noise(dir.xz * 500.0)) * milkyWay;
    color += vec3(0.5, 0.5, 0.6) * milkyStars;

    // Distant galaxies (rare, bright spots)
    float galaxyDensity = 0.0002;
    vec3 galaxyPos = dir * 20.0;
    float galaxy = step(1.0 - galaxyDensity, hash(floor(galaxyPos)));
    if (galaxy > 0.0) {
      vec2 galaxyUV = fract(galaxyPos.xy) - 0.5;
      float galaxyDist = length(galaxyUV);
      float galaxyBright = exp(-galaxyDist * 15.0);
      // Spiral arm effect
      float angle = atan(galaxyUV.y, galaxyUV.x);
      float spiral = sin(angle * 2.0 + galaxyDist * 10.0 + time) * 0.3 + 0.7;
      vec3 galaxyColor = mix(vec3(1.0, 0.9, 0.7), vec3(0.7, 0.8, 1.0), hash(floor(galaxyPos) + 3.0));
      color += galaxyColor * galaxyBright * spiral * 0.5;
    }

    // Subtle animated shimmer
    float shimmer = noise(dir.xy * 100.0 + time * 2.0) * 0.02;
    color += vec3(shimmer);

    gl_FragColor = vec4(color, 1.0);
  }
`;
}
