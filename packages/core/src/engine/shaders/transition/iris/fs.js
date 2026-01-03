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

// Fragment shader for iris/circle transition effect.
// Creates a circular iris wipe effect, common in classic films and games.

export default function fs() {
  return `
  precision mediump float;
  varying vec2 vUV;
  uniform float uProgress;
  uniform float uDirection;
  uniform vec2 uCenter; // Center point of iris (default 0.5, 0.5)
  uniform float uAspect; // Aspect ratio for circular shape

  void main() {
      float progress = uDirection > 0.5 ? (1.0 - uProgress) : uProgress;
      
      // Adjust UV for aspect ratio
      vec2 center = uCenter;
      if (center.x == 0.0 && center.y == 0.0) {
          center = vec2(0.5, 0.5);
      }
      
      vec2 uv = vUV - center;
      uv.x *= max(uAspect, 1.0);
      
      // Calculate distance from center
      float dist = length(uv);
      
      // Max radius to cover screen corners
      float maxRadius = 1.5;
      float radius = (1.0 - progress) * maxRadius;
      
      // Soft edge for smoother transition
      float edge = 0.02;
      float alpha = 1.0 - smoothstep(radius - edge, radius + edge, dist);
      
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
  }
  `;
}
