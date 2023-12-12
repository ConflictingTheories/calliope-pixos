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
export default function fs() {
  return `
  precision mediump float;
 
  uniform samplerCube uSkybox;
  uniform mat4 uViewDirectionProjectionInverse;
  
  varying vec4 vPosition;
  void main() {
    vec4 t = uViewDirectionProjectionInverse * vPosition;
    gl_FragColor = textureCube(uSkybox, normalize(t.xyz / t.w));
  }
`;
}
