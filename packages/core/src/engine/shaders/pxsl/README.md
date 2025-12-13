# PXSL - PixoSpritz Shader Language

A user-friendly domain-specific language for WebGL shaders that transpiles to standard GLSL.

## Features

- **Simple, Intuitive Syntax** - Write shaders without GLSL boilerplate
- **Built-in Functions** - Common operations like `diffuse()`, `fog()`, `noise()` ready to use
- **Type Aliases** - Use `color` instead of `vec4`, `texture` instead of `sampler2D`
- **Combined Shaders** - Define vertex and fragment shaders in one file
- **Full GLSL Support** - Falls back to standard GLSL when needed
- **Editor Integration** - Syntax highlighting and autocompletion in PixoSpritz Editor

## Quick Start

```pxsl
@shader "my_effect"

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
output fragColor: vec4

main {
  let color = sample(texture, vUV)
  let glow = pulse(time, 2.0) * 0.3
  fragColor = brighten(color, glow)
}
```

## Syntax Reference

### Directives

| Directive | Description |
|-----------|-------------|
| `@shader "name"` | Names the shader |
| `@vertex` | Starts vertex shader section |
| `@fragment` | Starts fragment shader section |
| `@effect "name"` | Defines a reusable effect preset |

### Variable Declarations

```pxsl
// Vertex inputs (attributes)
input position: vec3
input normal: vec3
input uv: vec2

// Uniforms from JavaScript
uniform modelMatrix: mat4
uniform time: float
uniform color: vec3

// Outputs (varyings)
output vUV: vec2
output vNormal: vec3

// Constants
const PI = 3.14159

// Local variables
let temp: vec3
```

### Type Aliases

| Alias | GLSL Type | Description |
|-------|-----------|-------------|
| `color` | `vec4` | RGBA color |
| `color3` | `vec3` | RGB color |
| `point` | `vec3` | 3D position |
| `point2` | `vec2` | 2D position |
| `direction` | `vec3` | Direction vector |
| `normal` | `vec3` | Surface normal |
| `matrix` | `mat4` | 4x4 matrix |
| `texture` | `sampler2D` | 2D texture |
| `cubemap` | `samplerCube` | Cube map |

## Built-in Functions

### Lighting

```pxsl
// Diffuse lighting (Lambert)
let diff = diffuse(normal, lightDirection)

// Specular highlight (Blinn-Phong)
let spec = specular(normal, lightDir, viewDir, 32.0)

// Fresnel rim effect
let rim = fresnel(normal, viewDir, 2.0)
```

### Color Operations

```pxsl
// Brightness adjustment
let bright = brighten(color, 0.2)
let dark = darken(color, 0.3)

// Saturation (0 = grayscale, 1 = original, >1 = vivid)
let vivid = saturate(color, 1.5)

// Contrast adjustment
let punchy = contrast(color, 1.2)

// Color tinting
let tinted = tint(color, vec3(1.0, 0.8, 0.6), 0.3)
```

### Effects

```pxsl
// Fog effect
let fogged = fog(color, depth, fogColor, 0.02)

// Self-illumination glow
let glowing = glow(color, intensity)

// Sprite outline
fragColor = outline(uv, texture, outlineColor, 2.0)

// Pixelation
let retroUV = pixelate(uv, 64.0)
```

### Math Helpers

```pxsl
// Range remapping
let normalized = remap(value, 0.0, 100.0, 0.0, 1.0)

// Smooth pulsing (0-1)
let p = pulse(time, 2.0)  // 2 pulses per second

// Simple noise
let n = noise(uv * 10.0)

// Fractal noise
let clouds = fbm(uv * 5.0, 4)
```

### UV Transforms

```pxsl
// Rotation
let rotated = rotateUV(uv, angle, vec2(0.5, 0.5))

// Scaling
let zoomed = scaleUV(uv, vec2(2.0), vec2(0.5))

// Wave distortion
let wavy = waveUV(uv, 0.1, 5.0, time)
```

## Usage in JavaScript

```javascript
import { PXSLTranspiler, ShaderManager } from '@pixospritz/core/shaders/pxsl';

// Create shader manager
const shaderManager = new ShaderManager(gl);

// Load and compile PXSL shader
const pxslSource = `
  @shader "glow"
  @vertex
  // ... vertex code
  @fragment
  // ... fragment code
`;

const program = shaderManager.loadAndCompile('glow', pxslSource);

// Use the shader
shaderManager.use('glow');

// Or transpile manually
const glsl = PXSLTranspiler.transpile(pxslSource);
console.log(glsl.vs);  // Vertex shader GLSL
console.log(glsl.fs);  // Fragment shader GLSL
```

## Built-in Shader Library

The `SHADER_LIBRARY` provides ready-to-use shaders:

```javascript
import { SHADER_LIBRARY } from '@pixospritz/core/shaders/pxsl';

// Available shaders:
// - unlit: Basic unlit texture shader
// - lit: Diffuse lighting
// - glow: Pulsing glow effect
// - water: Animated water surface
// - pixelate: Retro pixelation
// - crt: CRT monitor effect
// - dissolve: Dissolve/disintegration
// - hologram: Sci-fi hologram
// - fogPost: Post-process fog
// - colorGrade: Color grading
// - vignette: Vignette effect
// - spriteFlash: Hit/damage flash
// - spriteOutline: Sprite outline

const waterShader = SHADER_LIBRARY.water;
```

## Files

- `specification.js` - Language specification and built-in functions
- `transpiler.js` - PXSL to GLSL transpiler
- `manager.js` - Shader loading and compilation
- `library.js` - Pre-built shader collection
- `index.js` - Main entry point

## Example Shaders

See `/packages/spritz/shaders/` for example PXSL shaders:

- `glow_effect.pxsl` - Pulsing glow for interactive objects
- `water_surface.pxsl` - Animated water with reflections
- `retro_crt.pxsl` - CRT monitor effect
- `magic_particle.pxsl` - Sparkle particle effect

## Editor Support

The PixoSpritz Editor provides full PXSL support:

- Syntax highlighting with custom theme
- Autocompletion for all functions and types
- Hover documentation
- Shader templates and snippets

Files with `.pxsl` extension are automatically recognized.
