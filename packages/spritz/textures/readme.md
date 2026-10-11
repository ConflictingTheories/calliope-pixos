# Textures

This directory contains texture files used for sprites, tilesets, 3D models, and UI elements.

## Texture Categories

### Character Textures

| File                | Description           |
| ------------------- | --------------------- |
| `player.gif`        | Main player character |
| `player-blonde.gif` | Blonde hair variant   |
| `player-blue.gif`   | Blue outfit variant   |
| `player-dark.gif`   | Dark theme variant    |
| `player-elf.gif`    | Elf character         |
| `sorceror.gif`      | Magic user character  |

### NPC/Monster Textures

| File               | Description            |
| ------------------ | ---------------------- |
| `air-knight.gif`   | Air elemental knight   |
| `water-knight.gif` | Water elemental knight |
| `fire-knight.gif`  | Fire elemental knight  |
| `earth-knight.gif` | Earth elemental knight |
| `elementals.gif`   | Elemental creatures    |
| `elementals-2.gif` | Additional elementals  |
| `darkness.gif`     | Dark enemy sprites     |

### Portrait Textures

| File                    | Description             |
| ----------------------- | ----------------------- |
| `hero_portrait.gif`     | Hero dialogue portrait  |
| `air_portrait.gif`      | Air guardian portrait   |
| `water_portrait.gif`    | Water guardian portrait |
| `fire_portrait.gif`     | Fire guardian portrait  |
| `earth_portrait.gif`    | Earth guardian portrait |
| `dark_portrait.gif`     | Dark Lord portrait      |
| `skull_portrait.gif`    | Skeleton portrait       |
| `spirit_portrait.gif`   | Spirit portrait         |
| `witch_portrait.gif`    | Witch portrait          |
| `soldier_portrait.gif`  | Soldier portrait        |
| `potion_portrait.gif`   | Item portrait           |
| `succubus_portrait.gif` | Succubus portrait       |

### Tileset Textures

| File                        | Description     |
| --------------------------- | --------------- |
| `tileset.png`               | Common tileset  |
| `tileset-forest.png`        | Forest tileset  |
| `room.png` / `room.gif`     | Room tileset    |
| `sewer.png` / `sewer.gif`   | Sewer tileset   |
| `sewer-lava.gif`            | Sewer with lava |
| `sewer-mud.gif`             | Sewer with mud  |
| `trees.png` / `trees.gif`   | Tree sprites    |
| `chests.png` / `chests.gif` | Chest sprites   |

### Skybox Textures

| File                      | Description          |
| ------------------------- | -------------------- |
| `face1.bmp` - `face6.bmp` | Cubemap skybox faces |

### Model Textures

| File                       | Description          |
| -------------------------- | -------------------- |
| `character.png`            | 3D character texture |
| `LP_BodyNormalsMap_1K.jpg` | Normal map           |
| `Texture_1K.jpg`           | Base texture         |

## Texture Formats

- **GIF**: Animated sprites (256 colors, frame animation)
- **PNG**: Static sprites with transparency
- **JPEG**: Model textures and backgrounds
- **BMP**: Skybox faces

## Image Specifications

### Sprites

- Power of 2 dimensions recommended (32x32, 64x64, etc.)
- Transparent background for characters
- Consistent frame size for animations

### Portraits

- Standard size: 128x128 or 256x256
- Square aspect ratio
- Used in dialogue and cutscenes

### Tilesets

- Grid-based layout (typically 16x16 or 32x32 per tile)
- Seamless edges for tiling
- Consistent style within set

## Usage Examples

### In Sprites (sprite.json)

```json
{
  "texture": "textures/player.gif",
  "width": 32,
  "height": 32
}
```

### In Cutscenes (.pxc)

```
@char Hero using "textures/hero_portrait.gif"
@backdrop "textures/room.png"
```

### In Maps (for portraits)

```json
{
  "sprites": [
    {
      "id": "elder",
      "portraitSrc": "textures/portraits/elder_portrait.gif"
    }
  ]
}
```
