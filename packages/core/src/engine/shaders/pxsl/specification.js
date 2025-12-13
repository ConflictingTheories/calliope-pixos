/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    PXSL - PixoSpritz Shader Language
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A user-friendly domain-specific language for WebGL shaders.
 * PXSL transpiles to standard GLSL while providing:
 *   - Simplified syntax
 *   - Built-in common operations
 *   - Automatic uniform/varying management
 *   - Human-readable effect names
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *                            LANGUAGE SPECIFICATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * FILE EXTENSION: .pxsl
 *
 * ───────────────────────────────────────────────────────────────────────────
 * SHADER DECLARATION
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   @vertex                          // Marks start of vertex shader
 *   @fragment                        // Marks start of fragment shader
 *   @shader "name"                   // Combined shader with name
 *
 * ───────────────────────────────────────────────────────────────────────────
 * VARIABLE DECLARATIONS
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   input position: vec3             // Vertex attribute (in vertex shader)
 *   input normal: vec3               // Automatically creates aVertexNormal
 *   input uv: vec2                   // Texture coordinates
 *
 *   uniform modelMatrix: mat4        // Uniform from JavaScript
 *   uniform time: float              // Animation time
 *   uniform color: vec3              // Material color
 *
 *   output fragColor: vec4           // Fragment output
 *   output worldPos: vec3            // Passed to fragment shader (varying)
 *
 *   const PI = 3.14159               // Constants
 *   let temp: vec3                   // Local variable
 *
 * ───────────────────────────────────────────────────────────────────────────
 * BUILT-IN FUNCTIONS (Simplified Names)
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   // Lighting
 *   diffuse(normal, lightDir)                    -> dot(normal, lightDir)
 *   specular(normal, lightDir, viewDir, power)   -> Blinn-Phong specular
 *   fresnel(normal, viewDir, power)              -> Fresnel effect
 *   
 *   // Color Operations
 *   brighten(color, amount)                      -> color * (1 + amount)
 *   darken(color, amount)                        -> color * (1 - amount)
 *   saturate(color, amount)                      -> Adjust saturation
 *   contrast(color, amount)                      -> Adjust contrast
 *   tint(color, tintColor, amount)               -> Mix with tint
 *
 *   // Effects
 *   fog(color, depth, fogColor, density)         -> Apply fog
 *   glow(color, intensity)                       -> Add bloom/glow
 *   outline(uv, texture, color, width)           -> Edge detection
 *   pixelate(uv, resolution)                     -> Pixelation effect
 *
 *   // Math Helpers
 *   remap(value, inMin, inMax, outMin, outMax)   -> Remap range
 *   smoothstep(edge0, edge1, x)                  -> Smooth interpolation
 *   pulse(value, frequency)                      -> sin-based pulse
 *   noise(uv)                                    -> Simple noise
 *   fbm(uv, octaves)                             -> Fractal Brownian Motion
 *
 *   // Transforms
 *   rotateUV(uv, angle, center)                  -> Rotate UVs
 *   scaleUV(uv, scale, center)                   -> Scale UVs
 *   waveUV(uv, amplitude, frequency, time)       -> Wave distortion
 *
 * ───────────────────────────────────────────────────────────────────────────
 * EFFECTS (Automatic Shader Generation)
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   @effect "water" {
 *     wave: { amplitude: 0.1, frequency: 2.0 }
 *     reflection: 0.5
 *     transparency: 0.3
 *   }
 *
 *   @effect "fire" {
 *     distortion: 0.2
 *     colorGradient: [orange, red, yellow]
 *     speed: 1.5
 *   }
 *
 * ───────────────────────────────────────────────────────────────────────────
 * EXAMPLE SHADER
 * ───────────────────────────────────────────────────────────────────────────
 *
 *   @shader "glow_effect"
 *
 *   @vertex
 *   input position: vec3
 *   input uv: vec2
 *   uniform modelMatrix: mat4
 *   uniform viewMatrix: mat4
 *   uniform projectionMatrix: mat4
 *   output vUV: vec2
 *
 *   main {
 *     vUV = uv
 *     gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)
 *   }
 *
 *   @fragment
 *   input vUV: vec2
 *   uniform texture: sampler2D
 *   uniform time: float
 *   uniform glowColor: vec3
 *   uniform glowIntensity: float
 *   output fragColor: vec4
 *
 *   main {
 *     let baseColor = sample(texture, vUV)
 *     let glow = pulse(time, 2.0) * glowIntensity
 *     fragColor = baseColor + vec4(glowColor * glow, 0.0)
 *   }
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Built-in GLSL snippets that get injected based on usage
export const PXSL_BUILTINS = {
  // ─────────────────────────────────────────────────────────────────────────
  // Lighting Functions
  // ─────────────────────────────────────────────────────────────────────────
  diffuse: `
float pxsl_diffuse(vec3 normal, vec3 lightDir) {
  return max(dot(normalize(normal), normalize(lightDir)), 0.0);
}`,

  specular: `
float pxsl_specular(vec3 normal, vec3 lightDir, vec3 viewDir, float power) {
  vec3 n = normalize(normal);
  vec3 l = normalize(lightDir);
  vec3 v = normalize(viewDir);
  vec3 h = normalize(l + v);
  return pow(max(dot(n, h), 0.0), power);
}`,

  fresnel: `
float pxsl_fresnel(vec3 normal, vec3 viewDir, float power) {
  return pow(1.0 - max(dot(normalize(normal), normalize(viewDir)), 0.0), power);
}`,

  // ─────────────────────────────────────────────────────────────────────────
  // Color Functions
  // ─────────────────────────────────────────────────────────────────────────
  brighten: `
vec3 pxsl_brighten(vec3 color, float amount) {
  return color * (1.0 + amount);
}
vec4 pxsl_brighten(vec4 color, float amount) {
  return vec4(color.rgb * (1.0 + amount), color.a);
}`,

  darken: `
vec3 pxsl_darken(vec3 color, float amount) {
  return color * (1.0 - clamp(amount, 0.0, 1.0));
}
vec4 pxsl_darken(vec4 color, float amount) {
  return vec4(color.rgb * (1.0 - clamp(amount, 0.0, 1.0)), color.a);
}`,

  saturate: `
vec3 pxsl_saturate(vec3 color, float amount) {
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  return mix(vec3(gray), color, amount);
}`,

  contrast: `
vec3 pxsl_contrast(vec3 color, float amount) {
  return (color - 0.5) * amount + 0.5;
}`,

  tint: `
vec3 pxsl_tint(vec3 color, vec3 tintColor, float amount) {
  return mix(color, color * tintColor, amount);
}`,

  // ─────────────────────────────────────────────────────────────────────────
  // Effect Functions
  // ─────────────────────────────────────────────────────────────────────────
  fog: `
vec3 pxsl_fog(vec3 color, float depth, vec3 fogColor, float density) {
  float fogFactor = 1.0 - exp(-density * depth);
  return mix(color, fogColor, clamp(fogFactor, 0.0, 1.0));
}
vec4 pxsl_fog(vec4 color, float depth, vec3 fogColor, float density) {
  float fogFactor = 1.0 - exp(-density * depth);
  return vec4(mix(color.rgb, fogColor, clamp(fogFactor, 0.0, 1.0)), color.a);
}`,

  glow: `
vec3 pxsl_glow(vec3 color, float intensity) {
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  return color + color * luminance * intensity;
}
vec4 pxsl_glow(vec4 color, float intensity) {
  float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  return vec4(color.rgb + color.rgb * luminance * intensity, color.a);
}`,

  outline: `
vec4 pxsl_outline(vec2 uv, sampler2D tex, vec3 outlineColor, float width) {
  vec2 texelSize = vec2(1.0 / 512.0); // Adjust based on texture size
  vec4 center = texture2D(tex, uv);
  float edge = 0.0;
  edge += texture2D(tex, uv + vec2(-width, 0.0) * texelSize).a;
  edge += texture2D(tex, uv + vec2(width, 0.0) * texelSize).a;
  edge += texture2D(tex, uv + vec2(0.0, -width) * texelSize).a;
  edge += texture2D(tex, uv + vec2(0.0, width) * texelSize).a;
  edge = clamp(edge - center.a * 4.0, 0.0, 1.0);
  return mix(center, vec4(outlineColor, 1.0), edge * (1.0 - center.a));
}`,

  pixelate: `
vec2 pxsl_pixelate(vec2 uv, float resolution) {
  return floor(uv * resolution) / resolution;
}`,

  // ─────────────────────────────────────────────────────────────────────────
  // Math Helpers
  // ─────────────────────────────────────────────────────────────────────────
  remap: `
float pxsl_remap(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}`,

  pulse: `
float pxsl_pulse(float value, float frequency) {
  return (sin(value * frequency * 6.28318) + 1.0) * 0.5;
}`,

  noise: `
float pxsl_noise(vec2 uv) {
  return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
}`,

  fbm: `
float pxsl_fbm(vec2 uv, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for(int i = 0; i < 8; i++) {
    if(i >= octaves) break;
    value += amplitude * pxsl_noise(uv * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}`,

  // ─────────────────────────────────────────────────────────────────────────
  // UV Transform Functions
  // ─────────────────────────────────────────────────────────────────────────
  rotateUV: `
vec2 pxsl_rotateUV(vec2 uv, float angle, vec2 center) {
  float s = sin(angle);
  float c = cos(angle);
  uv -= center;
  return vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c) + center;
}`,

  scaleUV: `
vec2 pxsl_scaleUV(vec2 uv, vec2 scale, vec2 center) {
  return (uv - center) * scale + center;
}`,

  waveUV: `
vec2 pxsl_waveUV(vec2 uv, float amplitude, float frequency, float time) {
  return uv + vec2(
    sin(uv.y * frequency + time) * amplitude,
    sin(uv.x * frequency + time) * amplitude
  );
}`,

  // ─────────────────────────────────────────────────────────────────────────
  // Utility Functions
  // ─────────────────────────────────────────────────────────────────────────
  linearizeDepth: `
float pxsl_linearizeDepth(float depth, float near, float far) {
  float z = depth * 2.0 - 1.0;
  return (2.0 * near * far) / (far + near - z * (far - near));
}`,

  sample: `
#define pxsl_sample(tex, uv) texture2D(tex, uv)`,
};

// Standard precision and version headers
export const PXSL_HEADERS = {
  vertex: `precision mediump float;
precision mediump int;
`,
  fragment: `precision mediump float;
precision mediump int;
`,
};

// Type mappings for cleaner syntax
export const PXSL_TYPE_ALIASES = {
  float: 'float',
  int: 'int',
  bool: 'bool',
  vec2: 'vec2',
  vec3: 'vec3',
  vec4: 'vec4',
  mat2: 'mat2',
  mat3: 'mat3',
  mat4: 'mat4',
  sampler: 'sampler2D',
  samplerCube: 'samplerCube',
  // User-friendly aliases
  color: 'vec4',
  color3: 'vec3',
  point: 'vec3',
  point2: 'vec2',
  direction: 'vec3',
  normal: 'vec3',
  matrix: 'mat4',
  texture: 'sampler2D',
  cubemap: 'samplerCube',
};

// Standard input name mappings (what user writes -> what GLSL expects)
export const PXSL_INPUT_MAPPINGS = {
  position: 'aVertexPosition',
  normal: 'aVertexNormal',
  uv: 'aTextureCoord',
  texcoord: 'aTextureCoord',
  color: 'aVertexColor',
  tangent: 'aVertexTangent',
};

// Standard uniform name mappings
export const PXSL_UNIFORM_MAPPINGS = {
  modelMatrix: 'uModelMatrix',
  viewMatrix: 'uViewMatrix',
  projectionMatrix: 'uProjectionMatrix',
  normalMatrix: 'uNormalMatrix',
  cameraPosition: 'uCameraPosition',
  time: 'uTime',
  resolution: 'uResolution',
  // Lights are auto-handled
};

export default {
  PXSL_BUILTINS,
  PXSL_HEADERS,
  PXSL_TYPE_ALIASES,
  PXSL_INPUT_MAPPINGS,
  PXSL_UNIFORM_MAPPINGS,
};
