# Sprites

This directory contains all sprite definitions for the game, organized by category.

## Directory Structure

```
sprites/
├── characters/     # Playable character sprites
├── npc/           # Non-player characters
├── monsters/      # Enemy sprites
├── furniture/     # Interactive objects (doors, chests, etc.)
├── objects/       # Collectible items and props
└── effects/       # Visual effects (particles, magic, etc.)
```

## Sprite Categories

### Characters (`characters/`)
Playable character sprites with full animation sets.
- **male** - Male protagonist
- **female** - Female protagonist
- Various hair colors and styles

### NPCs (`npc/`)
Non-player character sprites for quest givers and townspeople.
- **air-knight** - Wind elemental guardian knight
- **water-knight** - Water elemental guardian knight
- **fire-knight** - Fire elemental guardian knight
- **earth-knight** - Earth elemental guardian knight

### Monsters (`monsters/`)
Enemy sprites for combat encounters.
- **slime** - Basic enemy
- **skeleton** - Undead warrior
- **golem** - Stone construct
- **dragon** - Boss monster
- **elemental** - Elemental guardians

### Furniture (`furniture/`)
Interactive world objects.
- **door** - Openable doors with open/closed states
- **portal** - Zone transition portals
- **chest** - Treasure chests with inventory
- **fireplace** - Light source with animation
- **tree** - Decorative trees

### Objects (`objects/`)
Collectible items and props.
- **chests/** - Various chest types (wood, blue, gold)
- **potions/** - Health and mana potions
- **keys/** - Keys for locked doors

### Effects (`effects/`)
Visual effect sprites.
- **fireplace** - Fire particle effect
- **magic** - Spell casting effects
- **portal** - Portal swirl effects

## Sprite Format

Each sprite is defined in a directory with:
```
sprite-name/
├── sprite.json     # Animation and collision data
├── sprite.gif      # Animated spritesheet
└── sprite.png      # Static fallback
```

### sprite.json Structure
```json
{
  "width": 32,
  "height": 32,
  "animations": {
    "idle": { "frames": [0], "speed": 1 },
    "walk": { "frames": [0,1,2,3], "speed": 8 },
    "attack": { "frames": [4,5,6,7], "speed": 12 }
  },
  "collision": { "x": 8, "y": 24, "width": 16, "height": 8 }
}
```

## Usage in Maps

Sprites are referenced in map.json files:
```json
{
  "sprites": [
    {
      "id": "avatar",
      "type": "characters/male",
      "pos": [10, 8, 0],
      "facing": "Down",
      "bindCamera": true
    }
  ]
}
```
