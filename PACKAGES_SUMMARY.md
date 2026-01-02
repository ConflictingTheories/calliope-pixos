# PACKAGES_SUMMARY.md

## Project-wide Package Summary

This document provides a consolidated overview of all packages in the `calliope-pixos` project, summarizing their purpose, structure, and integration within the overall architecture.

### Core Packages
- **core**: WebGL-based game engine, modular, handles rendering, entities, events, audio, and scripting.
- **core-c**: Native C engine for performance/embedded use, OpenGL-based, modular for engine, math, resource, and scene management.

### Supporting Packages
- **console**: Web player for running games, supports multiple input types, game loading, and fullscreen mode.
- **editor**: Visual tools for game creation, including sprite, tile, map, cutscene, model, and script editors.
- **math**: Math utilities for vectors, matrices, and geometric operations, WebGL-compatible.
- **script**: Lua-inspired scripting language, custom scope/table, operator overloading, built-in functions.
- **server**: WebSocket multiplayer server, zone/room management, session and action queue handling.

### Integration & Architecture
- Each package is designed for a specific role, with clear integration points.
- The architecture is modular and extensible, supporting both web and native platforms.
- Packages interact via well-defined APIs and shared utilities (math, scripting).
- Roadmaps and pending tasks are tracked in each package's `PENDING.md` for ongoing development and refactoring.

### Conceptual Breakdown
- Rendering and graphics pipeline (core, core-c, math)
- Game logic and scripting (core, script)
- Asset and map management (core, editor)
- Multiplayer and networking (server)
- Development tools and extensibility (editor, console)

---

**Overall, the `calliope-pixos` project is a comprehensive, multi-language game engine and toolset, supporting modern game development workflows for both web and native environments.**
