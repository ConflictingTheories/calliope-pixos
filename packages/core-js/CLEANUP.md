# CLEANUP.md

## File & Structure References
- `src/engine/actions/patrol.js`, `changezone.js`, `dialogue.js`, `prompt.js`: Remove manual triggers, legacy formats, and reimplement mouse/touch handler support.
- `src/engine/events/menu.js`, `chat.js`, `camera.js`: Refactor event handling, remove legacy camera logic, and update dialogue completion triggers.
- `src/engine/shaders/pxsl/manager.js`: Remove legacy JavaScript shader support and clean up shader cache logic.
- `src/engine/shaders/skybox/sunset/fs.js`: Audit sunset color palette and gradient logic for modern shader standards.

## Concepts
- Remove all legacy event and shader handling - migrating to the modern specs
- Standardize event and action system interfaces.
- Audit and refactor deprecated code in engine/core modules. (Focus on Clean, Readable, Maintainable)
- Update documentation to reflect cleaned-up event and shader systems.
