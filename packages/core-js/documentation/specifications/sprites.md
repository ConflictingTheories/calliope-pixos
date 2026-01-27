# Pixospritz - Sprites Specification

## Introduction

Sprites are visual entities rendered in the game world. They can represent characters, objects, effects, or UI elements. Sprites support animation, selection, interaction, and can be controlled by the player, AI, or scripts. Animated sprites are supported natively and can be layered with other scene elements.

## Format & Template

A sprite is defined in the package or zone data as an object with the following properties:

```json
{
  "id": "hero",
  "type": "character",
  "image": "textures/hero.png",
  "position": [x, y, z],
  "animation": {
    "frames": ["hero_walk_1.png", "hero_walk_2.png"],
    "speed": 0.1
  },
  "actions": ["move", "interact", "chat"],
  "isSelected": false
}
```

- `id`: Unique identifier for the sprite.
- `type`: Logical type (character, object, effect, etc.).
- `image`: Path to the sprite texture or image.
- `position`: 3D position in the world.
- `animation`: Optional animation frames and speed.
- `actions`: Supported actions for the sprite.
- `isSelected`: Selection state (updated by engine on click/pick).

## Engine Features

- Sprites are rendered after tiles/objects, respecting depth and layering.
- Animated sprites update per frame.
- Sprites can be selected via mouse/gamepad and trigger actions.
- Sprites can be controlled via Lua scripts and engine events.
- Sprites support custom shaders and effects.

## Tips

- Use descriptive IDs and types for sprites to simplify scripting and event handling.
- Group related sprites (e.g., NPCs, effects) for batch operations.
- Use animation for dynamic feedback and immersion.
- Sprites can be extended with custom properties for gameplay or UI logic.
