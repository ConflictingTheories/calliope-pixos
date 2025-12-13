# Tilesets

This directory contains tileset definitions used for rendering game maps. Each tileset is a directory containing tile graphics and configuration.

## Available Tilesets

### common
General-purpose tiles suitable for outdoor environments and basic floors.
- Standard floor tiles (FLOOR)
- Water tiles (WATER)
- Wall tiles (N_WALL, S_WALL, L_WALL, R_WALL)
- Corner pieces (NLW_CORNER, NRW_CORNER, SLW_CORNER, SRW_CORNER)
- Decorative columns (NLW_COLUMN, NRW_COLUMN, SLW_COLUMN, SRW_COLUMN)
- Transition tiles (stairs, walkways)

### sewer
Dark, dungeon-style tiles for underground areas.
- Stone floor tiles
- Dark water/lava tiles
- Dungeon walls with moss/damage
- Decorative pillars and columns
- Grate and drain tiles

### village
Warm, rustic tiles for town and village environments.
- Wooden floor tiles
- Stone pathways
- Wooden walls and fences
- Grass and dirt variations
- Market stall tiles

## Tileset Structure

Each tileset directory should contain:
```
tileset-name/
├── tileset.json    # Configuration (tile size, animation data)
├── tiles.png       # Spritesheet of all tiles
└── tiles.gif       # Animated version (optional)
```

## Tile Types

| Type | Description |
|------|-------------|
| `EMPTY` | Non-rendered void space |
| `FLOOR` | Walkable floor tile |
| `WATER` | Water tile (may be walkable or blocking) |
| `N_WALL` | North-facing wall |
| `S_WALL` | South-facing wall |
| `L_WALL` | Left (west) wall |
| `R_WALL` | Right (east) wall |
| `*_CORNER` | Corner pieces (NLW, NRW, SLW, SRW) |
| `*_COLUMN` | Decorative columns |
| `*_STAIR` | Stair tiles for transitions |
| `*_WALKWAY` | Bridge/walkway tiles over water |

## Usage

Tilesets are referenced in map.json files:
```json
{
  "tileset": "village",
  "bounds": [0, 0, 15, 15]
}
```

The corresponding cells.json defines the tile layout using tile type strings.
