/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
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
  uniform float useLighting;

  uniform vec3 uLightPosition;
  uniform vec3 uLightColor;
  uniform vec3 uLightDirection;
  uniform float uLightIsDirectional;

  varying vec2 vTextureCoord;
  varying vec3 vTransformedNormal;
  varying vec4 vPosition;

  varying vec3 vLighting;
  
  uniform vec3 u_scale;

  void main(void) {

    vec3 scaledPosition = aVertexPosition * u_scale;
    vPosition = uMVMatrix * vec4(scaledPosition, 1.0);
    gl_Position = uPMatrix * vPosition;

    vTextureCoord = aTextureCoord;

    vec3 ambientLight = vec3(0.8, 0.8, 0.8);
    vec3 directionalLightColor = uLightColor;
    vec3 directionalVector = normalize(vec3(1, 1, 0.75));

    vec3 transformedNormal = uNormalMatrix * aVertexNormal;
    float directional = max(dot(transformedNormal.xyz, directionalVector), 0.1);
    
    // todo -- Calculate incoming light for all light sources
    if (useLighting == 1.0) {
      if (uLightIsDirectional == 1.0) {
         directional = max(dot(transformedNormal.xyz, normalize(uLightDirection)), 0.0);
      } else {
        directionalLightColor = normalize(uLightPosition.xyz) * dot(uLightPosition.xyz, vPosition.xyz);
        directional = max(dot(transformedNormal.xyz, directionalLightColor), 0.0);
      }
    }

    vec3 reflectedLightColor = directional * directionalLightColor;
    vLighting = ambientLight + reflectedLightColor; 
  }
`;
}
