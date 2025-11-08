# Calliope Pixos Plugin

This plugin is for [Calliope](https://calliope.site) and is designed to provide Pixospritz player functionality.

## Pixospritz Tutorial Guide: Building a Spritz Package from the Example

### Introduction to Pixospritz

Pixospritz is a modular game engine and storytelling platform built in JavaScript/WebGL. It supports package-based content distribution, allowing games to be standalone or merged into persistent experiences. Key features include:

- **Package-based design**: Games are distributed as "spritz" packages containing assets, configs, and scripts.
- **Lua scripting**: Full engine API access for custom logic, triggers, callbacks, and events.
- **Rendering pipeline**: WebGL with skybox shaders, tiles, sprites, models, and transitions.
- **Modes, maps, and zones**: Define gameplay modes, spatial layouts, and interactive elements.
- **Extensibility**: Supports multiplayer, editor integration, and runtime customization.

This guide uses the `example/spritz/` folder as a complete example. We'll walk through setting up, configuring, and running a spritz package, explaining how each component works.

### Prerequisites

- Node.js and npm installed.
- Basic knowledge of JSON, Lua scripting, and game development concepts.
- The Pixospritz engine codebase (assumed cloned in `/Users/kderbyma/Git/calliope-pixos`).

### Step 1: Understanding the Spritz Package Structure

A spritz package is a ZIP archive (or folder) with a specific structure. The `example/spritz/` folder is our example package. Key folders:

- `manifest.json`: Main config file defining initial zones, modes, maps, etc.
- `audio/`: Sound files (e.g., MP3s).
- `callbacks/`: Lua scripts for reusable functions (e.g., door interactions).
- `maps/`: Zone layouts with tiles, objects, and scripts.
- `models/`: 3D models (OBJ/MTL files).
- `modes/`: Gameplay modes with setup/teardown/update scripts.
- `sprites/`: Character/object definitions with animations.
- `textures/`: Images for sprites, tiles, etc.
- `tilesets/`: Tile definitions with geometry and textures.
- `triggers/`: Conditional scripts for events (e.g., zone entry).

The package is loaded by the engine, which parses JSON configs and executes Lua scripts.

### Step 2: Setting Up the Package

1. **Create the Folder Structure**:
   - Copy `example/spritz/` to a new folder, e.g., `my-spritz/`.
   - Ensure the structure matches the example.

2. **Install Dependencies**:
   - In the root project directory (`/Users/kderbyma/Git/calliope-pixos`), run `npm install`.
   - For the example, navigate to `example/` and run `npm install` if needed.

3. **Run the Engine**:
   - Start the Pixospritz engine: `npm run dev` in the root.
   - Open `http://localhost:3000` (or configured port) in a browser.
   - Load the spritz package via the editor or directly (engine supports package loading).

The example package loads automatically in the `example/` app, demonstrating a dungeon room with explore/tactics modes.

### Step 3: Configuring the Manifest

The `manifest.json` is the entry point. It defines global settings.

Example from `example/spritz/manifest.json`:

```json
{
  "initialZones": ["base"],
  "modes": ["explore", "fight", "debug", "tactics"],
  "maps": ["room", "dungeon-top", "dungeon-bottom"],
  "tilesets": ["common", "sewer"],
  "network": {
    "enabled": true,
    "url": "ws://localhost:8080",
    "authority": "server"
  },
  "sprites": ["characters/male", "npc/air-knight"],
  "objects": [],
  "textures": [],
  "fonts": [],
  "audio": []
}
```

- `initialZones`: Starting zones (maps) to load.
- `modes`: Available gameplay modes (defined in `modes/`).
- `maps`: Map IDs (folders in `maps/`).
- `tilesets`: Tileset IDs (folders in `tilesets/`).
- `network`: Multiplayer settings (WebSocket URL).
- `sprites`: Sprite definitions (JSON files in `sprites/`).
- Other arrays: Lists assets (populated by engine from folders).

**How it Works**: The engine loads the manifest, initializes zones/maps, and sets up networking. Customize for your game (e.g., add new modes/maps).

**Tutorial Tip**: Change `"initialZones": ["my-zone"]` and create a new map folder. Reload the engine to test.

### Step 4: Creating Maps

Maps define spatial layouts using tilesets. Each map is a folder in `maps/` with `map.json` and `cells.json`.

Example: `example/spritz/maps/room/map.json`:

```json
{
  "extends": ["dungeon-top", "dungeon-bottom"],
  "tileset": "sewer",
  "bounds": [0, 0, 17, 19],
  "scripts": [
    {
      "id": "load-spritz",
      "trigger": "zone/room_clear_path"
    }
  ],
  "selectTrigger": "tile/select_test",
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

- `extends`: Inherits from other maps.
- `tileset`: References a tileset.
- `bounds`: Map size.
- `scripts`: Lua triggers to run.
- `lights`: Lighting config (position, color, etc.).

`cells.json` defines tile placements (empty in example, uses extensions).

**How it Works**: Engine renders tiles based on tileset, applies lights, and runs scripts on load. Maps support procedural generation via Lua.

**Tutorial Tip**: Add a new tile in `cells.json` (e.g., `{"cells": [[{"tile": "FLOOR", "x": 0, "y": 0}]]}`). Reload to see changes.

### Step 5: Defining Sprites

Sprites are animated entities. Defined in JSON files in `sprites/`.

Example: `example/spritz/sprites/characters/male.json`:

```json
{
  "type": "avatar",
  "src": "character.png",
  "portraitSrc": "hero_portrait.gif",
  "sheetSize": [96, 384],
  "tileSize": [24, 48],
  "state": "intro",
  "gender": "male",
  "frames": {
    "N": [[0, 192], [24, 192], ...]
  },
  "drawOffset": { "N": [-0.25, -0.15, -1] },
  "hotspotOffset": [0.5, 0.5, 0],
  "bindCamera": true,
  "enableSpeech": true,
  "selectTrigger": "sprite/test_select",
  "cutouts": { "happy": "cutout_happy.png" }
}
```

- `type`: Entity type (avatar, npc, etc.).
- `src`: Texture image.
- `frames`: Animation frames by direction (N, E, S, W, etc.).
- `drawOffset`: Rendering adjustments.
- `bindCamera`: Follows player.
- `selectTrigger`: Lua script on selection.

**How it Works**: Engine loads textures, animates frames, handles interactions. Sprites can be controlled by modes or scripts.

**Tutorial Tip**: Add a new sprite (e.g., copy and modify for "female"). Update `manifest.json` sprites array.

### Step 6: Configuring Tilesets

Tilesets define tiles with textures and geometry. Folder in `tilesets/` with `tileset.json`.

Example: `example/spritz/tilesets/common/tileset.json`:

- `textures`: Maps tile names to image coords (e.g., `"FLOOR": [1, 1]`).
- `geometry`: 3D models for tiles (vertices, surfaces, walkable polys).
- `tiles`: Combines geometry/textures (e.g., `"FLOOR": ["FLAT_ALL", "FLOOR", 0]`).

**How it Works**: Engine renders tiles as 3D meshes with textures. Supports stairs, walls, etc.

**Tutorial Tip**: Add a new tile (e.g., `"MY_TILE": ["FLAT_ALL", "FLOOR", 0]`). Use in a map.

### Step 7: Defining Modes

Modes control gameplay logic. Folder in `modes/` with `mode.json` and Lua scripts.

Example: `example/spritz/modes/explore/mode.json`:

```json
{
  "name": "explore",
  "update": "update.lua",
  "setup": "setup.lua"
}
```

`setup.lua`: Registers mode with setup/update/teardown functions.

**How it Works**: Engine switches modes, calling Lua functions. Modes handle input, AI, etc.

**Tutorial Tip**: Create a new mode (e.g., "combat"). Add to manifest.

### Step 8: Using Triggers, Callbacks, Actions, and Events

- **Triggers**: Conditional scripts (e.g., `triggers/zone/room_load.lua` runs on zone entry).
- **Callbacks**: Reusable functions (e.g., `callbacks/door_opened.lua` for door logic).
- **Actions**: Engine-defined behaviors (move, chat, etc.).
- **Events**: Async logic (camera, menu, etc.).

Example Lua in `triggers/zone/room_load.lua`:

```lua
pixos.set_mode('tactics');
pixos.sync({ pixos.play_cutscene('strange-legend') });
```

**How it Works**: Lua API (`pixos.*`) accesses engine features. Scripts run on conditions.

**Tutorial Tip**: Add a trigger (e.g., on sprite click). Use `pixos.log()` for debugging.

### Step 9: Scripting with Lua

Pixospritz uses Lua for logic. API includes:

- `pixos.get_world()`: Access game state.
- `pixos.set_mode()`: Switch modes.
- `pixos.create_particle()`: Effects.
- Full engine access (skybox, audio, etc.).

Example from `modes/explore/setup.lua`:

```lua
pixos.register_mode('explore', {
  setup = function(params)
    pixos.log('explore: setup called')
    -- Focus camera on avatar
  end
})
```

**How it Works**: Lua interpreter runs scripts, integrates with JSON configs.

**Tutorial Tip**: Modify a script (e.g., add logging). Reload engine.

### Step 10: Applying Assets

- **Textures**: Images in `textures/` (e.g., PNGs for sprites/tiles).
- **Audio**: MP3s in `audio/` (played via Lua).
- **Models**: OBJ/MTL in `models/` (3D rendering).

**How it Works**: Engine loads assets on demand. Reference in JSON/Lua.

**Tutorial Tip**: Add a new texture (e.g., "my-texture.png"). Use in a sprite.

### Step 11: Running and Testing the Example

1. Start engine: `npm run dev`.
2. Load package in browser/editor.
3. Explore the room: Move avatar, trigger events.
4. Switch modes (e.g., tactics via trigger).
5. Use editor for debugging (maps, sprites).

The example demonstrates a full dungeon scene with lighting, sprites, and scripting.

### Installation

The plugin can be installed from NPM via:

        npm install calliope-pixos

### Usage

Inside of your `_calliope/app/config/plugins/index.jsx` file, add the following:

```javascript
    // Import the module at the top
    import Pixos from "calliope-pixos";
    // and then further down inside of the switch statement add the following
    // ...
    case "pixos":
      let Plugin = Pixos['calliope-pixos'].default;
      return <Plugin />;
    // ...
```

### Assets

All paths are relative to the a core package folder (see /example/spritz) from the public directory when loading asssets. Place any of your assets used such as tilesets, sprites, and fonts and place them within the package folder directories for proper fetching. Please see example for how to load and extend assets.

### LICENSE

<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons Attribution-NonCommercial 4.0 International License</a>.

This plugin is free to use for non-commercial use only. If you are an individual, a hobbyist, or a tinkerer than this is free to use for your personal use excluding any commercial use. All modifications to the source code must be released back as open source to the community and preferably a pull request will be made with the available updates and improvements if applicable. There is commercial licensing available upon an individual request basis. The licensing will be based upon the scope and revenue expectations of the commercial use-case. For more information, please reach out via email to director@sovereign.enterprises for licensing details. For more information on the non-commerical license which is included by default - please see [LICENSE](LICENSE)
