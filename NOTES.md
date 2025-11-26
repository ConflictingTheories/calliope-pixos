# PixoSpritz Engine Upgrade - Implementation Notes

## Overview
This document contains detailed implementation notes, decisions, and explanations for all code changes made during the PixoSpritz engine upgrade project.

---

## Project Architecture Summary

### Core Components
- **pixospritz/src/engine**: Core game engine
  - `core/`: Core systems (rendering, input, scene management, etc.)
  - `actions/`: Action system for game behaviors
  - `events/`: Event handling
  - `scripting/`: PixoScript interpreter
  - `shaders/`: WebGL shaders
  - `utils/`: Utilities and loaders

- **editor/src**: Development tools
  - Various editors for sprites, maps, tilesets, cutscenes, etc.
  - WebGL preview components
  - Shared utilities

- **console/src**: Web console for running games

- **pixoscript/src**: Lua-like scripting engine

- **spritz/**: Game assets (maps, sprites, cutscenes, etc.)

---

## Task 1: Cutscene DSL Integration

### Analysis Notes

**Current State:**
1. **Editor CutscenePlayer.jsx (1028 lines)**: Full-featured React component with:
   - Complete DSL parser supporting all commands (@backdrop, @char, @action, @do, @transition, @end)
   - Multi-line dialogue with `"""` syntax
   - Bracket metadata parsing `[key=value, flag]`
   - Audio support (BGM, SFX, voice with blocking)
   - Visual rendering (backdrops, portraits, cutins, dialogue boxes)
   - Typewriter text effect with configurable speed
   - Auto-advance and manual skip functionality

2. **Engine PxcPlayer.js (501 lines)**: Partial implementation with:
   - Basic DSL parser (same command set)
   - Callback-based rendering (relies on external UI)
   - Audio support via engine.assetLoader
   - Missing: Direct visual rendering, typewriter effect

3. **Engine CutsceneManager (manager.js, 235 lines)**: Step-based system with:
   - Different architecture - uses step types not DSL commands
   - Step types: wait, transition, load_zone, action, set_backdrop, show_cutout
   - Does NOT parse .pxc DSL directly

**Key Differences:**
- Editor renders UI directly via React
- Engine uses callbacks, expects external UI rendering
- CutsceneManager uses different step format than PxcPlayer

**Integration Strategy:**
1. Enhance PxcPlayer to have self-contained rendering using HUD canvas
2. Add integration between PxcPlayer and CutsceneManager
3. Create bridge to allow .pxc files to generate CutsceneManager steps
4. Ensure asset loading uses engine's resource system

### Implementation Decisions
- PxcPlayer will be enhanced to render directly to HUD canvas
- CutsceneManager will be updated to accept PxcPlayer as step handler
- New `dialogue` step type will be added to CutsceneManager

### Key Files Modified
- `pixospritz/src/engine/core/cutscene/PxcPlayer.js`
- `pixospritz/src/engine/core/cutscene/manager.js`
- `pixospritz/src/engine/core/hud/index.js` (for dialogue rendering)

---

## Task 2: Picking Shader System Fix

### Analysis Notes

**Current Implementation:**
1. **Picker Shaders** (`picker/vs.js`, `picker/fs.js`, `picker/init.js`):
   - Vertex shader transforms vertices with scale uniform
   - Fragment shader outputs `u_id` as color with alpha from texture
   - Init sets up matrix uniforms and attribute locations
   
2. **RenderManager.activatePickerShaderProgram()**:
   - Switches to picker shader program
   - Has TODO note: framebuffer approach "not working as expected"
   - Falls back to rendering to screen for full-screen picking pass
   
3. **GLEngine.getSelectedObject()** (`core/index.js`):
   - Reads pixel at mouse position
   - Decodes RGB to ID: `id = R + (G << 8) + (B << 16)`
   - Handles sprite, object, and tile selection
   - Only processes on left click (`isActionPressed('select')`)

**ROOT CAUSE IDENTIFIED:**
The picking shader is never actually used during drawing! The problem is in `sprite.js`, `object.js`, and `zone.js`:

```javascript
// sprite.js draw() method:
// 1. Calls main shader's setMatrixUniforms (this calls gl.useProgram(mainShader))
this.engine.renderManager.shaderProgram.setMatrixUniforms({...});

// 2. Binds buffers
this.engine.renderManager.bindBuffer(...);

// 3. Calls picker shader's setMatrixUniforms (calls gl.useProgram(picker))
this.engine.renderManager.effectPrograms['picker'].setMatrixUniforms({...});

// 4. IMMEDIATELY calls main shader's setMatrixUniforms AGAIN!
//    This switches back to main shader right before drawing!
this.engine.renderManager.shaderProgram.setMatrixUniforms({...});

// 5. Draws - but main shader is now active, NOT picker!
gl.drawArrays(...);
```

Each shader's `setMatrixUniforms` calls `gl.useProgram()` to activate itself.
So even though the render loop activates picker, the sprites/objects switch 
back to the main shader before drawing.

**Solution:**
Add an `isPickerPass` flag to RenderManager that objects can check. During 
picker pass, objects should ONLY call picker's setMatrixUniforms, not main shader's.

Alternatively, refactor so setMatrixUniforms doesn't call useProgram, and 
manage shader activation centrally in RenderManager.

**Fix Strategy:**
1. Add `isPickerPass` boolean flag to RenderManager
2. Set flag to `true` in `activatePickerShaderProgram()`  
3. Set flag to `false` in `activateShaderProgram()`
4. Modify sprite/object/zone draw methods to check flag and skip main shader uniforms during picking
5. Remove `gl.useProgram()` call from picker's `setMatrixUniforms` (caller ensures correct program is active)

### Implementation Decisions
- Adding `isPickerPass` flag is less invasive than restructuring the entire uniform system
- Objects will check the flag and conditionally set only the relevant shader uniforms
- This maintains backward compatibility with existing rendering logic

### Key Files Modified
- `pixospritz/src/engine/core/render/manager.js` - Add isPickerPass flag
- `pixospritz/src/engine/shaders/picker/init.js` - Remove gl.useProgram call
- `pixospritz/src/engine/core/scene/sprite.js` - Check isPickerPass flag
- `pixospritz/src/engine/core/scene/zone.js` - Check isPickerPass flag
- `pixospritz/src/engine/core/resource/object.js` - Check isPickerPass flag
- `pixospritz/src/engine/dynamic/animatedTile.js` - Check isPickerPass flag

---

## Task 3: OBJ Loader Replacement

### Analysis Notes

**Current Engine OBJ Loader** (`utils/obj/`):
- Uses webgl-obj-loader library (exports OBJ namespace)
- Complex with Layout, Material, Mesh classes
- Has `downloadModels`, `downloadMeshes`, `initMeshBuffers`
- Verbose API, requires specific buffer layout management

**Editor ObjModelViewer** (`model-preview/ObjModelViewer.jsx`):
- Self-contained, simple implementation
- WebGL2 with modern shader syntax
- Clean parseOBJ() and parseMTL() functions
- Direct VAO/buffer management
- Proper normal calculation (face normals when vertex normals missing)
- Material properties: Ka, Kd, Ks, Ns, map_Kd (diffuse texture)

**Key Advantages of Viewer Approach:**
1. Simpler, more maintainable code
2. Better handling of face normals
3. Cleaner material parsing
4. Uses VAO (Vertex Array Objects) for cleaner state
5. Multi-mesh support with per-mesh materials

**Migration Plan:**
1. Create `ObjLoader.js` helper class in engine utils
2. Port parseOBJ() and parseMTL() functions
3. Add texture loading integration with engine's resource system
4. Create mesh rendering helper compatible with engine shaders
5. Replace existing OBJ loading calls

### Implementation Decisions
- Will create new `ObjHelper.js` class
- Keep compatibility with existing shader attribute layout
- Support both WebGL1 and WebGL2 (engine uses WebGL2)

### Key Files Modified
- New: `pixospritz/src/engine/utils/ObjHelper.js`
- Modified: `pixospritz/src/engine/core/resource/object.js`

---

## Task 4: Camera Controls Unification

### Analysis Notes

**Engine Camera** (`core/render/camera.js`):
- Uses yaw/pitch/distance/target spherical coordinates
- `updateViewFromAngles()` computes position from spherical
- `lookAt()` builds view matrix
- `setCamera()` legacy method using cameraAngle/cameraVector
- Z-up coordinate system

**Debug FreeCam** (`core/debug/index.js`):
- Toggles with F5
- Uses pointer lock for mouse look
- WASD/Arrow keys for movement via `translateCam()`
- Mouse wheel for zoom
- Modifies camera.yaw, camera.pitch, calls `updateViewFromAngles()`

**Editor Camera** (`model-preview/ObjModelViewer.jsx`):
- Simpler theta/phi/distance spherical
- Y-up coordinate system
- Mouse drag rotates, wheel zooms
- No keyboard movement

**Issues Identified:**
1. Coordinate system mismatch (Z-up vs Y-up)
2. Different control sensitivities
3. FreeCam pointer lock conflicts with normal input
4. Editor uses React refs, engine uses class properties

**Unification Strategy:**
1. Create shared `CameraController` class
2. Support both coordinate systems via configuration
3. Standardize control sensitivity
4. Add mode-aware input handling
5. Export from engine for editor use

### Implementation Decisions
(To be filled during implementation)

### Key Files Modified
(To be listed)

---

## Task 5: Console Click Handler Fix

### Analysis Notes

**Issue Location**: `console/src/App.css`

**Identified Problem:**
The `.screen-container` and its pseudo-elements (::before for scanlines, ::after for glow) have `pointer-events: none` but:
1. The container uses `overflow: visible` which may affect event bubbling
2. Pseudo-elements overlay the canvas with z-index 99 and 100
3. The child `PixosClient` component has `pointer-events: auto` but may be blocked

**CSS Structure:**
```css
.screen-container {
  position: relative;
  overflow: visible;
}
.screen-container::before { /* scanlines */
  pointer-events: none;
  z-index: 100;
}
.screen-container::after { /* glow */
  pointer-events: none;
  z-index: 99;
}
.screen-container > * {
  pointer-events: auto;
}
```

**Root Cause:**
Pseudo-elements with higher z-index intercept events despite `pointer-events: none` due to stacking context issues.

**Fix Strategy:**
1. Ensure canvas has explicit z-index higher than pseudo-elements OR
2. Move pseudo-elements to separate overlay div that's clearly non-interactive
3. Test touch events specifically

### Implementation Decisions
(To be filled during implementation)

### Key Files Modified
- `console/src/App.css`

---

## Task 6: Editor Tools Review

### Analysis Notes

Comprehensive review of all 10 editor tools in `editor/src/`:

#### 1. Audio Preview (`audio-preview/`)
- **Files**: index.jsx (simple export)
- **Status**: Minimal implementation, exports audio preview component
- **Issues**: None identified

#### 2. Cutscene Tool (`cutscene-tool/`)
- **Files**: CutscenePlayer.jsx (1028 lines), CutsceneTool.jsx, CharacterEditor.jsx
- **CutscenePlayer**: Full DSL parser, React-based renderer
- **Issues**:
  - Large monolithic component (1028 lines)
  - Some state mutation patterns (uses `setState` callbacks properly)
  - Character count system complex but well-structured
- **Recommendations**:
  - Extract DSL parser to shared module
  - Split renderer into smaller components
  - Consider extracting typewriter effect as hook

#### 3. Geometry Editor (`geometry-editor/`)
- **Files**: GeometryEditor.jsx, BlockGeometry.jsx, SlopeGeometry.jsx
- **Purpose**: Edit collision/walkable geometry for tiles
- **Issues**: None critical
- **Recommendations**: Add undo/redo support

#### 4. Image Preview (`image-preview/`)
- **Files**: ImagePreview.jsx
- **Issues**:
  - Uses deprecated `componentWillReceiveProps` lifecycle
  - Should migrate to `getDerivedStateFromProps` or use hooks
- **Recommendations**: Convert to functional component with hooks

#### 5. Map Editor (`map-editor/`)
- **Files**: MapEditor.jsx (1200+ lines), Layer*.jsx, Toolbar.jsx, etc.
- **Purpose**: Main map editing interface
- **Issues**:
  - Very large main component
  - Some debug `console.log` statements remain
  - Complex layer management
- **Recommendations**:
  - Extract layer logic to custom hooks
  - Remove debug logging
  - Add more granular undo steps

#### 6. Model Preview (`model-preview/`)
- **Files**: ObjModelViewer.jsx (500+ lines), ModelPreview.jsx
- **Purpose**: 3D OBJ model viewer
- **Issues**:
  - `mtlUrl` may be undefined causing fetch error
  - Self-contained WebGL - duplicates engine patterns
- **Recommendations**:
  - Add null check for mtlUrl
  - Extract to shared ObjHelper (DONE - created ObjHelper.js)

#### 7. Script Editor (`script-editor/`)
- **Files**: ScriptEditor.jsx, PixoScriptEditor.jsx
- **Purpose**: Edit .pxs PixoScript files
- **Issues**: None critical
- **Recommendations**: Add syntax highlighting improvements

#### 8. Sprite Editor (`sprite-editor/`)
- **Files**: SpriteEditor.jsx (800+ lines), AnimationEditor.jsx, FrameEditor.jsx
- **Purpose**: Edit sprite sheets and animations
- **Issues**:
  - Large component
  - Animation timing calculations complex
- **Recommendations**:
  - Extract animation logic to hooks
  - Add animation preview improvements

#### 9. Tileset Editor (`tileset-editor/`)
- **Files**: TilesetEditor.jsx (600+ lines), TileEditor.jsx
- **Purpose**: Create and edit tilesets
- **Issues**:
  - TODO comments for rendering improvements
  - Some incomplete features noted in code
- **Recommendations**:
  - Complete TODO items
  - Add batch tile operations

#### 10. Zip Manager (`zip-manager/`)
- **Files**: ZipManager.jsx
- **Purpose**: Export/import project as zip
- **Issues**: None critical
- **Status**: Functional

### Proposed Improvements Summary

**High Priority:**
1. Fix deprecated lifecycle in ImagePreview.jsx
2. Fix undefined mtlUrl bug in ObjModelViewer.jsx
3. Remove debug console.log statements

**Medium Priority:**
4. Decompose large components (MapEditor, SpriteEditor, CutscenePlayer)
5. Extract shared logic to custom hooks
6. Complete TODOs in TilesetEditor

**Low Priority:**
7. Add undo/redo to GeometryEditor
8. Improve syntax highlighting in ScriptEditor
9. Standardize error handling patterns

---

## Task 7: Code Deduplication

### Identified Duplications

#### 1. Vector/Matrix Math (~1200 lines duplicated)
**Engine**: `pixospritz/src/engine/utils/math/`
- Vector2, Vector3, Vector4, Matrix4 classes
- normalize, cross, dot, translate, rotate, scale, perspective, lookAt

**Editor**: `editor/src/math/`
- Similar implementations with subtle differences
- Some use Float32Array, some use plain arrays

**Overlap**: ~95% identical functionality

#### 2. Shader Patterns (~200 lines)
**Engine**: `pixospritz/src/engine/shaders/`
- Shader compilation, program linking, uniform management

**Editor**: `editor/src/*-preview/` components
- Each preview component has inline shader compilation
- Similar but not identical patterns

#### 3. Texture Loading (~100 lines)
**Engine**: `engine/core/resource/` 
- Image loading with WebGL texture setup

**Editor**: Various preview components
- Duplicate texture loading code

#### 4. Cutscene Parsing (~300 lines)
**Engine**: `engine/core/cutscene/PxcPlayer.js`
- DSL parser for .pxc files

**Editor**: `editor/src/cutscene-tool/CutscenePlayer.jsx`
- Nearly identical parser with React rendering

**Overlap**: ~80% identical parsing logic

#### 5. Camera/LookAt (~150 lines)
**Engine**: `engine/core/render/camera.js`
- Spherical coordinates, lookAt matrix

**Editor**: `editor/src/model-preview/ObjModelViewer.jsx`
- Similar spherical camera with different coordinate system

**Overlap**: Core math identical, coordinate system differs

#### 6. OBJ Loading (~400 lines)
**Engine**: `engine/utils/obj/` (uses webgl-obj-loader)
**Editor**: `editor/src/model-preview/ObjModelViewer.jsx`
**Overlap**: ~90% feature overlap, different implementations

### Shared Package Proposal

Create `packages/` directory with npm workspaces:

```
packages/
├── math/           # Vector, Matrix, geometry utilities
├── webgl-utils/    # Shader compilation, texture loading
├── obj-loader/     # OBJ/MTL parsing (based on new ObjHelper.js)
├── cutscene-parser/# DSL parsing without rendering
└── camera-controller/ # Unified camera (CameraController.js)
```

**Estimated Savings:**
- Math: ~600 lines (consolidate into one)
- WebGL Utils: ~100 lines
- OBJ Loader: ~200 lines
- Cutscene Parser: ~150 lines
- Camera: ~250 lines
- **Total: ~1300 lines of duplicate code eliminated**

### Files Already Created for Deduplication

1. **ObjHelper.js** (`pixospritz/src/engine/utils/ObjHelper.js`)
   - Clean OBJ/MTL parser
   - 265 lines, standalone
   - Ready for extraction to shared package

2. **CameraController.js** (`pixospritz/src/engine/utils/CameraController.js`)
   - Unified camera controller
   - 507 lines, supports both coordinate systems
   - Ready for extraction to shared package

### Migration Strategy

**Phase 1: Create Package Structure**
- Set up npm workspaces in root package.json
- Create packages/ directory with individual package.json files
- Move math utilities first (most stable, most reused)

**Phase 2: Migrate Engine**
- Import from packages instead of local utils
- Verify all engine functionality preserved
- Update webpack config for package resolution

**Phase 3: Migrate Editor**
- Replace local implementations with package imports
- Update vite config for package resolution
- Test all editor tools

**Phase 4: Cleanup**
- Remove duplicate files
- Update documentation
- Consolidate types/interfaces

---

## Change Log

### Session 1 - Initial Analysis & Implementation
- Initial documentation setup (NOTES.md, TODO.md)
- Completed codebase analysis for all 7 task categories
- Identified root causes for picking, camera, and console issues
- Documented integration strategy for cutscene DSL

### Task 1: Cutscene DSL - COMPLETED
- Enhanced PxcPlayer.js with full rendering capability
- Added HUD canvas integration for dialogue, portraits, backdrops
- Implemented typewriter effect and auto-advance

### Task 2: Picker Shader - COMPLETED
- Root cause: shaders switching during draw due to setMatrixUniforms calling useProgram
- Fix: Added isPickerPass flag to RenderManager
- Modified sprite.js, zone.js, object.js, animatedTile.js to check flag

### Task 3: OBJ Loader - PARTIALLY COMPLETE
- Created ObjHelper.js with clean parser
- Integration with ResourceManager pending

### Task 4: Camera Controls - COMPLETED
- Created CameraController.js (507 lines)
- Supports both Y-up and Z-up coordinate systems
- Provides unified API for engine and editor

### Task 5: Console Click Handler - COMPLETED
- Root cause: z-index stacking context conflicts with pseudo-elements
- Fix: Added isolation:isolate, adjusted z-index values in App.css

### Task 6: Editor Tools Review - COMPLETED
- Reviewed all 10 editor tools
- Documented issues: deprecated lifecycle, undefined variable, debug logging, TODOs
- Created prioritized improvement recommendations

### Task 7: Code Deduplication - COMPLETED (Analysis)
- Identified 6 major duplication areas
- Proposed 5 shared packages
- Created ObjHelper.js and CameraController.js as starting points
- Migration plan documented

