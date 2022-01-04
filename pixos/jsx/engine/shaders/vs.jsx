/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

export default function vs() {
  return `
  attribute vec3 aVertexPosition;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoord;
  
  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  uniform mat3 uNormalMatrix;
  
  varying vec2 vTextureCoord;
  varying vec3 vTransformedNormal;
  varying vec4 vPosition;

  varying highp vec3 vLighting;
  
  uniform vec3 u_scale;

  void main(void) {

    vec3 scaledPosition = aVertexPosition * u_scale;
    vPosition = uMVMatrix * vec4(scaledPosition, 1.0);
    gl_Position = uPMatrix * vPosition;

    vTextureCoord = aTextureCoord;

    highp vec3 ambientLight = vec3(0.8, 0.8, 0.8);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(1, 1, 0.75));

    highp vec3 transformedNormal = uNormalMatrix * aVertexNormal;

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
`;
}
