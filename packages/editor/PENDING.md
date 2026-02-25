# PENDING.md

## Major Todos

- Refactor editor modules for better separation
- Improve documentation for all tools
- Add more tests for asset editors
- Enhance Monaco integration for scripting
- ~~Fix Deprecated Lifecycle in `ImagePreview.jsx`~~ ✅ DONE (already converted to hooks)
- ~~Remove all debug `console.log` statements in `MapEditor.jsx` and `CutscenePlayer.jsx`.~~ ✅ DONE (cleaned up)
- ~~Fix `mtlUrl` bug in `ObjModelViewer.jsx`~~ ✅ DONE (null-check exists at line 386)
- Finalize OBJ Loader integration: Integrate `ObjHelper.js` with engine's `ResourceManager`.
- Create a First-Time User Wizard for onboarding.
- Develop Quick-Start Templates for new projects.
- Implement an In-Editor Help System.
- Complete Design System Migration (`design-system.css`).
- Create Core Component Library (`EditorToolbar`, `EditorPanel`, `WebGLCanvas`).
- Extract Shared Hooks (e.g., `useHistory()`).
- Implement Global Keyboard Shortcuts and help modal.
- Unify 2D/3D Map Editors (index.jsx + MapEditor3D.jsx → single component).
- ~~Implement core map editor tools (copy/paste, fill, layer toggles).~~ ✅ DONE (see map-editor/tools/)
- ~~Auto-Tiling System for level design.~~ ✅ DONE (see systems/AutoTiler.js)
- ~~Animation Preview Panel for sprite editor.~~ ✅ DONE (see sprite-editor/AnimationPreview.jsx)
- ~~Core Drawing Tools (line, rectangle, circle, flood-fill).~~ ✅ DONE (see sprite-editor/tools/)
- Customizable sprite sizes and color palettes.
- Import/Export for PNG/GIF and spritesheets.
- PixoScript Language Support in script editor (autocompletion, docs, lint).
- Console Output Panel for script runtime.
- Visual Timeline and Branching Dialogue for cutscene editor.

## Roadmap Items

- Support for collaborative editing
- Advanced cutscene and map design tools
- Plugin system for editor extensions

## Comments & Cleanup

- Remove deprecated editor features
- Standardize UI components
- Audit dependencies and update as needed
