# Pixospritz - Actions Specification

## Introduction

Actions are the core interactions and behaviors in Pixospritz games. They are engine-defined logic units that can be triggered by the player, AI, scripts, or events. Actions are distinct from triggers and callbacks, and are extensible via custom hooks and scripting.

## Supported Actions

- `animate`: Play an animation on a sprite or object.
- `changezone`: Transition to a different zone or map.
- `chat`: Display dialogue or chat bubbles.
- `dance`: Trigger a dance animation or sequence.
- `face`: Change the facing direction of a sprite/object.
- `greeting`: Show a greeting or message.
- `interact`: Interact with objects, NPCs, or environment.
- `move`: Move a sprite/object to a new position.
- `patrol`: Set up a patrol route for AI or NPCs.
- `prompt`: Show a prompt or menu to the player.
- `script`: Run a Lua or engine script.

## Action Lifecycle Hooks

- `init()`: Runs once at action start for setup.
- `tick()`: Runs every frame to update logic.
- `end()`: Runs at action completion for cleanup.
- `pause()`: Runs when the game is paused.
- `resume()`: Runs when resuming from pause.
- `success()`: Runs on successful completion.
- `error()`: Runs on error or exception.
- `cancel()`: Runs when action is cancelled.

## Format & Template

Actions are defined in zone, sprite, or object data as:

```json
{
  "type": "move",
  "target": "hero",
  "params": { "to": [10, 5, 0] },
  "onSuccess": "chat",
  "onError": "greeting"
}
```

- `type`: Action type (see above).
- `target`: Target entity for the action.
- `params`: Parameters for the action (destination, message, etc.).
- `onSuccess`, `onError`: Optional hooks for chaining actions.

## Engine Features

- Actions can be triggered by player input, AI, Lua scripts, or events.
- Actions support chaining, conditional logic, and custom hooks.
- Actions are extensible via engine and scripting APIs.
- Actions can be paused, resumed, or cancelled.

## Tips

- Use hooks to manage complex action flows and error handling.
- Chain actions for multi-step behaviors (e.g., move then chat).
- Extend actions with custom logic via Lua or engine plugins.
- Use descriptive parameters for clarity and maintainability.
