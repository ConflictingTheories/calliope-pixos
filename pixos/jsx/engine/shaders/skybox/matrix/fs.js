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
export default function fs() {
    return `
    precision mediump float;
    uniform samplerCube uSkybox;
    uniform mat4 uViewDirectionProjectionInverse;
    varying vec4 vPosition;
    uniform float uTime;

    // Function to generate a simple matrix code pattern using noise functions
    float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453 + uTime);
    }

    void main() {
        // Transform the view direction to projection space for texture lookup
        vec4 t = uViewDirectionProjectionInverse * vPosition;
        vec3 dir = normalize(t.xyz / t.w);
        
        // Generate a noise pattern based on the fragment's position in world space
        float noise = rand(vPosition.xz * 10.0) * 0.5 + 0.5;  // Scale and offset to get values between 0 and 1
        
        // Map the noise value to a color: white for high noise, black for low noise
        vec3 skyColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), noise);
        
        // Apply the calculated color to the fragment
        gl_FragColor = vec4(skyColor, 1.0);
    }
`;
}
