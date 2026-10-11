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
export const SHADER_LIBRARY = {
  // ─────────────────────────────────────────────────────────────────────────
  // BASIC SHADERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Simple unlit shader - just applies texture with color tint
   */
  unlit: `
@shader "unlit"

@vertex
input position: vec3
input uv: vec2
uniform modelMatrix: mat4
uniform viewMatrix: mat4
uniform projectionMatrix: mat4
output vUV: vec2

main {
  vUV = uv
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)
}

@fragment
input vUV: vec2
uniform texture: sampler2D
uniform tintColor: vec4
output fragColor: vec4

main {
  let tex = sample(texture, vUV)
  fragColor = tex * tintColor
}
`,

  /**
   * Basic lit shader with diffuse lighting
   */
  lit: `
@shader "lit"

@vertex
input position: vec3
input normal: vec3
input uv: vec2
uniform modelMatrix: mat4
uniform viewMatrix: mat4
uniform projectionMatrix: mat4
uniform normalMatrix: mat3
output vUV: vec2
output vNormal: vec3
output vWorldPos: vec3

main {
  vUV = uv
  vNormal = normalMatrix * normal
  vWorldPos = vec3(modelMatrix * vec4(position, 1.0))
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)
}

@fragment
input vUV: vec2
input vNormal: vec3
input vWorldPos: vec3
uniform texture: sampler2D
uniform lightDir: vec3
uniform lightColor: vec3
uniform ambientColor: vec3
output fragColor: vec4

main {
  let tex = sample(texture, vUV)
  let n = normalize(vNormal)
  let diff = diffuse(n, lightDir)
  let lighting = ambientColor + lightColor * diff
  fragColor = vec4(tex.rgb * lighting, tex.a)
}
`,

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT SHADERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Glowing outline effect
   */
  glow: `
@shader "glow"

@vertex
input position: vec3
input uv: vec2
uniform modelMatrix: mat4
uniform viewMatrix: mat4
uniform projectionMatrix: mat4
output vUV: vec2

main {
  vUV = uv
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)
}

@fragment
input vUV: vec2
uniform texture: sampler2D
uniform time: float
uniform glowColor: vec3
uniform glowIntensity: float
output fragColor: vec4

main {
  let tex = sample(texture, vUV)
  let glow = pulse(time, 2.0) * glowIntensity
  let glowAmount = glow(tex.rgb, glow * 0.5)
  fragColor = vec4(glowAmount + glowColor * glow * tex.a, tex.a)
}
`,

  /**
   * Water ripple effect
   */
  water: `
@shader "water"

@vertex
input position: vec3
input uv: vec2
uniform modelMatrix: mat4
uniform viewMatrix: mat4
uniform projectionMatrix: mat4
uniform time: float
uniform waveAmplitude: float
uniform waveFrequency: float
output vUV: vec2
output vWorldPos: vec3

main {
  let wave = sin(position.x * waveFrequency + time) * waveAmplitude
  wave = wave + sin(position.z * waveFrequency * 0.7 + time * 1.3) * waveAmplitude * 0.5
  let displaced = position + vec3(0.0, wave, 0.0)
  vUV = uv
  vWorldPos = vec3(modelMatrix * vec4(displaced, 1.0))
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(displaced, 1.0)
}

@fragment
input vUV: vec2
input vWorldPos: vec3
uniform texture: sampler2D
uniform time: float
uniform waterColor: vec3
uniform transparency: float
uniform reflectivity: float
output fragColor: vec4

main {
  let distortedUV = waveUV(vUV, 0.02, 10.0, time)
  let tex = sample(texture, distortedUV)
  let water = mix(tex.rgb, waterColor, transparency)
  let shimmer = pulse(vWorldPos.x + vWorldPos.z + time, 5.0) * reflectivity * 0.2
  fragColor = vec4(brighten(water, shimmer), 0.8)
}
`,

  /**
   * Pixelation/retro effect
   */
  pixelate: `
@shader "pixelate"

@vertex
input position: vec3
input uv: vec2
uniform modelMatrix: mat4
uniform viewMatrix: mat4
uniform projectionMatrix: mat4
output vUV: vec2

main {
  vUV = uv
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)
}

@fragment
input vUV: vec2
uniform texture: sampler2D
uniform pixelSize: float
output fragColor: vec4

main {
  let pixelatedUV = pixelate(vUV, pixelSize)
  fragColor = sample(texture, pixelatedUV)
}
`,

  /**
   * CRT monitor effect
   */
  crt: `
@shader "crt"

@vertex
input position: vec3
input uv: vec2
uniform modelMatrix: mat4
uniform viewMatrix: mat4
uniform projectionMatrix: mat4
output vUV: vec2

main {
  vUV = uv
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)
}

@fragment
input vUV: vec2
uniform texture: sampler2D
uniform time: float
uniform scanlineIntensity: float
uniform noiseAmount: float
output fragColor: vec4

main {
  // Barrel distortion
  let centered = vUV - 0.5
  let dist = length(centered)
  let distortion = 1.0 + dist * dist * 0.1
  let distortedUV = centered * distortion + 0.5
  
  // Check bounds
  if (distortedUV.x < 0.0 || distortedUV.x > 1.0 || distortedUV.y < 0.0 || distortedUV.y > 1.0) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0)
    return
  }
  
  let tex = sample(texture, distortedUV)
  
  // Scanlines
  let scanline = sin(distortedUV.y * 800.0) * 0.5 + 0.5
  scanline = mix(1.0, scanline, scanlineIntensity)
  
  // Static noise
  let n = noise(vUV + vec2(time, 0.0)) * noiseAmount
  
  // RGB shift
  let r = sample(texture, distortedUV + vec2(0.002, 0.0)).r
  let g = tex.g
  let b = sample(texture, distortedUV - vec2(0.002, 0.0)).b
  
  let color = vec3(r, g, b) * scanline + n
  fragColor = vec4(color, tex.a)
}
`,

  /**
   * Dissolve/disintegration effect
   */
  dissolve: `
@shader "dissolve"

@vertex
input position: vec3
input uv: vec2
uniform modelMatrix: mat4
uniform viewMatrix: mat4
uniform projectionMatrix: mat4
output vUV: vec2

main {
  vUV = uv
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)
}

@fragment
input vUV: vec2
uniform texture: sampler2D
uniform dissolveAmount: float
uniform edgeColor: vec3
uniform edgeWidth: float
output fragColor: vec4

main {
  let tex = sample(texture, vUV)
  let n = noise(vUV * 10.0)
  
  // Dissolve threshold
  if (n < dissolveAmount) {
    discard
  }
  
  // Edge glow
  let edge = smoothstep(dissolveAmount, dissolveAmount + edgeWidth, n)
  let edgeGlow = (1.0 - edge) * step(dissolveAmount, n)
  
  let color = mix(tex.rgb, edgeColor, edgeGlow)
  fragColor = vec4(color, tex.a)
}
`,

  /**
   * Hologram effect
   */
  hologram: `
@shader "hologram"

@vertex
input position: vec3
input uv: vec2
input normal: vec3
uniform modelMatrix: mat4
uniform viewMatrix: mat4
uniform projectionMatrix: mat4
uniform normalMatrix: mat3
uniform time: float
output vUV: vec2
output vNormal: vec3
output vWorldPos: vec3

main {
  // Slight vertex jitter for hologram instability
  let jitter = sin(position.y * 50.0 + time * 10.0) * 0.01
  let jitteredPos = position + vec3(jitter, 0.0, jitter)
  
  vUV = uv
  vNormal = normalMatrix * normal
  vWorldPos = vec3(modelMatrix * vec4(jitteredPos, 1.0))
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(jitteredPos, 1.0)
}

@fragment
input vUV: vec2
input vNormal: vec3
input vWorldPos: vec3
uniform texture: sampler2D
uniform time: float
uniform holoColor: vec3
uniform scanlineSpeed: float
uniform flickerIntensity: float
output fragColor: vec4

main {
  let tex = sample(texture, vUV)
  
  // Fresnel-like edge glow
  let viewDir = normalize(-vWorldPos)
  let edge = fresnel(vNormal, viewDir, 2.0)
  
  // Scanlines moving down
  let scanline = sin((vUV.y - time * scanlineSpeed) * 100.0) * 0.5 + 0.5
  scanline = mix(0.5, 1.0, scanline)
  
  // Random flicker
  let flicker = 1.0 - noise(vec2(time * 10.0, 0.0)) * flickerIntensity
  
  // Combine
  let holo = holoColor * (0.5 + edge * 0.5) * scanline * flicker
  let color = mix(tex.rgb * holoColor, holo, 0.3 + edge * 0.5)
  
  fragColor = vec4(color, tex.a * (0.6 + edge * 0.4) * flicker)
}
`,

  // ─────────────────────────────────────────────────────────────────────────
  // POST-PROCESSING SHADERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Fog post-process effect
   */
  fogPost: `
@shader "fog_post"

@vertex
input position: vec3
input uv: vec2
output vUV: vec2

main {
  vUV = uv
  gl_Position = vec4(position, 1.0)
}

@fragment
input vUV: vec2
uniform colorTexture: sampler2D
uniform depthTexture: sampler2D
uniform fogColor: vec3
uniform fogDensity: float
uniform fogStart: float
uniform fogEnd: float
output fragColor: vec4

main {
  let color = sample(colorTexture, vUV)
  let depth = sample(depthTexture, vUV).r
  
  // Linearize depth (assuming standard depth buffer)
  let linearDepth = linearizeDepth(depth, 0.1, 100.0)
  
  // Calculate fog factor
  let fogFactor = smoothstep(fogStart, fogEnd, linearDepth) * fogDensity
  
  let finalColor = fog(color.rgb, fogFactor, fogColor, 1.0)
  fragColor = vec4(finalColor, color.a)
}
`,

  /**
   * Color grading post-process
   */
  colorGrade: `
@shader "color_grade"

@vertex
input position: vec3
input uv: vec2
output vUV: vec2

main {
  vUV = uv
  gl_Position = vec4(position, 1.0)
}

@fragment
input vUV: vec2
uniform texture: sampler2D
uniform saturationAmount: float
uniform contrastAmount: float
uniform brightnessAmount: float
uniform tintColor: vec3
uniform tintAmount: float
output fragColor: vec4

main {
  let color = sample(texture, vUV).rgb
  
  // Apply adjustments in order
  color = saturate(color, saturationAmount)
  color = contrast(color, contrastAmount)
  color = brighten(color, brightnessAmount)
  color = tint(color, tintColor, tintAmount)
  
  // Clamp to valid range
  color = clamp(color, 0.0, 1.0)
  
  fragColor = vec4(color, 1.0)
}
`,

  /**
   * Vignette post-process
   */
  vignette: `
@shader "vignette"

@vertex
input position: vec3
input uv: vec2
output vUV: vec2

main {
  vUV = uv
  gl_Position = vec4(position, 1.0)
}

@fragment
input vUV: vec2
uniform texture: sampler2D
uniform vignetteIntensity: float
uniform vignetteRadius: float
uniform vignetteSoftness: float
output fragColor: vec4

main {
  let color = sample(texture, vUV)
  
  // Calculate vignette
  let center = vec2(0.5, 0.5)
  let dist = distance(vUV, center)
  let vignette = smoothstep(vignetteRadius, vignetteRadius - vignetteSoftness, dist)
  vignette = mix(1.0, vignette, vignetteIntensity)
  
  fragColor = vec4(color.rgb * vignette, color.a)
}
`,

  // ─────────────────────────────────────────────────────────────────────────
  // SPRITE/2D SHADERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Sprite with flash effect (for hit/damage feedback)
   */
  spriteFlash: `
@shader "sprite_flash"

@vertex
input position: vec3
input uv: vec2
uniform modelMatrix: mat4
uniform viewMatrix: mat4
uniform projectionMatrix: mat4
output vUV: vec2

main {
  vUV = uv
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)
}

@fragment
input vUV: vec2
uniform texture: sampler2D
uniform flashColor: vec3
uniform flashAmount: float
output fragColor: vec4

main {
  let tex = sample(texture, vUV)
  if (tex.a < 0.1) {
    discard
  }
  let flashed = mix(tex.rgb, flashColor, flashAmount)
  fragColor = vec4(flashed, tex.a)
}
`,

  /**
   * Sprite with outline
   */
  spriteOutline: `
@shader "sprite_outline"

@vertex
input position: vec3
input uv: vec2
uniform modelMatrix: mat4
uniform viewMatrix: mat4
uniform projectionMatrix: mat4
output vUV: vec2

main {
  vUV = uv
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)
}

@fragment
input vUV: vec2
uniform texture: sampler2D
uniform outlineColor: vec3
uniform outlineWidth: float
uniform textureSize: vec2
output fragColor: vec4

main {
  let tex = sample(texture, vUV)
  
  // Sample neighbors
  let pixelSize = vec2(1.0 / textureSize.x, 1.0 / textureSize.y) * outlineWidth
  let a = sample(texture, vUV + vec2(-pixelSize.x, 0.0)).a
  a = a + sample(texture, vUV + vec2(pixelSize.x, 0.0)).a
  a = a + sample(texture, vUV + vec2(0.0, -pixelSize.y)).a
  a = a + sample(texture, vUV + vec2(0.0, pixelSize.y)).a
  
  // Outline where neighbors have alpha but center doesn't
  let outline = clamp(a - tex.a * 4.0, 0.0, 1.0)
  
  // Mix outline and texture
  let color = mix(tex.rgb, outlineColor, outline * (1.0 - tex.a))
  let alpha = max(tex.a, outline)
  
  fragColor = vec4(color, alpha)
}
`,
};

/**
 * Get a shader from the library
 * @param {string} name - Shader name
 * @returns {string|null} - PXSL source or null if not found
 */
export function getShader(name) {
  return SHADER_LIBRARY[name] || null;
}

/**
 * List all available shaders in the library
 * @returns {string[]}
 */
export function listShaders() {
  return Object.keys(SHADER_LIBRARY);
}

export default SHADER_LIBRARY;
