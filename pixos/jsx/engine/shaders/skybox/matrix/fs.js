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
    precision highp float;
    uniform mat4 uViewDirectionProjectionInverse;
    varying vec4 vPosition;
    uniform float uTime;
    uniform vec2 uResolution;

    const float PI = 3.141592653589793;

    // simple float hash from vec2
    float hash12(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // value noise (cheap)
    float noise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash12(i + vec2(0.0, 0.0));
        float b = hash12(i + vec2(1.0, 0.0));
        float c = hash12(i + vec2(0.0, 1.0));
        float d = hash12(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    // smooth pulse shape
    float pulse(float x, float wid) {
        return smoothstep(0.0, wid, x) * (1.0 - smoothstep(1.0 - wid, 1.0, x));
    }

    void main() {
        // Reconstruct view direction from interpolated clip-space position
        vec4 t = uViewDirectionProjectionInverse * vPosition;
        vec3 dir = normalize(t.xyz / t.w);

        // convert direction -> equirectangular-like UV so "columns" wrap horizontally
        float u = atan(dir.z, dir.x) / (2.0 * PI) + 0.5;
        float v = asin(clamp(dir.y, -1.0, 1.0)) / PI + 0.5;
        vec2 uv = vec2(u, v);

        // Column layout
        float colsBase = mix(120.0, 240.0, clamp(uResolution.x / 1600.0, 0.0, 1.0));
        float horizonBias = 1.0 - abs(v - 0.5) * 2.0;
        float cols = max(32.0, colsBase * (0.6 + 0.8 * horizonBias));

        float colIndexF = floor(uv.x * cols);
        float colX = (colIndexF + 0.5) / cols;

        // per-column seed & speed variety
        float seed = hash12(vec2(colIndexF, floor(uTime * 10.0)));
        float speed = 0.8 + hash12(vec2(colIndexF, 9.0)) * 2.2;

        // vertical tiling for character cells
        float charSize = mix(0.018, 0.035, clamp(uResolution.y/900.0, 0.0, 1.0));
        float rows = 1.0 / charSize;

        float yScaled = uv.y * rows;
        float yCell = floor(yScaled);
        float yFrac = fract(yScaled);

        // falling offset based on time and column seed
        float fall = fract((uTime * speed * 0.25) + seed * 10.0);

        float dropPos = fract(seed * 7.3 + uTime * 0.25 * speed);
        float drop2 = fract(seed * 3.1 + uTime * 0.57 * speed * 0.7);

        float d1 = abs(yCell / rows - dropPos);
        float d2 = abs(yCell / rows - drop2);

        float head = exp(-pow((yFrac + fract(yCell*0.9183) * 0.35), 2.0) * 40.0);
        float tail = exp(-d1 * 8.0) + 0.5 * exp(-d2 * 12.0);

        float glyphSeed = hash12(vec2(colIndexF, yCell));
        float glyphPulse = pulse(fract(yScaled - (seed*3.0 + uTime*0.9*speed)), 0.12);
        float glyph = smoothstep(0.35, 0.55, glyphSeed + 0.2 * noise2(vec2(colIndexF * 0.13, yCell * 0.07 + uTime * 0.1)));

        float brightness = clamp( 1.6 * head + 0.9 * tail * glyph + 0.35 * glyph * glyphPulse, 0.0, 1.6);

        float colWidth = 1.0 / cols * 0.9;
        float colMask = smoothstep(0.0, 1.0, 1.0 - abs(uv.x - colX) / (colWidth * 0.6));

        float jitter = noise2(vec2(colIndexF * 0.7, yCell * 0.9 + uTime * 0.2)) * 0.5;
        float charV = smoothstep(0.0, 1.0, 1.0 - abs(yFrac - (0.5 + jitter*0.2)) * 2.0);

        float intensity = brightness * colMask * charV;

        vec3 baseGreen = vec3(0.1, 0.95, 0.15);
        vec3 headColor = mix(baseGreen * 0.6, vec3(1.0, 1.0, 0.9), clamp(head * 2.0, 0.0, 1.0));
        vec3 tailColor = baseGreen * (0.6 + 0.8 * glyph);

        float headFactor = clamp(head * 2.0, 0.0, 1.0);
        vec3 col = mix(tailColor, headColor, headFactor) * intensity;

        float bgNoise = 0.04 * (noise2(uv * 400.0 + uTime * 0.03));
        float verticalVignette = pow(1.0 - abs(v - 0.5) * 1.6, 1.8);
        vec3 bg = vec3(0.01, 0.03, 0.01) * verticalVignette + bgNoise;

        float stars = smoothstep(0.9996, 1.0, noise2(uv * 2000.0 + uTime * 0.1));
        vec3 starCol = vec3(0.6, 1.0, 0.6) * stars * 1.2;

        vec3 final = col + bg + starCol;

        float glow = pow(intensity, 1.6) * 0.9;
        final += vec3(glow * 0.14, glow * 0.22, glow * 0.06);

        final = 1.0 - exp(-final * 1.6);
        final = pow(final, vec3(0.9));

        gl_FragColor = vec4(final, 1.0);
    }
`;
}
