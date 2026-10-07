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
export default function vs() {
  return `
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;
    
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
  
    varying vec4 vWorldVertex;
    varying vec4 vPosition;
    varying vec2 vTextureCoord;

    uniform vec3 u_scale;
    
    void main() {
        // Multiply the position by the matrix.
        vec3 scaledPosition = aVertexPosition * u_scale;
        vTextureCoord = aTextureCoord;
        
        vWorldVertex = uModelMatrix * vec4(aVertexPosition, 1.0);
        vPosition = uModelMatrix * vec4(scaledPosition, 1.0);

        gl_Position = uProjectionMatrix * uViewMatrix * vPosition;
    }
  `;
}
