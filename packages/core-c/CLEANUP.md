# CLEANUP.md

## File & Structure References
- `src/render_manager.h`: Remove legacy backward compatibility code.
- `src/rendering/light_manager.h/c`: Refactor light removal logic and audit for unused code.
- `src/camera.c`: Implement missing yaw/pitch calculation and remove outdated comments.
- `src/scene/sprite.c`, `tileset.c`, `zone.c`, `zone.h`: Implement missing drawing and JSON parsing, remove obsolete sprite removal logic.
- `src/vendor/`: Remove unused vendor dependencies and audit for necessity.

## Concepts
- Finish implementing the core engine and console over to the C system.
- Refactor resource and scene management for clarity and performance.
- Audit memory management for leaks and inefficiencies.
- Standardize code formatting and comments across all modules.
