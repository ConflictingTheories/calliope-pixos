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
│   ├── audio/
│   │   ├── audio_manager.h     # Audio playback API
│   │   └── audio_manager.c     # miniaudio implementation
│   ├── platform/
│   │   ├── platform.h          # Platform abstraction API
│   │   ├── platform_desktop.c  # GLFW + GLEW implementation
│   │   └── platform_arm.c      # EGL + GBM + DRM implementation
│   ├── rendering/
│   │   ├── gles_compat.h       # GL/GLES compatibility layer
│   │   ├── shaders.h           # Desktop OpenGL 3.3 shaders
│   │   └── shaders_gles.h      # OpenGL ES 2.0/3.0 shaders
│   ├── scripting/
│   │   ├── lua_manager.h       # Lua scripting API
│   │   └── lua_manager.c       # Lua 5.4 integration
│   ├── input/
│   │   ├── input_actions.h     # Action mapping system
│   │   └── input_actions.c     # Gamepad + keyboard support
│   ├── resource/
│   │   ├── json_loader.h       # JSON asset loading
│   │   └── json_loader.c       # Zone/sprite/manifest parsing
│   └── vendor/
│       ├── cJSON.h             # JSON parser
│       ├── cJSON.c
│       ├── miniaudio.h         # Audio library
│       ├── lua-5.4/            # Lua 5.4 sources
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

| Option               | Default | Description                 |
| -------------------- | ------- | --------------------------- |
| `PLATFORM_ARM_LINUX` | OFF     | Enable ARM Linux build      |
| `USE_GLES3`          | OFF     | Use GLES 3.0 instead of 2.0 |
| `NETWORK_SUPPORT`    | ON      | Enable optional networking  |
| `ENABLE_AUDIO`       | ON      | Enable audio via miniaudio  |
| `ENABLE_LUA`         | ON      | Enable Lua 5.4 scripting    |

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

| Button      | evdev Code       | Action            |
| ----------- | ---------------- | ----------------- |
| D-pad Up    | KEY_UP (103)     | ACTION_MOVE_UP    |
| D-pad Down  | KEY_DOWN (108)   | ACTION_MOVE_DOWN  |
| D-pad Left  | KEY_LEFT (105)   | ACTION_MOVE_LEFT  |
| D-pad Right | KEY_RIGHT (106)  | ACTION_MOVE_RIGHT |
| A           | BTN_SOUTH (304)  | ACTION_CONFIRM    |
| B           | BTN_EAST (305)   | ACTION_CANCEL     |
| Start       | BTN_START (315)  | ACTION_MENU       |
| Select      | BTN_SELECT (314) | ACTION_MAP        |

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

| Feature                 | WebGL | C (Desktop) | C (ARM) | Status      |
| ----------------------- | ----- | ----------- | ------- | ----------- |
| Sprite rendering        | ✅    | ✅          | ✅      | Complete    |
| 8-directional animation | ✅    | ✅          | ✅      | Complete    |
| Tile rendering          | ✅    | ✅          | ✅      | Complete    |
| Point lights            | ✅    | ✅          | ✅      | Complete    |
| JSON asset loading      | ✅    | ✅          | ✅      | Complete    |
| Gamepad input           | ✅    | ⚠️          | ✅      | In progress |
| Lua scripting           | ✅    | ✅          | ✅      | Complete    |
| Audio playback          | ✅    | ✅          | ✅      | Complete    |
| Cutscene system         | ✅    | ❌          | ❌      | Planned     |
| HUD/UI overlay          | ✅    | ❌          | ❌      | Planned     |
| Network multiplayer     | ✅    | ❌          | ❌      | Optional    |

## Audio System

The engine uses miniaudio for cross-platform audio support:

```c
// In Lua scripts:
pixos.play_bgm("audio/music.ogg", true, 0.5)  -- Play with fade-in
pixos.play_sfx("audio/hit.wav")               -- Play sound effect
pixos.set_master_volume(0.8)                  -- Set volume
pixos.stop_bgm(1.0)                           -- Stop with fade-out

// In C code:
AudioManager* audio = engine->audio;
audio_manager_play_bgm(audio, "music.ogg", true, 0.5f);
audio_manager_play_sfx(audio, "hit.wav", 1.0f);
```

Supported formats: WAV, MP3, OGG, FLAC

## Lua Scripting

Lua 5.4 is integrated for game scripts:

```lua
-- Example trigger script
pixos.log("Hello from Lua!")

-- Check input
if pixos.is_action_active("interact") then
    pixos.sprite_dialogue("npc1", "Hello, traveler!")
end

-- Play audio
pixos.play_sfx("audio/talk.wav")

-- Camera control
pixos.set_camera_position(10, 5, 20)
pixos.look_at(10, 0, 15, 10, 0, 0)

-- Game flags
pixos.set_flag("quest_started", true)
if pixos.has_flag("key_obtained") then
    -- unlock door
end
```

## Next Steps

1. **Cutscenes**: Port cutscene DSL parser
2. **HUD System**: 2D overlay rendering with text
3. **ARM Testing**: Verify cross-compilation on device

## References

- [RG353V Hardware Specs](../arm-linux/rg353v-distro/README.md)
- [triangle_gles.c](../arm-linux/rg353v-distro/src/triangle_gles.c) - EGL/GBM reference
- [WebGL Core Engine](../core/README.md) - Feature reference
- [Specs Package](../specs/README.md) - JSON schemas
