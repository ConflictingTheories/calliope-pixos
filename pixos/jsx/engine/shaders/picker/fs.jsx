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
    return `#version 300 es
    
    precision highp float;
    
    uniform vec4 u_id;

    out vec4 outColor;
    
    void main() {
        outColor = u_id;
    }
  `;
  }
  