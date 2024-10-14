/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

export default function vs() {
  return `
  precision mediump float;

  attribute vec3 aVertexPosition;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoord;
  
  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  uniform mat3 uNormalMatrix;

  varying vec4 vWorldVertex;
  varying vec3 vTransformedNormal;
  varying vec4 vPosition;
  varying vec2 vTextureCoord;

  uniform vec3 u_scale;

  void main(void) {
    vec3 scaledPosition = aVertexPosition * u_scale;

    vWorldVertex = uMVMatrix * vec4(aVertexPosition, 1.0);
    vPosition = uMVMatrix * vec4(scaledPosition, 1.0);
    vTextureCoord = aTextureCoord;
    vTransformedNormal = uNormalMatrix * aVertexNormal;

    gl_Position = uPMatrix * vPosition;
  }
`;
}
