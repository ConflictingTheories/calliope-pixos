# CLEANUP.md

## File & Structure References
- `src/v1/main.js`, `v2/clientManager.js`, `v2/zoneHandler.js`: Remove obsolete zone/session cleanup logic and refactor for modern multiplayer protocols.
- `src/utils/security.js`: Audit cleanupInterval, remove logic, and sanitize/remove dangerous content handling.
- `src/v2/api.js`: Refactor connection and rate limiter cleanup logic.

## Concepts
- Remove unused server logic and legacy multiplayer code - do not break anything.
- Standardize session and zone management interfaces.
- Audit security and cleanup routines for modern best practices.
