# PixOS Cutscene System Demo

This demo showcases the new `.pxc` cutscene format with full audio, expressions, and visual effects.

## Demo Flow

### 1. **Menu Close → Intro Cutscene**
When you close the main menu (`triggers/menu/main.pxs`):
- Calls `triggers/menu/on_close.pxs`
- Plays an intro cutscene (first time only)
- Loads the `cutscene-demo` zone

### 2. **Zone Load → Welcome Cutscene**
When the `cutscene-demo` zone loads:
- Runs `triggers/zone/cutscene_demo_intro.pxs`
- Plays an inline welcome cutscene explaining the demo
- Sets up explore mode
- Shows instructions for interacting with NPCs and tiles

### 3. **Interactive Demonstrations**

#### a) **NPC Quest Giver**
- **Location**: Center-north of the demo zone
- **Trigger**: `triggers/sprite/npc_quest_giver.pxs`
- **Cutscene**: `cutscenes/epic-quest.pxc`
- **Features**:
  - 5 scenes with multiple characters
  - Background music (looping)
  - Sound effects (one-shot)
  - Backdrops and transitions
  - Character expressions and cutins
  - Quest flag tracking (plays once)

#### b) **Tile Trigger**
- **Location**: Eastern edge (marked tile at position [12, 5])
- **Trigger**: `triggers/tile/cutscene_trigger_tile.pxs`
- **Cutscene**: `cutscenes/voice-demo.pxc`
- **Features**:
  - Voice-over demonstration
  - Dialogue with voice metadata
  - Blocking audio (waits for completion)
  - One-time trigger with flag tracking

## Files Created/Modified

### New Map
- `maps/cutscene-demo/map.json` - Demo zone layout
- `maps/cutscene-demo/cells.json` - Tile grid

### New Triggers
- `triggers/zone/cutscene_demo_intro.pxs` - Zone load handler with welcome cutscene
- `triggers/menu/on_close.pxs` - Menu close handler with intro cutscene

### Modified Files
- `manifest.json` - Added `cutscene-demo` map, assets, and cutscene files
- `triggers/menu/main.pxs` - Now calls `on_close.pxs` handler
- `maps/hallway/map.json` - Added portal to demo zone

### Example Triggers (Previously Created)
- `triggers/sprite/npc_quest_giver.pxs` - NPC interaction example
- `triggers/zone/cutscene_on_enter.pxs` - Zone entry example (template)
- `triggers/event/story_event.pxs` - Story event with prerequisites (template)
- `triggers/tile/cutscene_trigger_tile.pxs` - Tile-based trigger example

### Cutscene Files
- `cutscenes/epic-quest.pxc` - Full-featured quest introduction (5 scenes)
- `cutscenes/elemental-gathering.pxc` - Multi-character gathering scene
- `cutscenes/voice-demo.pxc` - Voice-over demonstration

## Testing the Demo

1. **Start the game** - The main menu will appear
2. **Close the menu** - This triggers the intro cutscene (first time)
3. **Explore the demo zone** - Welcome cutscene explains the features
4. **Talk to the Quest NPC** - Experience the epic-quest cutscene with BGM/SFX
5. **Walk to the eastern edge** - Trigger the voice-over demo
6. **Return to hallway** - Use the portal at coordinates [14, 4] (if needed)

## Key Features Demonstrated

### Audio System
- **BGM**: Looping background music (replaces previous BGM)
- **SFX**: One-shot sound effects (multiple can play)
- **Voice**: Blocking voice-overs (waits for completion)

### Visual Features
- **Backdrops**: Background images with fade transitions
- **Expressions**: 8 emoji overlays (smile, sad, shocked, worried, annoyed, neutral, smirk, tired)
- **Cutins**: Full-screen character portraits
- **Transitions**: Fade effects between scenes

### Script Features
- **Flag System**: Track quest progress and one-time events
- **Inline Cutscenes**: Define cutscenes directly in trigger scripts
- **File Cutscenes**: Load .pxc files from the asset system
- **Callbacks**: Custom end handlers for rewards/progression

## PixoScript Integration

All triggers use PixoScript/Lua (`.pxs` files):

```lua
-- Simple cutscene playback
pixos.sync({
    pixos.play_pxc_cutscene('cutscenes/intro.pxc')
});

-- Inline cutscene
local my_scene = [[
  @backdrop textures/room.gif
  @char HERO sprite=characters/male
  HERO: [expression=smile] Hello world!
  waitInput
  @end
]];

pixos.sync({
    pixos.play_pxc_script(my_scene)
});

-- With callbacks
pixos.sync({
    pixos.play_pxc_cutscene('cutscenes/quest.pxc', {
        onEnd = function()
            pixos.set_flag('quest_started', true);
        end
    })
});
```

## Configuration

### Manifest Setup
The `manifest.json` includes:
- Initial zone: `cutscene-demo`
- Required textures for backdrops
- Audio files for BGM/SFX/voice
- Cutscene file references

### Asset Loading
All assets are loaded via the engine's asset loader:
- Textures from `textures/`
- Audio from `audio/`
- Cutscenes from `cutscenes/`
- Character sprites from `sprites/`

## Next Steps

To add your own cutscenes:

1. Create a `.pxc` file in `cutscenes/`
2. Add it to `manifest.json` under `"cutscenes"`
3. Create a trigger in `triggers/` (sprite, zone, tile, or event)
4. Reference the cutscene with `pixos.play_pxc_cutscene(path)`
5. Add flag tracking if it should play once

See `CUTSCENE_USAGE.md` for complete documentation.
