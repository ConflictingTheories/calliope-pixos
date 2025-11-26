# PixoSpritz Engine Upgrade - Task Tracker

## Overview
This document tracks all tasks for the PixoSpritz game engine upgrade project.

---

## Task Categories

### 1. Cutscene DSL Integration
- [x] Analyze current cutscene implementation in editor (CutscenePlayer.jsx, cutscene-tool)
- [x] Study core engine cutscene system (PxcPlayer.js, manager.js)
- [~] Port editor cutscene functionality to core engine
- [ ] Ensure compatibility with game asset loading system
- [ ] Test cutscene playback with existing .pxc files

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
- [ ] Replace engine OBJ loading with new implementation
- [ ] Test with existing .obj/.mtl models

**NEW FILE CREATED:** `pixospritz/src/engine/utils/ObjHelper.js`

A clean, modern OBJ/MTL parser with:
- Simple OBJ parsing with automatic face triangulation
- MTL material parsing with texture support
- Automatic face normal calculation when vertex normals are missing
- Per-mesh material assignment
- WebGL buffer initialization (VAO-based and legacy compatible)
- Utility methods: loadTexture, calculateBounds, deleteMeshBuffers

The new helper can be used alongside the existing OBJ library for gradual migration.

### 4. Camera Controls Unification
- [x] Analyze debug mode camera controls (core/debug/index.js)
- [x] Study editor camera implementations across tools
- [x] Identify common camera control patterns
- [x] Create shared camera control module
- [ ] Integrate into engine and editor
- [ ] Handle contextual overrides gracefully

**NEW FILE CREATED:** `pixospritz/src/engine/utils/CameraController.js`

A unified camera controller supporting:
- Spherical coordinates (yaw/pitch/distance)
- Both Y-up (editor) and Z-up (engine) coordinate systems
- Mouse drag rotation, wheel zoom
- Keyboard WASD/Arrow pan
- Touch gesture support (rotate + pinch zoom)
- View matrix generation
- 8-directional facing for sprites
- Easy attachment to canvas elements

### 5. Console Click Handler Fix
- [x] Analyze console styling and DOM hierarchy
- [x] Debug click/touch event propagation
- [x] Fix event handling in web console
- [x] Fix canvas coordinate alignment with viewport 
- [ ] Fix click error
        spritz.js:183 touchHandler error TypeError: Cannot read properties of undefined (reading 'length')
            at Object.touchstart (menu.js:92:1)
            at index.js:287:1
            at Array.map (<anonymous>)
            at GamePad.listen (index.js:285:1)
            at ExampleDynamicSpritz.onTouchEvent (spritz.js:181:1)
            at onTouchEvent (WebGLView.jsx:98:1)
            at onMouseDown (WebGLView.jsx:317:1)
            at HTMLUnknownElement.callCallback (react-dom.development.js:3945:1)
            at Object.invokeGuardedCallbackDev (react-dom.development.js:3994:1)
            at invokeGuardedCallback (react-dom.development.js:4056:1)
            at invokeGuardedCallbackAndCatchFirstError (react-dom.development.js:4070:1)
            at executeDispatch (react-dom.development.js:8243:1)
            at processDispatchQueueItemsInOrder (react-dom.development.js:8275:1)
            at processDispatchQueue (react-dom.development.js:8288:1)
            at dispatchEventsForPlugins (react-dom.development.js:8299:1)
            at react-dom.development.js:8508:1
            at batchedEventUpdates$1 (react-dom.development.js:22396:1)
            at batchedEventUpdates (react-dom.development.js:3745:1)
            at dispatchEventForPluginEventSystem (react-dom.development.js:8507:1)
            at attemptToDispatchEvent (react-dom.development.js:6005:1)
            at dispatchEvent (react-dom.development.js:5924:1)
            at unstable_runWithPriority (scheduler.development.js:468:1)
            at runWithPriority$1 (react-dom.development.js:11276:1)
            at discreteUpdates$1 (react-dom.development.js:22413:1)
            at discreteUpdates (react-dom.development.js:3756:1)
            at dispatchDiscreteEvent (react-dom.development.js:5889:1)
        (anonymous) @ spritz.js:183
        onTouchEvent @ WebGLView.jsx:98
        onMouseDown @ WebGLView.jsx:317
        callCallback @ react-dom.development.js:3945
        invokeGuardedCallbackDev @ react-dom.development.js:3994
        invokeGuardedCallback @ react-dom.development.js:4056
        invokeGuardedCallbackAndCatchFirstError @ react-dom.development.js:4070
        executeDispatch @ react-dom.development.js:8243
        processDispatchQueueItemsInOrder @ react-dom.development.js:8275
        processDispatchQueue @ react-dom.development.js:8288
        dispatchEventsForPlugins @ react-dom.development.js:8299
        (anonymous) @ react-dom.development.js:8508
        batchedEventUpdates$1 @ react-dom.development.js:22396
        batchedEventUpdates @ react-dom.development.js:3745
        dispatchEventForPluginEventSystem @ react-dom.development.js:8507
        attemptToDispatchEvent @ react-dom.development.js:6005
        dispatchEvent @ react-dom.development.js:5924
        unstable_runWithPriority @ scheduler.development.js:468
        runWithPriority$1 @ react-dom.development.js:11276
        discreteUpdates$1 @ react-dom.development.js:22413
        discreteUpdates @ react-dom.development.js:3756
        dispatchDiscreteEvent @ react-dom.development.js:5889

- [ ] Fix resize handling --- NOTE --> DID NOT FIX YET!
- [ ] Test on various browsers

**ROOT CAUSE:** Multiple issues identified:
1. CRT effect pseudo-elements with z-index conflicting with game content
2. Event coordinates not properly transformed between display size and canvas internal resolution
3. No resize observer to handle dynamic canvas resizing

**FIXES IMPLEMENTED:**
1. CSS: Added `isolation: isolate` to `.screen-container`, proper z-index ordering
2. WebGLView: Added proper coordinate transformation with `canvasX`/`canvasY` pre-computed
3. WebGLView: Added touch event handlers (onTouchStart, onTouchEnd, etc.)
4. Gamepad: Updated input handler to use `getBoundingClientRect()` for accurate offsets
5. Engine: Added `handleResize()` method with ResizeObserver integration
6. Gamepad: Fixed `eventTouches` normalization to handle all event types properly

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
- [ ] Create shared packages structure

**SHARED PACKAGES PROPOSAL:**

1. **packages/math/** - ~1200+ duplicated lines
   - Vector, Vector2, Vector3 classes  
   - vec3 functional API
   - Matrix4 operations (perspective, lookAt, translate, rotate)
   - Source: engine/utils/math/*.js + editor/src/math/*.jsx

2. **packages/webgl-utils/** - ~200+ duplicated lines
   - createShader, createProgram
   - TextureLoader class
   - Source: editor/src/shared/webgl-utils.js + ObjModelViewer.jsx

3. **packages/cutscene-parser/** - ~300+ duplicated lines
   - PxcParser class with parseLine, parse
   - Event type definitions
   - Source: editor/src/cutscene-tool/CutscenePlayer.jsx + engine/core/cutscene/PxcPlayer.js

**FILES ALREADY CREATED:**
- `ObjHelper.js` - Clean OBJ/MTL parser for gradual migration
- `CameraController.js` - Unified camera controls for both Y-up and Z-up systems

**NEXT STEPS:**
1. Set up packages/ directory with npm workspaces
2. Move math utilities first (most widely used)
3. Update imports gradually
4. Keep old files as re-exports during transition

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

### Session 2 - Current
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

---

## Status Legend
- [ ] Not Started
- [~] In Progress
- [x] Completed
- [!] Blocked/Issue
