# 3D Models

This directory contains 3D OBJ models used for objects and decorations in the game world.

## Available Models

### Props

| Model       | Description            |
| ----------- | ---------------------- |
| `apple.obj` | Collectible apple item |
| `book.obj`  | Readable book prop     |
| `die.obj`   | Dice for randomization |

### Furniture

| Model       | Description     |
| ----------- | --------------- |
| `bed.obj`   | Bed furniture   |
| `chair.obj` | Chair furniture |

### Characters

| Model        | Description        |
| ------------ | ------------------ |
| `person.obj` | Basic person model |
| `robot.obj`  | Robot character    |

### Environment

| Model              | Description          |
| ------------------ | -------------------- |
| `cactus_short.obj` | Short cactus plant   |
| `cactus_tall.obj`  | Tall cactus plant    |
| `cube.obj`         | Basic cube primitive |

## File Format

Each model consists of:

- `*.obj` - Wavefront OBJ geometry file
- `*.mtl` - Material definition (optional)

## Textures

Some models reference textures stored in the `textures/` directory:

- `6bf488141a8a487599953582478eca36.jpeg`
- `98a91fc2e52c4db6a4be147a471e98ca.jpeg`
- Various other texture maps

## Usage in Maps

Objects are placed in maps via the `objects` array:

```json
{
  "objects": [
    {
      "id": "apple-1",
      "type": "apple",
      "pos": [5, 5, 0],
      "scale": [0.5, 0.5, 0.5],
      "rotation": [0, 45, 0]
    }
  ]
}
```

## Model Requirements

- **Format**: Wavefront OBJ (triangulated)
- **Scale**: Normalized to fit within 1x1x1 unit cube
- **Origin**: Center-bottom for proper placement
- **UVs**: Required for textured models
- **Normals**: Required for proper lighting

## Editor Support

Models can be previewed in the PixoSpritz Editor:

- `demos/obj-model-viewer.html` - Standalone model viewer
- Model Preview panel in main editor

## Creating New Models

1. Create model in 3D software (Blender, etc.)
2. Export as OBJ with MTL
3. Ensure model is properly scaled and centered
4. Place files in this directory
5. Reference in map.json objects array
