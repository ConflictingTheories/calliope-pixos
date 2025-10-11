# Pixospritz - Triggers Specification

## Introduction
Triggers are conditional logic units that activate actions, events, or scripts when specific conditions are met. Triggers are used for gameplay logic, puzzles, story progression, and dynamic world changes. They can be defined in zones, maps, objects, or scripts.

## Format & Template
A trigger is defined as:

```json
{
  "id": "door_opened",
  "condition": "player.position == [5, 2, 0]",
  "action": "open_door",
  "once": true
}
```

- `id`: Unique identifier for the trigger.
- `condition`: Logical condition to check (can use Lua or engine expressions).
- `action`: Action or event to activate when condition is met.
- `once`: Whether the trigger fires only once.

## Engine Features
- Triggers can be attached to zones, maps, objects, or scripts.
- Triggers support complex conditions and chaining.
- Triggers can activate actions, events, or scripts.
- Triggers can be persistent or one-time.
- Triggers are extensible via Lua and engine plugins.

## Tips
- Use triggers for puzzles, story progression, and dynamic world changes.
- Chain triggers for multi-step logic (e.g., unlock door then play sound).
- Use Lua for advanced trigger conditions and logic.
- Document trigger IDs and conditions for maintainability.