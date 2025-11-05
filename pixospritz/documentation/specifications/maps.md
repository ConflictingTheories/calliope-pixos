# Pixospritz - Maps Specification

## Introduction
Maps define the spatial layout and structure of zones and scenes. Each map consists of tiles, objects, sprites, triggers, and events, and can be customized with layers, metadata, and procedural generation. Maps are loaded from package data and can be extended via Lua scripting and manifest config.

## Format & Template
A map is defined as:

```json
{
  "id": "dungeon-top",
  "tileset": "sewer",
  "size": [20, 20],
  "cells": [ ... ],
  "objects": [ ... ],
  "sprites": [ ... ],
  "triggers": [ ... ],
  "events": [ ... ]
}
```

- `id`: Unique identifier for the map.
- `tileset`: Reference to the tileset used.
- `size`: Map dimensions (width, height).
- `cells`: Array of tile cell data.
- `objects`, `sprites`: Entities present in the map.
- `triggers`, `events`: Logic units for gameplay and story.

## Engine Features
- Maps are loaded and cached by the engine.
- Maps support multiple layers, triggers, and events.
- Maps can be procedurally generated or hand-authored.
- Maps can be extended via Lua scripting and manifest config.
- Maps support runtime switching and saving/loading.

## Tips
- Use layers for complex environments and gameplay logic.
- Document map structure and entity placement for maintainability.
- Use Lua for procedural generation and dynamic map logic.
- Optimize map data for performance and clarity.