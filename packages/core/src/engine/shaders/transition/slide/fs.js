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

// Fragment shader for slide transition effect.
// Slides a black bar across the screen in the specified direction.

export default function fs() {
  return `
  precision mediump float;
  varying vec2 vUV;
  uniform float uProgress;
  uniform float uDirection;
  uniform float uSlideDirection; // 0=right, 1=left, 2=down, 3=up

  // Easing function for smooth slide
  float easeInOutQuad(float t) {
      return t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
  }

  void main() {
      float progress = uDirection > 0.5 ? (1.0 - uProgress) : uProgress;
      float easedProgress = easeInOutQuad(progress);
      
      float alpha = 0.0;
      
      if (uSlideDirection < 0.5) {
          // Slide right
          alpha = step(vUV.x, easedProgress);
      } else if (uSlideDirection < 1.5) {
          // Slide left
          alpha = step(1.0 - easedProgress, vUV.x);
      } else if (uSlideDirection < 2.5) {
          // Slide down
          alpha = step(1.0 - vUV.y, easedProgress);
      } else {
          // Slide up
          alpha = step(vUV.y, easedProgress);
      }
      
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
  }
  `;
}
