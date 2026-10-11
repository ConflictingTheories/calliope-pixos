# Pixospritz - Models Specification

## Introduction

Models are 3D assets used to represent objects, characters, and environments in the Pixospritz engine. Models can be static or animated, and support custom materials, textures, and shaders. Models are loaded from standard formats (OBJ, MTL, etc.) and can be extended with engine-specific metadata.

## Format & Template

A model is defined in the package or zone data as:

```json
{
  "id": "robot",
  "file": "models/robot.obj",
  "material": "models/robot.mtl",
  "position": [x, y, z],
  "scale": [1, 1, 1],
  "rotation": [0, 0, 0],
  "texture": "textures/robot.png",
  "animated": false
}
```

- `id`: Unique identifier for the model.
- `file`: Path to the model file (OBJ, etc.).
- `material`: Path to the material file (MTL).
- `position`: 3D position in the world.
- `scale`: Model scale.
- `rotation`: Model rotation (Euler angles).
- `texture`: Optional texture image.
- `animated`: Whether the model is animated.

## Engine Features

- Models are loaded and cached by the engine.
- Models support custom materials, textures, and shaders.
- Models can be static or animated.
- Models are rendered with correct depth and lighting.
- Models can be controlled via Lua scripts and engine events.

## Tips

- Optimize model geometry and textures for performance.
- Use descriptive IDs and filenames for clarity.
- Extend model metadata for custom game logic.
- Use engine plugins or Lua to add animation and interaction.
