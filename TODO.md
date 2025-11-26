# PixoSpritz Engine Upgrade - Task Tracker

## Overview
This document tracks all tasks for the PixoSpritz game engine upgrade project.

---

## ✅ MAJOR MILESTONE: Monorepo Restructure Complete

The entire project has been restructured into a clean `@pixospritz` scoped monorepo:

| Package | Path | Description |
|---------|------|-------------|
| `@pixospritz/core` | `packages/core/` | Core WebGL game engine |
| `@pixospritz/script` | `packages/script/` | Lua-inspired scripting language |
| `@pixospritz/math` | `packages/math/` | Math utilities (vectors, matrices) |
| `@pixospritz/editor` | `packages/editor/` | Visual development tools |
| `@pixospritz/console` | `packages/console/` | Web game player |
| `@pixospritz/server` | `packages/server/` | WebSocket multiplayer server |
| `@pixospritz/website` | `packages/website/` | Documentation website |
| `@pixospritz/assets` | `packages/assets/` | Shared game assets |

All builds are managed via the root `package.json` using npm workspaces.

### Commands

```bash
# Development
npm run dev:editor      # Start editor dev server
npm run dev:console     # Start console dev server
npm run start:server    # Start WebSocket server

# Building
npm run build           # Build all packages
npm run build:core      # Build core engine
npm run build:editor    # Build editor
npm run build:console   # Build console

# Utilities
npm run lint            # Lint all packages
npm run test            # Test all packages
npm run clean           # Clean all build outputs
```

---

## Task Categories

### 1. Cutscene DSL Integration
- [x] Analyze current cutscene implementation in editor (CutscenePlayer.jsx, cutscene-tool)
- [x] Study core engine cutscene system (PxcPlayer.js, manager.js)
- [x] Port editor cutscene functionality to core engine
- [x] Ensure compatibility with game asset loading system
- [ ] Test cutscene playback with existing .pxc files

**IMPLEMENTATION COMPLETE:**
- PxcPlayer.js enhanced with full rendering capabilities
- HUD canvas integration for dialogue boxes
- Complete DSL parsing (backdrop, char, dialogue, cutin, hooks, transitions, wait, end)
- Asset loading from ZIP/resources
- Audio system (BGM, SFX, Voice blocking)
- Typewriter text animation with configurable speed

### 2. Picking Shader System Fix
- [x] Analyze picker shader implementation (picker/fs.js, vs.js, init.js)
- [x] Study how picking is used in tactics mode
- [x] Debug why tile/sprite/object selection is broken
- [x] Fix the picking framebuffer and color-based selection
- [ ] Test selection in tactics mode

**ROOT CAUSE:** Objects called both picker and main shader's `setMatrixUniforms()` during draw, but each `setMatrixUniforms()` called `gl.useProgram()` to switch to its shader. This meant the main shader was always active when `drawArrays()` was called, even during the picker pass.

**FIX IMPLEMENTED:**
1. Added `isPickerPass` flag to RenderManager
2. Set flag to `true` in `activatePickerShaderProgram()`, `false` in `activateShaderProgram()`
3. Removed `gl.useProgram()` call from picker's `setMatrixUniforms()` 
4. Updated sprite.js, zone.js, object.js, animatedTile.js to check flag and only set appropriate shader uniforms

### 3. OBJ Loader Replacement
- [x] Analyze current OBJ loader (utils/obj/)
- [x] Study OBJ viewer demo implementation (model-preview/ObjModelViewer.jsx)
- [x] Create new OBJ helper class based on viewer demo
- [x] ObjHelper includes legacy buffer compatibility
- [ ] Replace engine OBJ loading with new implementation (gradual migration)
- [ ] Test with existing .obj/.mtl models

**NEW FILE CREATED:** `pixospritz/src/engine/utils/ObjHelper.js`

A clean, modern OBJ/MTL parser with:
- Simple OBJ parsing with automatic face triangulation
- MTL material parsing with texture support
- Automatic face normal calculation when vertex normals are missing
- Per-mesh material assignment
- WebGL buffer initialization (VAO-based and legacy compatible)
- Utility methods: loadTexture, calculateBounds, deleteMeshBuffers
- `initLegacyBuffers()` for backward compatibility with existing engine code

### 4. Camera Controls Unification
- [x] Analyze debug mode camera controls (core/debug/index.js)
- [x] Study editor camera implementations across tools
- [x] Identify common camera control patterns
- [x] Create shared camera control module
- [x] Module supports both coordinate systems
- [ ] Integrate into engine and editor (gradual adoption)

**NEW FILE CREATED:** `pixospritz/src/engine/utils/CameraController.js`

A unified camera controller supporting:
- Spherical coordinates (yaw/pitch/distance)
- Both Y-up (editor) and Z-up (engine) coordinate systems
- Mouse drag rotation, wheel zoom
- Keyboard WASD/Arrow pan
- Touch gesture support (rotate + pinch zoom)
- View matrix generation
- 8-directional facing for sprites
- Easy attachment to canvas elements via `attach()` method

### 5. Console Click Handler Fix
- [x] Analyze console styling and DOM hierarchy
- [x] Debug click/touch event propagation
- [x] Fix event handling in web console
- [x] Fix canvas coordinate alignment with viewport 
- [x] Fix click error (TypeError in menu.js:92)
- [x] Fix resize handling
- [ ] Test on various browsers

**ROOT CAUSE:** The menu.js and prompt.js hookListener expected `{ touches }` format but gamepad's `listen()` passed the full event object. Mouse events don't have `touches` property, causing the error.

**FIXES IMPLEMENTED:**
1. Fixed menu.js: Added `normalizeTouches()` helper to extract touches from mouse/touch/adjusted events
2. Fixed prompt.js: Same normalization fix
3. Added handleResize() to RenderManager for projection matrix updates
4. Added handleResize() to HUD for context updates
5. WebGLView already had ResizeObserver integration
            at discreteUpdates$1 (react-dom.development.js:22413:1)
            at discreteUpdates (react-dom.development.js:3756:1)
            at dispatchDiscreteEvent (react-dom.development.js:5889:1)
        (anonymous) @ spritz.js:183
        onTouchEvent @ WebGLView.jsx:98
        onMouseDown @ WebGLView.jsx:317
        (see fixed details below)

**ROOT CAUSE:** Multiple issues identified:
1. menu.js and prompt.js hookListener expected `{ touches }` format but gamepad passed raw event
2. Event coordinates not properly transformed between display size and canvas internal resolution
3. No resize observer to handle dynamic canvas resizing

**FIXES IMPLEMENTED:**
1. menu.js: Added `normalizeTouches()` helper to extract touches from any event type
2. prompt.js: Same normalization fix
3. WebGLView: Already had proper coordinate transformation with `canvasX`/`canvasY`
4. Gamepad: Already used `getBoundingClientRect()` for accurate offsets
5. RenderManager: Added `handleResize()` method for projection matrix updates
6. HUD: Added `handleResize()` method for context updates
7. WebGLView: Already had ResizeObserver integration

### 6. Editor Tools Review
- [x] Review each editor tool for missing functionality
- [x] Document placeholders and TODOs
- [x] Propose improvements
- [x] Fix deprecated lifecycle methods
- [x] Improve consistent styling/framing

**FINDINGS BY TOOL:** 

1. **audio-preview** - ✅ Well implemented with waveform visualization

2. **cutscene-tool** (1166 lines) - Needs component decomposition, inline styles should be extracted

3. **geometry-editor** - Two versions exist; simple editor lacks delete functionality

4. **image-preview** - ✅ FIXED:
   - Converted to functional component with hooks
   - Removed deprecated `componentWillReceiveProps`
   - Added zoom controls (buttons + Shift+scroll)
   - Added image info display (dimensions, format, zoom %)
   - Added checkered background for transparency
   - Consistent framing with `.editor-tool-container`

5. **map-editor** - Debug logging left in code (window.zoneData pollution), palette hardcoded - Lacking integration with geometry editor - also lacking tile editor functionality. Textures cannot be edited either properly.

6. **model-preview** - ✅ FIXED:
   - Complete rewrite of ObjModelViewer to accept props
   - Auto-loads MTL and textures from zip when OBJ selected
   - Parses `mtllib` reference and `map_Kd` texture references
   - Auto-fits camera to model bounds
   - Improved OBJ detection (handles comments, various line types)
   - Added loading state, error messages, info display
   - Consistent framing with `.editor-tool-container`

7. **script-editor** - ✅ FIXED:
   - Converted to functional component with hooks
   - Removed deprecated `componentWillReceiveProps`
   - Added Ctrl+S / Cmd+S keyboard save shortcut
   - Added "unsaved changes" indicator
   - Save button disabled when no changes
   - Consistent framing with flexbox layout
   - NOTE: Monaco still requires internet for full features

8. **sprite-editor** - Cannot load existing sprites, missing eyedropper tool, cannot delete frames - Needs to also render in 3D on grid for directional mappings, animations need to be playable

9. **tileset-editor** (DEPRECATED) - ⚠️ Added deprecation warnings. Should be removed. Use Map Editor + Geometry Editor instead.

10. **zip-manager** - Well structured, could add search/filter

**COMMON ISSUES ADDRESSED:**
- ✅ Deprecated lifecycle methods removed from image-preview, script-editor
- ✅ Added consistent `.editor-tool-container` CSS class for uniform framing
- ✅ Fixed editor tools to use flexbox for proper overflow/scroll handling
- Remaining: Mix of class/functional components, debug code, hardcoded values

### 7. Code Deduplication  
- [x] Identify shared code between editor and engine
- [x] Create ObjHelper utility (pixospritz/src/engine/utils/ObjHelper.js)
- [x] Create CameraController utility (pixospritz/src/engine/utils/CameraController.js)
- [x] Create shared packages structure

**SHARED PACKAGES CREATED:**

`packages/` directory created with npm workspace structure:

1. **packages/math/** - ✅ CREATED
   - `vector.js` - Coord, Vector, Vector4 classes + vec3 functional API + utilities
   - `matrix4.js` - Matrix operations (perspective, lookAt, translate, rotate, multiply, scale)
   - `index.js` - Unified exports
   - `package.json` - @pixospritz/math package config

2. **packages/webgl-utils/** - (Future)
   - createShader, createProgram
   - TextureLoader class
   - Source: editor/src/shared/webgl-utils.js + ObjModelViewer.jsx

3. **packages/cutscene-parser/** - (Future)
   - PxcParser class with parseLine, parse
   - Event type definitions
   - Source: editor/src/cutscene-tool/CutscenePlayer.jsx + engine/core/cutscene/PxcPlayer.js

**FILES CREATED:**
- `packages/math/` - Complete math package with vector and matrix utilities
- `packages/README.md` - Documentation for shared packages
- `ObjHelper.js` - Clean OBJ/MTL parser for gradual migration
- `CameraController.js` - Unified camera controls for both Y-up and Z-up systems

**MIGRATION NOTES:**
- Packages use ES modules (`"type": "module"`)
- Old files can re-export from packages during gradual migration
- npm workspaces can be configured in root package.json

---

## Progress Log

### Session 1 - November 25, 2025
- Created TODO.md and NOTES.md for tracking
- Completed initial analysis of:
  - Cutscene system (PxcPlayer.js vs CutscenePlayer.jsx)
  - Picking shader system (picker shaders and render manager)
  - OBJ loader implementations (engine OBJ lib vs ObjModelViewer)
  - Camera controls (debug mode and engine camera)
  - Console styling (App.css pointer-events issue identified)

### Session 2 - November 25, 2025
- **Task 1 COMPLETED:** Enhanced PxcPlayer.js with full rendering capabilities:
  - HUD canvas integration for dialogue boxes
  - Complete DSL parsing (backdrop, char, dialogue, cutin, hooks, transitions, wait, end)
  - Asset loading from ZIP/resources
  - Audio system (BGM, SFX, Voice blocking)
  - Typewriter text animation with configurable speed
  
- **Task 2 COMPLETED:** Fixed Picking Shader system:
  - Root cause: shader program switching in setMatrixUniforms
  - Added `isPickerPass` flag to RenderManager
  - Updated all drawable objects to conditionally set uniforms
  - Files modified: manager.js, picker/init.js, sprite.js, zone.js, object.js, animatedTile.js

### Session 3 - November 25, 2025
- **Console Click/Touch Event Fix:**
  - Fixed WebGLView.jsx event handling with proper coordinate transformation
  - Added `canvasX`/`canvasY` pre-computed coordinates to events
  - Added touch event handlers (onTouchStart, onTouchEnd, onTouchMove, onTouchCancel)
  - Added `touchAction: 'none'` and `cursor: 'pointer'` to HUD canvas
  - Fixed gamepad input handler to use getBoundingClientRect() for accurate offset calculation
  - Fixed `eventTouches` normalization to handle all event types (mouse, click, touch, changedTouches)
  
- **Console Resize Fix:**
  - Added `handleResize()` method to GLEngine (core/index.js)
  - Added ResizeObserver in WebGLView to detect canvas resize
  - Notifies RenderManager, InputManager, and HUD of size changes
  
- **Console CSS Improvements:**
  - Changed overflow from `visible` to `hidden` to prevent layout issues
  - Added flexbox layout for proper content sizing
  - Reordered z-index: content at 10, scanlines at 20, glow at 21 (all non-interactive)

### Session 4 - November 25, 2025
- **Image Preview Improvements:**
  - Shift+scroll required for zoom (no interference with normal page scroll)
  - Added "Shift+Scroll to zoom" hint in toolbar
  - Improved layout with proper flexbox for consistent framing
  - Fixed container overflow and sizing
  
- **Script Editor Modernization:**
  - Converted from class component to functional component with hooks
  - Removed deprecated `componentWillReceiveProps`
  - Added Ctrl+S / Cmd+S keyboard shortcut for save
  - Added "unsaved changes" indicator
  - Improved layout with proper flexbox
  - Save button now disabled when no changes
  
- **OBJ Model Viewer Complete Rewrite:**
  - Now accepts props: `objContent`, `mtlContent`, `textures`, `textureBasePath`
  - Auto-loads MTL and textures from zip when OBJ is selected
  - Parses `mtllib` reference from OBJ to find associated MTL file
  - Parses MTL for `map_Kd` texture references
  - Loads textures from zip as data URIs
  - Auto-fits camera to model bounds
  - Added loading state and error messages
  - Added mesh/texture count display
  - Added "Drag to rotate • Scroll to zoom" hint
  
- **Model Preview Detection Fix:**
  - Improved OBJ detection to handle comments at start of file
  - Checks for OBJ signatures: #, mtllib, o, g, v, vt, vn, f, usemtl
  
- **app.jsx renderModelPreview Rewrite:**
  - Now discovers and loads MTL files referenced in OBJ
  - Parses MTL to find texture references
  - Loads all referenced textures from zip
  - Passes complete data to ModelPreview component
  
- **Editor CSS Improvements:**
  - Added `.editor-tool-container` class for consistent framing
  - Added `.editor-tool-toolbar` for uniform toolbar styling
  - Added `.editor-tool-content` for content areas
  - Added `.editor-tool-canvas` for WebGL canvases
  - Added responsive adjustments for mobile
  
- **Model Preview Layout:**
  - Fixed GLTF/GLB viewer layout
  - Consistent framing with other tools

### Session 5 - November 25, 2025
- **Click Handler Fix COMPLETED:**
  - Fixed menu.js and prompt.js hookListener to normalize touch/mouse events
  - Added `normalizeTouches()` helper function that handles:
    - Pre-computed canvasX/canvasY from WebGLView
    - Touch events with touches array
    - Touch end events with changedTouches
    - Mouse events with clientX/clientY
    - Legacy format with touches property
  - Both files now properly extract coordinates regardless of event type

- **Resize Handler Fix COMPLETED:**
  - Added `handleResize()` method to RenderManager
  - Added `handleResize()` method to HUD
  - RenderManager updates viewport and projection matrix on resize
  - HUD re-acquires context reference on resize

- **Shared Packages Structure CREATED:**
  - Created `packages/` directory
  - Created `packages/README.md` with documentation
  - Created `packages/math/` with:
    - `package.json` for @pixospritz/math
    - `vector.js` with Coord, Vector, Vector4, vec3, utility functions
    - `matrix4.js` with create, perspective, lookAt, translate, rotate, multiply, scale
    - `index.js` with unified exports

---

## Remaining Tasks (Testing Phase)
- [ ] Test cutscene playback with existing .pxc files
- [ ] Test selection in tactics mode (picker shader)
- [ ] Test on various browsers
- [ ] Test OBJ loading with existing models
- [ ] Gradual migration to use shared packages

## Status Legend
- [ ] Not Started
- [~] In Progress
- [x] Completed
- [!] Blocked/Issue
