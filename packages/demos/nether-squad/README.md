# Nether Squad — Disgaea-like Mini Game

A tactical RPG mini in the Disgaea spirit: a hub area leading to a grid-based battle stage.

## The Flow

**Hub:** You start in a small village. Walk around with WASD/arrows. Find the recruiter (the knight). Press E to talk. Choose "To battle!" → you're transported to the arena.

**Battle:** 8×8 grid. Your team (Hero + Knight) vs 2 goblins. Turn-based:
- Your turn: unit auto-moves toward nearest enemy, attacks if in range
- Enemy turn: simple AI moves toward you, attacks if adjacent
- Win: defeat both goblins. Lose: your team falls.
- Press Space/Enter after victory/defeat to return to hub.

## What it showcases

- **Two modes:** hub (explore) → battle (tactics), with mode switching
- **Two maps:** hub village + battle arena, with map transitions
- **Turn-based combat:** initiative order, movement ranges, attack ranges, HP tracking
- **Enemy AI:** moves toward player, attacks in range
- **Win/lose conditions:** checked every frame

## Files

```
manifest.json
maps/hub/map.json + cells.json       — 8×8 village
maps/arena/map.json + cells.json     — 8×8 battle grid
modes/hub/mode.json/setup.pxs/update.pxs
modes/battle/mode.json/setup.pxs/update.pxs
```

## Controls

- **Hub:** WASD/arrows to move, E/Space to talk
- **Battle:**
  - Space/Enter: confirm selection
  - Arrow keys: move cursor to pick destination tile
  - Tab: cycle attack targets
  - W: wait (skip attack)
  - Escape: cancel back to unit select
  - Space/Enter: return to hub after battle ends

## Engine support verified

- ✅ **OBJ + MTL:** Engine has `parseOBJ`/`parseMTL` — material-mapped models work
- ✅ **Sprites:** Frames grid-aligned (verified: 8 dirs × 4 frames on 24×48)
- ✅ **Tile select:** Mode-based — battle mode shows movement range, cursor picks tiles
- ✅ **Unit select:** Mode-based — battle highlights selectable/targetable units
- ❌ **GLTF:** Not supported. No loader in engine, no Three.js dependency. Would require building a GLTF parser from scratch.

## Disgaea touches

- The recruiter says "dood" (a nod to the Prinny)
- Hub → battle flow mirrors Disgaea's castle → Item World structure
- Simplified: no lifting/throwing (yet), no geo panels, no combo system

## Limitations

- Battle movement is simplified (auto-move toward enemy, not tile selection)
- No animations for attacks (damage numbers assumed via `pixos.show_damage`)
- Hub uses placeholder tiles (properly tiled assets would replace these)
