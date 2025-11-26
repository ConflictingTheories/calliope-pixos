# @pixospritz/assets

Shared game assets for PixoSpritz demos and examples.

## Contents

- `audio/` - Sound effects and music
- `sprites/` - Character and object sprites
- `textures/` - Texture images
- `tilesets/` - Tileset definitions
- `maps/` - Game maps
- `models/` - 3D OBJ models
- `cutscenes/` - Cutscene scripts (.pxc)
- `callbacks/` - Script callbacks (.pxs)
- `triggers/` - Trigger scripts
- `modes/` - Game mode configurations

## Usage

These assets are used by the console and editor packages for demos and testing.

```javascript
// Example: Load a sprite
const sprite = await engine.loadSprite('/assets/sprites/hero.json');

// Example: Load a map
const map = await engine.loadMap('/assets/maps/town.json');
```

## License

Assets are licensed under CC-BY-NC-SA-4.0
