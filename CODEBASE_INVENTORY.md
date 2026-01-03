# 📍 CODEBASE INVENTORY & MAPPING

**Purpose:** Quick reference for finding existing code related to gameplan tasks  
**Usage:** Before starting each task, check what already exists  
**Note:** Completed tasks are moved to `AI_AGENT_COMPLETED_INVENTORY.md`

---

## PHASE 0: CRITICAL LAUNCH BLOCKERS

### ~~Task 0.1.1 - React Lifecycle Deprecations~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

### ~~Task 0.1.2 - Console.log Cleanup~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

### ~~Task 0.1.3 - OBJ Loader MTL Bug Fix~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

### ~~Task 0.1.4 - OBJ Loader Full Integration~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 0.2.1 - JWT Authentication~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 0.2.2 - Rate Limiting~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 0.2.3 - TLS/WSS Support~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 0.2.4 - Input Validation~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 0.2.5 - Connection Resilience~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 0.3.1 - Onboarding Wizard~~ ✅ COMPLETED
> Already implemented at `packages/editor/src/onboarding/FirstTimeWizard.jsx`
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 0.3.2 - Quick-Start Templates~~ ✅ COMPLETED
> Already implemented at `packages/editor/src/ai-generator/services/game-templates.js`
> Contains hello-world, coin-collector, fantasy-adventure, and more templates
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 0.3.3 - In-Editor Help System~~ ✅ COMPLETED
> Implemented at `packages/editor/src/shared/components/HelpPanel.jsx`
> Keyboard shortcuts at `packages/editor/src/shared/hooks/useKeyboardShortcuts.js`
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

---

## PHASE 1: EDITOR OVERHAUL

### ~~Task 1.1.1 - Design System~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 1.1.2 - Core Component Library~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 1.1.3 - Shared Hooks~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 1.1.4 - Global Keyboard Shortcuts~~ ✅ COMPLETED
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 1.2.1 - Unified Map Editor~~ ✅ COMPLETED
> Already implemented: MapEditor3D.jsx provides full 3D editing with 2D grid support
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 1.2.2 - Map Editor Tools~~ ✅ COMPLETED
> Implemented at `packages/editor/src/map-editor/tools/`
> Tools: BrushTool, EraserTool, FillTool, SelectionTool, EyedropperTool, RectangleTool, LineTool
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 1.2.3 - Auto-Tiling System~~ ✅ COMPLETED
> Implemented at `packages/editor/src/map-editor/systems/AutoTiler.js`
> Supports 4-dir and 8-dir neighbor checking, 16-tile and 47-tile sets
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### Task 1.3.1 - Sprite Editor Tools

**Current code:**
```
packages/editor/src/editors/SpriteEditor.jsx
packages/editor/src/sprite-editor/
```

**Tools to add:**
```
packages/editor/src/
├── components/
│   ├── ImagePreview.jsx
│   ├── ObjModelViewer.jsx
│   └── (other components)
```

**New components to create:**
```
packages/editor/src/components/shared/
├── EditorToolbar.jsx
├── EditorPanel.jsx
├── WebGLCanvas.jsx
├── PropertyPanel.jsx
├── LayerPanel.jsx
├── ColorPicker.jsx
├── Grid.jsx
├── Modal.jsx
├── ContextMenu.jsx
└── Toast.jsx
```

---

### Task 1.1.3 - Shared Hooks

**Existing hooks:**
```bash
find packages/editor/src/hooks/ -name "*.js"
```

**New hooks to create:**
```
packages/editor/src/hooks/
├── useHistory.js
├── useSelection.js
├── useAssetLibrary.js
├── useProject.js
├── useKeyboard.js
├── useClipboard.js
└── useSettings.js
```

---

### Task 1.1.4 - Global Keyboard Shortcuts

**Location:**
- Create: `packages/editor/src/systems/KeyboardManager.js`

**Integration in App.jsx:**
```javascript
useEffect(() => {
  const keyboardManager = new KeyboardManager();
  keyboardManager.register('cmd+z', undo);
  keyboardManager.register('cmd+shift+z', redo);
  // ... other shortcuts
}, []);
```

---

### Task 1.2.1 - Unify 2D/3D Map Editors

**Current files:**
```
packages/editor/src/editors/
├── MapEditor2D.jsx
├── MapEditor3D.jsx
└── MapEditor.jsx (which one to use?)
```

**Check:**
```bash
grep -r "MapEditor" packages/editor/src/ --include="*.jsx" --include="*.js"
```

**Plan:**
1. Rename `MapEditor.jsx` → `MapEditorLegacy.jsx`
2. Create new unified `MapEditor.jsx`
3. Import 2D and 3D components
4. Switch based on project type

---

### Task 1.2.2 - Map Editor Tools

**Existing code:**
- `packages/editor/src/editors/MapEditor*.jsx` - Has canvas/rendering

**Tools to implement:**
```javascript
// Create: packages/editor/src/systems/MapTools.js
class MapTools {
  brush = new BrushTool();
  eraser = new EraserTool();
  fill = new FillTool();
  // ... etc
}
```

**Canvas integration:**
```javascript
// In MapEditor component:
const handleCanvasClick = (x, y) => {
  currentTool.apply(x, y, mapData);
};
```

---

### Task 1.2.3 - Auto-Tiling

**Location:**
- Create: `packages/editor/src/systems/AutoTiler.js`

**Existing tileset code:**
```
packages/editor/src/editors/TilesetEditor.jsx
packages/editor/src/ (check for tileset definitions)
```

**Algorithm structure:**
```javascript
class AutoTiler {
  getTileVariant(x, y, surroundings) {
    // Check which tiles surround this position
    // Return appropriate tile variant
    // Support 47-tile (or similar) terrain sets
  }
}
```

---

### ~~Task 1.3.1 - Sprite Editor Tools~~ ✅ COMPLETED
> Implemented at `packages/editor/src/sprite-editor/tools/`
> Tools: PencilTool, BrushTool, EraserTool, FillTool, EyedropperTool, LineTool, RectangleTool, EllipseTool, SelectionTool
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 1.3.2 - Animation Preview~~ ✅ COMPLETED
> Implemented at `packages/editor/src/sprite-editor/AnimationPreview.jsx`
> Features playback controls, speed adjustment, zoom, onion skinning
> Moved to AI_AGENT_COMPLETED_INVENTORY.md
- Add tool event handlers

---

### Task 1.3.2 - Animation Preview

**Location:**
- Create: `packages/editor/src/components/AnimationPreview.jsx`

**Existing code:**
- Check `packages/editor/src/sprite-editor/` for frame handling
- `packages/core/src/engine/dynamic/Sprite.js` - Animation data structure

---

### Task 1.3.3 - Customization

**Palette files:**
- Check: `packages/spritz/` - Asset structure
- Look for: color palette definitions

**Canvas sizing:**
```javascript
// In SpriteEditor:
const [canvasSize, setCanvasSize] = useState({ width: 16, height: 16 });
```

---

### Task 1.3.4 - Import/Export

**Location:**
- Create: `packages/editor/src/utils/SpriteImporter.js`
- Create: `packages/editor/src/utils/SpriteExporter.js`

**Libraries to use:**
- PNG parsing: `packages/core/src/` - Check for image handling
- GIF: Use `gif.js` or similar
- Spritesheet packing: Use `bin-pack` or similar

---

### ~~Task 1.4.1 - PixoScript Language Support~~ ✅ COMPLETED
> Already implemented at `packages/editor/src/shared/pixoscript-language.js`
> Includes tokenizer, completion provider, hover provider, custom theme
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 1.4.2 - Console Output Panel~~ ✅ COMPLETED
> Implemented at `packages/editor/src/script-editor/ConsolePanel.jsx`
> Features: message types, command history, filtering, auto-scroll
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 1.5.1 - Visual Timeline~~ ✅ COMPLETED
> Implemented at `packages/editor/src/cutscene-tool/Timeline.jsx`
> Features: scrubber, zoom, event visualization, playback controls
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### Task 1.5.2 - Branching Dialogue

**Location:**
- Enhance: `packages/editor/src/editors/CutsceneEditor.jsx`

**Check existing:**
- `packages/core/documentation/specifications/cutscenes.md` - DSL spec
- `packages/spritz/cutscenes/` - Example cutscenes

---

### Task 1.5.3 - New DSL Commands

**Current DSL:**
- Check: `packages/core/documentation/specifications/cutscenes.md`
- Implementation: `packages/core/src/engine/cutscenes/CutscenePlayer.js`

**Add commands:**
- Create: `packages/core/src/engine/cutscenes/commands/` - New command classes
- Update parser: `packages/script/src/parser/` - If needed

---

## PHASE 2: ENGINE ENHANCEMENTS

### ~~Task 2.1.1 - Frustum Culling~~ ✅ COMPLETED
> Implemented at `packages/core/src/engine/core/render/FrustumCuller.js`
> Integrated into RenderManager with frustumCuller property
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### ~~Task 2.2.1 - Screen Shake~~ ✅ COMPLETED
### ~~Task 2.2.2 - Smooth Camera Follow~~ ✅ COMPLETED
> Both implemented at `packages/core/src/engine/core/render/CameraEffects.js`
> Includes: shake, follow, zoom, flash, fade, punch effects
> Integrated into RenderManager with cameraEffects property
> Moved to AI_AGENT_COMPLETED_INVENTORY.md

---

### Task 2.1.2 - Particle Batching

**Location:**
- `packages/core/src/engine/rendering/ParticleManager.js` (enhance)

**Check existing:**
- Search: Particle system code
- WebGL2 instancing: ANGLE_instanced_arrays

---

### Task 2.1.3 - Level of Detail (LOD)

**Create:**
- `packages/core/src/engine/rendering/LODManager.js`

**Existing model handling:**
- `packages/core/src/engine/dynamic/Model.js`
- `packages/core/src/engine/dynamic/Sprite.js`

---

### Task 2.2.1 - Screen Shake

**Location:**
- `packages/core/src/engine/rendering/CameraEffects.js` (create if needed)

**Camera integration:**
- `packages/core/src/engine/core/Camera.js`

---

### Task 2.2.2 - Smooth Camera Follow

**Location:**
- `packages/core/src/engine/rendering/CameraController.js`

**Existing camera code:**
- `packages/core/src/engine/core/Camera.js`

---

### Task 2.2.3 - Transition System

**Location:**
- `packages/core/src/engine/rendering/TransitionManager.js` (enhance)

**Existing transitions:**
```bash
grep -r "transition" packages/core/src/ --include="*.js"
```

---

### Task 2.2.4 - Shader Library

**Location:**
- `packages/core/src/engine/shaders/` - Existing shaders

**Check:**
```bash
ls packages/core/src/engine/shaders/
```

**New shaders to add:**
```glsl
// packages/core/src/engine/shaders/effects/
├── crt.glsl
├── scanlines.glsl
├── bloom.glsl
└── ... etc
```

---

## PHASE 3: SCRIPTING SYSTEM

### Task 3.1.1 - Coroutines

**Existing script engine:**
- `packages/script/src/runtime/ScriptEngine.js`

**Add:**
- `packages/script/src/runtime/Coroutines.js`

---

### Task 3.1.2 - Source Maps

**Create:**
- `packages/script/src/compiler/SourceMapGenerator.js`

---

### Task 3.1.3 - Debug Library

**Create:**
- `packages/script/src/stdlib/debug.js`

---

## PHASE 4: TESTING & DEPLOYMENT

### Task 4.1.1 - Unit Testing Setup

**Check:**
```bash
ls packages/*/package.json
grep -i "vitest\|jest" packages/*/package.json
```

**Create:**
- Root: `vitest.config.js`
- Each package: Package-level vitest config

---

### Task 4.1.2 - Core Logic Tests

**Create test files:**
```
packages/*/__tests__/
├── [module].test.js
└── ... many more
```

---

### Task 4.1.3 - E2E Testing

**Check:**
```bash
ls packages/editor/ | grep -i playwright
```

**Create:**
- `packages/editor/__tests__/e2e/` - E2E tests

---

### Task 4.1.4 - CI/CD

**Check:**
```bash
ls .github/workflows/
```

**Create GitHub Actions:**
- `.github/workflows/test.yml`
- `.github/workflows/build.yml`
- `.github/workflows/deploy.yml`

---

## QUICK REFERENCE: File Locations

### Editor Package
```
packages/editor/
├── src/
│   ├── components/          ← UI Components
│   ├── editors/             ← Map, Sprite, Script editors
│   ├── design-system/       ← Design tokens (TO CREATE)
│   ├── hooks/               ← React hooks (TO CREATE MORE)
│   ├── systems/             ← Manager classes
│   ├── utils/               ← Utility functions
│   ├── data/                ← Static data (templates, etc)
│   ├── ai-generator/        ← AI generation tools
│   └── App.jsx              ← Main entry point
├── __tests__/               ← Tests (TO EXPAND)
├── public/                  ← Static assets
└── package.json
```

### Core Package
```
packages/core/
├── src/
│   ├── engine/
│   │   ├── core/            ← RenderManager, Camera, Audio
│   │   ├── systems/         ← Game systems
│   │   ├── rendering/       ← Graphics pipeline (TO EXPAND)
│   │   ├── dynamic/         ← Sprite, Model, Actor
│   │   ├── events/          ← Event system
│   │   ├── scripting/       ← Script integration
│   │   ├── shaders/         ← GLSL shaders (TO EXPAND)
│   │   ├── utils/           ← Helpers
│   │   └── actions/         ← Action system
│   ├── components/          ← React components
│   ├── spritz/              ← Spritz player integration
│   └── index.js             ← Exports
├── documentation/
│   └── specifications/      ← API specs
├── __tests__/               ← Tests (TO EXPAND)
└── package.json
```

### Script Package
```
packages/script/
├── src/
│   ├── parser/              ← Language parser
│   ├── compiler/            ← Compiler (TO EXPAND for source maps)
│   ├── runtime/             ← Runtime execution (TO EXPAND for coroutines)
│   ├── stdlib/              ← Built-in library (TO EXPAND)
│   └── index.js
├── __tests__/               ← Tests (TO EXPAND)
└── package.json
```

### Server Package
```
packages/server/
├── src/
│   ├── systems/             ← Zone, Session, Action Queue management
│   ├── auth/                ← Auth system (TO CREATE)
│   ├── validation/          ← Input validation (TO CREATE)
│   ├── middleware/          ← Middleware (TO CREATE)
│   ├── config/              ← Configuration
│   └── index.js
├── __tests__/               ← Tests (TO EXPAND)
└── package.json
```

---

## DEPENDENCY INSTALLATION REFERENCE

**If adding new packages**, update:
1. `package.json` in relevant package
2. Root `package.json` (if workspace dependency)
3. Run `npm install`

**Common packages to potentially add:**
- Testing: `vitest`, `@vitest/ui`, `@testing-library/react`
- E2E: `@playwright/test`
- Validation: `jsonschema` or `zod`
- Graphics: Already have WebGL built-in
- Math: Already have `pixospritz-math`

---

**Last Updated:** January 2, 2026  
**Status:** Complete inventory of codebase
