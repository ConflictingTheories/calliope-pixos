# 🔧 PixoSpritz Quick Fix Reference

## CRITICAL BUGS (Fix Today)

### 1. ModeManager Duplicate Method
**File:** `packages/core/src/engine/core/mode/manager.js`
**Line:** ~200
**Issue:** Second `set()` method shadows the first async version
**Fix:** Delete the duplicate method at line 200-237

### 2. play_cutscene Not Working
**File:** `packages/core/src/engine/scripting/PixoScriptLibrary.js`
**Line:** ~202
**Issue:** Marked as "todo - not working"
**Fix:** Implement or remove the function

### 3. Picker Frustum Optimization Broken
**File:** `packages/core/src/engine/core/render/manager.js`
**Line:** ~469
**Issue:** 1x1 pixel picker framebuffer not working, comment says "not working"
**Fix:** Debug the applyPixelFrustum function

---

## HIGH PRIORITY (This Week)

### Server Security
1. Add JWT authentication to WebSocket connections
2. Implement rate limiting (60 msg/sec per client)
3. Add JSON Schema validation for all payloads
4. Enable WSS (TLS) instead of WS

### Editor Consistency
1. Migrate remaining inline styles to design-system.css
2. Create useHistory hook in `shared/hooks/`
3. Create EditorToolbar component
4. Add keyboard shortcut help modals (F1)

### Sprite Editor Basics
1. Add animation preview panel
2. Add configurable sprite size
3. Add drawing tools (line, rect, circle)
4. Add fill (flood fill) tool

---

## DEPRECATIONS TO REMOVE

| File | What | Reason |
|------|------|--------|
| `tileset-editor/` | Entire folder | Marked DEPRECATED in code |
| `RenderManager.js:742` | `transition()` method | Replaced by `startTransition()` |
| `GLEngine.js` | `this.gamepad/keyboard/mouse/touch` | Use `inputManager.*` |

---

## CONSOLE.LOG CLEANUP

These files have debug logging that should use debug-logger.js:

```
packages/core/src/engine/scripting/PixoScriptLibrary.js
packages/editor/src/ai-generator/services/game-package-orchestrator.js
packages/editor/src/map-editor/MapEditor.jsx
packages/editor/src/cutscene-tool/CutscenePlayer.jsx
packages/editor/src/model-preview/ObjModelViewer.jsx
```

---

## QUICK WINS (< 1 hour each)

1. **Cap history stack** - Add `maxHistory: 100` to all editors using history
2. **Add Number.clamp utility** - Remove prototype pollution in camera.js
3. **Add environment config** - Make server port configurable via `process.env.PORT`
4. **Fix mtlUrl bug** - Add null check in ObjModelViewer.jsx before fetch

---

## FILE REFERENCE

### New Files Created This Session
- `/packages/editor/src/styles/design-system.css` - UI design tokens
- `/packages/editor/src/ai-generator/services/game-templates.js` - Template library
- `/packages/editor/src/ai-generator/TemplateSelector.jsx` - Template browser
- `/packages/editor/src/shared/Onboarding.jsx` - First-time wizard
- `/packages/editor/src/shared/debug-logger.js` - Logging utility
- `/COMPREHENSIVE_ROADMAP.md` - This roadmap
- `/LAUNCH_ROADMAP.md` - Original launch plan

### Files Updated
- `/packages/editor/src/index.css` - Added design system import
- `/packages/editor/src/ai-generator/styles/ai-generator.css` - Cleaned up
- `/packages/editor/src/ai-generator/styles/template-selector.css` - Created
- `/packages/editor/src/shared/styles/onboarding.css` - Created
- `/packages/console/src/App.css` - Cleaned up

---

*Reference document for quick bug fixes and improvements*
