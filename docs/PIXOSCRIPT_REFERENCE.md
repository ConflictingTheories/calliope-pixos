# PixoScript Reference

PixoScript is a Lua-like scripting language for PixoSpritz games. Scripts run in a sandbox with explicit capabilities.

## Modes

Each game mode has two scripts:

- **setup.pxs** — Runs once when the mode starts
- **update.pxs** — Runs every frame

```lua
-- setup.pxs
local world = pixos.get_world()
pixos.log('Mode started!')

-- update.pxs
return function(time, params)
  -- Runs every frame
  -- time: seconds since mode started
  -- params: mode-specific data
end
```

## World

```lua
local world = pixos.get_world()

-- Get the avatar (player)
local avatar = world.avatarManager.avatar

-- Get a zone/map
local zone = world.getZone('village-hub')

-- Find objects
local chest = world.behaviorManager  -- (use via object references)
```

## Avatar

```lua
local avatar = pixos.get_world().avatarManager.avatar

-- Position (array: [x, y, z])
avatar.pos[1]  -- x
avatar.pos[2]  -- y

-- Move
avatar.pos[1] = avatar.pos[1] + 1

-- Facing: 'Up', 'Down', 'Left', 'Right'
avatar.facing = 'Up'

-- Inventory (persists across maps)
table.insert(avatar.inventory, 'sword')

-- Flags (persists)
avatar._manager.state.flags['met_elder'] = true
```

## Input

```lua
-- Check if key is held
if pixos.input_down('w') then
  -- Move up
end

-- Check if key was just pressed
if pixos.input_pressed('e') then
  -- Interact
end

-- Keys: 'w', 'a', 's', 'd', 'up', 'down', 'left', 'right',
--        'space', 'enter', 'escape', 'e', 'tab'
```

## UI

```lua
-- Show a message
pixos.show_message('Hello!')

-- Show a dialog with options
local choice = pixos.show_choice({
  speaker = 'Elder',
  text = 'What do you want?',
  options = {'Buy sword', 'Leave'}
})
-- choice is 1 or 2 (index), or nil if cancelled

-- Show damage number
pixos.show_damage('goblin1', 8)

-- Log to console
pixos.log('Something happened')
```

## Modes

```lua
-- Switch to another mode
pixos.switch_mode('battle')

-- Load a different map
pixos.load_map('dungeon-entrance')
```

## Camera

```lua
local world = pixos.get_world()
local hero = world.spriteDict['hero']
if hero then
  pixos.bind_camera(hero)
end
```

## HUD

```lua
-- Show a HUD layout
pixos.show_hud('battle')
pixos.show_hud('hub')
```

## Complete Example: Simple NPC Dialogue

```lua
-- npc_talk.pxs (attached to onInteract hook)
return function(ctx)
  local met = ctx.obj._manager.state.flags['met_elder']
  if not met then
    pixos.show_message('Elder: Hello, traveler! Take this potion.')
    pixos.give_item('potion')
    ctx.obj._manager.state.flags['met_elder'] = true
  else
    pixos.show_message('Elder: Good luck on your journey!')
  end
end
```

## Sandbox Restrictions

PixoScript cannot:
- Access the network
- Read/write arbitrary files
- Execute shell commands
- Access browser DOM directly

All capabilities must be granted explicitly via the `pixos.*` API.
