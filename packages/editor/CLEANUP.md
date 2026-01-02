# CLEANUP.md

## File & Structure References
- `src/app.jsx`, `script-editor/index.jsx`, `model-preview/ObjModelViewer.jsx`, `tile-editor/index.jsx`, `cutscene-tool/index.jsx`: Remove deprecated event listeners and refactor remove functions for clarity.
- `src/styles/design-system.css`: Remove ugly gradients and audit for modern design standards.
- `src/shared/debug-logger.js`: Audit debug logic and remove unused localStorage keys.

## Concepts
- Remove deprecated editor features and UI components.
- Standardize event handling and component structure.
- Audit asset management logic for unused or obsolete code.
