# pixospritz-core

The core WebGL-based game engine for PixoSpritz.

## Features

- WebGL2 rendering with shader support
- Sprite and tileset management
- Map loading and rendering
- Entity/Actor system
- Event system (keyboard, mouse, touch, gamepad)
- Audio engine with BPM analysis
- Cutscene player with DSL support
- HUD/UI overlay system

## Installation

```bash
npm install pixospritz-core
```

## Usage

```javascript
import { RenderManager, ActionQueue, GamePad } from 'pixospritz-core';

// Initialize the engine
const renderer = new RenderManager(canvas, gl);
const gamepad = new GamePad();
const actions = new ActionQueue();
```

## Package Structure

```
src/
├── components/     # React components (WebGLView)
├── engine/
│   ├── actions/    # Action system (prompt, delay, move, etc.)
│   ├── core/       # Core systems (render, HUD, audio)
│   ├── dynamic/    # Dynamic assets (sprites, maps, actors)
│   ├── events/     # Event handlers (menu, keyboard)
│   ├── scripting/  # Script execution engine
│   ├── shaders/    # GLSL shaders
│   └── utils/      # Utility functions
└── spritz/         # Spritz player integration
```

## Dependencies

- `pixospritz-math` - Math utilities
- `pixoscript` - Scripting engine
