# Map Editor Quick Reference

## Mode Selector

| Mode | Icon | Purpose | Shortcut |
|------|------|---------|----------|
| Tiles | 🟦 | Edit tile grid | - |
| Sprites | 🎭 | Place sprites (characters, NPCs) | - |
| Objects | 📦 | Place objects (chests, furniture) | - |
| Animated Tiles | ✨ | Place animated effects | - |
| Triggers | ⚡ | Configure scripts and triggers | - |
| Lights | 💡 | View lights (read-only) | - |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `P` | Paint tool |
| `E` | Erase tool |
| `I` | Pick tool |
| `Shift+Click` | Paint tile |
| `Shift+Right-Click` | Erase tile |

## Sprite/Object Properties

### Required
- **ID** - Unique identifier (e.g., "avatar", "chest1")
- **Type** - Sprite type path (e.g., "characters/male", "objects/chests/metal")

### Optional
- **Facing** - Direction: Down, Up, Left, Right
- **Position** - Automatically set from click position [x, y, z]

### Example
```json
{
  "id": "avatar",
  "type": "characters/male",
  "pos": [8, 5, 0],
  "facing": "Down"
}
```

## Animated Tiles

### Required
- **Type** - Sprite type for animation (e.g., "effects/spurt")

### Example
```json
{
  "type": "effects/spurt",
  "pos": [10, 5, -1.5]
}
```

## Triggers

### Select Trigger
Lua script that runs on tile click
```json
{
  "selectTrigger": "tile/select_test"
}
```

### Scripts
Scripts that run on map load
```json
{
  "scripts": [
    {
      "id": "init",
      "trigger": "zone/init_room"
    }
  ]
}
```

## Extends Syntax

### Tilesets
```json
{
  "extends": ["common"],
  "name": "sewer"
}
```

### Sprites
```json
{
  "extends": ["objects/chests/base"],
  "frames": {
    "S": [[16, 0]]
  }
}
```

### Maps
```json
{
  "extends": ["dungeon-top", "dungeon-bottom"],
  "tileset": "sewer"
}
```

## Common Sprite Types

### Characters
- `characters/male`
- `characters/female`

### NPCs
- `npc/knight`
- `npc/air-knight`

### Objects
- `objects/chests/metal`
- `objects/chests/wood`
- `objects/chests/red`
- `objects/chests/blue`

### Furniture
- `furniture/door`
- `furniture/portal`
- `furniture/tree`
- `furniture/fireplace`

### Effects
- `effects/spurt`
- `effects/fire`
- `effects/water`

## Workflow

### Adding a Sprite
1. Switch to Sprites mode
2. Enter ID and Type
3. Select Facing
4. Click on map
5. Save

### Adding an Object
1. Switch to Objects mode
2. Enter ID and Type
3. Select Facing
4. Click on map
5. Save

### Configuring Triggers
1. Switch to Triggers mode
2. Set Select Trigger (optional)
3. Add scripts (optional)
4. Configure IDs and triggers
5. Save

### Placing Animated Tiles
1. Switch to Animated Tiles mode
2. Enter Type
3. Click on map
4. Save

## Tips

- Use descriptive IDs (e.g., "entrance_guard" not "sprite1")
- Type paths are relative to sprites/ folder
- Facing affects initial sprite direction
- Height (Z) can be negative for floor effects
- Always save after making changes
- Use extends to reduce duplication

## Status Bar

Bottom bar shows:
- Current mode
- Current tool
- Selected tile
- Current height
- Entity counts (sprites, objects, animated tiles)
- Hovered cell coordinates

## Common Issues

### Sprite Not Appearing
- Check ID and Type are filled
- Verify Type path exists in package
- Ensure position is within map bounds

### Tileset Not Loading
- Check console for extends errors
- Verify extended tilesets exist
- Check tileset paths

### Save Not Working
- Check console for errors
- Verify write permissions
- Ensure map structure is valid

## Support

For detailed documentation, see:
- [MAP_EDITOR_ENHANCEMENTS.md](./MAP_EDITOR_ENHANCEMENTS.md)
- [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)
