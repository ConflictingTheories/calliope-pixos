# Map Editor Enhancements - Sprites, Objects, Triggers, and Extends Support

## Overview

The map editor has been significantly enhanced to support the full range of features used by the Pixospritz engine, including:

1. **Sprite Placement** - Place dynamic sprites (characters, NPCs, etc.)
2. **Object Placement** - Place interactive objects (chests, furniture, etc.)
3. **Animated Tiles** - Place sprite-based animated tiles (effects, water, etc.)
4. **Trigger Configuration** - Configure map-level triggers and scripts
5. **Light Management** - View and manage lights in maps
6. **Extends Support** - Full support for tileset and configuration inheritance

## New Features

### 1. Sprite Placement

Sprites are dynamic entities that can be placed on the map. They support:

- **ID**: Unique identifier for the sprite
- **Type**: Sprite type reference (e.g., `characters/male`, `npc/knight`)
- **Position**: 3D position [x, y, z]
- **Facing**: Direction the sprite faces (Down, Up, Left, Right)

**Usage:**
1. Switch to "Sprites" mode in the Mode Selector
2. Enter an ID (e.g., "avatar", "npc1")
3. Enter a Type (e.g., "characters/male")
4. Select Facing direction
5. Click on the map to place the sprite

**Example Sprite:**
```json
{
  "id": "avatar",
  "type": "characters/male",
  "pos": [8, 5, 0],
  "facing": "Down"
}
```

### 2. Object Placement

Objects are similar to sprites but typically represent static or interactive items:

- Chests
- Furniture (doors, portals, etc.)
- Interactive elements

**Usage:**
Same as sprites, but switch to "Objects" mode.

**Example Object:**
```json
{
  "id": "chest1",
  "type": "objects/chests/metal",
  "pos": [10, 5, 0],
  "facing": "Down"
}
```

### 3. Animated Tiles

Animated tiles are sprite-based animations rendered on tiles (e.g., water effects, spurts):

- Reference sprite type for animation
- Position on map
- Typically used for effects

**Usage:**
1. Switch to "Animated Tiles" mode
2. Enter the Sprite Type (e.g., "effects/spurt", "effects/water")
3. Click on the map to place

**Example Animated Tile:**
```json
{
  "type": "effects/spurt",
  "pos": [10, 5, -1.5]
}
```

### 4. Trigger Configuration

Triggers allow you to attach scripts and behaviors to maps:

#### Select Trigger
A Lua script that runs when a tile is clicked:

```json
{
  "selectTrigger": "tile/select_test"
}
```

#### Scripts
Scripts that run when the map loads:

```json
{
  "scripts": [
    {
      "id": "load-spritz",
      "trigger": "zone/room_clear_path"
    }
  ]
}
```

**Usage:**
1. Switch to "Triggers" mode
2. Enter the Select Trigger path (relative to triggers/)
3. Add scripts with ID and trigger path
4. Remove scripts as needed

### 5. Extends Support

The editor now fully supports the "extends" feature for tilesets and configurations.

#### How Extends Works

Extends allows configurations to inherit from other configurations:

**Example: Tileset with Extends**
```json
{
  "extends": ["common"],
  "name": "sewer"
}
```

The `sewer` tileset will inherit all properties from the `common` tileset, including:
- Textures
- Geometry definitions
- Tiles
- Sheet size and offsets
- Background color

**Example: Sprite with Extends**
```json
{
  "extends": ["objects/chests/base"],
  "frames": {
    "S": [[16, 0], [16, 24]]
  }
}
```

The sprite inherits the base configuration and overrides specific properties.

#### Deep Merging

The extends system uses deep merging:
- Objects are merged recursively
- Arrays are replaced (not concatenated)
- Later configurations override earlier ones
- Multiple extends are processed in order

#### Implementation

The extends support is implemented in three files:

1. **`extends-utils.js`** - Core utilities:
   - `mergeDeep()` - Deep merge objects
   - `resolveExtends()` - Recursively resolve extends
   - `loadTilesetWithExtends()` - Load tileset with extends
   - `loadSpriteWithExtends()` - Load sprite with extends

2. **`app.jsx`** - Integration:
   - Automatically loads and resolves tilesets with extends
   - Falls back to non-extends loading if needed

3. **Engine compatibility**:
   - Matches the engine's behavior in `TilesetLoader.js` and `sprite.js`

## UI Changes

### Mode Selector

A new Mode Selector panel allows switching between different editing modes:

- 🟦 **Tiles** - Edit tile grid (existing functionality)
- 🎭 **Sprites** - Place and manage sprites
- 📦 **Objects** - Place and manage objects
- ✨ **Animated Tiles** - Place animated tiles
- ⚡ **Triggers & Scripts** - Configure triggers
- 💡 **Lights** - View light information

### Editor Panels

Each mode has a dedicated panel with:
- Input fields for configuration
- List of placed items
- Remove buttons for each item
- Mode-specific help text

### Status Bar

The status bar now shows:
- Current editor mode
- Current tool
- Selected tile
- Height level
- Counts: sprites, objects, animated tiles

## Keyboard Shortcuts

Existing shortcuts remain:
- **P** - Paint tool
- **E** - Erase tool
- **I** - Pick tool
- **Shift+Click** - Paint tile
- **Shift+Right-Click** - Erase tile

## Data Export

When saving a map, the editor now exports:

```json
{
  "tileset": "sewer",
  "bounds": [0, 0, 17, 19],
  "cells": [...],
  "heights": [...],
  "sprites": [
    {
      "id": "avatar",
      "type": "characters/male",
      "pos": [8, 5, 0],
      "facing": "Down"
    }
  ],
  "objects": [
    {
      "id": "chest1",
      "type": "objects/chests/metal",
      "pos": [10, 5, 0],
      "facing": "Down"
    }
  ],
  "animatedTiles": [
    {
      "type": "effects/spurt",
      "pos": [10, 5, -1.5]
    }
  ],
  "selectTrigger": "tile/select_test",
  "scripts": [
    {
      "id": "load-spritz",
      "trigger": "zone/room_clear_path"
    }
  ],
  "lights": [...]
}
```

## Technical Details

### State Management

New state variables in `MapEditor3D.jsx`:
- `sprites` - Array of placed sprites
- `objects` - Array of placed objects
- `animatedTiles` - Array of animated tiles
- `triggers` - Object with selectTrigger and scripts
- `lights` - Array of lights (read from map)
- `editorMode` - Current editing mode
- `spriteIdInput`, `spriteTypeInput`, `spriteFacing` - Input states

### Functions

New functions for managing entities:
- `addSprite(x, y)` - Add sprite at position
- `removeSprite(index)` - Remove sprite
- `updateSprite(index, updates)` - Update sprite properties
- `addObject(x, y)` - Add object at position
- `removeObject(index)` - Remove object
- `updateObject(index, updates)` - Update object properties
- `addAnimatedTile(x, y)` - Add animated tile
- `removeAnimatedTile(index)` - Remove animated tile

### Event Handling

Updated `handleCellClick` to:
- Check current editor mode
- Place sprite/object/animated tile based on mode
- Maintain existing tile editing behavior

### Save Handler

Updated `handleSave` to:
- Include all new properties in map data
- Clean up undefined values
- Maintain backward compatibility

## Migration Guide

### For Existing Maps

Maps without sprites, objects, or triggers will work as before. The new features are additive.

### For New Maps

To use the new features:

1. Open the map in the editor
2. Switch to the appropriate mode
3. Add sprites, objects, or triggers
4. Save the map

The editor will automatically include the new data in the exported JSON.

## Examples

### Example Map with All Features

```json
{
  "extends": ["dungeon-top", "dungeon-bottom"],
  "tileset": "sewer",
  "bounds": [0, 0, 17, 19],
  "cells": [...],
  "sprites": [
    {
      "id": "avatar",
      "type": "characters/male",
      "pos": [8, 5, 0],
      "facing": "Down"
    },
    {
      "id": "npc1",
      "type": "npc/knight",
      "pos": [10, 4, 0],
      "facing": "Down"
    }
  ],
  "objects": [
    {
      "id": "door",
      "type": "furniture/door",
      "pos": [2, 5, 0],
      "facing": "Down",
      "zones": ["base"]
    },
    {
      "id": "portal",
      "type": "furniture/portal",
      "pos": [3, 6, 0],
      "facing": "Down",
      "zones": ["room"],
      "state": "open"
    }
  ],
  "animatedTiles": [
    {
      "type": "effects/spurt",
      "pos": [10, 5, -1.5]
    }
  ],
  "selectTrigger": "tile/select_test",
  "scripts": [
    {
      "id": "load-spritz",
      "trigger": "zone/room_clear_path"
    }
  ],
  "lights": [
    {
      "id": "spot-light",
      "pos": [2, 17, 0],
      "color": [1, 0, 0],
      "direction": [0.4, 0.8, 1],
      "attenuation": [0.9, 0.9, 0.9],
      "enabled": true
    }
  ]
}
```

## Known Limitations

1. **Light Editing**: Lights are currently read-only in the UI
2. **Visual Feedback**: Sprites/objects are not rendered in the 3D view (only tiles)
3. **Advanced Properties**: Some advanced sprite/object properties need manual JSON editing

## Future Enhancements

Potential improvements:
- 3D rendering of sprites and objects in the editor
- Visual light editor
- Drag-and-drop sprite placement
- Sprite property editor dialog
- Template/preset system for common entities

## Troubleshooting

### Tileset Not Loading with Extends

If a tileset with extends doesn't load:
1. Check the console for error messages
2. Verify the extended tileset exists in the package
3. Ensure the path is correct (relative to tilesets/)
4. Check for circular dependencies

### Sprites Not Saving

If sprites aren't saved:
1. Ensure both ID and Type are filled in
2. Check that the map has been saved after adding sprites
3. Verify the save callback is working (check console)

### UI Not Updating

If the UI doesn't update after changes:
1. Check the browser console for errors
2. Try refreshing the package in the zip manager
3. Ensure React state is updating correctly

## Related Files

- `/src/map-editor/MapEditor3D.jsx` - Main map editor component
- `/src/shared/extends-utils.js` - Extends support utilities
- `/src/app.jsx` - App integration and tileset loading
- `/src/shared/webgl-utils.js` - WebGL rendering utilities

## Documentation References

- [Pixospritz Tutorial Guide](../../README.md)
- [Maps Specification](../../pixospritz/documentation/specifications/maps.md)
- [Engine Sprite Documentation](../../pixospritz/src/engine/dynamic/sprite.js)
- [Engine Tileset Loader](../../pixospritz/src/engine/utils/loaders/TilesetLoader.js)
