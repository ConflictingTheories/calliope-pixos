# 🚀 PixoSpritz Focused Roadmap

**The Vision:** Make PixoSpritz the fastest, most accessible, and most enjoyable platform for game creation. This roadmap focuses on the key priorities to achieve that goal.

---

## 🎯 P0: Critical Launch Priorities

These items must be addressed before a public launch. They address critical bugs, security vulnerabilities, and core user experience.

### 1. High-Priority Bug Fixes
- [ ] **Fix Deprecated Lifecycle in `ImagePreview.jsx`:** Replace `componentWillReceiveProps` with a modern equivalent like a React hook to prevent warnings and future breakages.
- [ ] **Remove All Debug `console.log` Statements:** Clean up production code in files like `MapEditor.jsx` and `CutscenePlayer.jsx`.
- [ ] **Fix `mtlUrl` Bug in `ObjModelViewer.jsx`:** Add a null-check to prevent fetch errors when a material file is not defined.
- [ ] **Finalize OBJ Loader Integration:** The new `ObjHelper.js` is created; integrate it fully with the engine's `ResourceManager`.

### 2. First-Time User Experience
- [ ] **Create a First-Time User Wizard:** Guide new users through the process of creating their first game.
- [ ] **Develop Quick-Start Templates:** Provide a library of pre-built game starters that users can clone and modify.
- [ ] **Implement an In-Editor Help System:** Offer contextual tips, tutorials, and a searchable documentation panel.

### 3. Security & Networking Improvements
- [ ] **Implement JWT Authentication:** Secure the server by requiring JWT tokens for all WebSocket connections.
- [ ] **Add Rate Limiting:** Implement a per-client throttle (e.g., 60 messages/sec) to prevent abuse.
- [ ] **Enable TLS (WSS):** Deploy the server with SSL/TLS to encrypt all communication.
- [ ] **Add Input Validation:** Use JSON Schema or a similar library to validate all incoming data from clients.
- [ ] **Implement Reconnection Handling:** Allow players to seamlessly reconnect within a time window (e.g., 5 minutes) if their connection drops.

---

## 🏗️ Part 1: Editor Overhaul

Focus on consistency, power, and ease of use for all content creation tools.

### 1.1 Design System & Shared Components
- [ ] **Complete Design System Migration:** Migrate all remaining inline styles and disparate CSS to the unified design system (`design-system.css`).
- [ ] **Create Core Component Library:** Build and use shared components like `EditorToolbar`, `EditorPanel`, and `WebGLCanvas` to ensure consistency.
- [ ] **Extract Shared Hooks:** Finish extracting duplicated logic into shared hooks, especially `useHistory()` for undo/redo.
- [ ] **Implement Global Keyboard Shortcuts:** Build the help modal and ensure shortcuts are consistent across all editors.

### 1.2 Editor-Specific Improvements

#### 🗺️ Map Editor (High Priority)
- [ ] **Unify 2D/3D Editors:** Combine the two separate map editors into a single, powerful 3D editor.
- [ ] **Implement Core Tools:** Add essential features like copy/paste for regions, a fill tool, and layer visibility toggles.
- [ ] **Auto-Tiling System:** Design and implement an auto-tiling system to accelerate level design.

#### 🎨 Sprite Editor (High Priority)
- [ ] **Animation Preview Panel:** This is a critical feature for artists.
- [ ] **Core Drawing Tools:** Add line, rectangle, circle, and flood-fill tools.
- [ ] **Customization:** Allow for configurable sprite sizes and custom color palettes.
- [ ] **Import/Export:** Enable importing from PNG/GIF and exporting to PNG spritesheets.

#### 📝 Script Editor (High Priority)
- [ ] **PixoScript Language Support:** Implement autocompletion, API documentation on hover, and error/lint markers within the Monaco editor.
- [ ] **Console Output Panel:** Add a panel to show `print()` statements and runtime errors from scripts.

#### 🎬 Cutscene Editor (Medium Priority)
- [ ] **Visual Timeline:** Add a scrubbable timeline view to make sequencing easier.
- [ ] **Branching Dialogue:** Implement nodes for player choices.
- [ ] **New DSL Commands:** Add camera controls (`pan`, `zoom`, `shake`) and screen effects.

---

## ⚙️ Part 2: Engine Enhancements

Focus on performance, new creative features, and stability.

### 2.1 Performance Optimizations
- [ ] **Frustum Culling:** Implement frustum culling to avoid rendering off-screen objects, significantly improving performance in large maps.
- [ ] **Particle Batching:** Use instanced rendering to allow for a massive increase in the number of simultaneous particles.
- [ ] **Level of Detail (LOD):** Implement a distance-based LOD system for models and sprites.

### 2.2 New Engine Features
- [ ] **Screen Shake Effect:** Implement the `CameraEffects.shake()` functionality.
- [ ] **Smooth Camera Follow:** Implement a `SmoothFollow` class for cinematic camera work.
- [ ] **Enhanced Transition System:** Add new transition types (wipes, pixelate, dissolve) and support for easing functions.

---

## 📜 Part 3: Scripting System (PixoScript)

Focus on making the scripting language more powerful and easier to debug.

- [ ] **Implement Coroutines:** Use async generators to add support for Lua-style coroutines, essential for complex game logic.
- [ ] **Generate Source Maps:** Map compiled JavaScript back to the original PixoScript for accurate error reporting.
- [ ] **Build a Debug Library:** Implement `debug.sethook`, `debug.getinfo`, and `debug.traceback` for in-game debugging.
- [ ] **Full API Documentation:** Finish documenting the entire PixoScript API for the auto-generated docs.

---

## 🌐 Part 4: Testing & Deployment

Focus on ensuring the project is stable, maintainable, and ready for production.

### 4.1 Testing Infrastructure
- [ ] **Set Up Unit Testing:** Configure Vitest and write unit tests for core logic, starting with the PixoScript parser and math libraries.
- [ ] **Set Up E2E Testing:** Configure Playwright and write end-to-end tests for critical user flows like creating a project and using the AI generator.

### 4.2 State Persistence & Scalability
- [ ] **Integrate Redis:** Use Redis for persisting zone and player state to enable multi-server deployments.
- [ ] **Implement Delta Synchronization:** Optimize network traffic by sending only state changes (`deltas`) instead of the full state on every update.

---

## ✅ Recently Completed

This is a summary of major tasks that have been successfully implemented, providing context on recent progress.

- **Picker Shader System Fix:** Identified and fixed the root cause where objects would switch back to the main shader before the picking draw call. The system now correctly uses the picking shader.
- **Camera Controls Unification:** Created a unified `CameraController.js` that supports both Y-up (editor) and Z-up (engine) coordinate systems, resolving inconsistencies.
- **Console Click Handler Fix:** Resolved an issue where CSS pseudo-elements were intercepting mouse/touch events, blocking clicks on the game canvas.
- **Initial Code Deduplication:** Began the process of moving duplicated code into shared packages. Created `ObjHelper.js` and `CameraController.js` as the first step.
- **Cutscene DSL Engine Integration:** Enhanced the engine's `PxcPlayer` to handle direct rendering of cutscenes to the HUD, including dialogue and effects.
- **Comprehensive Code Review:** Audited all editor tools and engine components, identifying key areas for improvement and bugs, which formed the basis of this roadmap.
