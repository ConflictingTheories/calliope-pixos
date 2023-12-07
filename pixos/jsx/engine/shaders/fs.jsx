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

  const float Near = 1.0;
  const float Far = 30.0;
  const float LinearDepthConstant = 1.0 / (Far - Near);
  
  struct PointLight
  {
    float enabled;
    vec3 color;
    vec3 position;
    vec3 attenuation;
  };

  float unpack(vec4 color)
  {
    const vec4 bitShifts = vec4(1.0, 1.0/255.0, 1.0/(255.0*255.0), 1.0/(255.0*255.0*255.0));
    return dot(color, bitShifts);
  }

  varying vec4 vWorldVertex;
  varying vec3 vTransformedNormal;
  varying vec4 vPosition;
  varying vec2 vTextureCoord;

  varying vec3 vLighting;

  uniform PointLight uLights[4];
  uniform sampler2D uDepthMap;

  uniform float useSampler;
  uniform float useDiffuse;
  uniform sampler2D uSampler;
  uniform sampler2D uDiffuseMap;

  uniform vec3 uDiffuse;
  uniform vec3 uSpecular;
  uniform float uSpecularExponent;

  vec3 setLights(vec3 color){
    vec3 normal = normalize(vTransformedNormal);
    for (int i=0; i<4; i++) {
      if (uLights[i].enabled < 0.5)
        continue;
      
      vec3 lightVec = normalize(uLights[i].position - vPosition.xyz);
      float l = dot(normal, lightVec);
  
      if (l <= 0.0)
        continue;
  
      float d = distance(vPosition.xyz, uLights[i].position);
      float a = 1.0/(
        uLights[i].attenuation.x +
        uLights[i].attenuation.y*d + 
        uLights[i].attenuation.z*d*d
      );
      color += l*a*uLights[i].color;
    }
    return color;
  }

  void main(void) {
    float shadow = 1.0;
    
    if(useSampler == 1.0){
      vec4 texelColors = texture2D(uSampler, vTextureCoord);
      vec3 color = texelColors.rgb;
      
      if(texelColors.a < 0.1)
        discard;

      if(vLighting != vec3(0.0,0.0,0.0)){
        color = texelColors.rgb * vLighting;
      }else{
        color = texelColors.rgb;
      }

      color = setLights(color);
      gl_FragColor = clamp(vec4(texelColors.rgb*color*shadow, texelColors.a), 0.0, 1.0);
    } else {
      vec4 texelColors = texture2D(uDiffuseMap, vTextureCoord);
      vec3 V = -normalize(vPosition.xyz);
      vec3 L = normalize(vec3(1.0, 1.0, 1.0));
      vec3 H = normalize(L + V);
      vec3 N = normalize(vLighting);
      vec3 color = uDiffuse * dot(N, L);
      if(useDiffuse == 1.0){
        if(texelColors != vec4(0.0,0.0,0.0,0.0)){
          color = texelColors.rgb * color;
        }
      }

      if(vLighting != vec3(0.0,0.0,0.0))
        gl_FragColor = vec4(color * vLighting, 1.0);
      else
        gl_FragColor = vec4(color, 1.0);
    }
  }
`;
}
