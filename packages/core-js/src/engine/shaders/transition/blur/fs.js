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

// Fragment shader for a radial blur‑mask transition. The edge is softened
// with smoothstep. uDirection > 0.5 = IN (mask shrinks), else OUT (mask grows).

export default function fs() {
  return `
  precision mediump float;
  varying vec2 vUV;
  uniform float uProgress;
  uniform float uDirection;

  void main() {
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUV, center);

      // Radius grows [0..1] for OUT, shrinks for IN
      float radius = (uDirection > 0.5) ? (1.0 - uProgress) : uProgress;

      // Blur width relative to screen; tweak for softer/harder edge
      float feather = 0.20; // 20% of radius as feather
      float edge0 = radius - feather * 0.5;
      float edge1 = radius + feather * 0.5;

      float mask = smoothstep(edge0, edge1, dist);

      // Black overlay with soft edge
      gl_FragColor = vec4(0.0, 0.0, 0.0, mask);
  }
  `;
}
