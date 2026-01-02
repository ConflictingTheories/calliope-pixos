# 📍 CODEBASE INVENTORY & MAPPING

**Purpose:** Quick reference for finding existing code related to gameplan tasks  
**Usage:** Before starting each task, check what already exists

---

## PHASE 0: CRITICAL LAUNCH BLOCKERS

### Task 0.1.1 - React Lifecycle Deprecations

**File to Fix:**
- `packages/editor/src/components/ImagePreview.jsx` - Uses `componentWillReceiveProps`

**How to check:**
```bash
grep -r "componentWillReceiveProps" packages/editor/src/
grep -r "componentWillMount" packages/editor/src/
grep -r "componentWillUpdate" packages/editor/src/
```

**How to fix:**
```javascript
// Before:
componentWillReceiveProps(nextProps) {
  if (nextProps.image !== this.props.image) {
    this.loadImage(nextProps.image);
  }
}

// After:
useEffect(() => {
  loadImage(image);
}, [image, loadImage]);
```

---

### Task 0.1.2 - Console.log Cleanup

**Files likely to have debug logs:**
- `packages/editor/src/editors/MapEditor.jsx`
- `packages/editor/src/editors/CutscenePlayer.jsx`
- `packages/editor/src/systems/ProjectManager.js`
- `packages/core/src/engine/scripting/ScriptEngine.js`

**How to find:**
```bash
grep -n "console.log" packages/editor/src/editors/MapEditor.jsx
grep -rn "console.log" packages/editor/src/ --include="*.js" --include="*.jsx"
```

**How to replace:**
- Production logs → Remove
- Debug logs → Use `logger.debug()` with env flag
- Important info → Use `logger.info()`

**Allowed console usage:**
```javascript
// OK - package startup
console.log('[EditorUI] Starting editor with config:', config);

// NOT OK - debug during development
console.log('Current selection:', selection); // Remove in production

// OK - Using logger system
if (DEBUG_MODE) {
  logger.debug('State change:', oldState, newState);
}
```

---

### Task 0.1.3 - OBJ Loader MTL Bug Fix

**Current Code:**
- `packages/editor/src/components/ObjModelViewer.jsx` (has the bug)
- `packages/editor/src/utils/ObjHelper.js` (new utility)

**What to fix:**
```javascript
// BEFORE - mtlUrl might be undefined, causing fetch error
const mtlResponse = await fetch(mtlUrl);

// AFTER - check if mtlUrl exists
const mtlData = mtlUrl ? await fetch(mtlUrl) : null;
```

**Related files to check:**
```
packages/editor/src/
├── components/ObjModelViewer.jsx (FIX)
└── utils/ObjHelper.js (NEW)

packages/core/src/engine/
├── ResourceManager.js (INTEGRATE)
└── loaders/
    └── ObjLoader.js (CHECK)
```

---

### Task 0.1.4 - OBJ Loader Full Integration

**Files involved:**
- `packages/editor/src/utils/ObjHelper.js` (already created)
- `packages/core/src/engine/ResourceManager.js` (add OBJ support)

**Integration points:**
```javascript
// In ResourceManager.js, add:
const ObjHelper = require('./loaders/ObjHelper');

ResourceManager.registerLoader('obj', {
  async load(path) {
    return ObjHelper.loadOBJ(path);
  }
});

// Usage:
const model = await resourceManager.load('models/player.obj', 'obj');
```

---

### Task 0.2.1 - JWT Authentication

**Current Server Code:**
- `packages/server/src/index.js` - Server entry point
- `packages/server/src/systems/SessionManager.js` - Session handling

**What to add:**
```
packages/server/src/
├── auth/
│   ├── JwtManager.js (NEW)
│   └── TokenValidator.js (NEW)
├── middleware/
│   └── authenticate.js (NEW)
└── config/
    └── auth.config.js (NEW)
```

**Integration in WebSocket:**
```javascript
// In WebSocket connection handler:
const token = url.searchParams.get('token');
if (!JwtManager.verify(token)) {
  socket.close(4001, 'Unauthorized');
  return;
}
```

---

### Task 0.2.2 - Rate Limiting

**Location to add:**
- `packages/server/src/systems/RateLimiter.js` (NEW)

**Tracking per client:**
```javascript
class RateLimiter {
  constructor(maxMessagesPerSecond = 60) {
    this.clients = new Map(); // Map<clientId, MessageTracker>
    this.maxMessages = maxMessagesPerSecond;
  }
  
  isAllowed(clientId) {
    // Check if client exceeded limit
  }
}
```

---

### Task 0.2.3 - TLS/WSS Support

**Current config:**
- `packages/server/src/index.js` - Server creation
- Check `package.json` for https module

**What to add:**
```javascript
// In server startup:
const https = require('https');
const fs = require('fs');

const options = {
  cert: fs.readFileSync(process.env.CERT_PATH),
  key: fs.readFileSync(process.env.KEY_PATH)
};

const httpsServer = https.createServer(options);
```

---

### Task 0.2.4 - Input Validation

**Location to add:**
- `packages/server/src/validation/` (NEW)

**Schema file:**
```javascript
// packages/server/src/validation/schemas.js
const messageSchemas = {
  'player:move': {
    type: 'object',
    properties: {
      x: { type: 'number', min: -999999, max: 999999 },
      y: { type: 'number', min: -999999, max: 999999 },
      z: { type: 'number', min: -999999, max: 999999 }
    },
    required: ['x', 'y']
  }
  // ... more schemas
};
```

**Validation middleware:**
```javascript
function validateMessage(message, schema) {
  // Use json-schema library to validate
}
```

---

### Task 0.2.5 - Connection Resilience

**Files to modify:**
- `packages/server/src/systems/SessionManager.js` - Add timeout/recovery
- `packages/server/src/systems/ZoneManager.js` - Preserve zone state

**Session recovery:**
```javascript
class SessionManager {
  reconnectPlayer(playerId, sessionId, timeout = 5 * 60 * 1000) {
    // Check if session still exists within timeout
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      if (Date.now() - session.disconnectTime < timeout) {
        // Restore player state
        return session;
      }
    }
    return null;
  }
}
```

---

### Task 0.3.1 - Onboarding Wizard

**Location to create:**
- `packages/editor/src/components/OnboardingWizard.jsx` (NEW)
- `packages/editor/src/flows/OnboardingFlow.js` (NEW)

**Related existing code:**
- `packages/editor/src/App.jsx` - Main app, check for first-run detection
- `packages/editor/src/systems/ProjectManager.js` - Project creation

**Integration:**
```javascript
// In App.jsx:
const isFirstRun = !localStorage.getItem('pixospritz:hasRunBefore');

if (isFirstRun) {
  return <OnboardingWizard onComplete={() => startEditor()} />;
}

return <EditorUI />;
```

---

### Task 0.3.2 - Quick-Start Templates

**Existing files:**
- `packages/editor/src/ai-generator/services/game-templates.js` - HAS template definitions!

**What's already there:**
```javascript
// From game-templates.js:
export const gameTemplates = [
  {
    id: 'fantasy-adventure',
    name: '🗡️ Fantasy Adventure',
    description: '...',
    // Already has templates!
  }
];
```

**Need to add:**
- `packages/editor/src/templates/quick-start/` - Pre-built starter projects
- Each template should have:
  - `manifest.json` - Game config
  - `sprites/` - Basic sprites
  - `maps/` - Starter maps
  - `callbacks/` - Sample scripts

---

### Task 0.3.3 - In-Editor Help System

**Location to create:**
- `packages/editor/src/components/HelpPanel.jsx` (NEW)
- `packages/editor/src/systems/HelpSystem.js` (NEW)
- `packages/editor/src/data/help-content.json` (NEW)

**How to trigger:**
```javascript
// Global keyboard shortcut (?)
window.addEventListener('keydown', (e) => {
  if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
    showHelpPanel();
  }
});
```

---

## PHASE 1: EDITOR OVERHAUL

### Task 1.1.1 - Design System

**Location:**
- Create: `packages/editor/src/design-system/design-system.css`
- Create: `packages/editor/src/design-system/index.js`

**Check existing:**
```bash
grep -r "--color-" packages/editor/src/
grep -r "--font-" packages/editor/src/
```

**Existing CSS structure:**
- `packages/editor/public/index.html` - Check what's linked
- `packages/editor/src/App.css` - Check existing styles

**Integration:**
```css
/* In App.css or main entry point */
@import './design-system/design-system.css';
```

---

### Task 1.1.2 - Core Component Library

**Existing shared components:**
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

### Task 1.3.1 - Sprite Editor Tools

**Current code:**
```
packages/editor/src/editors/SpriteEditor.jsx
packages/editor/src/sprite-editor/
```

**Tools to add:**
```javascript
// Create: packages/editor/src/sprite-editor/tools/
├── PencilTool.js
├── BrushTool.js
├── LineTool.js
├── ShapeTool.js
├── FillTool.js
├── EyedropperTool.js
└── SelectionTool.js
```

**Canvas handling:**
- Check existing canvas code in SpriteEditor.jsx
- Add tool event handlers

---

### Task 1.3.2 - Animation Preview

**Location:**
- Create: `packages/editor/src/components/AnimationPreview.jsx`

**Existing code:**
- Check `packages/editor/src/sprite-editor/` for frame handling
- `packages/core/src/engine/dynamic/Sprite.js` - Animation data structure

**Integration:**
```javascript
// In SpriteEditor:
const [animationFrame, setAnimationFrame] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);

// Use AnimationPreview component
<AnimationPreview 
  frames={spriteData.frames}
  frameIndex={animationFrame}
  onFrameChange={setAnimationFrame}
  isPlaying={isPlaying}
  onPlayToggle={setIsPlaying}
/>
```

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

### Task 1.4.1 - PixoScript Language Support

**Existing Monaco integration:**
```bash
grep -r "monaco" packages/editor/src/ --include="*.jsx"
grep -r "MonacoEditor" packages/editor/src/
```

**Location to enhance:**
- `packages/editor/src/editors/ScriptEditor.jsx`

**Language definition:**
```javascript
// Create: packages/editor/src/monaco/pixoscript-language.js
monaco.languages.register({ id: 'pixoscript' });
monaco.languages.setMonarchTokensProvider('pixoscript', {
  keywords: ['function', 'if', 'else', 'for', 'while', ...],
  // ... token rules
});
```

**Autocompletion:**
```javascript
monaco.languages.registerCompletionItemProvider('pixoscript', {
  provideCompletionItems(model, position) {
    // Return suggestions from engine API
  }
});
```

---

### Task 1.4.2 - Console Output Panel

**Location:**
- Create: `packages/editor/src/components/ConsolePanel.jsx`

**Integration:**
- Capture `console.log()` output
- Capture `ScriptEngine` errors
- Integrate with ScriptEditor

**Existing logging:**
- Check: `packages/script/src/runtime/ScriptEngine.js`
- Look for: error handling, logging

---

### Task 1.5.1 - Visual Timeline

**Existing code:**
- `packages/editor/src/editors/CutsceneEditor.jsx` - Current implementation
- `packages/editor/src/editors/CutscenePlayer.jsx` - Playback

**What to enhance:**
- Add timeline visualization
- Add scrubber/playhead
- Add timeline controls

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

### Task 2.1.1 - Frustum Culling

**Create:**
- `packages/core/src/engine/rendering/FrustumCuller.js`

**Existing rendering:**
- `packages/core/src/engine/core/RenderManager.js` - Main renderer
- `packages/core/src/engine/core/Camera.js` - Camera definition

**Integration:**
```javascript
// In RenderManager.update():
const visibleObjects = frustumCuller.cull(objects, camera);
visibleObjects.forEach(obj => renderObject(obj));
```

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
