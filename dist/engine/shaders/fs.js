"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = fs;

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
function fs() {
  return "\n  precision mediump float;\n\n  varying vec2 vTextureCoord;\n  varying vec3 vTransformedNormal;\n  varying vec4 vPosition;\n\n  varying highp vec3 vLighting;\n\n  uniform float useSampler;\n  uniform float useDiffuse;\n  uniform sampler2D uSampler;\n  uniform sampler2D uDiffuseMap;\n\n  uniform vec3 uDiffuse;\n  uniform vec3 uSpecular;\n  uniform float uSpecularExponent;\n\n  void main(void) {\n\n    if(useSampler == 1.0){\n      if(vLighting != vec3(0.0,0.0,0.0)){\n        highp vec4 texelColors = texture2D(uSampler, vTextureCoord);\n        gl_FragColor = vec4(texelColors.rgb * vLighting, texelColors.a);\n      }else{\n        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);\n        gl_FragColor = vec4(texelColor.rgb, texelColor.a);\n      }\n    } else {\n      highp vec4 texelColors = texture2D(uDiffuseMap, vTextureCoord);\n      vec3 V = -normalize(vPosition.xyz);\n      vec3 L = normalize(vec3(1.0, 1.0, 1.0));\n      vec3 H = normalize(L + V);\n      vec3 N = normalize(vLighting);\n      vec3 color = uDiffuse * dot(N, L) + uSpecular * pow(dot(H, N), uSpecularExponent);\n      if(useDiffuse == 1.0){\n        if(texelColors != vec4(0.0,0.0,0.0,0.0)){\n          color = texelColors.rgb * color;\n        }\n      }\n\n      if(vLighting != vec3(0.0,0.0,0.0))\n        gl_FragColor = vec4(color * vLighting, 1.0);\n      else\n        gl_FragColor = vec4(color, 1.0);\n    }\n\n    if(gl_FragColor.a < 0.1)\n      discard;\n  }\n";
}