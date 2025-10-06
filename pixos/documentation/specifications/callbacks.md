# Pixospritz - Callbacks Specification

## Introduction
Callbacks are reusable code snippets or functions that can be invoked from actions, events, triggers, or scripts. They help avoid duplication and centralize logic for common behaviors. Callbacks can be organized in namespaces for modularity and maintainability.

## Format & Template
A callback is defined as:

```json
{
  "id": "door_opened",
  "function": "function(zone, player) { zone.openDoor(); player.playSound('door_open'); }"
}
```

- `id`: Unique identifier for the callback.
- `function`: Code to execute (can be Lua, JS, or engine API).

Callbacks can also be referenced by name in actions, events, or triggers:

```json
{
  "action": "open_door",
  "onSuccess": "door_opened"
}
```

## Engine Features
- Callbacks can be global or namespaced for modularity.
- Callbacks are invoked from actions, events, triggers, or scripts.
- Callbacks support Lua, JS, or engine API code.
- Callbacks can be chained or extended for complex logic.

## Tips
- Use namespaces to organize callbacks and avoid global conflicts.
- Centralize common logic in callbacks for maintainability.
- Document callback IDs and usage for clarity.
- Use Lua or engine plugins for advanced callback logic.