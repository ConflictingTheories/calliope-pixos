# PixoSpritz

A WebGL-based game engine and editor ecosystem for creating pixel-art games.

## 📦 Packages

This monorepo contains the following packages:

| Package | Description |
|---------|-------------|
| [`@pixospritz/core`](./packages/core) | Core WebGL game engine |
| [`@pixospritz/script`](./packages/script) | Lua-inspired scripting language |
| [`@pixospritz/math`](./packages/math) | Math utilities (vectors, matrices) |
| [`@pixospritz/editor`](./packages/editor) | Visual development tools |
| [`@pixospritz/console`](./packages/console) | Web game player |
| [`@pixospritz/server`](./packages/server) | WebSocket multiplayer server |
| [`@pixospritz/website`](./packages/website) | Documentation website |
| [`@pixospritz/assets`](./packages/assets) | Shared game assets |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/ConflictingTheories/calliope-pixos.git
cd calliope-pixos

# Install all dependencies
npm install
```

### Development

```bash
# Start the editor
npm run dev:editor

# Start the console player
npm run dev:console

# Start the multiplayer server
npm run start:server
```

### Building

```bash
# Build all packages
npm run build

# Build individual packages
npm run build:core
npm run build:script
npm run build:editor
npm run build:console
```

## 🏗️ Project Structure

```
calliope-pixos/
├── packages/
│   ├── core/           # @pixospritz/core - Game engine
│   ├── script/         # @pixospritz/script - Scripting language
│   ├── math/           # @pixospritz/math - Math utilities
│   ├── editor/         # @pixospritz/editor - Development tools
│   ├── console/        # @pixospritz/console - Game player
│   ├── server/         # @pixospritz/server - Multiplayer server
│   ├── website/        # @pixospritz/website - Documentation
│   └── assets/         # @pixospritz/assets - Shared assets
├── package.json        # Root workspace configuration
└── README.md
```

## 🎮 Features

### Core Engine
- WebGL2 rendering with custom shaders
- Sprite and tileset management
- Isometric and 2D map support
- Entity/Actor system with pathfinding
- Event system (keyboard, mouse, touch, gamepad)
- Audio engine with BPM analysis
- Cutscene player with DSL

### Editor
- Sprite Editor with animation support
- Tile Editor with collision data
- Map Editor with multiple layers
- Cutscene scripting tools
- 3D model viewer (OBJ/MTL)
- Monaco-based script editor

### Scripting
- Lua-compatible syntax
- Game-specific extensions
- Hot-reloading support

## 📝 License

CC-BY-NC-SA-4.0

## 🔗 Links

- Website: https://pixospritz.com
- GitHub: https://github.com/ConflictingTheories/calliope-pixos
