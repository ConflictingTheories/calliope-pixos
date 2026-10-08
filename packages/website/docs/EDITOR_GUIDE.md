# PixoSpritz Editor Guide

**Version:** 1.0.0  
**Last Updated:** January 2026

This guide walks you through using the PixoSpritz visual editor to create games.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Map Editor](#map-editor)
4. [Sprite Editor](#sprite-editor)
5. [Tileset Editor](#tileset-editor)
6. [Cutscene Editor](#cutscene-editor)
7. [Script Editor](#script-editor)
8. [Asset Management](#asset-management)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Opening the Editor

1. Navigate to the editor URL (typically `http://localhost:5173` in development)
2. The editor will prompt you to open or create a project
3. Choose "Create New Project" or "Open Existing Project"

### First-Time Setup

On first launch, the editor will guide you through:

- Project name and location
- Initial asset setup
- Basic configuration

### Project Structure

A PixoSpritz project is a `.pxz` archive containing:

```
project.pxz
├── manifest.json          # Game metadata
├── maps/                  # Map files
│   ├── village/
│   │   ├── map.json
│   │   ├── cells.json
│   │   └── heights.json
├── sprites/              # Sprite definitions
│   ├── hero.json
│   └── npc_villager.json
├── tilesets/             # Tileset definitions
│   └── overworld.json
├── cutscenes/            # Cutscene scripts
│   └── intro.pxc
├── triggers/             # Trigger scripts
│   └── door_trigger.pxs
├── textures/             # Image assets
│   ├── sprites/
│   └── tiles/
└── audio/                # Audio assets
    ├── bgm/
    └── sfx/
```

---

## Map Editor

The Map Editor allows you to create and edit game maps in both 2D and 3D views.

### Opening a Map

1. In the file browser, navigate to `maps/`
2. Double-click a map file (e.g., `village/map.json`)
3. The map editor will open

### Editor Modes

The map editor has several modes accessible via the toolbar:

- **Tiles Mode** - Paint tiles on the map
- **Sprites Mode** - Place sprites/characters
- **Objects Mode** - Place interactive objects
- **Triggers Mode** - Define trigger zones
- **Lights Mode** - Place light sources
- **Animated Tiles Mode** - Add animated tile effects
- **Attributes Mode** - Edit cell properties

### Tools

#### Paint Tool

- **Left-click**: Paint selected tile
- **Right-click**: Erase tile
- **Shift + Drag**: Draw straight lines
- **Ctrl + Click**: Pick tile from map

#### Sprite/Object Placement

1. Select Sprite/Object mode
2. Choose sprite/object type from palette
3. Click on map to place
4. Right-click to remove

#### Height Editing (3D Mode)

1. Switch to 3D view
2. Select height tool
3. Click and drag to adjust height
4. Use mouse wheel for fine adjustment

### View Modes

- **2D View**: Top-down tile view
- **3D View**: Isometric 3D preview

Toggle between views using the view mode button.

### Layers

Maps support multiple layers:

- **Base Layer**: Ground tiles
- **Overlay Layer**: Decorative tiles
- **Object Layer**: Interactive objects
- **Sprite Layer**: Characters/NPCs

Switch layers using the layer selector.

### Saving Maps

- **Ctrl+S**: Save current map
- Maps are automatically saved to the project archive
- Changes are reflected immediately in the preview

---

## Sprite Editor

The Sprite Editor allows you to create and edit sprite animations.

### Creating a Sprite

1. Navigate to `sprites/` in the file browser
2. Click "New Sprite"
3. Enter sprite name and dimensions
4. The sprite editor will open

### Drawing Tools

The sprite editor includes:

- **Pencil Tool** (`P`): Draw single pixels
- **Brush Tool** (`B`): Draw with brush size
- **Eraser Tool** (`E`): Erase pixels
- **Fill Tool** (`F`): Fill area with color
- **Eyedropper Tool** (`I`): Pick color from canvas
- **Line Tool** (`L`): Draw straight lines
- **Rectangle Tool** (`R`): Draw rectangles
- **Ellipse Tool** (`O`): Draw ellipses
- **Selection Tool** (`S`): Select and move regions

### Animation Setup

1. Click "Add Animation" button
2. Enter animation name (e.g., "walk", "idle")
3. Set frame count and duration
4. Draw frames sequentially
5. Use playback controls to preview

### Animation Properties

- **Frame Rate**: Frames per second
- **Loop**: Whether animation loops
- **Direction**: 8-directional support (N, NE, E, SE, S, SW, W, NW)

### Sprite Properties

- **Anchor Point**: Sprite pivot point
- **Collision Box**: Define collision bounds
- **Hotspot**: Interaction point
- **Draw Offset**: Visual offset per direction

### Exporting Sprites

Sprites are automatically saved to the project. Export options:

- PNG sequence
- GIF animation
- Sprite sheet

---

## Tileset Editor

The Tileset Editor manages tile definitions and properties.

### Creating a Tileset

1. Navigate to `tilesets/` in the file browser
2. Click "New Tileset"
3. Import tile image or create new
4. Define tile size (e.g., 32x32)

### Tile Properties

For each tile, you can set:

- **Walkability**: Which directions are walkable
  - North, South, East, West
  - Diagonal directions
- **Collision**: Whether tile blocks movement
- **Height**: Z-height for 3D rendering
- **Tags**: Custom tags for filtering
- **Auto-tile Rules**: Smart tile placement

### Auto-tiling

Auto-tiling automatically selects tile variants based on neighbors:

1. Select tile with auto-tile enabled
2. Define connection rules
3. Tiles will update automatically when placed

### Tile Variants

Tiles can have multiple variants:

- Different visual styles
- Seasonal variants
- Damaged/broken states

---

## Cutscene Editor

The Cutscene Editor creates scripted sequences using a visual timeline.

### Creating a Cutscene

1. Navigate to `cutscenes/` in the file browser
2. Click "New Cutscene"
3. Enter cutscene name
4. The timeline editor opens

### Event Types

Cutscenes support various event types:

- **Dialogue**: Show text dialogue
- **Cutin**: Display character portrait
- **Wait**: Pause for duration
- **Action**: Execute script action
- **Transition**: Screen transition effect
- **Load Zone**: Change to different zone
- **Camera**: Camera movement/effects

### Timeline Interface

- **Timeline**: Horizontal timeline showing events
- **Tracks**: Separate tracks for parallel events
- **Playhead**: Current playback position
- **Scrubbing**: Drag playhead to preview

### Adding Events

1. Click "Add Event" button
2. Select event type
3. Configure event properties
4. Drag to position on timeline

### Event Properties

#### Dialogue Event

- **Speaker**: Character name
- **Text**: Dialogue content
- **Portrait**: Character portrait
- **Duration**: Display duration

#### Camera Event

- **Type**: Pan, zoom, shake, follow
- **Target**: Position or entity
- **Duration**: Animation duration
- **Easing**: Easing function

#### Transition Event

- **Effect**: Fade, wipe, pixelate, dissolve
- **Direction**: In/out
- **Duration**: Transition duration

### DSL Mode

Cutscenes can also be edited as text using the DSL:

```pxc
transition fade out 500
load_zone village fade 500
transition fade in 500
dialogue "Hero" "Welcome to the village!"
wait 1000
cutin hero happy left
dialogue "Hero" "This is my home."
```

### Preview

- **Play Button**: Preview cutscene
- **Pause**: Pause playback
- **Stop**: Stop and reset
- **Scrub**: Drag playhead to jump to position

---

## Script Editor

The Script Editor provides a Monaco-based code editor for PixoScript.

### Features

- **Syntax Highlighting**: PixoScript syntax support
- **Autocomplete**: IntelliSense for engine APIs
- **Error Detection**: Real-time error checking
- **Code Folding**: Collapse code blocks
- **Multi-cursor**: Edit multiple locations
- **Find & Replace**: Search across files

### Writing Scripts

PixoScript is Lua-inspired and easy to learn:

```lua
-- Set a flag
pixos.set_flag("met_npc", true)

-- Check flag
if pixos.has_flag("met_npc") then
  pixos.sprite_dialogue("npc", "Hello again!")
else
  pixos.sprite_dialogue("npc", "Nice to meet you!")
  pixos.set_flag("met_npc", true)
end

-- Move sprite
pixos.move_sprite("hero", 10, 5, 0)

-- Play sound
pixos.play_sfx("audio/door_open.wav")
```

### API Reference

Press `Ctrl+Space` for autocomplete. Available APIs:

- `pixos.set_flag(key, value)` - Set game flag
- `pixos.get_flag(key)` - Get game flag
- `pixos.move_sprite(id, x, y, z)` - Move sprite
- `pixos.sprite_dialogue(id, text)` - Show dialogue
- `pixos.play_sfx(path)` - Play sound
- `pixos.play_music(path, loop)` - Play music
- `pixos.load_zone_from_zip(zoneId, zip)` - Load zone
- `pixos.save(slotId, name)` - Save game
- `pixos.load(slotId)` - Load game

See [API Reference](./00-pixospritz-api.md) for complete API.

### Debug Console

The editor includes a debug console:

1. Open Console panel (bottom of editor)
2. Script output appears here
3. Use `pixos.log("message")` in scripts

---

## Asset Management

### File Browser

The left sidebar shows the project file tree:

- **Folders**: Expand/collapse with arrow
- **Files**: Double-click to open
- **Context Menu**: Right-click for options

### Importing Assets

1. Right-click target folder
2. Select "Import File"
3. Choose file from disk
4. Asset is added to project

Supported formats:

- **Images**: PNG, GIF, JPEG, BMP
- **Audio**: MP3, OGG, WAV
- **Models**: OBJ
- **Text**: JSON, TXT, PXS, PXC

### Exporting Assets

1. Right-click asset
2. Select "Export"
3. Choose destination
4. File is saved to disk

### Asset Properties

Right-click any asset → "Properties":

- File size
- Dimensions (images)
- Duration (audio)
- Last modified

---

## Keyboard Shortcuts

### Global Shortcuts

- `Ctrl+S`: Save current file
- `Ctrl+O`: Open file
- `Ctrl+N`: New file
- `Ctrl+Z`: Undo
- `Ctrl+Y`: Redo
- `Ctrl+F`: Find
- `Ctrl+H`: Find & Replace
- `Ctrl+/`: Toggle comment
- `F11`: Toggle fullscreen
- `Esc`: Close current panel

### Map Editor

- `1-9`: Select tool
- `Space`: Pan view
- `Ctrl+Scroll`: Zoom
- `G`: Toggle grid
- `L`: Toggle layers panel

### Sprite Editor

- `P`: Pencil tool
- `B`: Brush tool
- `E`: Eraser tool
- `F`: Fill tool
- `I`: Eyedropper tool
- `L`: Line tool
- `R`: Rectangle tool
- `O`: Ellipse tool
- `S`: Selection tool
- `Ctrl+A`: Select all
- `Ctrl+C`: Copy
- `Ctrl+V`: Paste
- `Ctrl+X`: Cut
- `Delete`: Delete selection

### Script Editor

- `Ctrl+Space`: Autocomplete
- `F1`: Show command palette
- `Ctrl+K Ctrl+S`: Keyboard shortcuts
- `Alt+Up/Down`: Move line
- `Shift+Alt+Up/Down`: Copy line
- `Ctrl+/`: Toggle line comment
- `Shift+Alt+A`: Toggle block comment

---

## Tips & Best Practices

### Map Design

1. **Use Layers**: Organize tiles, objects, and sprites on separate layers
2. **Grid Alignment**: Keep sprites aligned to grid for clean look
3. **Height Variation**: Use height to create depth and interest
4. **Lighting**: Place lights strategically for atmosphere
5. **Triggers**: Use triggers for interactive elements (doors, chests)

### Sprite Creation

1. **Consistent Style**: Maintain consistent art style across sprites
2. **Animation Timing**: Match animation speed to game feel
3. **Anchor Points**: Set anchor points correctly for proper positioning
4. **Collision Boxes**: Define accurate collision boxes
5. **Direction Support**: Create 8-directional animations for smooth movement

### Scripting

1. **Modular Scripts**: Break complex logic into reusable functions
2. **Flag Management**: Use flags for game state tracking
3. **Error Handling**: Check for nil values before accessing
4. **Comments**: Document complex logic
5. **Testing**: Test scripts frequently in debug console

### Performance

1. **Texture Size**: Keep textures power-of-2 sized (32, 64, 128, etc.)
2. **Sprite Count**: Limit active sprites for performance
3. **Audio Format**: Use compressed formats (OGG) for music
4. **Map Size**: Keep maps reasonable size (under 100x100 tiles)
5. **LOD**: Use level-of-detail for distant objects

### Organization

1. **Naming Conventions**: Use consistent naming (snake_case, camelCase)
2. **Folder Structure**: Organize assets by type
3. **Version Control**: Use Git for project versioning
4. **Backups**: Regularly backup project files
5. **Documentation**: Document custom systems and scripts

---

## Troubleshooting

### Common Issues

**Map not saving:**

- Check file permissions
- Ensure project archive is writable
- Try saving to different location

**Sprites not appearing:**

- Verify sprite is in correct folder
- Check sprite JSON definition
- Ensure texture path is correct

**Scripts not running:**

- Check syntax errors in console
- Verify script is attached to trigger/sprite
- Ensure script file extension is `.pxs`

**Editor slow:**

- Reduce map size
- Close unused panels
- Clear browser cache
- Check browser console for errors

### Getting Help

- **Documentation**: Check [API Reference](./00-pixospritz-api.md)
- **Tutorials**: See [Tutorials](./TUTORIALS.md)
- **GitHub Issues**: Report bugs on GitHub
- **Community**: Join Discord/Forum for support

---

_Happy game making!_
