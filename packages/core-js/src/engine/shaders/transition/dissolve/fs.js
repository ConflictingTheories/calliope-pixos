/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
*                                                 */

// Fragment shader for dissolve/noise transition effect.
// Uses procedural noise to create a dissolving particle effect.

export default function fs() {
  return `
  precision mediump float;
  varying vec2 vUV;
  uniform float uProgress;
  uniform float uDirection;
  uniform float uTime;

  // Simple hash function for noise
  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Value noise
  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f); // Smooth interpolation
      
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal noise for more organic look
  float fbm(vec2 p) {
      float sum = 0.0;
      float amp = 0.5;
      float freq = 1.0;
      for (int i = 0; i < 4; i++) {
          sum += noise(p * freq) * amp;
          amp *= 0.5;
          freq *= 2.0;
      }
      return sum;
  }

  void main() {
      float progress = uDirection > 0.5 ? (1.0 - uProgress) : uProgress;
      
      // Generate noise pattern
      vec2 noiseCoord = vUV * 10.0;
      float n = fbm(noiseCoord);
      
      // Add some time-based animation for sparkle effect
      float sparkle = noise(vUV * 50.0 + uTime * 0.001) * 0.1;
      n += sparkle;
      
      // Threshold based on progress
      float threshold = progress * 1.2; // Slightly overshoot for full coverage
      float alpha = smoothstep(threshold - 0.1, threshold + 0.1, n);
      
      // Invert for dissolve-in effect
      alpha = 1.0 - alpha;
      
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
  }
  `;
}
