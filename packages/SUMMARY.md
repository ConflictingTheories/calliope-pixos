# SUMMARY.md

## Overview
This document summarizes the purpose, structure, and conceptual breakdown of each package in the `calliope-pixos` project. It also provides a high-level view of the overall architecture and integration points.

---

### packages/core
**Purpose:**
- The main WebGL-based game engine for PixoSpritz, handling rendering, entity management, events, audio, and scripting.

**Main Notes:**
- Uses WebGL2 for graphics.
- Integrates with math and scripting packages.
- Modular structure for engine, actions, events, shaders, and utilities.

**Structure:**
- `src/components/` - React components (WebGLView)
- `src/engine/` - Core engine logic
- `src/engine/actions/` - Action system
- `src/engine/core/` - Rendering, HUD, audio
- `src/engine/dynamic/` - Dynamic assets
- `src/engine/events/` - Event handlers
- `src/engine/scripting/` - Script engine
- `src/engine/shaders/` - GLSL shaders
- `src/engine/utils/` - Utilities
- `src/spritz/` - Spritz player integration

**Conceptual Breakdown:**
- Rendering pipeline
- Entity and map management
- Event-driven architecture
- Audio and cutscene systems
- Scripting integration

---

### packages/core-c
**Purpose:**
- Native C implementation of the Pixos game engine for performance-critical and embedded use cases.

**Main Notes:**
- Uses CMake for build management.
- Integrates OpenGL, GLEW, and GLFW for graphics.
- Modular source structure for engine, math, rendering, resource, and scene management.

**Structure:**
- `src/main.c` - Entry point
- `src/engine.c` - Engine logic
- `src/resource/` - Resource management
- `src/math/` - Math utilities
- `src/rendering/` - Rendering logic
- `src/scene/` - Scene management
- `src/vendor/` - Third-party dependencies

**Conceptual Breakdown:**
- Engine initialization and main loop
- Resource and texture management
- Scene and world handling
- Platform-specific build configuration

---

### packages/console
**Purpose:**
- Web player for running PixoSpritz games in the browser.

**Main Notes:**
- Supports loading games from URLs or files.
- Handles multiple input types and fullscreen mode.

**Structure:**
- `src/App.js` - Main React app
- `src/index.js` - Entry point
- `public/index.html` - HTML template
- `public/pixospritz/` - Sample content

**Conceptual Breakdown:**
- Game loading and execution
- Input management
- UI and fullscreen support

---

### packages/editor
**Purpose:**
- Visual development tools for creating and editing PixoSpritz games.

**Main Notes:**
- Includes editors for sprites, tiles, maps, cutscenes, models, and scripts.
- Uses Monaco editor for scripting.

**Structure:**
- `src/app.jsx` - Main app
- `src/sprite-editor/` - Sprite tools
- `src/tile-editor/` - Tile tools
- `src/tileset-editor/` - Tileset management

**Conceptual Breakdown:**
- Asset creation and editing
- Map and cutscene design
- Script authoring

---

### packages/math
**Purpose:**
- Math utilities for vectors, matrices, and geometric operations.

**Main Notes:**
- Provides 2D/3D/4D vector classes and matrix operations.
- WebGL-compatible data types.

**Structure:**
- `src/` - Math classes and functions

**Conceptual Breakdown:**
- Vector and matrix operations
- Graphics math utilities

---

### packages/script
**Purpose:**
- Lua-inspired scripting language for the game engine.

**Main Notes:**
- Custom scope and table implementation.
- Operator overloading and built-in functions.

**Structure:**
- `src/index.ts` - Entry point
- `src/parser.ts` - Lua parser
- `src/Scope.ts` - Scope management
- `src/Table.ts` - Table implementation
- `src/operators.ts` - Operators
- `src/utils.ts` - Utilities

**Conceptual Breakdown:**
- Script parsing and execution
- Scope and variable management
- Table and operator logic

---

### packages/server
**Purpose:**
- WebSocket multiplayer server for PixoSpritz games.

**Main Notes:**
- Real-time communication and zone management.
- Action queue and session handling.

**Structure:**
- `src/` - Server logic

**Conceptual Breakdown:**
- WebSocket protocol
- Zone/room management
- Action and session processing

---

## Project-wide Summary
The `calliope-pixos` project is a modular, multi-language game engine and toolset for creating, running, and editing PixoSpritz games. It features:
- A core engine in both JavaScript (WebGL) and C (OpenGL)
- Visual and scripting tools for game development
- Math and scripting utilities
- Multiplayer server support
- Extensible architecture for assets, events, and gameplay

Each package is designed for a specific role, with clear integration points and a focus on modularity and extensibility.
