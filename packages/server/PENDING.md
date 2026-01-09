# PENDING.md

## Major Todos
- Refactor zone and session management
- Improve error handling and logging
- Add more tests for WebSocket protocol
- Enhance action queue processing
- ~~Implement JWT Authentication for WebSocket connections.~~ ✅ DONE (src/auth/)
- ~~Add Rate Limiting (per-client throttle).~~ ✅ DONE (src/utils/security.js)
- ~~Enable TLS (WSS) for encrypted communication.~~ ✅ DONE (src/utils/secure-server.js)
- ~~Add Input Validation (JSON Schema).~~ ✅ DONE (src/utils/security.js - MessageValidator)
- ~~Implement Reconnection Handling for dropped connections.~~ ✅ DONE (src/v2/clientManager.js)
- ~~Integrate Redis for state persistence.~~ ✅ DONE (src/utils/redis-store.js)
- Implement Delta Synchronization for network traffic.

## Roadmap Items
- Support for additional multiplayer protocols
- Advanced matchmaking and lobby features
- Plugin system for server extensions

## Comments & Cleanup
- Remove unused server logic
- Standardize code formatting and comments
- Audit dependencies for security and performance
