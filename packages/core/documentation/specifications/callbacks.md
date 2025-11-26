# Pixospritz - Callbacks Specification

## Introduction
Callbacks are reusable code snippets or functions that can be invoked from actions, events, triggers, or scripts. They help avoid duplication and centralize logic for common behaviors. Callbacks can be organized in namespaces for modularity and maintainability.

## Lua Scripting Integration
Pixospritz supports Lua scripting for callbacks, allowing game logic to be written in Lua and executed by the engine. Lua callbacks can:
- Access and modify game state (zones, sprites, objects, etc.)
- Trigger actions, events, and transitions
- Change skybox shaders (`engine:set_skybox_shader("shaderName")`)
- Manipulate avatar, inventory, and stats
- Control menus, UI, and camera
- Handle triggers and conditional logic
- Save/load data and interact with persistent storage
- Communicate with other scripts and engine modules

### Example Lua Callback
```lua
function door_opened(zone, player)
  zone:openDoor()
  player:playSound('door_open')
  engine:set_skybox_shader('sunset')
end
```

### Supported Lua Features
- Full access to engine API via the Lua environment
- Table-based data structures for game objects
- Custom functions for actions, events, triggers, and callbacks
- Ability to chain, pause, resume, or cancel logic
- Integration with manifest and zone config
- Error handling and notifications

## Format & Template
A callback is defined as:

```json
{
  "id": "door_opened",
  "function": "function(zone, player) { zone.openDoor(); player.playSound('door_open'); }"
}
```

Or as a Lua function in a callback file:

```lua
function door_opened(zone, player)
  -- Lua logic here
end
```

## Engine Features
- Callbacks can be global or namespaced for modularity.
- Callbacks are invoked from actions, events, triggers, or scripts.
- Callbacks support Lua, JS, or engine API code.
- Callbacks can be chained or extended for complex logic.
- Lua callbacks have full access to engine features and game state.

## Tips
- Use namespaces to organize callbacks and avoid global conflicts.
- Centralize common logic in callbacks for maintainability.
- Document callback IDs and usage for clarity.
- Use Lua for advanced callback logic, chaining, and engine integration.
- Test Lua callbacks for error handling and edge cases.