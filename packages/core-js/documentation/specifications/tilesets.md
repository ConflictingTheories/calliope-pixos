# Pixospritz - Tilesets Specification

## Introduction

Tilesets define the visual and logical structure of the game world grid. Each tileset contains a collection of tile images and metadata describing walkability, interaction, and rendering order. Tilesets are used to build maps, zones, and environments, and can be extended with custom properties for gameplay logic.

## Format & Template

A tileset is defined as an object with the following properties:

```json
{
  "id": "sewer",
  "image": "textures/tilesets/sewer.png",
  "tileSize": [32, 32],
  "tiles": [
    { "id": "floor", "walkable": true },
    { "id": "wall", "walkable": false }
  ],
  "layers": ["background", "foreground"]
}
```

- `id`: Unique identifier for the tileset.
- `image`: Path to the tileset image.
- `tileSize`: Size of each tile (width, height).
- `tiles`: Array of tile definitions with properties (walkable, interactable, etc.).
- `layers`: Optional rendering layers for multi-layer maps.

## Engine Features

- Tilesets are loaded and cached by the engine.
- Tiles are rendered before sprites/objects, respecting layer and depth.
- Tiles can be walkable, interactable, or trigger events.
- Tilesets can be switched at runtime via zone or manifest config.
- Custom shaders and effects can be applied to tilesets.

## Tips

- Use layers for complex maps (e.g., background, collision, foreground).
- Define walkability and interaction for each tile to support gameplay logic.
- Optimize tileset images for performance and clarity.
- Extend tileset metadata for custom game mechanics.
