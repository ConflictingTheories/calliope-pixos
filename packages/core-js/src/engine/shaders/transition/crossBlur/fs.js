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

// Fragment shader for a horizontal cross‑blur wipe. Progress moves the edge
// across X; we soften with smoothstep. uDirection > 0.5 = IN (wipe recedes).

export default function fs() {
  return `
  precision mediump float;
  varying vec2 vUV;
  uniform float uProgress;
  uniform float uDirection;

  void main() {
      // Determine wipe center position depending on direction
      float pos = (uDirection > 0.5) ? (1.0 - uProgress) : uProgress;

      // Feather width in UV space
      float feather = 0.12;

      // Distance from the moving edge (vertical line at x=pos)
      float d = vUV.x - pos;

      // Soft mask around the edge using smoothstep
      float mask = smoothstep(-feather, feather, d);

      // Black overlay with soft edge
      gl_FragColor = vec4(0.0, 0.0, 0.0, mask);
  }
  `;
}
