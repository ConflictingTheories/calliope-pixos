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

// Fragment shader for a radial “swirl” transition. This effect creates a
// growing or shrinking circular wipe based on the distance from the
// screen center. While not a true rotational swirl, it produces an
// interesting radial transition and avoids sampling textures.

export default function fs() {
  return `
  precision mediump float;
  varying vec2 vUV;
  uniform float uProgress;
  uniform float uDirection;
  void main() {
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUV, center);
      float mask;
      if (uDirection > 0.5) {
          // transition in: shrink the black disc
          mask = step(uProgress, dist);
      } else {
          // transition out: grow the black disc
          mask = step(dist, uProgress);
      }
      gl_FragColor = vec4(0.0, 0.0, 0.0, mask);
  }
  `;
}
