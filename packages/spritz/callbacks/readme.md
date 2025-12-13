# Callbacks

This directory contains callback scripts (`.pxs` files) that are triggered by game events and object interactions.

## Available Callbacks

### Object Interactions
| File | Description |
|------|-------------|
| `chest_add_inventory.pxs` | Adds items from chest to player inventory |
| `elemental_shard.pxs` | Handles collecting elemental shard items |

### Door/Portal State Changes
| File | Description |
|------|-------------|
| `door_opened.pxs` | Triggered when a door opens |
| `door_closed.pxs` | Triggered when a door closes |
| `portal_opened.pxs` | Triggered when a portal activates |
| `portal_closed.pxs` | Triggered when a portal deactivates |
| `portal_effect.pxs` | Portal visual and audio effects |
| `boss_door_unlock.pxs` | Special unlock for boss arena |

### NPC Callbacks
| File | Description |
|------|-------------|
| `npc_quest_giver.pxs` | Quest assignment logic |

## Callback Script Format

Callbacks use the PixoScript (`.pxs`) format:
```lua
-- Callback: chest_add_inventory
-- Triggered when player opens a chest

local chest = args.target
local items = chest:get_inventory()

for _, item in ipairs(items) do
    player:add_to_inventory(item)
    show_notification("Found: " .. item.name)
end

play_sound("chest_open.mp3")
chest:set_state("empty")
```

## Callback Arguments

Callbacks receive an `args` table with context:
- `args.target` - The object that triggered the callback
- `args.player` - The player sprite
- `args.zone` - The current zone
- `args.engine` - Engine reference

## Defining Callbacks

### In Sprite Definitions (map.json)
```json
{
  "id": "treasure-chest",
  "type": "objects/chests/wood",
  "inventory": ["health_potion", "gold_coin"],
  "onOpen": "chest_add_inventory"
}
```

### In Triggers
```lua
-- From a trigger script
engine:run_callback("door_opened", { target = door })
```

## Common Callback Patterns

### State Changes
```lua
-- Toggle between states
local current = target:get_state()
target:set_state(current == "open" and "closed" or "open")
```

### Visual Effects
```lua
-- Spawn particles
emit_particles("magic_sparkle", target:get_position())
```

### Audio Feedback
```lua
-- Play sound effect
play_sound("door_creak.mp3")
```

### Inventory Management
```lua
-- Transfer items
local items = target:get_inventory()
player:add_items(items)
target:clear_inventory()
```

## Creating New Callbacks

1. Create a `.pxs` file in this directory
2. Write callback logic using PixoScript
3. Reference the callback name (without extension) in game objects
4. Test using the editor preview
