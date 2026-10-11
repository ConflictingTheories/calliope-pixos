# Triggers

This directory contains trigger scripts (`.pxs` files) that respond to various game events.

## Directory Structure

```
triggers/
├── zone/       # Zone load/unload events
├── sprite/     # Sprite interaction events
├── tile/       # Tile step/interaction events
├── event/      # Game state events (battle, victory, etc.)
└── menu/       # Menu interaction events
```

## Trigger Categories

### Zone Triggers (`zone/`)

Triggered when zones are loaded or unloaded.

| File                        | Description                |
| --------------------------- | -------------------------- |
| `village_hub_load.pxs`      | Village hub initialization |
| `dungeon_entrance_load.pxs` | Dungeon hub setup          |
| `fire_chamber_load.pxs`     | Fire trial initialization  |
| `water_chamber_load.pxs`    | Water trial initialization |
| `earth_chamber_load.pxs`    | Earth trial initialization |
| `air_chamber_load.pxs`      | Air trial initialization   |
| `boss_arena_load.pxs`       | Boss arena setup           |

### Sprite Triggers (`sprite/`)

Triggered when sprites are selected or interacted with.

| File                | Description           |
| ------------------- | --------------------- |
| `village_elder.pxs` | Elder NPC dialogue    |
| `knight_guard.pxs`  | Guard NPC interaction |
| `dungeon_guide.pxs` | Guide NPC dialogue    |

### Tile Triggers (`tile/`)

Triggered when player steps on specific tiles.

| File                | Description        |
| ------------------- | ------------------ |
| `water_step.pxs`    | Water tile effects |
| `trap_tile.pxs`     | Trap activation    |
| `teleport_tile.pxs` | Teleportation      |

### Event Triggers (`event/`)

Triggered by game state changes.

| File                 | Description            |
| -------------------- | ---------------------- |
| `battle_start.pxs`   | Combat initialization  |
| `battle_victory.pxs` | Victory handling       |
| `fire_victory.pxs`   | Fire trial completion  |
| `water_victory.pxs`  | Water trial completion |
| `earth_victory.pxs`  | Earth trial completion |
| `air_victory.pxs`    | Air trial completion   |

### Menu Triggers (`menu/`)

Triggered by menu selections.

| File                     | Description        |
| ------------------------ | ------------------ |
| `main_menu_new.pxs`      | New game selection |
| `main_menu_continue.pxs` | Continue game      |
| `pause_menu_resume.pxs`  | Resume from pause  |
| `inventory_use.pxs`      | Use inventory item |

## Trigger Script Format

```lua
-- Trigger: zone/village_hub_load
-- Runs when village-hub zone is loaded

-- Play zone music
play_music("fields.mp3", { fadeIn = 2.0 })

-- Set up lighting
set_ambient_light(1.0, 0.9, 0.8)

-- Show welcome message (first visit only)
if not get_flag("visited_village") then
    set_flag("visited_village", true)
    show_dialogue("Welcome to the village!")
end
```

## Trigger Registration

### In Map Files (map.json)

```json
{
  "sprites": [
    {
      "id": "elder",
      "selectTrigger": "sprite/village_elder"
    }
  ],
  "loadTrigger": "zone/village_hub_load"
}
```

### In Manifest

```json
{
  "triggers": {
    "zone/village_hub_load": "triggers/zone/village_hub_load.pxs"
  }
}
```

## Available Functions

### Dialogue

```lua
show_dialogue("Message text")
show_choice("Question?", {"Option 1", "Option 2"})
play_cutscene("cutscene-name")
```

### Game State

```lua
set_flag("flag_name", true)
get_flag("flag_name")
add_inventory("item_id")
set_mode("explore|tactics|fight")
```

### Audio/Visual

```lua
play_music("track.mp3")
play_sound("effect.mp3")
emit_particles("effect_name", position)
screen_shake(intensity, duration)
```

### Zone/Sprite Control

```lua
load_zone("zone-name")
spawn_sprite("sprite_id", "type", position)
move_sprite("sprite_id", target_position)
```

## Creating New Triggers

1. Create a `.pxs` file in the appropriate subdirectory
2. Write trigger logic using PixoScript
3. Register in manifest.json or map.json
4. Test using the game or editor
