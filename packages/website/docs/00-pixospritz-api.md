# PixoSpritz API Reference

**Version:** 1.0.0  
**Last Updated:** January 2026

This document provides a comprehensive reference for the PixoSpritz core JavaScript/TypeScript API.

---

## Table of Contents

1. [Core Engine](#core-engine)
2. [RenderManager](#rendermanager)
3. [World & Zone Management](#world--zone-management)
4. [Sprite System](#sprite-system)
5. [Physics System](#physics-system)
6. [Pathfinding](#pathfinding)
7. [Inventory System](#inventory-system)
8. [Save/Load System](#saveload-system)
9. [Input Management](#input-management)
10. [Audio System](#audio-system)
11. [Cutscene System](#cutscene-system)
12. [HUD System](#hud-system)
13. [Network System](#network-system)
14. [PixoScript Integration](#pixoscript-integration)

---

## Core Engine

### GLEngine

The main engine class that orchestrates the game loop, rendering, and all subsystems.

```javascript
import GLEngine from 'pixospritz-core';

const engine = new GLEngine(
  canvas, // HTMLCanvasElement - WebGL canvas
  hudCanvas, // HTMLCanvasElement - HUD canvas
  mipmap, // HTMLCanvasElement - Mipmap canvas
  gamepadCanvas, // HTMLCanvasElement - Gamepad overlay canvas
  fileUpload, // HTMLInputElement - File input
  width, // number - Viewport width
  height // number - Viewport height
);
```

#### Properties

- `engine.gl` - WebGL2RenderingContext
- `engine.ctx` - CanvasRenderingContext2D (HUD)
- `engine.renderManager` - RenderManager instance
- `engine.world` - World instance (via `engine.spritz.world`)
- `engine.hud` - Hud instance
- `engine.inputManager` - InputManager instance
- `engine.physicsManager` - PhysicsManager instance
- `engine.saveManager` - SaveManager instance
- `engine.cutsceneManager` - CutsceneManager instance
- `engine.modeManager` - ModeManager instance
- `engine.networkManager` - NetworkManager instance
- `engine.frameCount` - Current frame number
- `engine.time` - Current timestamp
- `engine.debug` - Debug mode flag

#### Methods

```javascript
// Initialize the engine
await engine.init();

// Start the render loop
engine.render();

// Stop the render loop
engine.close();

// Resize viewport
engine.screenSize(width, height);
```

---

## RenderManager

Manages WebGL2 rendering, shaders, and the rendering pipeline.

### Properties

- `renderManager.engine` - Reference to GLEngine
- `renderManager.camera` - Camera instance
- `renderManager.particleManager` - ParticleManager instance
- `renderManager.skyboxManager` - SkyboxManager instance
- `renderManager.lightManager` - LightManager instance

### Methods

```javascript
// Clear the screen
renderManager.clearScreen();

// Begin scene rendering
renderManager.beginScene();

// End scene rendering (applies post-processing)
renderManager.endScene(timestamp);

// Render skybox
renderManager.renderSkybox();

// Activate main shader program
renderManager.activateShaderProgram();

// Create a buffer
const buffer = renderManager.createBuffer(data, usage, components);
```

---

## World & Zone Management

### World

Manages zones, sprites, and game state.

```javascript
const world = engine.spritz.world;
```

#### Methods

```javascript
// Load a zone
await world.loadZone(zoneId);

// Find path between two points (A* pathfinding)
const path = world.pathFind([x1, y1], [x2, y2], {
  allowDiagonal: true,
  smoothPath: true,
});

// Get zone containing a point
const zone = world.zoneContaining(x, y);

// Get zone by ID
const zone = world.getZoneById(zoneId);
```

### Zone

Represents a map/level with tiles, sprites, and objects.

```javascript
const zone = world.getZoneById('village');
```

#### Properties

- `zone.id` - Zone identifier
- `zone.size` - [width, height] in tiles
- `zone.bounds` - [minX, minY, maxX, maxY] world bounds
- `zone.walkability` - Uint16Array of walkability flags

#### Methods

```javascript
// Get height at world coordinates
const height = zone.getHeight(x, y);

// Check if point is in zone
const isInZone = zone.isInZone(x, y);

// Get cell at grid coordinates
const cell = zone.getCell(x, y);
```

---

## Sprite System

### Sprite

Represents a 2D sprite in the game world.

```javascript
const sprite = new Sprite(engine);
await sprite.load(definition);
```

#### Properties

- `sprite.id` - Unique sprite ID
- `sprite.pos` - Vector position [x, y, z]
- `sprite.facing` - Direction (0-7)
- `sprite.animFrame` - Current animation frame
- `sprite.loaded` - Whether sprite is loaded

#### Methods

```javascript
// Draw the sprite
sprite.draw();

// Get AABB for collision detection
const aabb = sprite.getAABB();

// Interact with sprite
sprite.interact(interactor);
```

### Avatar

Extends Sprite, represents the player character.

```javascript
const avatar = world.avatar;
```

#### Properties

- `avatar.inventory` - Inventory instance
- All Sprite properties

---

## Physics System

### PhysicsManager

Handles collision detection and physics simulation.

```javascript
const physics = engine.physicsManager;
```

#### Methods

```javascript
// Add a dynamic body
physics.addBody(body, width, height, layer, mask);

// Add a static body
physics.addStaticBody(body, layer, mask);

// Remove a body
physics.removeBody(body);

// Update physics (called automatically)
physics.update(deltaTime);

// Raycast
const hit = physics.raycast(origin, direction);
```

#### Collision Layers

```javascript
import CollisionMask from 'pixospritz-core/engine/core/physics/CollisionMask';

// Predefined layers
CollisionMask.Layers.PLAYER; // 0x02
CollisionMask.Layers.ENEMY; // 0x04
CollisionMask.Layers.ITEM; // 0x08
CollisionMask.Layers.WALL; // 0x10
CollisionMask.Layers.TRIGGER; // 0x20
CollisionMask.Layers.ALL; // 0xFF

// Check if bodies should collide
const shouldCollide = CollisionMask.shouldCollide(layerA, maskA, layerB, maskB);
```

#### Collision Events

Bodies can implement collision callbacks:

```javascript
body.onCollisionEnter = other => {
  console.log('Collision started with', other);
};

body.onCollisionStay = other => {
  // Called every frame during collision
};

body.onCollisionExit = other => {
  console.log('Collision ended with', other);
};
```

---

## Pathfinding

### Pathfinder

A\* pathfinding with path smoothing.

```javascript
import Pathfinder from 'pixospritz-core/engine/core/scene/Pathfinder';

const pathfinder = new Pathfinder(zone);
const path = pathfinder.findPath(startX, startY, endX, endY, {
  allowDiagonal: true, // Allow 8-directional movement
  smoothPath: true, // Apply path smoothing
  maxIterations: 10000, // Maximum search iterations
});

// Returns: Array<[x, y, z]> or null if no path found
```

### BinaryHeap

Priority queue for A\* algorithm.

```javascript
import BinaryHeap from 'pixospritz-core/engine/core/scene/BinaryHeap';

const heap = new BinaryHeap((a, b) => a.priority - b.priority);
heap.push({ priority: 5, data: 'item' });
const item = heap.pop(); // Returns item with lowest priority
```

---

## Inventory System

### Inventory

Manages item collection with stacking and categories.

```javascript
import Inventory from 'pixospritz-core/engine/core/inventory/Inventory';

const inventory = new Inventory(30); // 30 slots
```

#### Methods

```javascript
// Add item
inventory.addItem(itemId, quantity);
inventory.addItem(itemDefinition, quantity);

// Remove item
inventory.removeItem(itemId, quantity);

// Check if has item
const hasItem = inventory.hasItem(itemId, quantity);

// Get item quantity
const quantity = inventory.getItemQuantity(itemId);

// Get item at slot
const item = inventory.getItemAt(slotIndex);

// Move item between slots
inventory.moveItem(fromSlot, toSlot);

// Use item
inventory.useItem(slotIndex, context);

// Get items by category
const items = inventory.getItemsByCategory('consumable');

// Serialize/deserialize
const data = inventory.serialize();
inventory.deserialize(data, itemDefinitions);
```

### Item

Represents a single inventory item.

```javascript
import Item from 'pixospritz-core/engine/core/inventory/Item';

const item = new Item(
  {
    id: 'potion_health',
    name: 'Health Potion',
    description: 'Restores 50 HP',
    icon: 'items/potion_red.png',
    stackable: true,
    maxStack: 99,
    category: 'consumable',
    usable: true,
    onUse: 'scripts/use_potion.pxs',
  },
  quantity
);
```

#### Properties

- `item.id` - Unique item ID
- `item.name` - Display name
- `item.description` - Item description
- `item.quantity` - Current quantity
- `item.stackable` - Whether item can stack
- `item.maxStack` - Maximum stack size
- `item.category` - Item category
- `item.usable` - Whether item can be used

#### Methods

```javascript
// Check if can stack with another item
const canStack = item.canStackWith(otherItem);

// Add quantity
const added = item.addQuantity(amount);

// Remove quantity
const removed = item.removeQuantity(amount);

// Serialize
const data = item.serialize();
```

### InventoryUI

Renders inventory overlay on HUD.

```javascript
const inventoryUI = engine.hud.inventoryUI;

// Show/hide inventory
inventoryUI.show();
inventoryUI.hide();
inventoryUI.toggle();

// Handle click
inventoryUI.handleClick(x, y);
```

---

## Save/Load System

### SaveManager

Handles game state persistence.

```javascript
const saveManager = engine.saveManager;
```

#### Methods

```javascript
// Save game to slot
await saveManager.saveGame(slotId, name, {
  captureScreenshot: true,
});

// Load game from slot
await saveManager.loadGame(slotId);

// Delete save slot
await saveManager.deleteSave(slotId);

// Check if save exists
const hasSave = await saveManager.hasSave(slotId);

// Get all save slots
const slots = saveManager.getSlots();

// Quick save (auto-save slot)
await saveManager.quickSave();

// Enable/disable auto-save
saveManager.enableAutoSave(intervalMs, slotId);
saveManager.disableAutoSave();
```

### SaveSlot

Represents a save slot with metadata.

```javascript
import SaveSlot from 'pixospritz-core/engine/core/persistence/SaveSlot';

const slot = new SaveSlot(slotId, {
  name: 'Before Boss',
  timestamp: Date.now(),
  zone: 'boss_chamber',
  gameId: 'my-game',
});
```

### SaveMigration

Handles save file version migration.

```javascript
import SaveMigration from 'pixospritz-core/engine/core/persistence/SaveMigration';

// Migrate save data to current version
const migrated = await SaveMigration.migrate(saveData);

// Validate save data
const isValid = SaveMigration.validate(saveData);
```

---

## Input Management

### InputManager

Handles keyboard, mouse, touch, and gamepad input.

```javascript
const input = engine.inputManager;
```

#### Methods

```javascript
// Update input (called automatically)
input.update();

// Handle input for current mode
const consumed = input.handleInput(timestamp);

// Set mode mappings
input.setModeMappings(modeName, mappings);

// Get current mode
const mode = input.getMode();
```

---

## Audio System

### AudioLoader

Manages audio playback.

```javascript
const audio = engine.resourceManager.audioLoader;

// Play sound effect
audio.load(src, loop);

// Play music
audio.load(src, true); // loop = true

// Stop audio
audio.stop(src);
```

---

## Cutscene System

### CutsceneManager

Manages cutscene playback.

```javascript
const cutscene = engine.cutsceneManager;
```

#### Methods

```javascript
// Register a cutscene
cutscene.register(name, steps);

// Start a cutscene
cutscene.start(name);

// Skip current cutscene
cutscene.skip();

// Set backdrop
cutscene.setBackdrop({ backdrop: 'village' });

// Show cutout
cutscene.showCutout({ sprite: 'hero', cutout: 'happy', position: 'left' });
```

---

## HUD System

### Hud

Manages Heads-Up Display elements.

```javascript
const hud = engine.hud;
```

#### Methods

```javascript
// Clear HUD
hud.clearHud();

// Draw button
hud.drawButton(text, x, y, w, h, colors);

// Draw mode label
hud.drawModeLabel();

// Set backdrop
hud.setBackdrop(image);

// Show cutout
hud.showCutout(image, position, x, y);
```

---

## Network System

### NetworkManager

Handles WebSocket multiplayer connections.

```javascript
const network = engine.networkManager;
```

#### Methods

```javascript
// Connect to server
await network.connect(url);

// Send action
network.sendAction(action);

// Disconnect
network.disconnect();
```

---

## PixoScript Integration

The engine exposes APIs to PixoScript scripts via the `pixos` global object.

### Save/Load API

```lua
-- Save game
pixos.save(slotId, name)

-- Load game
pixos.load(slotId)

-- Delete save
pixos.delete_save(slotId)

-- Check if save exists
local hasSave = pixos.has_save(slotId)

-- Get all save slots
local slots = pixos.get_save_slots()

-- Quick save
pixos.quick_save()
```

### Flag API

```lua
-- Set flag
pixos.set_flag("key", value)

-- Get flag
local value = pixos.get_flag("key")

-- Check flag
local hasFlag = pixos.has_flag("key")

-- Get all flags
local flags = pixos.all_flags()
```

### Zone/World API

```lua
-- Load zone
pixos.load_zone_from_zip(zoneId, zip)

-- Get world
local world = pixos.get_world()

-- Get zone
local zone = pixos.get_zone()
```

### Camera API

```lua
-- Set camera position
pixos.set_camera_position(x, y, z)

-- Look at point
pixos.look_at(x, y, z, targetX, targetY, targetZ)

-- Focus camera
pixos.focus_camera({x = 10, y = 10, z = 0}, {mode = 'isometric'})

-- Zoom camera
pixos.zoom_camera(5.0)
```

### Audio API

```lua
-- Play sound effect
pixos.play_sfx("audio/hit.wav")

-- Play music
pixos.play_music("audio/bgm.ogg", true) -- loop = true

-- Stop music
pixos.stop_music()

-- Set volume
pixos.set_volume(0.8)
```

### Sprite API

```lua
-- Move sprite
pixos.move_sprite(spriteId, x, y, z)

-- Sprite dialogue
pixos.sprite_dialogue(spriteId, "Hello!")
```

### Cutscene API

```lua
-- Register cutscene
pixos.register_cutscene("intro", {
  {type = 'transition', effect = 'fade', direction = 'out'},
  {type = 'load_zone', zone = 'village'},
  {type = 'transition', effect = 'fade', direction = 'in'}
})

-- Start cutscene
pixos.start_cutscene("intro")

-- Skip cutscene
pixos.skip_cutscene()

-- Set backdrop
pixos.set_backdrop("village")

-- Show cutout
pixos.show_cutout("hero", "happy", "left")
```

### Particle API

```lua
-- Emit particles
pixos.emit_particles({x = 10, y = 5, z = 0}, {
  count = 20,
  life = 1000,
  speed = 0.05,
  color = {1.0, 0.7, 0.2}
})

-- Clear particles
pixos.clear_particles()

-- Get particle count
local count = pixos.get_particle_count()
```

### Mode API

```lua
-- Set mode
pixos.set_mode("fight", {enemy = "boss"})

-- Get current mode
local mode = pixos.get_mode()

-- Register mode
pixos.register_mode("custom", {
  setup = function(params) end,
  update = function(dt) end,
  teardown = function() end
})
```

---

## Examples

### Basic Game Setup

```javascript
import GLEngine from 'pixospritz-core';

const canvas = document.getElementById('game-canvas');
const hudCanvas = document.getElementById('hud-canvas');
const gamepadCanvas = document.getElementById('gamepad-canvas');
const fileUpload = document.getElementById('file-upload');

const engine = new GLEngine(canvas, hudCanvas, null, gamepadCanvas, fileUpload, 800, 600);

await engine.init();
engine.render();
```

### Using Save System

```javascript
// Save game
await engine.saveManager.saveGame(1, 'Before Boss');

// Load game
await engine.saveManager.loadGame(1);

// Check if save exists
const hasSave = await engine.saveManager.hasSave(1);
```

### Using Inventory

```javascript
const avatar = engine.spritz.world.avatar;
const inventory = avatar.inventory;

// Add item
inventory.addItem('potion_health', 5);

// Use item
inventory.useItem(0, { engine });

// Show inventory UI
engine.hud.inventoryUI.show();
```

### Using Physics

```javascript
const physics = engine.physicsManager;

// Add sprite as physics body
physics.addBody(
  sprite,
  32,
  32,
  CollisionMask.Layers.PLAYER,
  CollisionMask.Layers.WALL | CollisionMask.Layers.ENEMY
);

// Implement collision callbacks
sprite.onCollisionEnter = other => {
  console.log('Collided with', other.id);
};
```

### Using Pathfinding

```javascript
const world = engine.spritz.world;
const path = world.pathFind([10, 10], [50, 50], {
  allowDiagonal: true,
  smoothPath: true,
});

if (path) {
  // Follow path
  for (const [x, y, z] of path) {
    await moveTo(x, y, z);
  }
}
```

---

## Type Definitions

### Save Data Format

```typescript
interface SaveData {
  version: string;
  format: 'pxsave';
  gameId: string;
  timestamp: string; // ISO 8601
  player: {
    zone: string;
    position: [number, number, number];
    facing: number;
  };
  flags: Record<string, any>;
  zones: Record<string, ZoneState>;
}
```

### Item Definition

```typescript
interface ItemDefinition {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  stackable?: boolean;
  maxStack?: number;
  category?: string;
  usable?: boolean;
  onUse?: string;
  data?: Record<string, any>;
}
```

---

_For PixoScript API reference, see [Scripting API Documentation](../core-js/documentation/scripting-api.md)_
