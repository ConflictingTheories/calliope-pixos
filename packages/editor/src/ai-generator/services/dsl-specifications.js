/**
 * ---------------------------------------------------------------
 *                AI Generator - DSL Specifications
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Comprehensive DSL specifications for PixosScript, PixoCut, and
 * package structure. These are used as system prompts for AI
 * to generate valid, usable game assets.
 */

/**
 * PixosScript (Lua) DSL Specification
 * Used for .pxs script files (callbacks, triggers)
 */
export const PIXOSCRIPT_SPEC = `# PixosScript DSL Specification

PixosScript is a Lua 5.3-based scripting language for the Pixospritz game engine.

## Core API Functions

### Context Functions
\`\`\`lua
local caller = pixos.get_caller()    -- Object that triggered script
local subject = pixos.get_subject()  -- Player or target sprite
local zone = pixos.get_zone()        -- Current zone/map
local world = pixos.get_world()      -- World object
\`\`\`

### Property Access
\`\`\`lua
local value = pixos.from(object, 'propertyName')  -- Read property
pixos.to(object, { prop1 = value1, blocking = true })  -- Write properties
\`\`\`

### Flag System (Persistent State)
\`\`\`lua
pixos.has_flag('flag_name')         -- Check if flag exists (returns boolean)
pixos.set_flag('flag_name', value)  -- Set flag value
pixos.get_flag('flag_name')         -- Get flag value
pixos.add_flag('counter', 1)        -- Add to numeric flag
\`\`\`

### Synchronous Execution (IMPORTANT)
\`\`\`lua
pixos.sync({
    pixos.play_pxc_cutscene('cutscenes/demo.pxc')
})
-- Code here runs AFTER cutscene completes
\`\`\`

### Cutscene Steps
\`\`\`lua
local steps = {
    { type = 'transition', effect = 'fade', direction = 'out', duration = 500 },
    { type = 'load_zone', zone = 'village', zip = 'maps/village.zip' },
    { type = 'transition', effect = 'fade', direction = 'in', duration = 500 }
}
pixos.sync({ pixos.run_cutscene(steps) })
\`\`\`

### Sprite Functions
\`\`\`lua
pixos.sync({ pixos.sprite_dialogue('npc_id', 'Hello!') })
pixos.sync({ pixos.move_sprite('npc_id', {5, 3, 1}, false) })  -- pos, running
\`\`\`

### Logging
\`\`\`lua
pixos.log(pixos.as_obj({ msg = 'Event occurred', data = someData }))
\`\`\`

### Signal Completion
\`\`\`lua
pixos.callback_finish(1)  -- Success (positive)
pixos.callback_finish(0)  -- Failure (zero/negative)
\`\`\`

## Script Templates

### Callback Script (callbacks/*.pxs)
\`\`\`lua
local _this = pixos.get_caller()
local player = pixos.get_subject()

pixos.log(pixos.as_obj({ msg = 'callback triggered', caller = _this }))

-- Your logic here

pixos.callback_finish(1)
\`\`\`

### NPC Interaction (callbacks/npc_*.pxs)
\`\`\`lua
local npc = pixos.get_caller()
local player = pixos.get_subject()

if pixos.has_flag('quest_accepted') then
    pixos.sync({ pixos.sprite_dialogue(npc, 'Have you completed the task?') })
    return
end

pixos.sync({ pixos.play_pxc_cutscene('cutscenes/quest-intro.pxc') })
pixos.set_flag('quest_accepted', true)

return nil
\`\`\`

### Zone Trigger (triggers/zone/*.pxs)
\`\`\`lua
local _this = pixos.get_caller()
pixos.log(pixos.as_obj({ msg = 'zone loaded', zone = _this }))

pixos.set_mode('explore')
pixos.set_skybox_shader('sunset')

local steps = {}
table.insert(steps, { type = 'transition', effect = 'fade', direction = 'in', duration = 500 })
pixos.sync({ pixos.run_cutscene(steps) })

return nil
\`\`\`

### Portal Trigger (triggers/event/portal.pxs)
\`\`\`lua
local portal = pixos.get_caller()
local player = pixos.get_subject()

local zones = pixos.from(portal, 'zones')
local zip = pixos.from(portal, 'zip')

pixos.remove_all_zones()

local steps = {}
table.insert(steps, { type = 'transition', effect = 'blur', direction = 'out', duration = 500 })
table.insert(steps, { type = 'load_zone', zone = zones, zip = zip })
table.insert(steps, { type = 'transition', effect = 'blur', direction = 'in', duration = 500 })

pixos.sync({ pixos.run_cutscene(steps) })
return nil
\`\`\`

## RULES
1. Always use \`local\` for variables
2. End trigger scripts with \`return nil\`
3. Use \`pixos.sync({})\` for async operations
4. Structure logs with \`pixos.as_obj({})\`
5. Check flags before one-time events
6. Use \`table.insert()\` for dynamic arrays
`;

/**
 * PixoCut Cutscene DSL Specification
 * Used for .pxc cutscene files
 */
export const PIXOCUT_SPEC = `# PixoCut Cutscene DSL Specification

PixoCut (.pxc) is a markdown-like DSL for creating visual novel-style cutscenes.

## Commands

### @backdrop - Set Background
\`\`\`
@backdrop textures/room.gif [fadeIn=800]
\`\`\`

### @char - Define Character
\`\`\`
@char HERO sprite=characters/male
@char VILLAIN sprite=npc/dark-knight
\`\`\`

### Dialogue - Character Speech
\`\`\`
# Single line
HERO: [expression=neutral,position=left] Hello there!

# Multi-line
VILLAIN: [expression=angry,position=right]
"""
You dare challenge me?
This will be your end!
"""
\`\`\`

### *Cutin - Dramatic Close-up
\`\`\`
*HERO: [cutin=size=large,expression=shocked]
"""
What was that sound?!
"""
\`\`\`

### @do - Audio/Actions
\`\`\`
@do playBgm [name=audio/theme.mp3]      # Loop background music
@do playSfx [name=audio/explosion.mp3]  # One-shot sound
@do stopBgm                              # Stop music
\`\`\`

### @transition - Scene Transitions
\`\`\`
@transition fadeOutBackdrop [duration=600]
@transition wipe [duration=500]
\`\`\`

### wait / waitInput
\`\`\`
wait 1000      # Pause 1 second
waitInput      # Wait for player input
\`\`\`

### @end - End Cutscene
\`\`\`
@end
\`\`\`

## Expressions
neutral, smile, happy, sad, angry, annoyed, shocked, worried, tired, smirk

## Positions
left, right, center

## Complete Template
\`\`\`
# Cutscene Title
# Brief description

@backdrop textures/scene.gif [fadeIn=800]
@char SPEAKER1 sprite=characters/hero
@char SPEAKER2 sprite=npc/villager

@do playBgm [name=audio/peaceful.mp3]

wait 800

SPEAKER1: [expression=neutral,position=left]
"""
Opening dialogue here.
Sets the scene for the player.
"""

SPEAKER2: [expression=smile,position=right] Response dialogue.

wait 500

*SPEAKER1: [cutin=size=large,expression=shocked]
"""
Dramatic moment!
"""

@do playSfx [name=audio/impact.mp3]

wait 800

SPEAKER2: [expression=worried,position=right]
"""
Closing dialogue.
"""

@transition fadeOutBackdrop [duration=600]

waitInput

@end
\`\`\`

## RULES
1. Always start with @backdrop and @char definitions
2. Use varied expressions to show emotion
3. Alternate left/right positions for conversation
4. Use wait commands (500-1500ms) for pacing
5. Reserve *cutins for dramatic moments
6. Always end with waitInput and @end
7. Keep dialogue concise (2-4 lines per block)
`;

/**
 * Sprite Configuration Specification
 */
export const SPRITE_CONFIG_SPEC = `# Sprite Configuration Specification

Sprite JSON files define character/object rendering and animation.

## Required Fields
\`\`\`json
{
  "type": "sprite",
  "src": "character.png",
  "sheetSize": [96, 384],
  "tileSize": [24, 48],
  "frames": {
    "S": [[0, 0], [24, 0], [48, 0], [72, 0]],
    "SE": [[0, 48], [24, 48], [48, 48], [72, 48]],
    "E": [[0, 96], [24, 96], [48, 96], [72, 96]],
    "NE": [[0, 144], [24, 144], [48, 144], [72, 144]],
    "N": [[0, 192], [24, 192], [48, 192], [72, 192]],
    "NW": [[0, 240], [24, 240], [48, 240], [72, 240]],
    "W": [[0, 288], [24, 288], [48, 288], [72, 288]],
    "SW": [[0, 336], [24, 336], [48, 336], [72, 336]]
  }
}
\`\`\`

## Standard Layouts

### 8-Direction Character (24x48 tiles, 4 frames)
- sheetSize: [96, 384]
- tileSize: [24, 48]
- Row order: S, SE, E, NE, N, NW, W, SW

### 4-Direction Character (24x32 tiles, 4 frames)
- sheetSize: [96, 128]
- tileSize: [24, 32]
- Row order: S, E, N, W

### Monster/NPC (32x32 tiles, 4 frames)
- sheetSize: [128, 128]
- tileSize: [32, 32]
- Row order: S, E, N, W

## Frame Coordinate Formula
For tile at column C, row R:
- x = C * tileWidth
- y = R * tileHeight

## Optional Fields
\`\`\`json
{
  "portraitSrc": "hero_portrait.png",
  "state": "intro",
  "bindCamera": true,
  "enableSpeech": true,
  "blocking": false,
  "fixed": false,
  "isLit": false,
  "frameTime": 150,
  "hotspotOffset": [0.5, 0.5, 0],
  "drawOffset": {
    "N": [-0.15, -0.15, -1],
    "E": [-0.15, -0.15, -1],
    "S": [-0.15, -0.15, -1],
    "W": [-0.15, -0.15, -1]
  },
  "states": [],
  "selectTrigger": "sprite/on_select",
  "stepTrigger": "event/on_step"
}
\`\`\`

## State Machine
\`\`\`json
{
  "states": [
    {
      "name": "intro",
      "next": "idle",
      "actions": [
        {
          "type": "dialogue",
          "dialogue": "Welcome, traveler!",
          "callback": "npc_greet"
        }
      ]
    },
    {
      "name": "idle",
      "next": "idle",
      "actions": []
    }
  ]
}
\`\`\`

## CRITICAL RULES
1. Frame coordinates MUST match actual spritesheet layout
2. sheetSize = [tileWidth * framesPerRow, tileHeight * numDirections]
3. All direction keys must match standard: N, NE, E, SE, S, SW, W, NW
4. Coordinates are [x, y] from TOP-LEFT of sheet
5. Portrait dimensions should be square (64x64, 128x128, or 256x256)
`;

/**
 * Package Manifest Specification
 */
export const MANIFEST_SPEC = `# Pixospritz Package Manifest Specification

The manifest.json file declares all assets in a game package.

## Required Structure
\`\`\`json
{
  "initialZones": ["start"],
  "modes": ["explore"],
  "maps": ["start"],
  "tilesets": ["common"],
  "sprites": ["characters/hero"],
  "textures": ["textures/tileset.png"],
  "audio": [],
  "cutscenes": []
}
\`\`\`

## Complete Fields
\`\`\`json
{
  "initialZones": ["zone-id-1", "zone-id-2"],
  "modes": ["explore", "battle", "menu"],
  "maps": ["village", "dungeon", "overworld"],
  "tilesets": ["common", "dungeon"],
  "sprites": [
    "characters/hero",
    "characters/party-member",
    "npc/shopkeeper",
    "monsters/slime"
  ],
  "objects": ["chair", "table"],
  "textures": [
    "textures/tileset.png",
    "textures/hero_portrait.png"
  ],
  "fonts": [],
  "audio": [
    "audio/theme.mp3",
    "audio/battle.mp3",
    "audio/door.mp3"
  ],
  "cutscenes": [
    "cutscenes/intro.pxc",
    "cutscenes/boss-defeat.pxc"
  ],
  "network": {
    "enabled": false,
    "url": "ws://localhost:8080",
    "authority": "server"
  }
}
\`\`\`

## Asset Path Conventions
- sprites: Relative to sprites/ (e.g., "characters/hero" → sprites/characters/hero.json)
- textures: Full path from package root (e.g., "textures/hero.png")
- audio: Full path from package root (e.g., "audio/theme.mp3")
- cutscenes: Full path from package root (e.g., "cutscenes/intro.pxc")
- maps: Map ID only (e.g., "village" → maps/village/)
- tilesets: Tileset ID only (e.g., "common" → tilesets/common/)
`;

/**
 * Map/Zone Configuration Specification
 */
export const MAP_SPEC = `# Zone/Map Configuration Specification

Each zone has a folder with map.json and cells.json.

## map.json
\`\`\`json
{
  "bounds": [0, 0, 17, 19],
  "tileset": "common",
  "audioSrc": "peaceful.mp3",
  "mode": "explore",
  "sprites": [
    {
      "id": "avatar",
      "type": "characters/hero",
      "pos": [8, 4, 0],
      "facing": "Down"
    },
    {
      "id": "npc-1",
      "type": "npc/villager",
      "pos": [5, 7, 0],
      "facing": "Left",
      "state": "intro"
    }
  ],
  "lights": [
    {
      "id": "ambient",
      "pos": [8, 8, 10],
      "color": [1, 0.9, 0.8],
      "density": 0.3,
      "enabled": true
    }
  ],
  "scripts": [
    {
      "id": "on-load",
      "trigger": "zone/village_load"
    }
  ]
}
\`\`\`

## cells.json
2D array of tile type names matching tileset tiles.json:
\`\`\`json
[
  ["EMPTY", "N_WALL", "N_WALL", "EMPTY"],
  ["L_WALL", "FLOOR", "FLOOR", "R_WALL"],
  ["L_WALL", "FLOOR", "FLOOR", "R_WALL"],
  ["EMPTY", "S_WALL", "S_WALL", "EMPTY"]
]
\`\`\`

## Sprite Instance Fields
- id: Unique identifier
- type: Sprite definition path (relative to sprites/)
- pos: [x, y, z] position
- facing: "Up", "Down", "Left", "Right"
- state: Initial state machine state
- zones: Target zones for portals
- fixed: Cannot move
`;

/**
 * Tileset Configuration Specification
 */
export const TILESET_SPEC = `# Tileset Configuration Specification

Each tileset has a folder with tileset.json, tiles.json, and geometry.json.

## tileset.json
\`\`\`json
{
  "name": "common",
  "src": "tileset.png",
  "sheetSize": [256, 256],
  "tileSize": 16,
  "bgColor": [32, 62, 88],
  "textures": {
    "FLOOR": [1, 1],
    "WALL": [0, 5],
    "WATER": [0, 10],
    "EMPTY": [0, 0]
  }
}
\`\`\`

## tiles.json
Maps tile names to geometry + texture:
\`\`\`json
{
  "FLOOR": ["FLAT_ALL", "FLOOR", 0],
  "WATER": ["FLAT_NONE", "WATER", -1.5],
  "N_WALL": ["WALL_T", "WALL", 2, "FLAT_ALL", "EMPTY_B", 2],
  "S_WALL": ["WALL_B", "WALL", 2, "FLAT_ALL", "EMPTY_T", 2],
  "EMPTY": ["FLAT_ALL", "EMPTY", 2]
}
\`\`\`

Format: ["geometry", "texture", height, ...additional layers]

## Common Geometries
- FLAT_ALL: Flat walkable surface
- FLAT_NONE: Flat non-walkable
- WALL_T/B/L/R: Wall facing direction
- STAIR_T/B/L/R: Stairs facing direction
`;

/**
 * Complete Game Package Structure
 */
export const PACKAGE_STRUCTURE = `# Complete Game Package Structure

\`\`\`
game-package/
├── manifest.json              # Package declaration
├── audio/
│   ├── theme.mp3             # Background music
│   ├── battle.mp3
│   └── sfx/
│       ├── door.mp3
│       └── coin.mp3
├── callbacks/
│   ├── door_opened.pxs
│   ├── random_encounter.pxs
│   ├── victory_screen.pxs
│   ├── run_credits.pxs
│   ├── chest_open.pxs
│   └── npc_quest.pxs
├── cutscenes/
│   ├── intro.pxc
│   └── boss-defeat.pxc
│   └── credits.pxc
├── maps/
│   ├── start/
│   │   ├── map.json
│   │   └── cells.json
│   └── dungeon/
│       ├── map.json
│       └── cells.json
├── modes/
│   └── explore/
│       ├── mode.json
│       ├── setup.pxs
│       └── update.pxs
|   └── battle/
│       ├── mode.json
│       ├── setup.pxs
│       └── update.pxs
├── sprites/
│   ├── characters/
│   │   ├── hero.json
│   │   └── hero.png
│   ├── npc/
│   │   ├── villager.json
│   │   └── villager.png
│   └── monsters/
│       ├── slime.json
│       └── slime.png
├── textures/
│   ├── tileset.png
│   ├── hero_portrait.png
│   └── backgrounds/
│       └── village.gif
├── tilesets/
│   └── common/
│       ├── tileset.json
│       ├── tiles.json
│       └── geometry.json
└── triggers/
    ├── zone/
    │   └── start_load.pxs
    │   └── start_battle.pxs
    └── event/
        └── portal.pxs
\`\`\`
`;

/**
 * Get the complete system prompt for a specific generation type
 */
export function getSystemPrompt(type, context = {}) {
  switch (type) {
    case 'sprite-config':
      return `You are an expert Pixospritz game asset designer. Generate VALID JSON sprite configurations.

${SPRITE_CONFIG_SPEC}

CRITICAL: Frame coordinates MUST be mathematically correct based on tile size and direction layout.
- For 8-direction with 4 frames and 24x48 tiles:
  - Row 0 (S): [[0,0], [24,0], [48,0], [72,0]]
  - Row 1 (SE): [[0,48], [24,48], [48,48], [72,48]]
  - etc.

Return ONLY valid JSON, no explanations.`;

    case 'cutscene':
      return `You are an expert Pixospritz narrative designer. Generate engaging cutscene scripts.

${PIXOCUT_SPEC}

Context: ${context.mood || 'neutral'} mood, ${context.characters?.join(', ') || 'appropriate characters'}

CRITICAL:
1. Write natural, engaging dialogue
2. Use varied expressions
3. Include proper pacing with wait commands
4. Always end with waitInput and @end
5. Keep dialogue concise (2-4 lines per block)

Return ONLY the .pxc script content, no explanations.`;

    case 'script':
      return `You are an expert Pixospritz game programmer. Generate valid Lua scripts.

${PIXOSCRIPT_SPEC}

Script type: ${context.type || 'callback'}

CRITICAL:
1. Use proper pixos API functions
2. Always use local variables
3. End triggers with return nil
4. Use pixos.sync() for async operations
5. Log structured data with pixos.as_obj()

Return ONLY the .pxs script content, no explanations.`;

    case 'manifest':
      return `You are an expert Pixospritz package architect. Generate valid manifest.json files.

${MANIFEST_SPEC}

CRITICAL:
1. List ALL assets that exist in the package
2. Use correct path conventions
3. initialZones MUST reference valid map IDs

Return ONLY valid JSON, no explanations.`;

    case 'map':
      return `You are an expert Pixospritz level designer. Generate valid zone configurations.

${MAP_SPEC}

CRITICAL:
1. Bounds must encompass all content
2. Sprite positions must be within bounds
3. Tileset must be a valid tileset ID
4. Sprite types must reference valid sprite definitions

Return ONLY valid JSON, no explanations.`;

    case 'game-package':
      return `You are an expert Pixospritz game architect. Plan complete game packages.

${PACKAGE_STRUCTURE}
${MANIFEST_SPEC}
${SPRITE_CONFIG_SPEC}
${MAP_SPEC}
${PIXOCUT_SPEC}
${PIXOSCRIPT_SPEC}

Design cohesive, playable game packages with all necessary assets.
Ensure all references between assets are valid and consistent.`;

    default:
      return `You are an expert Pixospritz game developer.`;
  }
}

/**
 * Spritesheet layout configurations for different preset types
 */
export const SPRITESHEET_LAYOUTS = {
  // 8-direction character (standard RPG)
  character8: {
    directions: ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW'],
    framesPerDirection: 4,
    tileSize: [24, 48],
    get sheetSize() {
      return [
        this.tileSize[0] * this.framesPerDirection,
        this.tileSize[1] * this.directions.length,
      ];
    },
  },

  // 4-direction character
  character4: {
    directions: ['S', 'E', 'N', 'W'],
    framesPerDirection: 4,
    tileSize: [24, 32],
    get sheetSize() {
      return [
        this.tileSize[0] * this.framesPerDirection,
        this.tileSize[1] * this.directions.length,
      ];
    },
  },

  // NPC (4-direction, smaller)
  npc: {
    directions: ['S', 'E', 'N', 'W'],
    framesPerDirection: 4,
    tileSize: [24, 32],
    get sheetSize() {
      return [
        this.tileSize[0] * this.framesPerDirection,
        this.tileSize[1] * this.directions.length,
      ];
    },
  },

  // Monster (4-direction, square)
  monster: {
    directions: ['S', 'E', 'N', 'W'],
    framesPerDirection: 4,
    tileSize: [32, 32],
    get sheetSize() {
      return [
        this.tileSize[0] * this.framesPerDirection,
        this.tileSize[1] * this.directions.length,
      ];
    },
  },

  // Item (single direction)
  item: {
    directions: ['S'],
    framesPerDirection: 4,
    tileSize: [16, 16],
    get sheetSize() {
      return [
        this.tileSize[0] * this.framesPerDirection,
        this.tileSize[1] * this.directions.length,
      ];
    },
  },

  // Effect (horizontal strip)
  effect: {
    directions: ['S'],
    framesPerDirection: 8,
    tileSize: [32, 32],
    get sheetSize() {
      return [
        this.tileSize[0] * this.framesPerDirection,
        this.tileSize[1] * this.directions.length,
      ];
    },
  },
};

/**
 * Calculate exact frame coordinates for a spritesheet layout
 */
export function calculateFrameCoordinates(layout) {
  const { directions, framesPerDirection, tileSize } = layout;
  const [tileWidth, tileHeight] = tileSize;

  const frames = {};

  for (let row = 0; row < directions.length; row++) {
    const direction = directions[row];
    frames[direction] = [];

    for (let col = 0; col < framesPerDirection; col++) {
      frames[direction].push([col * tileWidth, row * tileHeight]);
    }
  }

  return frames;
}

/**
 * Generate complete sprite config from layout
 */
export function generateSpriteConfigFromLayout(layoutName, spriteName, options = {}) {
  const layout = SPRITESHEET_LAYOUTS[layoutName];
  if (!layout) {
    throw new Error(`Unknown layout: ${layoutName}`);
  }

  const frames = calculateFrameCoordinates(layout);

  // Build draw offsets
  const drawOffset = {};
  const offsetValue = [-0.15, -0.15, -1];
  for (const dir of layout.directions) {
    drawOffset[dir] = [...offsetValue];
  }

  const config = {
    type: 'sprite',
    src: `${spriteName}.png`,
    sheetSize: layout.sheetSize,
    tileSize: layout.tileSize,
    frames,
    drawOffset,
    hotspotOffset: [0.5, 0.5, 0],
    state: 'intro',
    enableSpeech: true,
    bindCamera: layoutName.includes('character'),
    frameTime: options.frameTime || 150,
  };

  if (options.includePortrait) {
    config.portraitSrc = `${spriteName}_portrait.png`;
  }

  return config;
}

export default {
  PIXOSCRIPT_SPEC,
  PIXOCUT_SPEC,
  SPRITE_CONFIG_SPEC,
  MANIFEST_SPEC,
  MAP_SPEC,
  TILESET_SPEC,
  PACKAGE_STRUCTURE,
  getSystemPrompt,
  SPRITESHEET_LAYOUTS,
  calculateFrameCoordinates,
  generateSpriteConfigFromLayout,
};
