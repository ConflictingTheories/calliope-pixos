/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

export default function () {
  return `
    precision mediump float;

    varying vec2 vTextureCoord;
    varying vec3 vColor;
    varying float vAlpha;

    void main(void) {
      // Calculate distance from center for soft circular particles
      vec2 center = vTextureCoord - vec2(0.5);
      float dist = length(center) * 2.0;
      
      // Soft falloff from center - creates a glowing effect
      float softEdge = 1.0 - smoothstep(0.0, 1.0, dist);
      
      // Apply color with soft edge and alpha fade
      float alpha = softEdge * vAlpha;
      
      // Discard fully transparent pixels for performance
      if (alpha < 0.01) discard;
      
      // Output with glow effect - slightly brighter in center
      vec3 glowColor = vColor * (1.0 + (1.0 - dist) * 0.5);
      gl_FragColor = vec4(glowColor, alpha);
    }
  `;
}
