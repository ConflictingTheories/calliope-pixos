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
  
  uniform mat4 uModelMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat3 uNormalMatrix;
  uniform mat3 uCamPos;

  uniform vec3 uLightDirection;
  uniform vec3 uCameraPosition;
  varying vec3 vFragPos;
  varying vec3 vLightDir;
  varying vec3 vViewDir;

  varying vec4 vWorldVertex;
  varying vec3 vWorldNormal;
  varying vec3 vTransformedNormal;
  varying vec4 vPosition;
  varying vec2 vTextureCoord;

  uniform vec3 u_scale;

  void main(void) {
    vec3 scaledPosition = aVertexPosition * u_scale;

    vWorldVertex = uModelMatrix * vec4(aVertexPosition, 1.0);
    vPosition = uModelMatrix * vec4(scaledPosition, 1.0);
    vTextureCoord = aTextureCoord;
    vTransformedNormal = uNormalMatrix * aVertexNormal;
    vWorldNormal = normalize(mat3(uModelMatrix) * aVertexNormal);

    // Pass fragment position to fragment shader
    vFragPos = vec3(uModelMatrix * vec4(scaledPosition, 1.0));
    
    // Calculate view direction and pass to fragment shader
    vViewDir = normalize(uCameraPosition - vFragPos);

    gl_Position = uProjectionMatrix * uViewMatrix * vPosition;
  }
`;
}
