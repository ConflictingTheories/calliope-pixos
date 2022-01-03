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
  varying vec3 vTransformedNormal;
  varying vec4 vPosition;

  varying highp vec3 vLighting;

  uniform float useSampler;
  uniform sampler2D uSampler;
    
  uniform vec3 uDiffuse;
  uniform vec3 uSpecular;
  uniform float uSpecularExponent;

  void main(void) {

    if(useSampler == 1.0){
      if(vLighting != vec3(0.0,0.0,0.0)){
        highp vec4 texelColors = texture2D(uSampler, vTextureCoord);
        gl_FragColor = vec4(texelColors.rgb * vLighting, texelColors.a);
      }else{
        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
        gl_FragColor = vec4(texelColor.rgb, texelColor.a);
      }
    } else {
      vec3 V = -normalize(vPosition.xyz);
      vec3 L = normalize(vec3(1.0, 1.0, 1.0));
      vec3 H = normalize(L + V);
      vec3 N = normalize(vTransformedNormal);
      vec3 color = uDiffuse * dot(N, L) + uSpecular * pow(dot(H, N), uSpecularExponent);
      if(vLighting != vec3(0.0,0.0,0.0))
        gl_FragColor = vec4(color * vLighting, 1.0);
      else
        gl_FragColor = vec4(color, 1.0);
    }

    if(gl_FragColor.a < 0.1)
      discard;
  }
`;
}
