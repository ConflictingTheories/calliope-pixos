# Pixospritz - Main README

## Overview

Pixospritz is a modular, extensible game engine and storytelling platform. It supports cross-platform, cross-publisher, and multi-game integration, allowing players to merge standalone titles into persistent experiences. The engine is built in JavaScript/WebGL and supports runtime extensibility, Lua scripting, and package-based content.

## Key Features

- **Package-based design:** Game content is distributed in packages, supporting standalone and episodic play, and dynamic interoperability.
- **Rendering pipeline:** Modern WebGL pipeline with custom shaders, skyboxes, tiles, 3D models, sprites, and transitions. Skybox shaders can be switched programmatically, via Lua, or by zone/manifest config.
- **Lua scripting:** Full engine API access from Lua, including actions, events, triggers, callbacks, rendering, audio, and game state.
- **Zone/manifest extensibility:** Zones and manifests can specify rendering, audio, and gameplay configuration, including skybox shaders and other effects.
- **Actions, events, triggers, callbacks:** Modular logic units for gameplay, story, and UI, all extensible via Lua and engine plugins.
- **Gamepad support:** Customizable button/axis mapping, vibration feedback, and multi-controller support.
- **Editor integration:** Optional built-in editor for game development and debugging.
- **Networked multiplayer:** Optional network layer for shared world states and real-time multiplayer.

## Example: Lua Scripting

```lua
function on_zone_enter(zone, player)
  engine:set_skybox_shader('morning')
  player:chat('Welcome to the morning zone!')
  if player.stats.hp < 50 then
    engine:open_menu('healMenu')
  end
end
```

## Documentation

See the `documentation/specifications/` folder for detailed specs on:

- Architecture
- Sprites
- Tilesets
- Models
- Scenes
- Actions
- Events
- Triggers
- Callbacks
- Gamepad
- Avatar
- Menus
- Maps

Each spec includes:

- Introduction and context
- Format and template examples
- Engine features and extensibility
- Tips and best practices
- Lua scripting integration (where applicable)

## Getting Started

1. Clone the repo and install dependencies.
2. Create or import a package with assets, zones, and scripts.
3. Configure zones, scenes, and manifests for your game.
4. Use Lua scripting and engine APIs for custom logic.
5. Run the engine and start building your story!

## Contributing

Contributions are welcome! Please see the documentation for guidelines and API references.
