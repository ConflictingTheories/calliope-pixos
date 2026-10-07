/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
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
