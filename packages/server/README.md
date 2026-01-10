# pixospritz-server

WebSocket multiplayer server for PixoSpritz games.

## Features

- WebSocket-based real-time communication
- Zone/room management for multiplayer areas
- Client session management
- Action queue processing

## Installation

```bash
npm install pixospritz-server
```

## Usage

```bash
# Start server
npm run start

# Start with file watching (development)
npm run dev
```

## API

The server accepts JSON messages over WebSocket:

```javascript
// Join a zone
{ "type": "join", "zone": "town-square" }

// Send action
{ "type": "action", "action": "move", "data": { "x": 10, "y": 20 } }
```

## Package Structure

```
src/
├── main.js           # Server entry point
├── auth/             # Authentication utilities
├── utils/            # Shared utilities
└── v2/
    ├── api.js           # WebSocket API handler
    ├── clientManager.js # Client session management
    └── zoneHandler.js   # Zone/room management
```

## Configuration

Default port: 8080

Set via environment variable:
```bash
PORT=3000 npm run start
```
