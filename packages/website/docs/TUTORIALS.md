# PixoSpritz Tutorials

Welcome to the PixoSpritz tutorials hub! These guides are designed to take you from a complete beginner to a confident game developer.

---

## Tutorial 1: Your First Game

In this tutorial, you'll create a simple, playable game from scratch. You will learn how to:

1.  Create a new game package.
2.  Design a simple map using the Map Editor.
3.  Add a player character and an NPC.
4.  Write a simple script to make the NPC talk.
5.  Play your game in the PixoSpritz Console.

### Step 1: Create Your Project

First, we need a new game package. A package is a folder (or zip file) that holds all your game's assets, maps, and scripts.

1.  Open the **PixoSpritz Editor**.
2.  In the **Zip Manager** tab, click the **"New Package"** button.
3.  Name your package `MyFirstGame`.
4.  This creates a standard folder structure inside your package. You'll see folders like `maps`, `sprites`, and `scripts`.

### Step 2: Create a Tileset

A tileset is the palette of tiles you'll use to paint your map.

1.  Go to the **Tileset Editor**.
2.  Click **"New Tileset"**. Let's call it `basic_tiles`.
3.  For this tutorial, we'll use the default tiles. You'll see a grid of tiles like grass, dirt, and water.
4.  Click on a tile, and use the properties panel on the right to mark it as `walkable` or not. Ensure the grass tile is walkable.
5.  Click **"Save"** (Ctrl+S). It will be saved as `tilesets/basic_tiles.json`.

### Step 3: Design Your Map

Now let's create the world your player will explore.

1.  Navigate to the **Map Editor** tab.
2.  Click **"New Map"**. Name it `level_one`.
3.  In the map properties, select `basic_tiles` as the tileset.
4.  Your tileset will appear in the palette. Select the grass tile.
5.  Click and drag on the main grid to paint a grassy area for your player to walk on.
6.  Save the map. It will be saved as `maps/level_one.json`.

### Step 4: Add Sprites (Player and NPC)

A map isn't much fun without characters. Let's add a player and a friendly NPC.

1.  In the **Map Editor**, switch from the "Paint" tool to the **"Sprite"** tool in the toolbar.
2.  In the asset panel, find a suitable player sprite (e.g., `characters/male`).
3.  Click on the map where you want the player to start. A sprite instance will appear.
4.  Select the sprite. In the properties panel on the right, give it a unique ID: `player`.
5.  Now, let's add an NPC. Select another sprite (e.g., `npc/air-knight`) and place it on the map.
6.  Give this NPC sprite the ID `guard`.
7.  Save your map again.

### Step 5: Create an Interaction Script

Let's make the `guard` NPC say something when the player interacts with them. This requires a simple PixoScript file.

1.  Go to the **Script Editor** tab.
2.  Create a new file and save it as `scripts/guard_talk.pxs`.
3.  Write the following Lua code in the editor:

```lua
-- scripts/guard_talk.pxs

-- This function is called when the player interacts with the sprite this script is attached to.
function on_interact(self, interactor)
  -- 'self' is the guard sprite.
  -- 'interactor' is the player sprite.

  pixos.sprite_dialogue(self.id, "Greetings, traveler! The path ahead is dangerous.")
end
```

4.  Save the script.
5.  Go back to the **Map Editor**, select the `guard` sprite.
6.  In the properties panel, find the "On Interact" script property and set it to `scripts/guard_talk.pxs`.
7.  Save the map one last time.

### Step 6: Configure the Manifest

The `manifest.json` file is the entry point to your game. It tells the engine what to load first.

1.  In the **Zip Manager**, find and open `manifest.json`.
2.  Modify it to look like this:

```json
{
  "id": "my-first-game",
  "title": "My First Game",
  "startZone": "maps/level_one.json",
  "player": "player"
}
```

This tells the engine to load your `level_one` map and designate the sprite with the ID `player` as the controllable character.

### Step 7: Play Your Game!

You're all set! It's time to see your creation in action.

1.  In the **Zip Manager**, click the **"Export as Zip"** button. Save `MyFirstGame.zip`.
2.  Open the **PixoSpritz Console** (you can usually access this from the main website's "Launch Demo" area).
3.  Drag and drop your `MyFirstGame.zip` file onto the console window.

Your game will load, and you'll see your player character on the map. Walk over to the guard using the arrow keys and press the interact button (usually 'E' or 'Space'). The guard should display the dialogue you wrote!

**Congratulations, you've made your first PixoSpritz game!**

---

## Tutorial 2: Advanced Map Design

Learn to create complex, multi-layered maps with height variation, lighting, and interactive elements.

### Creating Height Variation

1. Open your map in the Map Editor
2. Switch to **3D View** mode
3. Select the **Height Tool**
4. Click and drag on tiles to raise/lower them
5. Use mouse wheel for fine adjustment
6. Create hills, valleys, and platforms

### Adding Lighting

1. Switch to **Lights Mode** in the toolbar
2. Click on the map to place a light source
3. Configure light properties:
   - **Color**: RGB color (e.g., [1.0, 0.8, 0.6] for warm light)
   - **Intensity**: Light strength
   - **Range**: Light radius
4. Place multiple lights for atmosphere

### Creating Interactive Triggers

1. Switch to **Triggers Mode**
2. Draw a trigger zone (rectangle)
3. Set trigger properties:
   - **On Enter**: Script to run when player enters
   - **On Exit**: Script to run when player exits
   - **One-time**: Whether trigger fires only once

Example trigger script (`triggers/door_trigger.pxs`):

```lua
function on_enter(self, entity)
  if entity.id == "player" then
    pixos.sprite_dialogue("door", "The door is locked.")
    pixos.play_sfx("audio/door_locked.wav")
  end
end
```

### Using Multiple Layers

1. Use the **Layer Selector** to switch between layers
2. **Base Layer**: Ground tiles
3. **Overlay Layer**: Decorative elements (grass, flowers)
4. **Object Layer**: Interactive objects (chests, doors)
5. **Sprite Layer**: Characters and NPCs

### Best Practices

- Keep maps under 100x100 tiles for performance
- Use consistent tile sizes (32x32 recommended)
- Test walkability for all tiles
- Add visual variety with overlays
- Use height to create depth

---

## Tutorial 3: Creating Cutscenes

Learn to create cinematic sequences using the Cutscene Editor.

### Basic Cutscene Structure

1. Navigate to `cutscenes/` in the file browser
2. Click **"New Cutscene"**
3. Name it `intro.pxc`
4. The timeline editor opens

### Adding Dialogue Events

1. Click **"Add Event"** → **"Dialogue"**
2. Configure:
   - **Speaker**: Character name
   - **Text**: Dialogue content
   - **Portrait**: Character portrait (optional)
   - **Duration**: Display time in ms
3. Drag event on timeline to position

### Camera Movement

1. Add **"Camera"** event
2. Select camera type:
   - **Pan**: Move camera to position
   - **Zoom**: Zoom in/out
   - **Shake**: Screen shake effect
   - **Follow**: Follow entity
3. Set duration and easing

### Transitions

1. Add **"Transition"** event
2. Choose effect:
   - **Fade**: Fade to black/white
   - **Wipe**: Wipe across screen
   - **Pixelate**: Pixelate effect
   - **Dissolve**: Dissolve transition
3. Set direction (in/out) and duration

### Using DSL Mode

Switch to **DSL Mode** for text-based editing:

```pxc
-- Fade out
transition fade out 500

-- Load new zone
load_zone village fade 500

-- Fade in
transition fade in 500

-- Show dialogue
dialogue "Hero" "Welcome to the village!"

-- Wait
wait 1000

-- Show character portrait
cutin hero happy left

-- More dialogue
dialogue "Hero" "This is my home."
```

### Advanced: Branching Dialogue

1. Add **"Choice"** event
2. Define options:
   ```lua
   {
     "Fight the boss",
     "Run away",
     "Negotiate"
   }
   ```
3. Handle choice result in script

### Previewing Cutscenes

- Click **Play** to preview
- Drag playhead to scrub timeline
- Use **Pause** to stop at specific point
- **Stop** resets to beginning

---

## Tutorial 4: Multiplayer Setup

Learn to create multiplayer games with synchronized player movement.

### Server Setup

1. Install the PixoSpritz server:

   ```bash
   npm install -g pixospritz-server
   ```

2. Start the server:
   ```bash
   pixospritz-server --port 8080
   ```

### Configuring Network in Manifest

Edit `manifest.json`:

```json
{
  "id": "my-multiplayer-game",
  "title": "My Multiplayer Game",
  "network": {
    "enabled": true,
    "server": "ws://localhost:8080",
    "zone": "maps/lobby.json"
  }
}
```

### Synchronizing Player Movement

In your game scripts, use the network API:

```lua
-- Send player position to server
function on_update(dt)
  local pos = entity.getPosition()
  pixos.send_action({
    type = "move",
    x = pos.x,
    y = pos.y,
    z = pos.z
  })
end
```

### Handling Network Events

```lua
-- Receive other players' positions
function on_network_message(data)
  if data.type == "player_move" then
    -- Update remote player position
    local remotePlayer = world.getEntity(data.playerId)
    if remotePlayer then
      remotePlayer.setPosition(data.x, data.y, data.z)
    end
  end
end
```

### Zone Synchronization

Zones are synchronized automatically:

- Player enters/exits trigger events
- Sprite positions sync across clients
- Flags sync for shared state

---

## Tutorial 5: Save/Load System

Learn to implement save/load functionality in your game.

### Saving Game State

Use the save API in your scripts:

```lua
-- Save to slot 1
pixos.save(1, "Before Boss")

-- Quick save (auto-save slot)
pixos.quick_save()

-- Check if save exists
if pixos.has_save(1) then
  pixos.sprite_dialogue("system", "Save found!")
end
```

### Loading Game State

```lua
-- Load from slot 1
local success = pixos.load(1)
if success then
  pixos.sprite_dialogue("system", "Game loaded!")
else
  pixos.sprite_dialogue("system", "No save found.")
end
```

### Save Menu Implementation

Create a save menu script (`scripts/save_menu.pxs`):

```lua
function show_save_menu()
  local slots = pixos.get_save_slots()

  for i, slot in ipairs(slots) do
    pixos.log("Slot " .. i .. ": " .. slot.name)
    pixos.log("  Zone: " .. slot.zone)
    pixos.log("  Time: " .. slot.timestamp)
  end
end
```

### Auto-Save

Enable auto-save in your game initialization:

```lua
function on_load()
  -- Auto-save every 60 seconds
  pixos.enable_auto_save(60000, 0)
end
```

### What Gets Saved

The save system automatically saves:

- Player position and zone
- Game flags (all `pixos.set_flag()` values)
- Zone states (visited, cleared, etc.)
- Inventory (if using inventory system)

---

## Tutorial 6: Physics and Collision

Learn to use the physics system for collision detection and response.

### Setting Up Collision Layers

```lua
-- In sprite initialization
function on_load()
  -- Set collision layer and mask
  entity.collisionLayer = 0x02  -- PLAYER layer
  entity.collisionMask = 0x10 | 0x04  -- Collide with WALL and ENEMY
end
```

### Collision Callbacks

Implement collision callbacks on sprites:

```lua
function on_collision_enter(other)
  if other.id == "enemy" then
    pixos.play_sfx("audio/hit.wav")
    -- Take damage
    health = health - 10
  end
end

function on_collision_stay(other)
  -- Called every frame during collision
  if other.id == "spike_trap" then
    health = health - 1
  end
end

function on_collision_exit(other)
  if other.id == "safe_zone" then
    pixos.sprite_dialogue("system", "You left the safe zone!")
  end
end
```

### Trigger Zones

Create trigger zones (non-solid collisions):

```lua
-- In trigger script
function on_load()
  entity.isTrigger = true  -- Pass through, but detect collision
  entity.collisionLayer = 0x20  -- TRIGGER layer
end

function on_collision_enter(other)
  if other.id == "player" then
    pixos.set_flag("entered_secret_area", true)
    pixos.play_sfx("audio/secret.wav")
  end
end
```

### Physics Bodies

Add physics to sprites:

```javascript
// In JavaScript/TypeScript
const sprite = world.getSprite('enemy');
sprite.velocity = { x: 0, y: 0, z: 0 };
sprite.useGravity = true;

engine.physicsManager.addBody(
  sprite,
  32,
  32,
  CollisionMask.Layers.ENEMY,
  CollisionMask.Layers.WALL | CollisionMask.Layers.PLAYER
);
```

---

## Tutorial 7: Using the Inventory System

Learn to create items and manage player inventory.

### Defining Items

Create item definitions in your manifest or as separate JSON files:

```json
{
  "items": [
    {
      "id": "potion_health",
      "name": "Health Potion",
      "description": "Restores 50 HP",
      "icon": "items/potion_red.png",
      "stackable": true,
      "maxStack": 99,
      "category": "consumable",
      "usable": true,
      "onUse": "scripts/use_potion.pxs"
    },
    {
      "id": "sword_iron",
      "name": "Iron Sword",
      "description": "A basic iron sword",
      "icon": "items/sword.png",
      "stackable": false,
      "category": "weapon",
      "usable": false
    }
  ]
}
```

### Adding Items to Inventory

```lua
-- Give item to player
function give_item(itemId, quantity)
  local avatar = pixos.get_world().avatar
  avatar.inventory.addItem(itemId, quantity)
  pixos.sprite_dialogue("system", "Received " .. quantity .. "x " .. itemId)
end

-- Example: Give potion
give_item("potion_health", 5)
```

### Using Items

Create use script (`scripts/use_potion.pxs`):

```lua
function use_potion()
  local avatar = pixos.get_world().avatar
  local health = pixos.get_flag("player_health") or 100
  local maxHealth = pixos.get_flag("player_max_health") or 100

  health = math.min(health + 50, maxHealth)
  pixos.set_flag("player_health", health)

  pixos.play_sfx("audio/potion.wav")
  pixos.sprite_dialogue("system", "Restored 50 HP!")
end
```

### Inventory UI

The inventory UI is automatically available:

```lua
-- Show inventory
engine.hud.inventoryUI.show()

-- Hide inventory
engine.hud.inventoryUI.hide()

-- Toggle inventory
engine.hud.inventoryUI.toggle()
```

---

## Tutorial 8: Pathfinding for NPCs

Learn to make NPCs navigate using A\* pathfinding.

### Basic Pathfinding

```lua
-- Move NPC to target position
function move_npc_to(npcId, targetX, targetY)
  local world = pixos.get_world()
  local path = world.pathFind(
    {npc.x, npc.y},
    {targetX, targetY},
    {
      allowDiagonal = true,
      smoothPath = true
    }
  )

  if path then
    -- Follow path
    for i, point in ipairs(path) do
      pixos.move_sprite(npcId, point[1], point[2], point[3])
      pixos.wait(100)  -- Wait between moves
    end
  end
end
```

### Patrol Behavior

```lua
function patrol_route(npcId, waypoints)
  while true do
    for i, waypoint in ipairs(waypoints) do
      move_npc_to(npcId, waypoint.x, waypoint.y)
      pixos.wait(2000)  -- Wait at waypoint
    end
  end
end

-- Example usage
patrol_route("guard", {
  {x = 10, y = 10},
  {x = 20, y = 10},
  {x = 20, y = 20},
  {x = 10, y = 20}
})
```

### Following Player

```lua
function follow_player(npcId, distance)
  while true do
    local player = pixos.get_world().avatar
    local npc = world.getEntity(npcId)

    local dx = player.x - npc.x
    local dy = player.y - npc.y
    local dist = math.sqrt(dx*dx + dy*dy)

    if dist > distance then
      move_npc_to(npcId, player.x, player.y)
    end

    pixos.wait(100)  -- Update every 100ms
  end
end
```

---

## Next Steps

Now that you've completed these tutorials, you're ready to:

1. **Explore the API**: Check the [API Reference](./00-pixospritz-api.md) for all available functions
2. **Read the Editor Guide**: Learn advanced editor features in the [Editor Guide](./EDITOR_GUIDE.md)
3. **Join the Community**: Share your games and get help on Discord/Forum
4. **Create Your Game**: Start building your dream game!

Happy game making!
