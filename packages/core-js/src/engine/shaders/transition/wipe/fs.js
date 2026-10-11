/*                                                 *\
 ** ----------------------------------------------- **
 **          Calliope - Pixos Game Engine           **
 ** ----------------------------------------------- **
 **  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
 **                                                 **
 ** PixoSpritz Dual License - see LICENSE.          **
 ** Free for education, non-commercial use, and     **
 ** individual non-profit artists (CC-BY-NC-SA-4.0) **
 ** Commercial use requires a purchased license.    **
 ** ----------------------------------------------- **
 *                                                 */

// Fragment shader for directional wipe transition.
// Wipes from left to right (or reverse based on direction).
// uProgress: 0-1 transition progress
// uDirection: 0 = out (wipe to black), 1 = in (reveal from black)

export default function fs() {
  return `
  precision mediump float;
  varying vec2 vUV;
  uniform float uProgress;
  uniform float uDirection;
  uniform float uWipeAngle; // 0=left-to-right, 1=top-to-bottom, 2=diagonal

  void main() {
      float progress = uDirection > 0.5 ? (1.0 - uProgress) : uProgress;
      
      // Calculate wipe position based on angle
      float wipePos;
      if (uWipeAngle < 0.5) {
          // Left to right
          wipePos = vUV.x;
      } else if (uWipeAngle < 1.5) {
          // Top to bottom
          wipePos = 1.0 - vUV.y;
      } else {
          // Diagonal
          wipePos = (vUV.x + (1.0 - vUV.y)) * 0.5;
      }
      
      // Soft edge for smoother transition
      float edge = 0.05;
      float alpha = smoothstep(progress - edge, progress + edge, wipePos);
      
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
  }
  `;
}
