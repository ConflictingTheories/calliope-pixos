# Core-JS Feature Audit

## WebGL2 Rendering (RenderManager)
**File:** `src/engine/core/render/manager.js`
- [x] Structure/Composition Check: Class is too large (God Object). Handles Shaders, Buffers, Transitions, Skybox, Picking.
  - Recommendation: Extract `TransitionManager` and `ShaderManager`.
- [x] Duplication Check: Shader compilation logic is reused well via `loadShader`, but specific program inits (`initShaders`, `initTransitionProgram`) are separate.
- [x] JSDoc Verification: Mostly good.
- [x] Deprecated Code: `transition()` method is explicitly deprecated. **Action: Remove.**
- [ ] Missing Features: `activateShaderEffectProgram` is referenced in comments but missing in implementation.

## Sprite System
**File:** `src/engine/core/scene/sprite.js`
- [x] Dead code check: Clean.
- [x] Animation logic verification: Logic is distributed. `Sprite` stores state, `Action` (e.g. `Move`) updates it. No central animation ticker in `Sprite`.
  - Recommendation: Ensure `Action` system robustly handles animation frames.
- [x] Naming: Consistent (`draw`, `onLoad`, `interact`).

## Zone/World System
**Files:** `src/engine/core/scene/zone.js`, `world.js`
- [x] Structure: `World` handles Zone management and Network avatars. `Zone` handles Tile/Object rendering.
- [x] Transition logic: `World.js` has transition logic in `loadZoneFromZip` (seen in outline context).
- [x] Findings: `World` class seems to mix Network/Multiplayer logic with Scene management. Consider extracting `NetworkAvatarManager`.

## Action Queue
**Files:** `src/engine/actions/*.js`
- [x] Audit for deprecated actions: `move.js` has hardcoded frame counts (4). `script.js` is clean.
- [x] Verify completion callbacks: `onStep` and `completed` flags used consistently.
- [x] Findings: Simple mixin pattern. `move.js` could be more flexible with animation frames.

## HUD/UI System
**File:** `src/engine/core/hud/index.js`
- [x] Dead code check: Clean.
- [x] Button/Menu consistency: Basic.
- [x] Textbox: `textScrollBox` class inside `index.js`. Recommendation: Extract to separate file.
- [x] Debug overlay: `drawHeightDebugOverlay` performs 3D projection; acceptable for debug but slightly leaky abstraction.

## Cutscene System
**Files:** `src/engine/core/cutscene/manager.js`, `PxcPlayer.js`
- [x] DSL command verification: `PxcPlayer` implements a rich DSL (`@char`, `@backdrop`, `*Cutin`).
- [x] Deprecated code: `CutsceneManager.js` seems to be a simpler/older implementation that doesn't fully integrate with HUD (e.g. doesn't load backdrop images). `PxcPlayer` is the superior implementation.
- [x] Findings: `PxcPlayer` creates `new Audio()` directly, bypassing `AudioLoader` / Engine mixer. Recommendation: Use `engine.audio` for consistent volume control.
