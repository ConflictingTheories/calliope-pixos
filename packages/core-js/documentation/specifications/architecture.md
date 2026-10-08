# Pixospritz - Architecture & Engine Specification

## Overview

Pixospritz is a modular, extensible game engine and storytelling platform. It supports cross-platform, cross-publisher, and multi-game integration, allowing players to merge standalone titles into persistent experiences. The engine is built in JavaScript/WebGL and supports runtime extensibility, Lua scripting, and package-based content.

## Key Features

- Package-based design
- Rendering pipeline (skybox, tiles, models, sprites, transitions)
- Lua scripting and engine API integration
- Zone/manifest extensibility
- Actions, events, triggers, callbacks, and gamepad support
- Runtime shader switching and extensibility
- Editor integration
- Networked multiplayer

## Rendering Pipeline

- SkyboxManager: Multiple shader effects, runtime switching via API, Lua, or zone/manifest config
- Tiles/Objects/Sprites: Rendered in correct order with depth buffer management
- Transitions: Customizable transition effects between scenes/zones

## Scripting & Extensibility

- Lua API exposes engine features (skybox, actions, events, menus, etc.)
- Zone/Manifest config for rendering, audio, and gameplay options

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

## Package-Based Design

Content can be distributed via direct download, upload, torrent, IPFS, etc. Packages are hashed and support flexible, decentralized distribution.

## Networked Multiplayer

Optional network layer for shared world states and real-time multiplayer. Supports drop-in/drop-out, latency management, and distributed state.

## Future Applications

- Offline + Online Support / Drop-out / Latency Support
- IPFS content Serving
- Signed Packages / DRM
- Episode Support / Series
- RSS / Subscription to New Episodes
- Hub Worlds / Directory Zones
- Trophy System / Quest Tracker
- Distributed Shared State Network Protocol
