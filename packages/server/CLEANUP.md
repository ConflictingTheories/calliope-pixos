# CLEANUP.md

## Completed ✅
- Removed `src/v1/` legacy server implementation
- Consolidated to v2 WebSocket API

## TODO
- `v2/clientManager.js`, `v2/zoneHandler.js`: Refactor obsolete zone/session cleanup logic for modern multiplayer protocols.
- `src/utils/security.js`: Audit cleanupInterval, remove dangerous content handling.
- `src/v2/api.js`: Refactor connection and rate limiter cleanup logic.
- Standardize session and zone management interfaces.
- Audit security and cleanup routines for modern best practices.
