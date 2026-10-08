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

// Vertex shader for slide transition
export default function vs() {
  return `
  attribute vec2 aPosition;
  varying vec2 vUV;
  void main() {
      vUV = (aPosition + 1.0) * 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
  }
  `;
}
