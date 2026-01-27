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

// Fragment shader for a horizontal cross‑wipe transition. A black
// rectangle slides across the screen. The direction uniform controls
// whether the wipe grows from the left (out) or shrinks from the right (in).

export default function fs() {
  return `
  precision mediump float;
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
  `;
}
