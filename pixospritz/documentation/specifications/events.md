# Pixospritz - Events Specification

## Introduction
Events are asynchronous logic units that run outside the main action queue. They control game flow, UI, networking, error handling, and more. Events can be triggered by actions, scripts, or engine state, and are managed in their own queue for flexibility and reliability.

## Supported Events
- `camera`: Controls camera movement, transitions, and effects.
- `menu`: Opens, closes, or updates menus and UI overlays.
- `chat`: Displays chat bubbles, dialogue, or notifications.
- `network`: Handles multiplayer/network state and messages.
- `error`: Manages error handling and fault tolerance.
- `storage`: Manages saving/loading and persistent data.
- `notification`: Push or local notifications, async feedback.

## Format & Template
Events are defined as:

```json
{
  "type": "camera",
  "params": { "target": "hero", "transition": "pan" },
  "onComplete": "menu"
}
```

- `type`: Event type (see above).
- `params`: Parameters for the event (target, transition, message, etc.).
- `onComplete`: Optional event to trigger after completion.

## Engine Features
- Events run asynchronously, outside the main action queue.
- Events can be triggered by actions, scripts, or engine state.
- Events support chaining, conditional logic, and custom hooks.
- Events are extensible via engine and scripting APIs.
- Events can be paused, resumed, or cancelled.

## Tips
- Use events for UI, networking, and async game logic.
- Chain events for complex flows (e.g., camera pan then open menu).
- Handle errors and notifications via dedicated event types.
- Extend events with custom logic via Lua or engine plugins.