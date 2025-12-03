"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.SHADER_LIBRARY = void 0;
exports.getShader = getShader;
exports.listShaders = listShaders;
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *                    PXSL Built-in Shader Library
 * ═══════════════════════════════════════════════════════════════════════════
 * Copyright (c) 2020-2025 Kyle Derby MacInnis
 *
 * Pre-built PXSL shaders for common effects.
 * These can be used directly or as templates for custom shaders.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Built-in shader library
 */
var SHADER_LIBRARY = exports.SHADER_LIBRARY = {
  // ─────────────────────────────────────────────────────────────────────────
  // BASIC SHADERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Simple unlit shader - just applies texture with color tint
   */
  unlit: "\n@shader \"unlit\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\nuniform modelMatrix: mat4\nuniform viewMatrix: mat4\nuniform projectionMatrix: mat4\noutput vUV: vec2\n\nmain {\n  vUV = uv\n  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\nuniform texture: sampler2D\nuniform tintColor: vec4\noutput fragColor: vec4\n\nmain {\n  let tex = sample(texture, vUV)\n  fragColor = tex * tintColor\n}\n",
  /**
   * Basic lit shader with diffuse lighting
   */
  lit: "\n@shader \"lit\"\n\n@vertex\ninput position: vec3\ninput normal: vec3\ninput uv: vec2\nuniform modelMatrix: mat4\nuniform viewMatrix: mat4\nuniform projectionMatrix: mat4\nuniform normalMatrix: mat3\noutput vUV: vec2\noutput vNormal: vec3\noutput vWorldPos: vec3\n\nmain {\n  vUV = uv\n  vNormal = normalMatrix * normal\n  vWorldPos = vec3(modelMatrix * vec4(position, 1.0))\n  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\ninput vNormal: vec3\ninput vWorldPos: vec3\nuniform texture: sampler2D\nuniform lightDir: vec3\nuniform lightColor: vec3\nuniform ambientColor: vec3\noutput fragColor: vec4\n\nmain {\n  let tex = sample(texture, vUV)\n  let n = normalize(vNormal)\n  let diff = diffuse(n, lightDir)\n  let lighting = ambientColor + lightColor * diff\n  fragColor = vec4(tex.rgb * lighting, tex.a)\n}\n",
  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT SHADERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Glowing outline effect
   */
  glow: "\n@shader \"glow\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\nuniform modelMatrix: mat4\nuniform viewMatrix: mat4\nuniform projectionMatrix: mat4\noutput vUV: vec2\n\nmain {\n  vUV = uv\n  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\nuniform texture: sampler2D\nuniform time: float\nuniform glowColor: vec3\nuniform glowIntensity: float\noutput fragColor: vec4\n\nmain {\n  let tex = sample(texture, vUV)\n  let glow = pulse(time, 2.0) * glowIntensity\n  let glowAmount = glow(tex.rgb, glow * 0.5)\n  fragColor = vec4(glowAmount + glowColor * glow * tex.a, tex.a)\n}\n",
  /**
   * Water ripple effect
   */
  water: "\n@shader \"water\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\nuniform modelMatrix: mat4\nuniform viewMatrix: mat4\nuniform projectionMatrix: mat4\nuniform time: float\nuniform waveAmplitude: float\nuniform waveFrequency: float\noutput vUV: vec2\noutput vWorldPos: vec3\n\nmain {\n  let wave = sin(position.x * waveFrequency + time) * waveAmplitude\n  wave = wave + sin(position.z * waveFrequency * 0.7 + time * 1.3) * waveAmplitude * 0.5\n  let displaced = position + vec3(0.0, wave, 0.0)\n  vUV = uv\n  vWorldPos = vec3(modelMatrix * vec4(displaced, 1.0))\n  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(displaced, 1.0)\n}\n\n@fragment\ninput vUV: vec2\ninput vWorldPos: vec3\nuniform texture: sampler2D\nuniform time: float\nuniform waterColor: vec3\nuniform transparency: float\nuniform reflectivity: float\noutput fragColor: vec4\n\nmain {\n  let distortedUV = waveUV(vUV, 0.02, 10.0, time)\n  let tex = sample(texture, distortedUV)\n  let water = mix(tex.rgb, waterColor, transparency)\n  let shimmer = pulse(vWorldPos.x + vWorldPos.z + time, 5.0) * reflectivity * 0.2\n  fragColor = vec4(brighten(water, shimmer), 0.8)\n}\n",
  /**
   * Pixelation/retro effect
   */
  pixelate: "\n@shader \"pixelate\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\nuniform modelMatrix: mat4\nuniform viewMatrix: mat4\nuniform projectionMatrix: mat4\noutput vUV: vec2\n\nmain {\n  vUV = uv\n  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\nuniform texture: sampler2D\nuniform pixelSize: float\noutput fragColor: vec4\n\nmain {\n  let pixelatedUV = pixelate(vUV, pixelSize)\n  fragColor = sample(texture, pixelatedUV)\n}\n",
  /**
   * CRT monitor effect
   */
  crt: "\n@shader \"crt\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\nuniform modelMatrix: mat4\nuniform viewMatrix: mat4\nuniform projectionMatrix: mat4\noutput vUV: vec2\n\nmain {\n  vUV = uv\n  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\nuniform texture: sampler2D\nuniform time: float\nuniform scanlineIntensity: float\nuniform noiseAmount: float\noutput fragColor: vec4\n\nmain {\n  // Barrel distortion\n  let centered = vUV - 0.5\n  let dist = length(centered)\n  let distortion = 1.0 + dist * dist * 0.1\n  let distortedUV = centered * distortion + 0.5\n  \n  // Check bounds\n  if (distortedUV.x < 0.0 || distortedUV.x > 1.0 || distortedUV.y < 0.0 || distortedUV.y > 1.0) {\n    fragColor = vec4(0.0, 0.0, 0.0, 1.0)\n    return\n  }\n  \n  let tex = sample(texture, distortedUV)\n  \n  // Scanlines\n  let scanline = sin(distortedUV.y * 800.0) * 0.5 + 0.5\n  scanline = mix(1.0, scanline, scanlineIntensity)\n  \n  // Static noise\n  let n = noise(vUV + vec2(time, 0.0)) * noiseAmount\n  \n  // RGB shift\n  let r = sample(texture, distortedUV + vec2(0.002, 0.0)).r\n  let g = tex.g\n  let b = sample(texture, distortedUV - vec2(0.002, 0.0)).b\n  \n  let color = vec3(r, g, b) * scanline + n\n  fragColor = vec4(color, tex.a)\n}\n",
  /**
   * Dissolve/disintegration effect
   */
  dissolve: "\n@shader \"dissolve\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\nuniform modelMatrix: mat4\nuniform viewMatrix: mat4\nuniform projectionMatrix: mat4\noutput vUV: vec2\n\nmain {\n  vUV = uv\n  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\nuniform texture: sampler2D\nuniform dissolveAmount: float\nuniform edgeColor: vec3\nuniform edgeWidth: float\noutput fragColor: vec4\n\nmain {\n  let tex = sample(texture, vUV)\n  let n = noise(vUV * 10.0)\n  \n  // Dissolve threshold\n  if (n < dissolveAmount) {\n    discard\n  }\n  \n  // Edge glow\n  let edge = smoothstep(dissolveAmount, dissolveAmount + edgeWidth, n)\n  let edgeGlow = (1.0 - edge) * step(dissolveAmount, n)\n  \n  let color = mix(tex.rgb, edgeColor, edgeGlow)\n  fragColor = vec4(color, tex.a)\n}\n",
  /**
   * Hologram effect
   */
  hologram: "\n@shader \"hologram\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\ninput normal: vec3\nuniform modelMatrix: mat4\nuniform viewMatrix: mat4\nuniform projectionMatrix: mat4\nuniform normalMatrix: mat3\nuniform time: float\noutput vUV: vec2\noutput vNormal: vec3\noutput vWorldPos: vec3\n\nmain {\n  // Slight vertex jitter for hologram instability\n  let jitter = sin(position.y * 50.0 + time * 10.0) * 0.01\n  let jitteredPos = position + vec3(jitter, 0.0, jitter)\n  \n  vUV = uv\n  vNormal = normalMatrix * normal\n  vWorldPos = vec3(modelMatrix * vec4(jitteredPos, 1.0))\n  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(jitteredPos, 1.0)\n}\n\n@fragment\ninput vUV: vec2\ninput vNormal: vec3\ninput vWorldPos: vec3\nuniform texture: sampler2D\nuniform time: float\nuniform holoColor: vec3\nuniform scanlineSpeed: float\nuniform flickerIntensity: float\noutput fragColor: vec4\n\nmain {\n  let tex = sample(texture, vUV)\n  \n  // Fresnel-like edge glow\n  let viewDir = normalize(-vWorldPos)\n  let edge = fresnel(vNormal, viewDir, 2.0)\n  \n  // Scanlines moving down\n  let scanline = sin((vUV.y - time * scanlineSpeed) * 100.0) * 0.5 + 0.5\n  scanline = mix(0.5, 1.0, scanline)\n  \n  // Random flicker\n  let flicker = 1.0 - noise(vec2(time * 10.0, 0.0)) * flickerIntensity\n  \n  // Combine\n  let holo = holoColor * (0.5 + edge * 0.5) * scanline * flicker\n  let color = mix(tex.rgb * holoColor, holo, 0.3 + edge * 0.5)\n  \n  fragColor = vec4(color, tex.a * (0.6 + edge * 0.4) * flicker)\n}\n",
  // ─────────────────────────────────────────────────────────────────────────
  // POST-PROCESSING SHADERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fog post-process effect
   */
  fogPost: "\n@shader \"fog_post\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\noutput vUV: vec2\n\nmain {\n  vUV = uv\n  gl_Position = vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\nuniform colorTexture: sampler2D\nuniform depthTexture: sampler2D\nuniform fogColor: vec3\nuniform fogDensity: float\nuniform fogStart: float\nuniform fogEnd: float\noutput fragColor: vec4\n\nmain {\n  let color = sample(colorTexture, vUV)\n  let depth = sample(depthTexture, vUV).r\n  \n  // Linearize depth (assuming standard depth buffer)\n  let linearDepth = linearizeDepth(depth, 0.1, 100.0)\n  \n  // Calculate fog factor\n  let fogFactor = smoothstep(fogStart, fogEnd, linearDepth) * fogDensity\n  \n  let finalColor = fog(color.rgb, fogFactor, fogColor, 1.0)\n  fragColor = vec4(finalColor, color.a)\n}\n",
  /**
   * Color grading post-process
   */
  colorGrade: "\n@shader \"color_grade\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\noutput vUV: vec2\n\nmain {\n  vUV = uv\n  gl_Position = vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\nuniform texture: sampler2D\nuniform saturationAmount: float\nuniform contrastAmount: float\nuniform brightnessAmount: float\nuniform tintColor: vec3\nuniform tintAmount: float\noutput fragColor: vec4\n\nmain {\n  let color = sample(texture, vUV).rgb\n  \n  // Apply adjustments in order\n  color = saturate(color, saturationAmount)\n  color = contrast(color, contrastAmount)\n  color = brighten(color, brightnessAmount)\n  color = tint(color, tintColor, tintAmount)\n  \n  // Clamp to valid range\n  color = clamp(color, 0.0, 1.0)\n  \n  fragColor = vec4(color, 1.0)\n}\n",
  /**
   * Vignette post-process
   */
  vignette: "\n@shader \"vignette\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\noutput vUV: vec2\n\nmain {\n  vUV = uv\n  gl_Position = vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\nuniform texture: sampler2D\nuniform vignetteIntensity: float\nuniform vignetteRadius: float\nuniform vignetteSoftness: float\noutput fragColor: vec4\n\nmain {\n  let color = sample(texture, vUV)\n  \n  // Calculate vignette\n  let center = vec2(0.5, 0.5)\n  let dist = distance(vUV, center)\n  let vignette = smoothstep(vignetteRadius, vignetteRadius - vignetteSoftness, dist)\n  vignette = mix(1.0, vignette, vignetteIntensity)\n  \n  fragColor = vec4(color.rgb * vignette, color.a)\n}\n",
  // ─────────────────────────────────────────────────────────────────────────
  // SPRITE/2D SHADERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Sprite with flash effect (for hit/damage feedback)
   */
  spriteFlash: "\n@shader \"sprite_flash\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\nuniform modelMatrix: mat4\nuniform viewMatrix: mat4\nuniform projectionMatrix: mat4\noutput vUV: vec2\n\nmain {\n  vUV = uv\n  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\nuniform texture: sampler2D\nuniform flashColor: vec3\nuniform flashAmount: float\noutput fragColor: vec4\n\nmain {\n  let tex = sample(texture, vUV)\n  if (tex.a < 0.1) {\n    discard\n  }\n  let flashed = mix(tex.rgb, flashColor, flashAmount)\n  fragColor = vec4(flashed, tex.a)\n}\n",
  /**
   * Sprite with outline
   */
  spriteOutline: "\n@shader \"sprite_outline\"\n\n@vertex\ninput position: vec3\ninput uv: vec2\nuniform modelMatrix: mat4\nuniform viewMatrix: mat4\nuniform projectionMatrix: mat4\noutput vUV: vec2\n\nmain {\n  vUV = uv\n  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)\n}\n\n@fragment\ninput vUV: vec2\nuniform texture: sampler2D\nuniform outlineColor: vec3\nuniform outlineWidth: float\nuniform textureSize: vec2\noutput fragColor: vec4\n\nmain {\n  let tex = sample(texture, vUV)\n  \n  // Sample neighbors\n  let pixelSize = vec2(1.0 / textureSize.x, 1.0 / textureSize.y) * outlineWidth\n  let a = sample(texture, vUV + vec2(-pixelSize.x, 0.0)).a\n  a = a + sample(texture, vUV + vec2(pixelSize.x, 0.0)).a\n  a = a + sample(texture, vUV + vec2(0.0, -pixelSize.y)).a\n  a = a + sample(texture, vUV + vec2(0.0, pixelSize.y)).a\n  \n  // Outline where neighbors have alpha but center doesn't\n  let outline = clamp(a - tex.a * 4.0, 0.0, 1.0)\n  \n  // Mix outline and texture\n  let color = mix(tex.rgb, outlineColor, outline * (1.0 - tex.a))\n  let alpha = max(tex.a, outline)\n  \n  fragColor = vec4(color, alpha)\n}\n"
};

/**
 * Get a shader from the library
 * @param {string} name - Shader name
 * @returns {string|null} - PXSL source or null if not found
 */
function getShader(name) {
  return SHADER_LIBRARY[name] || null;
}

/**
 * List all available shaders in the library
 * @returns {string[]}
 */
function listShaders() {
  return Object.keys(SHADER_LIBRARY);
}
var _default = exports["default"] = SHADER_LIBRARY;