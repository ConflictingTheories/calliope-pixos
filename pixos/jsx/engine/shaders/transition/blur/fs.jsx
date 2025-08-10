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

// Fragment shader for a blur effect - todo - needs some work - WIP

export default function fs() {
  return `
  precision mediump float;

  # blur constants
  const float MAX_BLUR = 20.0;
  const float NEAR = 0.1;
  const float FAR = 10.0;
  const float FOCAL_LENGTH = 1.0;
  const float FOCUS_DISTANCE = 2.0;
  const float MAGNIFICATION = FOCAL_LENGTH / abs(FOCUS_DISTANCE - FOCAL_LENGTH);
  const float FSTOP = 2.8;
  const float BLUR_COEFFICIENT = (FOCAL_LENGTH * MAGNIFICATION) / FSTOP;
  const float PPM = sqrt(480.0 * 480.0 + 600.0 * 600.0) / 35.0;
  const vec2 DEPTH_RANGE = vec2(NEAR, FAR);

  varying vec2 vUV;
  uniform float uProgress;
  uniform float uDirection;
  void main() {
      float mask;
      // When uDirection == 1.0 (transition in), the black area shrinks
      // from right to left. Otherwise, it grows from left to right.
      if (uDirection > 0.5) {
          mask = step(1.0 - uProgress, vUV.x);
      } else {
          mask = step(vUV.x, uProgress);
      }
      gl_FragColor = vec4(0.0, 0.0, 0.0, mask);
  }



  uniform vec2 uResolution;
  uniform vec2 uTexelOffset;
  
  uniform sampler2D uColor;
  uniform sampler2D uDepth;
  
  void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 resolution = uResolution - vec2(1.0);
  
      // Convert to linear depth
      float ndc = 2.0 * texture2D(uDepth, fragCoord / resolution).r - 1.0;
      float depth = -(2.0 * 0.5 * DEPTH_RANGE.y * DEPTH_RANGE.x) / (ndc * (DEPTH_RANGE.y - DEPTH_RANGE.x) - DEPTH_RANGE.y - DEPTH_RANGE.x);
      float deltaDepth = abs(FOCUS_DISTANCE - depth);
  
      // Blur more quickly in the foreground.
      float xdd = depth < FOCUS_DISTANCE ? abs(FOCUS_DISTANCE - deltaDepth) : abs(FOCUS_DISTANCE + deltaDepth);
      float blurRadius = min(floor(BLUR_COEFFICIENT * (deltaDepth / xdd) * PPM), MAX_BLUR);
  
      vec4 color = vec4(0.0);
      if (blurRadius > 1.0) {
          float halfBlur = blurRadius * 0.5;
  
          float count = 0.0;
  
          for (float i = 0.0; i <= MAX_BLUR; ++i) {
              if (i > blurRadius) {
                  break;
              }
  
              // Clamp sample coordinates
              vec2 sampleCoord = clamp(fragCoord + ((i - halfBlur) * uTexelOffset), vec2(0.0), resolution);
              color += texture2D(uColor, sampleCoord / resolution);
  
              ++count;
          }
  
          color /= count;
      } else {
          color = texture2D(uColor, fragCoord / resolution);
      }
  
      gl_FragColor = color;
  }
  `;
}