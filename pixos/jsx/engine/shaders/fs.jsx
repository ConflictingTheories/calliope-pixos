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
export default function fs() {
  return `
  precision mediump float;
  varying vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;
  
  void main(void) {
    if(vLighting != vec3(0.0,0.0,0.0))
      gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
    else{
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
      gl_FragColor = vec4(texelColor.rgb, texelColor.a);
    }
    if(gl_FragColor.a < 0.1)
        discard;
  }
`;
}
