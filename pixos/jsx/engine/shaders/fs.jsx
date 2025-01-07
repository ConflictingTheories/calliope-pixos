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
export default function fs() {
  return `
  precision mediump int;
  precision mediump float;

  const float Near = 0.1;
  const float Far = 50.0;

  struct PointLight {
    float enabled;
    vec3 color;
    vec3 position;
    vec3 attenuation;
    vec3 direction;
    vec3 scatteringCoefficients;
    float density;
  };

  float unpack(vec4 color) {
    const vec4 bitShifts = vec4(1.0, 1.0 / 255.0, 1.0 / (255.0 * 255.0), 1.0 / (255.0 * 255.0 * 255.0));
    return dot(color, bitShifts);
  }

  varying vec4 vWorldVertex;
  varying vec3 vWorldNormal;
  varying vec3 vTransformedNormal;
  varying vec4 vPosition;
  varying vec2 vTextureCoord;

  varying vec3 vLighting;

  uniform PointLight uLights[32];
  uniform sampler2D uDepthMap;

  uniform float runTransition;
  uniform float useSampler;
  uniform float useDiffuse;
  uniform sampler2D uSampler;
  uniform sampler2D uDiffuseMap;

  uniform vec3 uDiffuse;
  uniform vec3 uSpecular;
  uniform float uSpecularExponent;

  uniform vec3 uLightColor;
  varying vec3 vFragPos;
  varying vec3 vLightDir;
  varying vec3 vViewDir;

  float getAttenuation(PointLight light) {
    float distance_from_light;
    vec3 to_light;

    to_light = light.position - vPosition.xyz;
    distance_from_light = length(to_light);
    
    float attenuation = 1.0 / (
        1.0 + light.attenuation.x
        + light.attenuation.y * distance_from_light 
        + light.attenuation.z * pow(distance_from_light, 2.0)
      );
    return attenuation;
  }

  vec3 getReflectedLightColor(vec3 color) {
    vec3 reflectedLightColor = vec3(0.0);
  
    for(int i = 0; i < 32; i++) {
      if(uLights[i].enabled <= 0.5) continue;
  
      vec3 specular_color;
      vec3 diffuse_color;
      vec3 to_light;
      vec3 reflection;
      vec3 to_camera;
      float cos_angle;
      float attenuation;
      vec3 normal;
  
      // Calculate a vector from the fragment location to the light source
      to_light = normalize(uLights[i].position - vFragPos);
      normal = normalize(vWorldNormal);
  
      // DIFFUSE calculations
      if (useSampler == 1.0) {
        cos_angle = 0.67; // billboard sprites
        cos_angle += dot(to_camera, to_light);
      } else {
        cos_angle = dot(normal, to_light);
        cos_angle = clamp(cos_angle, 0.0, 1.0);
      }
  
      // Scale the color of this fragment based on its angle to the light.
      diffuse_color = uLights[i].color * cos_angle;
  
      // SPECULAR calculations
      reflection = 2.0 * dot(normal, to_light) * normal - to_light;
      reflection = normalize(reflection);
  
      to_camera = normalize(vViewDir);
  
      cos_angle = dot(reflection, to_camera);
      cos_angle = clamp(cos_angle, 0.0, 1.0);
      specular_color = uLights[i].color * cos_angle;
  
      // ATTENUATION calculations
      attenuation = getAttenuation(uLights[i]);
  
      // Combine and attenuate the colors from this light source
      reflectedLightColor += attenuation * (diffuse_color + specular_color);
    }
  
    return clamp(0.5 * color + reflectedLightColor, 0.0, 1.0);
  }

  // Diffuse Colour Calculation
  vec3 calculateDiffuse() {
    vec4 texelColors = texture2D(uDiffuseMap, vTextureCoord);
    vec3 color = uDiffuse;
    if(useDiffuse == 1.0) {
      if(texelColors != vec4(0.0, 0.0, 0.0, 0.0)) {
        color = texelColors.rgb + color;
      }
    }
    return color;
  }

  // Sampler Texture Colour Calculation
  vec3 calculateSampler(vec4 texelColors) {
    vec3 color = texelColors.rgb;
    if(texelColors.a < 0.1) discard;
    return color;
  }

  // linearize depth
  float LinearizeDepth(float depth) {
    float z = depth * 2.0 - 1.0; // back to NDC 
    return (2.0 * Near * Far) / (Far + Near - z * (Far - Near));
  }

  // fog effect based on depth
  vec4 fogEffect(vec4 color4) {
    float depth = LinearizeDepth(gl_FragCoord.z) / Far;
    vec4 depthVec4 = vec4(vec3(pow(depth, 1.4)), 1.0);
    return (color4 * (1.0 - depth)) + depthVec4;
  }

  // Volumetric Calculation
  vec4 volumetricCalculation(vec4 color4) {
    vec3 finalColor;

    for(int i = 0; i < 32; i++) {
      if(uLights[i].enabled <= 0.5) continue;
        
      // Calculate the distance from the fragment to the light
      float distance = length(uLights[i].position - vec3(vWorldVertex));

      // directional lighting - not working atm
      // if(length(uLights[i].direction) > 0.0){
      //   // Calculate the angle between the light direction and the fragment
      //   float cos_angle = dot(normalize(uLights[i].direction), normalize(vFragPos - uLights[i].position));
      //   // If the fragment is not within the light cone, skip this light
      //   if(cos_angle <= 0.0) continue;
      // }

      // Calculate the scattering effect
      float scattering = exp(-uLights[i].density * distance);
      vec3 scatteredLight = uLights[i].color * scattering * uLights[i].scatteringCoefficients;
      // Combine the scattered light with the existing lighting
      finalColor += scatteredLight;
    }

    return color4 * vec4(finalColor, 1.0);
  }

  void main(void) {
    if(runTransition == 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }

    if(useSampler == 1.0) { // sampler
      vec4 texelColors = texture2D(uSampler, vTextureCoord);
      vec3 color = calculateSampler(texelColors);
      vec4 color4 = vec4(getReflectedLightColor(color), texelColors.a);
      gl_FragColor = volumetricCalculation(vec4(color, texelColors.a)) * fogEffect(color4);
    } else { // diffuse
      vec3 color = calculateDiffuse();
      vec4 color4 = vec4((getReflectedLightColor(color)), 1.0);
      gl_FragColor = volumetricCalculation(vec4(color,1.0)) * fogEffect(color4);
    }
  }
`;
}
