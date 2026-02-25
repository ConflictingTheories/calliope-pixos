/*                                                 *\
 ** ----------------------------------------------- **
 **          Calliope - Pixos Game Engine           **
 ** ----------------------------------------------- **
 **  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
 **                                                 **
 **    Any unauthorized distribution or transfer    **
 **       of this work is strictly prohibited.      **
 **                                                 **
 **               All Rights Reserved.              **
 ** ----------------------------------------------- **
 *                                                 */

/**
 * Effect Shader Library - Post-processing visual effects
 *
 * Each effect exports a vertex shader (vs) and fragment shader (fs)
 * for use with the post-processing pipeline.
 */

// Common vertex shader for all post-processing effects
export const commonVS = `
  attribute vec2 aPosition;
  varying vec2 vUV;
  void main() {
      vUV = (aPosition + 1.0) * 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

/**
 * CRT Monitor Effect
 * Simulates a retro CRT monitor with curvature, scanlines, and color bleeding
 */
export const crt = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uCurvature;    // 0-1, barrel distortion amount
    uniform float uScanlines;    // 0-1, scanline intensity
    uniform float uVignette;     // 0-1, vignette intensity
    
    vec2 curveUV(vec2 uv) {
        uv = uv * 2.0 - 1.0;
        vec2 offset = abs(uv.yx) / vec2(6.0, 4.0);
        uv = uv + uv * offset * offset * uCurvature;
        uv = uv * 0.5 + 0.5;
        return uv;
    }
    
    void main() {
        vec2 uv = curveUV(vUV);
        
        // Check if outside screen bounds (black out)
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
        }
        
        // Sample with slight RGB offset for color bleeding
        float offset = 0.001;
        float r = texture2D(uTexture, uv + vec2(offset, 0.0)).r;
        float g = texture2D(uTexture, uv).g;
        float b = texture2D(uTexture, uv - vec2(offset, 0.0)).b;
        vec3 color = vec3(r, g, b);
        
        // Scanlines
        float scanline = sin(uv.y * uResolution.y * 2.0) * 0.5 + 0.5;
        color *= 1.0 - uScanlines * (1.0 - scanline) * 0.3;
        
        // Vignette
        float dist = length(vUV - 0.5);
        color *= 1.0 - uVignette * dist * dist * 2.0;
        
        // Slight flicker
        color *= 0.98 + 0.02 * sin(uTime * 60.0);
        
        gl_FragColor = vec4(color, 1.0);
    }
  `,
};

/**
 * Bloom/Glow Effect
 * Adds a glow to bright areas of the image
 */
export const bloom = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform float uThreshold;  // Brightness threshold for bloom
    uniform float uIntensity;  // Bloom intensity
    uniform float uRadius;     // Blur radius
    
    void main() {
        vec4 color = texture2D(uTexture, vUV);
        vec3 bloom = vec3(0.0);
        
        // Simple box blur for bloom
        float total = 0.0;
        int samples = 8;
        
        for (int x = -4; x <= 4; x++) {
            for (int y = -4; y <= 4; y++) {
                vec2 offset = vec2(float(x), float(y)) * uRadius / uResolution;
                vec4 sample = texture2D(uTexture, vUV + offset);
                
                // Extract bright parts
                float brightness = dot(sample.rgb, vec3(0.2126, 0.7152, 0.0722));
                if (brightness > uThreshold) {
                    bloom += sample.rgb * (brightness - uThreshold);
                    total += 1.0;
                }
            }
        }
        
        if (total > 0.0) {
            bloom /= total;
        }
        
        gl_FragColor = vec4(color.rgb + bloom * uIntensity, color.a);
    }
  `,
};

/**
 * Scanlines Effect
 * Adds horizontal scanlines overlay
 */
export const scanlines = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform float uIntensity;  // 0-1
    uniform float uCount;      // Number of scanlines
    uniform float uSpeed;      // Scroll speed
    uniform float uTime;
    
    void main() {
        vec4 color = texture2D(uTexture, vUV);
        
        // Moving scanlines
        float y = vUV.y + uTime * uSpeed;
        float scanline = sin(y * uCount * 3.14159) * 0.5 + 0.5;
        
        // Apply scanline darkening
        color.rgb *= 1.0 - uIntensity * (1.0 - scanline);
        
        gl_FragColor = color;
    }
  `,
};

/**
 * Chromatic Aberration Effect
 * Color channel separation for a distorted look
 */
export const chromaticAberration = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform float uAmount;     // Separation amount
    uniform vec2 uDirection;   // Direction of separation
    
    void main() {
        vec2 dir = normalize(vUV - 0.5);
        float dist = length(vUV - 0.5);
        
        // Stronger effect towards edges
        float offset = uAmount * dist * dist;
        
        float r = texture2D(uTexture, vUV + dir * offset).r;
        float g = texture2D(uTexture, vUV).g;
        float b = texture2D(uTexture, vUV - dir * offset).b;
        
        gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

/**
 * Posterize Effect
 * Reduces color palette for a stylized look
 */
export const posterize = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform float uLevels;  // Number of color levels (2-16)
    
    void main() {
        vec4 color = texture2D(uTexture, vUV);
        
        // Quantize each channel
        float levels = max(2.0, uLevels);
        color.rgb = floor(color.rgb * levels) / (levels - 1.0);
        
        gl_FragColor = color;
    }
  `,
};

/**
 * Grayscale Effect
 * Converts image to black and white
 */
export const grayscale = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform float uIntensity;  // 0-1, blend with original
    
    void main() {
        vec4 color = texture2D(uTexture, vUV);
        
        // Luminance-weighted grayscale
        float gray = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 grayColor = vec3(gray);
        
        // Blend with original
        color.rgb = mix(color.rgb, grayColor, uIntensity);
        
        gl_FragColor = color;
    }
  `,
};

/**
 * Sepia Effect
 * Vintage brown-tinted effect
 */
export const sepia = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform float uIntensity;  // 0-1
    
    void main() {
        vec4 color = texture2D(uTexture, vUV);
        
        // Sepia matrix
        vec3 sepia;
        sepia.r = dot(color.rgb, vec3(0.393, 0.769, 0.189));
        sepia.g = dot(color.rgb, vec3(0.349, 0.686, 0.168));
        sepia.b = dot(color.rgb, vec3(0.272, 0.534, 0.131));
        
        color.rgb = mix(color.rgb, sepia, uIntensity);
        
        gl_FragColor = color;
    }
  `,
};

/**
 * Thermal/Heat Vision Effect
 * False color heat map effect
 */
export const thermal = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform float uIntensity;  // 0-1
    
    vec3 heatmap(float t) {
        // Cold (blue) -> warm (red) -> hot (white)
        vec3 cold = vec3(0.0, 0.0, 1.0);
        vec3 warm = vec3(1.0, 1.0, 0.0);
        vec3 hot = vec3(1.0, 0.0, 0.0);
        vec3 white = vec3(1.0, 1.0, 1.0);
        
        if (t < 0.33) {
            return mix(cold, warm, t * 3.0);
        } else if (t < 0.66) {
            return mix(warm, hot, (t - 0.33) * 3.0);
        } else {
            return mix(hot, white, (t - 0.66) * 3.0);
        }
    }
    
    void main() {
        vec4 color = texture2D(uTexture, vUV);
        
        // Calculate brightness as "heat"
        float heat = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 thermal = heatmap(heat);
        
        color.rgb = mix(color.rgb, thermal, uIntensity);
        
        gl_FragColor = color;
    }
  `,
};

/**
 * Displacement/Wave Effect
 * Water ripple or wave distortion
 */
export const displacement = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uAmplitude;    // Wave height
    uniform float uFrequency;    // Wave frequency
    uniform float uSpeed;        // Wave speed
    uniform int uWaveType;       // 0=horizontal, 1=vertical, 2=radial
    
    void main() {
        vec2 uv = vUV;
        
        float wave;
        if (uWaveType == 0) {
            // Horizontal waves
            wave = sin(uv.y * uFrequency + uTime * uSpeed) * uAmplitude;
            uv.x += wave;
        } else if (uWaveType == 1) {
            // Vertical waves
            wave = sin(uv.x * uFrequency + uTime * uSpeed) * uAmplitude;
            uv.y += wave;
        } else {
            // Radial waves
            float dist = length(uv - 0.5);
            wave = sin(dist * uFrequency - uTime * uSpeed) * uAmplitude;
            uv += normalize(uv - 0.5) * wave * 0.1;
        }
        
        gl_FragColor = texture2D(uTexture, uv);
    }
  `,
};

/**
 * Vignette Effect
 * Darkens edges of screen
 */
export const vignette = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform float uIntensity;  // 0-1
    uniform float uSoftness;   // Edge softness
    
    void main() {
        vec4 color = texture2D(uTexture, vUV);
        
        float dist = length(vUV - 0.5);
        float vignette = smoothstep(0.5, 0.5 - uSoftness, dist);
        
        color.rgb *= mix(1.0, vignette, uIntensity);
        
        gl_FragColor = color;
    }
  `,
};

/**
 * Pixelate Effect
 * Reduces resolution for retro look
 */
export const pixelate = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform float uPixelSize;  // Size of pixels
    
    void main() {
        vec2 pixelatedUV = floor(vUV * uResolution / uPixelSize) * uPixelSize / uResolution;
        gl_FragColor = texture2D(uTexture, pixelatedUV);
    }
  `,
};

/**
 * Film Grain Effect
 * Adds noise for a filmic look
 */
export const filmGrain = {
  vs: commonVS,
  fs: `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uIntensity;  // 0-1
    
    float random(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
        vec4 color = texture2D(uTexture, vUV);
        
        // Generate noise
        float noise = random(vUV + fract(uTime));
        noise = noise * 2.0 - 1.0;
        
        // Apply grain
        color.rgb += noise * uIntensity * 0.1;
        
        gl_FragColor = color;
    }
  `,
};

/**
 * Get all available effects
 */
export const effects = {
  crt,
  bloom,
  scanlines,
  chromaticAberration,
  posterize,
  grayscale,
  sepia,
  thermal,
  displacement,
  vignette,
  pixelate,
  filmGrain,
};

export default effects;
