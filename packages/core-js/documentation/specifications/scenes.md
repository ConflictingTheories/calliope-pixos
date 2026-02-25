# Pixospritz - Scenes (Spritz) Specification

## Introduction

Scenes (also called "Spritz") are the top-level containers for gameplay, story, and world logic. A scene manages zones, maps, objects, sprites, events, and transitions. Scenes can be loaded, saved, and switched at runtime, and support custom configuration via manifest or scripting.

## Format & Template

A scene is defined in the package or manifest as:

```json
{
  "id": "intro",
  "zones": ["base", "dungeon-top"],
  "startZone": "base",
  "skyboxShader": "cosmic",
  "audio": "opening.mp3",
  "events": [
    { "type": "cutscene", "params": { ... } }
  ],
  "objects": [ ... ],
  "sprites": [ ... ]
}
```

- `id`: Unique identifier for the scene.
- `zones`: Array of zone IDs included in the scene.
- `startZone`: Zone to load first.
- `skyboxShader`: Default skybox shader for the scene.
- `audio`: Background music or ambient sound.
- `events`: Scene-level events (cutscenes, triggers, etc.).
- `objects`, `sprites`: Entities present in the scene.

## Engine Features

- Scenes manage zones, transitions, and global state.
- Scenes can specify rendering, audio, and gameplay config (e.g., skybox shader).
- Scenes support runtime switching and saving/loading.
- Scenes can be extended via manifest, Lua, or engine plugins.

## Tips

- Use scenes to organize story chapters, levels, or gameplay modes.
- Specify default shaders, audio, and events for immersive experiences.
- Use manifest or Lua to customize scene logic and transitions.
- Scenes can be nested or chained for complex story flows.
