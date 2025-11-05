# Pixospritz - Avatar Specification

## Introduction
The Avatar is the player's in-game representation, controlling actions, interactions, and progression. Avatars can be persistent across games or unique to each story. The engine supports multiple avatars, legacy characters, and dynamic skill sets, all managed via sprites, objects, and scripting.

## Format & Template
An avatar is defined as:

```json
{
  "id": "player1",
  "sprite": "hero",
  "skills": ["move", "interact", "chat"],
  "inventory": [ ... ],
  "stats": { "hp": 100, "mp": 50 },
  "position": [x, y, z],
  "legacy": true
}
```

- `id`: Unique identifier for the avatar.
- `sprite`: Associated sprite or character.
- `skills`: Actions and abilities available to the avatar.
- `inventory`: Items carried by the avatar.
- `stats`: Numeric stats (HP, MP, etc.).
- `position`: Current position in the world.
- `legacy`: Whether the avatar persists across games.

## Engine Features
- Avatars can be controlled via player input, AI, or Lua scripts.
- Avatars support persistent progression and legacy characters.
- Avatars can be customized with skills, inventory, and stats.
- Multiple avatars are supported for multiplayer or story modes.

## Tips
- Use legacy avatars for persistent campaigns and cross-game progression.
- Extend avatar data for custom skills, stats, and inventory.
- Use Lua or engine plugins to manage avatar logic and events.
- Avatars can be switched or updated at runtime for dynamic gameplay.