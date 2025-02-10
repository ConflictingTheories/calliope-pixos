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
/** referenced from https://webgl2fundamentals.org/webgl/lessons/webgl-picking.html */
export default function fs() {
  return `
    precision highp float;
    
    uniform vec4 u_id;
    uniform float useSampler;
    uniform sampler2D uSampler;

    varying vec2 vTextureCoord;

    void main() {
        if(useSampler == 1.0) { // sampler
            vec4 texelColors = texture2D(uSampler, vTextureCoord);
            gl_FragColor= vec4(vec3(u_id),texelColors.a);
        } else {
            gl_FragColor = vec4(vec3(u_id),1.0);
        }
    }
  `;
}
