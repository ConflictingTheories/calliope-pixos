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

// Fragment shader for pixelate transition effect.
// Creates a retro pixelation effect that increases as the transition progresses.
// Perfect for retro-style games and scene changes.

export default function fs() {
  return `
  precision mediump float;
  varying vec2 vUV;
  uniform float uProgress;
  uniform float uDirection;
  uniform vec2 uResolution;

  void main() {
      float progress = uDirection > 0.5 ? (1.0 - uProgress) : uProgress;
      
      // Calculate pixel size based on progress (2 to 64 pixels)
      float minPixels = 2.0;
      float maxPixels = 64.0;
      float pixelSize = mix(minPixels, maxPixels, progress);
      
      // Snap UV to pixelated grid
      vec2 pixelatedUV = floor(vUV * uResolution / pixelSize) * pixelSize / uResolution;
      
      // Fade to black based on progress squared for acceleration
      float fadeProgress = progress * progress;
      float alpha = smoothstep(0.3, 0.8, fadeProgress);
      
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
  }
  `;
}
