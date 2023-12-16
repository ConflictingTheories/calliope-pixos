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

  const float Near = 0.1;
  const float Far = 50.0;
  
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
    vec3 lightcolor = vec3(0.0, 0.0, 0.0);
    for (int i=0; i<4; i++) {
      if (uLights[i].enabled < 0.5)
        continue;
      
      vec3 lightVec = normalize(uLights[i].position - vPosition.xyz);
      float light = dot(normal, lightVec);
    
      if (light > 0.0) {
        float dist = distance(vPosition.xyz, uLights[i].position);
        float attenuation = 1.0/(
          uLights[i].attenuation.x +
          uLights[i].attenuation.y*dist + 
          uLights[i].attenuation.z*dist*dist
        );
        lightcolor += attenuation * light * uLights[i].color;
      }
    }

    return color + lightcolor;
  }
  
  // Diffuse Colour Calculation
   vec3 calculateDiffuse(){
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
    return color;
   }

   // Sampler Texture Colour Calculation
   vec3 calculateSampler(vec4 texelColors){
    vec3 color = texelColors.rgb;
    if(texelColors.a < 0.1)
      discard;
    if(vLighting != vec3(0.0,0.0,0.0)){
      return texelColors.rgb * vLighting;
    }
    return color;
   }

   // linearize depth
   float LinearizeDepth(float depth) 
   {
       float z = depth * 2.0 - 1.0; // back to NDC 
       return (2.0 * Near * Far) / (Far + Near - z * (Far - Near));	
   }

   // fog effect based on depth
   vec4 fogEffect(vec4 color4){
    float depth = LinearizeDepth(gl_FragCoord.z) / Far;
    vec4 depthVec4 = vec4(vec3(pow(depth, 1.4)), 1.0);
    return (color4 * (1.0 - depth)) + depthVec4;
   }

  void main(void) {
    float shadow = 1.0;
    
    // sampler
    if(useSampler == 1.0){
      vec4 texelColors = texture2D(uSampler, vTextureCoord);
      vec3 color = calculateSampler(texelColors);
      vec4 color4 = clamp(vec4(setLights(color) * shadow, texelColors.a), 0.0, 1.0);
      // fog effect
      gl_FragColor = fogEffect(color4);
    } else { // diffuse
      vec3 color = calculateDiffuse();
      vec4 color4 = vec4(setLights(color), 1.0);
      if(vLighting != vec3(0.0,0.0,0.0))
        color4 = vec4(color4.rgb * vLighting, 1.0);
      // fog effect
      gl_FragColor = fogEffect(color4);
    }
  }
`;
}
