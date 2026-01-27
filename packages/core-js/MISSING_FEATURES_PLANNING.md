# Core-JS Missing Features Planning

This document captures detailed planning for features that are currently missing from the core-js engine. These are not bugs or incomplete implementations, but entirely new functionality that would enhance the engine.

---

## 1. Instanced Rendering

### Priority: High

### Current State

- Sprites and particles are rendered individually with separate draw calls
- Each particle in `ParticleManager` is a separate `drawArrays` call
- No GPU instancing utilized

### What's Needed

- WebGL2 `drawArraysInstanced` / `drawElementsInstanced` support
- Instance buffer for per-instance data (position, scale, rotation, color)
- Instanced vertex shader with `gl_InstanceID`

### Implementation Plan

#### Files to Create/Modify

- `src/engine/core/render/InstancedRenderer.js` - New instanced rendering manager
- `src/engine/core/render/ParticleManager.js` - Refactor to use instancing
- `src/engine/shaders/instanced/vs.js` - Instanced vertex shader
- `src/engine/shaders/instanced/fs.js` - Instanced fragment shader

#### Technical Details

```javascript
// Instance data layout (per particle)
// vec4: position.xyz + scale
// vec4: rotation + color.rgb
// float: alpha

// Vertex shader additions
in vec4 a_instancePosition;
in vec4 a_instanceRotationColor;
in float a_instanceAlpha;
```

#### Expected Benefits

- Reduce draw calls from 1000s to 1-10 for particle systems
- Enable large sprite crowds (100+ entities) at 60fps
- GPU-side animation interpolation

### Effort Estimate

- 3-5 days for full implementation and testing

---

## 2. Physics System

### Priority: Medium

### Current State

- No collision detection between sprites
- No collision response (entities can walk through each other)
- Tile collision is height-based only, not AABB

### What's Needed

- AABB (Axis-Aligned Bounding Box) collision detection
- Collision layers/masks for filtering
- Collision response (separate, trigger events)
- Tile collision masks for complex shapes

### Implementation Plan

#### Files to Create

- `src/engine/core/physics/PhysicsWorld.js` - Main physics manager
- `src/engine/core/physics/AABB.js` - Bounding box class
- `src/engine/core/physics/CollisionMask.js` - Bit-mask layers
- `src/engine/core/physics/SpatialHash.js` - Broad phase optimization

#### Technical Details

```javascript
class PhysicsWorld {
  constructor(engine) {
    this.bodies = [];
    this.spatialHash = new SpatialHash(32); // 32px cells
  }

  addBody(entity, width, height, layer = 0x01, mask = 0xff) {
    // Create AABB, register in spatial hash
  }

  update(dt) {
    // Broad phase: spatial hash query
    // Narrow phase: AABB intersection test
    // Response: separate bodies, emit events
  }
}
```

#### Collision Events

- `onCollisionEnter(other)` - First frame of collision
- `onCollisionStay(other)` - Ongoing collision
- `onCollisionExit(other)` - Collision ended

### Effort Estimate

- 5-7 days for core system
- 2-3 days for tile integration

---

## 3. Pathfinding A\*

### Priority: Medium

### Current State

- Basic pathfinding exists in `World.buildPath()`
- Simple neighbor traversal, not optimized
- No diagonal movement optimization
- No path smoothing

### What's Needed

- A\* algorithm with proper heuristics
- Binary heap priority queue for performance
- Diagonal movement with corner cutting prevention
- Path smoothing/funnel algorithm
- Dynamic obstacle avoidance

### Implementation Plan

#### Files to Create/Modify

- `src/engine/core/scene/Pathfinder.js` - New A\* implementation
- `src/engine/core/scene/BinaryHeap.js` - Priority queue
- `src/engine/core/scene/world.js` - Integrate new pathfinder

#### Technical Details

```javascript
class Pathfinder {
  constructor(zone) {
    this.grid = this.buildNavigationGrid(zone);
  }

  findPath(startX, startY, endX, endY, options = {}) {
    // A* with configurable heuristic
    // Options: allowDiagonal, smoothPath, maxIterations
  }

  heuristic(a, b) {
    // Octile distance for 8-directional movement
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
  }
}
```

### Effort Estimate

- 2-3 days for A\* implementation
- 1-2 days for path smoothing

---

## 4. Save/Load System

### Priority: High

### Current State

- JSON schema defined in `specs/formats/save.schema.json`
- No runtime implementation
- Game flags exist but aren't persisted

### What's Needed

- SaveManager class for web (LocalStorage + IndexedDB)
- Auto-save functionality
- Multiple save slots
- Save versioning and migration
- Cloud save integration (optional)

### Implementation Plan

#### Files to Create

- `src/engine/core/persistence/SaveManager.js` - Main save/load manager
- `src/engine/core/persistence/SaveSlot.js` - Individual save slot
- `src/engine/core/persistence/SaveMigration.js` - Version migration

#### Data to Persist

```javascript
const saveData = {
  version: '1.0.0',
  format: 'pxsave',
  gameId: manifest.id,
  timestamp: Date.now(),

  player: {
    zone: currentZone.id,
    position: [avatar.x, avatar.y, avatar.z],
    direction: avatar.direction,
    inventory: [], // Future
  },

  flags: world.flags, // All game flags

  zones: {
    // Per-zone state (opened chests, defeated enemies, etc.)
  },
};
```

#### Storage Strategy

- Small saves (< 5KB): LocalStorage
- Large saves (< 50MB): IndexedDB
- Save slot metadata: Always LocalStorage for quick listing

### Effort Estimate

- 3-4 days for core implementation
- 1-2 days for PixoScript/Lua API integration

---

## 5. Inventory UI

### Priority: Medium

### Current State

- No inventory data structure
- No inventory UI component
- Items not defined in game assets

### What's Needed

- Inventory data model (slots, stacking, categories)
- Inventory UI component (grid view, list view)
- Item definitions in manifest/sprites
- Use/equip/drop actions

### Implementation Plan

#### Files to Create

- `src/engine/core/inventory/Inventory.js` - Data model
- `src/engine/core/inventory/Item.js` - Item class
- `src/engine/core/hud/InventoryUI.js` - UI rendering
- `src/engine/events/inventory.js` - Input handling

#### Item Definition Schema

```json
{
  "id": "potion_health",
  "name": "Health Potion",
  "description": "Restores 50 HP",
  "icon": "items/potion_red.png",
  "stackable": true,
  "maxStack": 99,
  "category": "consumable",
  "usable": true,
  "onUse": "heal_player.pxs"
}
```

### Effort Estimate

- 4-5 days for data model and basic UI
- 2-3 days for full interaction polish

---

## 6. Quest/Journal System

### Priority: Low

### Current State

- Game flags can track quest state
- No UI for quest tracking
- No quest definition format

### What's Needed

- Quest definition schema
- Quest tracker UI
- Objective markers on map
- Quest log/journal

### Implementation Plan

#### Quest Schema

```json
{
  "id": "main_fire_trial",
  "name": "The Trial of Fire",
  "description": "Defeat the Fire Elemental",
  "objectives": [
    { "id": "enter_chamber", "text": "Enter the Fire Chamber", "flag": "entered_fire_chamber" },
    { "id": "defeat_boss", "text": "Defeat the Fire Elemental", "flag": "fire_trial_complete" }
  ],
  "rewards": [
    { "type": "flag", "key": "fire_seal_obtained", "value": true },
    { "type": "item", "id": "fire_gem", "quantity": 1 }
  ]
}
```

### Effort Estimate

- 3-4 days for core system
- 2-3 days for UI

---

## 7. Localization (i18n)

### Priority: Low

### Current State

- All text is hardcoded in English
- No string extraction
- No language selection

### What's Needed

- String table format (JSON or YAML)
- Language loader
- Runtime string lookup with fallback
- UI for language selection

### Implementation Plan

#### String Table Format

```json
{
  "locale": "en-US",
  "strings": {
    "menu.start": "Start Game",
    "menu.options": "Options",
    "dialogue.elder.greeting": "Welcome, brave hero!",
    "item.potion_health.name": "Health Potion"
  }
}
```

#### API

```javascript
// In PixoScript
local text = pixos.localize("dialogue.elder.greeting")
```

### Effort Estimate

- 2-3 days for core system
- 1 day per language for translations

---

## 8. Entity Component System

### Priority: Medium (Architectural)

### Current State

- Object-oriented class hierarchy (Sprite, Avatar, etc.)
- Inheritance-based behavior sharing
- Tight coupling between rendering and logic

### What's Needed

- Component-based architecture
- Systems that operate on component sets
- Better scripting integration
- Runtime component composition

### Why Consider ECS

- Easier to add new behaviors without modifying base classes
- Better performance for large entity counts (data-oriented)
- Cleaner separation of concerns
- More flexible for user-created content

### Migration Considerations

- This is a major architectural change
- Could be done incrementally
- May not be worth the effort for current scope
- Consider only if entity count becomes a bottleneck

### Effort Estimate

- 2-3 weeks for full migration (if pursued)
- Recommend deferring to future major version

---

## Summary Table

| Feature             | Priority | Effort    | Dependencies         |
| ------------------- | -------- | --------- | -------------------- |
| Instanced Rendering | High     | 3-5 days  | WebGL2 knowledge     |
| Save/Load System    | High     | 3-4 days  | None                 |
| Physics System      | Medium   | 5-7 days  | None                 |
| Pathfinding A\*     | Medium   | 2-3 days  | Zone grid access     |
| Inventory UI        | Medium   | 4-5 days  | Item schema          |
| Quest System        | Low      | 3-4 days  | Inventory (optional) |
| Localization        | Low      | 2-3 days  | None                 |
| ECS Migration       | Medium   | 2-3 weeks | Full codebase        |

---

## Next Steps

1. **Phase 1**: Implement Save/Load System (critical for any game)
2. **Phase 2**: Add Instanced Rendering (performance unlock)
3. **Phase 3**: Basic Physics for collision detection
4. **Phase 4**: A\* Pathfinding optimization
5. **Defer**: ECS migration to future major version
