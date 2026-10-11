# Shaders

This directory contains custom PXSL (PixoSpritz Shader Language) shaders for visual effects.

## Available Shaders

| File                  | Description             | Usage                      |
| --------------------- | ----------------------- | -------------------------- |
| `glow_effect.pxsl`    | Soft glow/bloom effect  | Magic items, UI highlights |
| `magic_particle.pxsl` | Sparkle particle effect | Spell casting, portals     |
| `retro_crt.pxsl`      | CRT monitor simulation  | Retro aesthetic            |
| `water_surface.pxsl`  | Animated water surface  | Lakes, rivers, pools       |

## PXSL Language

PXSL is a simplified shader language that compiles to GLSL WebGL2. It provides:

- Simplified syntax with `@vertex` and `@fragment` sections
- Built-in lighting functions
- Color manipulation helpers
- UV transformation utilities
- Time-based animation support

## Shader Structure

```pxsl
@version 300 es
@precision highp float

@vertex {
  in vec4 aVertexPosition;
  in vec2 aTextureCoord;

  out vec2 vUV;

  void main() {
    vUV = aTextureCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
}

@fragment {
  in vec2 vUV;
  out vec4 fragColor;

  uniform float uTime;
  uniform sampler2D uTexture;

  void main() {
    vec4 color = texture(uTexture, vUV);
    fragColor = color;
  }
}
```

## Built-in Functions

### Lighting

- `calcLight(pos, normal, lightPos, color)` - Point light calculation
- `calcAmbient(color, intensity)` - Ambient lighting

### Color

- `desaturate(color, amount)` - Reduce saturation
- `adjustBrightness(color, amount)` - Brightness adjustment
- `blend(colorA, colorB, factor)` - Color blending

### Effects

- `noise(uv)` - Procedural noise
- `blur(texture, uv, radius)` - Gaussian blur
- `wave(uv, amplitude, frequency, time)` - Wave distortion

### UV Transforms

- `rotate(uv, angle)` - UV rotation
- `scale(uv, factor)` - UV scaling
- `offset(uv, delta)` - UV offset

## Usage in Game

### In Manifest

```json
{
  "shaders": {
    "glow": "shaders/glow_effect.pxsl",
    "water": "shaders/water_surface.pxsl"
  }
}
```

### In Scripts

```lua
-- Apply shader to sprite
sprite:set_shader("glow")

-- Set shader uniform
sprite:set_uniform("uGlowIntensity", 0.5)
```

### In Maps

```json
{
  "sprites": [
    {
      "id": "magic-orb",
      "shader": "glow",
      "shaderParams": {
        "uGlowIntensity": 0.8,
        "uGlowColor": [0.5, 0.8, 1.0]
      }
    }
  ]
}
```

## Creating New Shaders

1. Create a `.pxsl` file in this directory
2. Define `@vertex` and `@fragment` sections
3. Use built-in functions for common effects
4. Register in manifest.json
5. Test in the editor's shader preview

## Shader Examples

### Glow Effect

```pxsl
@fragment {
  void main() {
    vec4 color = texture(uTexture, vUV);
    float glow = smoothstep(0.3, 0.7, color.a);
    fragColor = color + uGlowColor * glow * uGlowIntensity;
  }
}
```

### Water Ripple

```pxsl
@fragment {
  void main() {
    vec2 uv = vUV;
    uv.x += sin(uv.y * 10.0 + uTime) * 0.02;
    uv.y += cos(uv.x * 10.0 + uTime) * 0.02;
    fragColor = texture(uTexture, uv);
  }
}
```

## Resources

- See `packages/core-js/src/engine/shaders/pxsl/README.md` for full PXSL documentation
- Editor shader preview: `demos/tile-editor.html`
