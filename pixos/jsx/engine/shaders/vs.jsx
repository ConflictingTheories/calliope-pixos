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
  attribute vec2 aTextureCoord;
  attribute vec3 aVertexNormal;
  
  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  uniform mat4 uNormalMatrix;

  uniform vec3 u_scale;
  
  varying vec2 vTextureCoord;
  varying highp vec3 vLighting;

  void main(void) {
    vec3 scaledPosition = aVertexPosition * u_scale;
    gl_Position = uPMatrix * uMVMatrix * vec4(scaledPosition, 1.0);
    vTextureCoord = aTextureCoord;
    
    highp vec3 ambientLight = vec3(0.8, 0.8, 0.8);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
`;
}
