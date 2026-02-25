# Maps

This directory contains game map/zone definitions. Each map is a directory containing the map configuration and tile layout.

## Available Maps

### Example Game: The Elemental Trials

| Map                | Tileset | Mode    | Description                          |
| ------------------ | ------- | ------- | ------------------------------------ |
| `village-hub`      | village | explore | Central village, game starting point |
| `dungeon-entrance` | sewer   | explore | Hub connecting elemental chambers    |
| `fire-chamber`     | sewer   | tactics | Fire elemental trial                 |
| `water-chamber`    | common  | tactics | Water elemental trial                |
| `earth-chamber`    | village | tactics | Earth elemental trial                |
| `air-chamber`      | common  | tactics | Air elemental trial                  |
| `boss-arena`       | sewer   | fight   | Final boss confrontation             |

### Demo Maps

| Map             | Description                  |
| --------------- | ---------------------------- |
| `hallway`       | Basic hallway demonstration  |
| `room`          | Simple room layout           |
| `base`          | Starter base template        |
| `cutscene-demo` | Cutscene testing environment |
| `town-village`  | Village demonstration        |

## Map Structure

Each map directory contains:

```
map-name/
├── map.json        # Map configuration
└── cells.json      # Tile layout (2D array)
```

### map.json Structure

```json
{
  "name": "Map Display Name",
  "description": "Map description",
  "bounds": [x1, y1, x2, y2],
  "tileset": "tileset-name",
  "audioSrc": "background-music.mp3",
  "mode": "explore|tactics|fight",

  "sprites": [...],
  "lights": [...],
  "objects": [...],
  "scenes": [...],
  "menu": {...}
}
```

### cells.json Structure

A 2D array of tile type strings matching the bounds dimensions:

```json
[
  ["EMPTY", "NLW_CORNER", "N_WALL", "NRW_CORNER", "EMPTY"],
  ["EMPTY", "L_WALL", "FLOOR", "R_WALL", "EMPTY"],
  ["EMPTY", "SLW_CORNER", "S_WALL", "SRW_CORNER", "EMPTY"]
]
```

Dimensions: `(x2 - x1 + 1)` columns × `(y2 - y1 + 1)` rows

## Map Features

### Sprites

Characters, NPCs, monsters, and interactive objects placed in the map.

### Lights

Dynamic lighting sources (sun, fire, magic effects).

### Objects

3D model objects rendered in the scene.

### Scenes

Camera and environment settings.

### Menu

In-game menu system configuration.

## Game Modes

| Mode       | Description                    |
| ---------- | ------------------------------ |
| `explore`  | Free movement, NPC interaction |
| `tactics`  | Turn-based tactical combat     |
| `fight`    | Real-time boss battle          |
| `cutscene` | Non-interactive story sequence |

## Zone Transitions

Maps connect via portal sprites:

```json
{
  "id": "fire-portal",
  "type": "furniture/portal",
  "zones": ["fire-chamber"],
  "state": "open"
}
```
