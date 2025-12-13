"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.PXSL_UNIFORM_MAPPINGS = exports.PXSL_TYPE_ALIASES = exports.PXSL_INPUT_MAPPINGS = exports.PXSL_HEADERS = exports.PXSL_BUILTINS = void 0;
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
var PXSL_BUILTINS = exports.PXSL_BUILTINS = {
  // ─────────────────────────────────────────────────────────────────────────
  // Lighting Functions
  // ─────────────────────────────────────────────────────────────────────────
  diffuse: "\nfloat pxsl_diffuse(vec3 normal, vec3 lightDir) {\n  return max(dot(normalize(normal), normalize(lightDir)), 0.0);\n}",
  specular: "\nfloat pxsl_specular(vec3 normal, vec3 lightDir, vec3 viewDir, float power) {\n  vec3 n = normalize(normal);\n  vec3 l = normalize(lightDir);\n  vec3 v = normalize(viewDir);\n  vec3 h = normalize(l + v);\n  return pow(max(dot(n, h), 0.0), power);\n}",
  fresnel: "\nfloat pxsl_fresnel(vec3 normal, vec3 viewDir, float power) {\n  return pow(1.0 - max(dot(normalize(normal), normalize(viewDir)), 0.0), power);\n}",
  // ─────────────────────────────────────────────────────────────────────────
  // Color Functions
  // ─────────────────────────────────────────────────────────────────────────
  brighten: "\nvec3 pxsl_brighten(vec3 color, float amount) {\n  return color * (1.0 + amount);\n}\nvec4 pxsl_brighten(vec4 color, float amount) {\n  return vec4(color.rgb * (1.0 + amount), color.a);\n}",
  darken: "\nvec3 pxsl_darken(vec3 color, float amount) {\n  return color * (1.0 - clamp(amount, 0.0, 1.0));\n}\nvec4 pxsl_darken(vec4 color, float amount) {\n  return vec4(color.rgb * (1.0 - clamp(amount, 0.0, 1.0)), color.a);\n}",
  saturate: "\nvec3 pxsl_saturate(vec3 color, float amount) {\n  float gray = dot(color, vec3(0.299, 0.587, 0.114));\n  return mix(vec3(gray), color, amount);\n}",
  contrast: "\nvec3 pxsl_contrast(vec3 color, float amount) {\n  return (color - 0.5) * amount + 0.5;\n}",
  tint: "\nvec3 pxsl_tint(vec3 color, vec3 tintColor, float amount) {\n  return mix(color, color * tintColor, amount);\n}",
  // ─────────────────────────────────────────────────────────────────────────
  // Effect Functions
  // ─────────────────────────────────────────────────────────────────────────
  fog: "\nvec3 pxsl_fog(vec3 color, float depth, vec3 fogColor, float density) {\n  float fogFactor = 1.0 - exp(-density * depth);\n  return mix(color, fogColor, clamp(fogFactor, 0.0, 1.0));\n}\nvec4 pxsl_fog(vec4 color, float depth, vec3 fogColor, float density) {\n  float fogFactor = 1.0 - exp(-density * depth);\n  return vec4(mix(color.rgb, fogColor, clamp(fogFactor, 0.0, 1.0)), color.a);\n}",
  glow: "\nvec3 pxsl_glow(vec3 color, float intensity) {\n  float luminance = dot(color, vec3(0.299, 0.587, 0.114));\n  return color + color * luminance * intensity;\n}\nvec4 pxsl_glow(vec4 color, float intensity) {\n  float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));\n  return vec4(color.rgb + color.rgb * luminance * intensity, color.a);\n}",
  outline: "\nvec4 pxsl_outline(vec2 uv, sampler2D tex, vec3 outlineColor, float width) {\n  vec2 texelSize = vec2(1.0 / 512.0); // Adjust based on texture size\n  vec4 center = texture2D(tex, uv);\n  float edge = 0.0;\n  edge += texture2D(tex, uv + vec2(-width, 0.0) * texelSize).a;\n  edge += texture2D(tex, uv + vec2(width, 0.0) * texelSize).a;\n  edge += texture2D(tex, uv + vec2(0.0, -width) * texelSize).a;\n  edge += texture2D(tex, uv + vec2(0.0, width) * texelSize).a;\n  edge = clamp(edge - center.a * 4.0, 0.0, 1.0);\n  return mix(center, vec4(outlineColor, 1.0), edge * (1.0 - center.a));\n}",
  pixelate: "\nvec2 pxsl_pixelate(vec2 uv, float resolution) {\n  return floor(uv * resolution) / resolution;\n}",
  // ─────────────────────────────────────────────────────────────────────────
  // Math Helpers
  // ─────────────────────────────────────────────────────────────────────────
  remap: "\nfloat pxsl_remap(float value, float inMin, float inMax, float outMin, float outMax) {\n  return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);\n}",
  pulse: "\nfloat pxsl_pulse(float value, float frequency) {\n  return (sin(value * frequency * 6.28318) + 1.0) * 0.5;\n}",
  noise: "\nfloat pxsl_noise(vec2 uv) {\n  return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);\n}",
  fbm: "\nfloat pxsl_fbm(vec2 uv, int octaves) {\n  float value = 0.0;\n  float amplitude = 0.5;\n  float frequency = 1.0;\n  for(int i = 0; i < 8; i++) {\n    if(i >= octaves) break;\n    value += amplitude * pxsl_noise(uv * frequency);\n    amplitude *= 0.5;\n    frequency *= 2.0;\n  }\n  return value;\n}",
  // ─────────────────────────────────────────────────────────────────────────
  // UV Transform Functions
  // ─────────────────────────────────────────────────────────────────────────
  rotateUV: "\nvec2 pxsl_rotateUV(vec2 uv, float angle, vec2 center) {\n  float s = sin(angle);\n  float c = cos(angle);\n  uv -= center;\n  return vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c) + center;\n}",
  scaleUV: "\nvec2 pxsl_scaleUV(vec2 uv, vec2 scale, vec2 center) {\n  return (uv - center) * scale + center;\n}",
  waveUV: "\nvec2 pxsl_waveUV(vec2 uv, float amplitude, float frequency, float time) {\n  return uv + vec2(\n    sin(uv.y * frequency + time) * amplitude,\n    sin(uv.x * frequency + time) * amplitude\n  );\n}",
  // ─────────────────────────────────────────────────────────────────────────
  // Utility Functions
  // ─────────────────────────────────────────────────────────────────────────
  linearizeDepth: "\nfloat pxsl_linearizeDepth(float depth, float near, float far) {\n  float z = depth * 2.0 - 1.0;\n  return (2.0 * near * far) / (far + near - z * (far - near));\n}",
  sample: "\n#define pxsl_sample(tex, uv) texture2D(tex, uv)"
};

// Standard precision and version headers
var PXSL_HEADERS = exports.PXSL_HEADERS = {
  vertex: "precision mediump float;\nprecision mediump int;\n",
  fragment: "precision mediump float;\nprecision mediump int;\n"
};

// Type mappings for cleaner syntax
var PXSL_TYPE_ALIASES = exports.PXSL_TYPE_ALIASES = {
  "float": 'float',
  "int": 'int',
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
  cubemap: 'samplerCube'
};

// Standard input name mappings (what user writes -> what GLSL expects)
var PXSL_INPUT_MAPPINGS = exports.PXSL_INPUT_MAPPINGS = {
  position: 'aVertexPosition',
  normal: 'aVertexNormal',
  uv: 'aTextureCoord',
  texcoord: 'aTextureCoord',
  color: 'aVertexColor',
  tangent: 'aVertexTangent'
};

// Standard uniform name mappings
var PXSL_UNIFORM_MAPPINGS = exports.PXSL_UNIFORM_MAPPINGS = {
  modelMatrix: 'uModelMatrix',
  viewMatrix: 'uViewMatrix',
  projectionMatrix: 'uProjectionMatrix',
  normalMatrix: 'uNormalMatrix',
  cameraPosition: 'uCameraPosition',
  time: 'uTime',
  resolution: 'uResolution'
  // Lights are auto-handled
};
var _default = exports["default"] = {
  PXSL_BUILTINS: PXSL_BUILTINS,
  PXSL_HEADERS: PXSL_HEADERS,
  PXSL_TYPE_ALIASES: PXSL_TYPE_ALIASES,
  PXSL_INPUT_MAPPINGS: PXSL_INPUT_MAPPINGS,
  PXSL_UNIFORM_MAPPINGS: PXSL_UNIFORM_MAPPINGS
};