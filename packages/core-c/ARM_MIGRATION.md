# ARM Linux Migration Guide

## Overview

This document describes the architecture for running the Pixos C Game Engine on ARM Linux devices, specifically the Anbernic RG353V (Rockchip RK3566 / Cortex-A55 / Mali-G52).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PIXOS GAME ENGINE                           │
├─────────────────────────────────────────────────────────────────┤
│  Game Logic    │  Rendering      │  Input         │  Audio      │
│  - Zones       │  - Sprites      │  - Actions     │  (miniaudio)│
│  - Sprites     │  - Tiles        │  - Mapping     │             │
│  - Scripts     │  - Lights       │  - Gamepad     │             │
├─────────────────────────────────────────────────────────────────┤
│                   PLATFORM ABSTRACTION LAYER                    │
├────────────────────────────┬────────────────────────────────────┤
│  Desktop (macOS/Linux/Win) │  ARM Linux (RG353V)                │
│  - GLFW window management  │  - EGL + GBM + DRM/KMS             │
│  - OpenGL 3.3 Core         │  - OpenGL ES 2.0/3.0               │
│  - Keyboard/Mouse          │  - evdev input                     │
│  - GLEW loader             │  - Direct framebuffer              │
└────────────────────────────┴────────────────────────────────────┘
```

## Directory Structure

```
packages/core-c/
├── CMakeLists.txt              # Multi-platform build
├── toolchain-arm.cmake         # ARM cross-compilation toolchain
├── src/
│   ├── platform/
│   │   ├── platform.h          # Platform abstraction API
│   │   ├── platform_desktop.c  # GLFW + GLEW implementation
│   │   └── platform_arm.c      # EGL + GBM + DRM implementation
│   ├── rendering/
│   │   ├── gles_compat.h       # GL/GLES compatibility layer
│   │   ├── shaders.h           # Desktop OpenGL 3.3 shaders
│   │   └── shaders_gles.h      # OpenGL ES 2.0/3.0 shaders
│   ├── input/
│   │   ├── input_actions.h     # Action mapping system
│   │   └── input_actions.c     # Gamepad + keyboard support
│   ├── resource/
│   │   ├── json_loader.h       # JSON asset loading
│   │   └── json_loader.c       # Zone/sprite/manifest parsing
│   └── vendor/
│       ├── cJSON.h             # JSON parser
│       ├── cJSON.c
│       └── stb_image.h         # Image loader
```

## Building

### Desktop (macOS/Linux)

```bash
cd packages/core-c
mkdir build && cd build
cmake ..
make
./pixos_engine
```

### ARM Cross-Compilation

```bash
# Set up environment
export BUILDROOT_PATH=/path/to/buildroot
# OR
export ARM_TOOLCHAIN_PREFIX=/usr/bin/aarch64-linux-gnu-
export ARM_SYSROOT=/path/to/arm/sysroot

# Build
cd packages/core-c
mkdir build-arm && cd build-arm
cmake -DCMAKE_TOOLCHAIN_FILE=../toolchain-arm.cmake \
      -DPLATFORM_ARM_LINUX=ON \
      ..
make
```

### Build Options

| Option | Default | Description |
|--------|---------|-------------|
| `PLATFORM_ARM_LINUX` | OFF | Enable ARM Linux build |
| `USE_GLES3` | OFF | Use GLES 3.0 instead of 2.0 |
| `NETWORK_SUPPORT` | ON | Enable optional networking |

## Platform Abstraction

The platform layer (`src/platform/platform.h`) provides a unified API:

```c
// Initialize platform (window/display, graphics context)
PlatformContext* ctx = platform_init(640, 480, "Game", true);

// Main loop
while (!platform_should_close(ctx)) {
    platform_poll_events(ctx);
    
    // Render with OpenGL/GLES
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    // ... render ...
    
    platform_swap_buffers(ctx);
}

platform_shutdown(ctx);
```

## Shader Compatibility

Shaders are provided in two versions:

1. **Desktop OpenGL 3.3** (`shaders.h`):
   - Uses `#version 330 core`
   - `in/out` qualifiers
   - `texture()` function

2. **OpenGL ES 2.0** (`shaders_gles.h`):
   - Uses `#version 100`
   - `attribute/varying` qualifiers
   - `precision mediump float`
   - `texture2D()` function

The `gles_compat.h` header provides compatibility macros.

## Input System

The input action system (`src/input/input_actions.h`) maps physical inputs to game actions:

```c
InputActionManager input;
input_action_init(&input);

// Check actions
if (input_action_just_pressed(&input, ACTION_CONFIRM)) {
    // A button / Space pressed
}

// Get movement vector
float mx, my;
input_action_get_movement(&input, &mx, &my);
```

### RG353V Button Mapping

| Button | evdev Code | Action |
|--------|------------|--------|
| D-pad Up | KEY_UP (103) | ACTION_MOVE_UP |
| D-pad Down | KEY_DOWN (108) | ACTION_MOVE_DOWN |
| D-pad Left | KEY_LEFT (105) | ACTION_MOVE_LEFT |
| D-pad Right | KEY_RIGHT (106) | ACTION_MOVE_RIGHT |
| A | BTN_SOUTH (304) | ACTION_CONFIRM |
| B | BTN_EAST (305) | ACTION_CANCEL |
| Start | BTN_START (315) | ACTION_MENU |
| Select | BTN_SELECT (314) | ACTION_MAP |

## JSON Asset Loading

Assets are loaded from JSON files matching the WebGL engine format:

```c
// Load zone
ZoneDefinition* zone = zone_definition_load("maps/village.json");

// Load sprite
SpriteDefinition* sprite = sprite_definition_load("sprites/npc.json");

// Load manifest
GameManifest* manifest = manifest_load("manifest.json");
```

## Network Support

Network support is optional and controlled by `NETWORK_SUPPORT` compile flag:

```c
#ifdef NETWORK_SUPPORT
    // Multiplayer code here
#endif
```

When disabled, all network-related code is excluded from compilation.

## Feature Parity with WebGL

| Feature | WebGL | C (Desktop) | C (ARM) | Status |
|---------|-------|-------------|---------|--------|
| Sprite rendering | ✅ | ✅ | ✅ | Complete |
| 8-directional animation | ✅ | ✅ | ✅ | Complete |
| Tile rendering | ✅ | ✅ | ✅ | Complete |
| Point lights | ✅ | ✅ | ✅ | Complete |
| JSON asset loading | ✅ | ✅ | ✅ | Complete |
| Gamepad input | ✅ | ⚠️ | ✅ | In progress |
| Lua scripting | ✅ | ❌ | ❌ | Planned |
| Audio playback | ✅ | ❌ | ❌ | Planned |
| Cutscene system | ✅ | ❌ | ❌ | Planned |
| HUD/UI overlay | ✅ | ❌ | ❌ | Planned |
| Network multiplayer | ✅ | ❌ | ❌ | Optional |

## Next Steps

1. **Lua Integration**: Add Lua 5.4 for scripting
2. **Audio**: Integrate miniaudio for sound effects and music
3. **Cutscenes**: Port cutscene DSL parser
4. **HUD System**: 2D overlay rendering with text

## References

- [RG353V Hardware Specs](../arm-linux/rg353v-distro/README.md)
- [triangle_gles.c](../arm-linux/rg353v-distro/src/triangle_gles.c) - EGL/GBM reference
- [WebGL Core Engine](../core/README.md) - Feature reference
- [Specs Package](../specs/README.md) - JSON schemas
