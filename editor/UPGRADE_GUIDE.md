# Upgrade Guide - Map Editor Enhancements

## Overview

This guide helps you migrate to the enhanced map editor with sprite, object, trigger, and extends support.

## What Changed

### For End Users

✅ **Good News**: All existing features work exactly as before!

The new features are **additive** - your existing workflow for editing tiles remains unchanged. The new modes are optional.

### New Capabilities

You can now:
1. Place sprites (characters, NPCs) directly in the editor
2. Place objects (chests, furniture, interactive items)
3. Add animated tiles (effects like water, fire)
4. Configure triggers and scripts
5. Use tilesets with extends (inheritance)

## Migration Steps

### Step 1: Update Your Workflow (Optional)

If you previously manually edited map JSON to add sprites:

**Before:**
```javascript
// Had to manually edit JSON
{
  "cells": [...],
  "sprites": [
    { "id": "avatar", "type": "characters/male", "pos": [8, 5, 0] }
  ]
}
```

**After:**
```
1. Open map in editor
2. Switch to Sprites mode
3. Fill in ID: "avatar"
4. Fill in Type: "characters/male"
5. Click on map at position
6. Save
```

### Step 2: Verify Extends Support

If you use tilesets with extends:

**Check:**
```json
// In tilesets/sewer/tileset.json
{
  "extends": ["common"],
  "name": "sewer"
}
```

The editor will now automatically:
- Load the common tileset
- Merge properties
- Apply overrides from sewer tileset

**Test:**
1. Open a map that uses a tileset with extends
2. Verify tiles render correctly
3. Check console for any errors

### Step 3: Update Map JSON (if needed)

If you have existing maps with sprites/objects in JSON:

**No action needed!** The editor will load them automatically.

You can now:
- View the list in the appropriate mode
- Edit positions by removing and re-adding
- Add more sprites/objects using the UI

## Feature-by-Feature Guide

### Using Sprite Placement

**Previous Method:**
```json
// Edit JSON manually
{
  "sprites": [
    { "id": "avatar", "type": "characters/male", "pos": [8, 5, 0], "facing": "Down" }
  ]
}
```

**New Method:**
1. Open map editor
2. Click "🎭 Sprites" mode
3. Enter ID: "avatar"
4. Enter Type: "characters/male"
5. Select Facing: "Down"
6. Click map position
7. Save

**Benefits:**
- Visual placement
- No JSON syntax errors
- Easier to manage multiple sprites
- Can remove with one click

### Using Object Placement

Same as sprites, but for objects:

1. Click "📦 Objects" mode
2. Fill in object properties
3. Place on map
4. Save

**Common Objects:**
- Chests: `objects/chests/metal`
- Doors: `furniture/door`
- Portals: `furniture/portal`

### Using Animated Tiles

For effects like water, fire, spurts:

1. Click "✨ Animated Tiles" mode
2. Enter Type: "effects/spurt"
3. Click map position
4. Save

**Note:** Z-position often negative (e.g., -1.5) for floor effects

### Using Trigger Configuration

**Previous Method:**
```json
// Edit JSON manually
{
  "selectTrigger": "tile/select_test",
  "scripts": [
    { "id": "init", "trigger": "zone/init_room" }
  ]
}
```

**New Method:**
1. Click "⚡ Triggers" mode
2. Enter Select Trigger: "tile/select_test"
3. Click "Add" for scripts
4. Enter script ID and trigger
5. Save

**Benefits:**
- No syntax errors
- Visual list of scripts
- Easy to add/remove

### Understanding Extends

**What it does:**
Tilesets can inherit from other tilesets:

```json
// sewer extends common
{
  "extends": ["common"],
  "name": "sewer"
}
```

Result: sewer gets all properties from common, can override specific ones.

**How it works in the editor:**
- Automatic - just load the map
- Editor resolves extends recursively
- Merges all properties
- Applies overrides

**Benefits:**
- Reduce duplication
- Share common tiles/geometry
- Override only what's needed

## Compatibility

### Backward Compatibility

✅ **Maps without sprites/objects/triggers work as before**

✅ **Tilesets without extends work as before**

✅ **All existing keyboard shortcuts work**

✅ **Tile editing workflow unchanged**

### Forward Compatibility

✅ **Maps saved with new features work in engine**

✅ **Extends resolution matches engine behavior**

✅ **Data format matches engine expectations**

## Common Migration Scenarios

### Scenario 1: You edit tiles only

**Action Required:** None!

Continue using the editor exactly as before. The new modes are optional.

### Scenario 2: You manually add sprites in JSON

**Recommended:**
1. Try the new Sprites mode
2. Place sprites visually
3. Compare with manual JSON
4. Choose preferred method

**Benefits of UI:**
- Visual placement
- No typos
- Easier to manage

### Scenario 3: You use tilesets with extends

**Action Required:** None!

The editor now handles extends automatically. Your tilesets will load correctly.

**What to check:**
- Open maps with extended tilesets
- Verify tiles render
- Check console for errors

### Scenario 4: Complex maps with sprites, objects, triggers

**Recommended:**
1. Open map in editor
2. Switch to each mode to view existing entities
3. Use UI to add more as needed
4. Save and test in engine

**Benefits:**
- One place for all editing
- Visual overview
- Consistent workflow

## Troubleshooting

### Problem: Tileset not loading

**Possible causes:**
- Extended tileset missing
- Circular dependency
- Path error

**Solution:**
1. Check console for specific error
2. Verify all extended tilesets exist
3. Check paths in extends array
4. Test without extends first

### Problem: Sprites not saving

**Possible causes:**
- ID or Type empty
- Write permission issue
- Save callback not working

**Solution:**
1. Ensure ID and Type filled
2. Check console for errors
3. Verify save button clicked
4. Try reloading package

### Problem: UI looks different

**Expected!** New panels added:
- Mode Selector
- Sprite/Object panels
- Trigger panel

**All existing panels still there:**
- Tools
- Tiles
- Map Controls
- Help

## Best Practices

### Naming Conventions

**Sprites:**
- Use descriptive IDs: `entrance_guard`, not `sprite1`
- Follow path conventions: `characters/male`, `npc/knight`

**Objects:**
- Prefix by category: `chest_metal`, `door_main`
- Use consistent naming: `portal_room` not `roomPortal`

**Triggers:**
- Follow folder structure: `tile/select_test`, `zone/init_room`
- Use clear names: `room_init`, not `script1`

### Organization

**Sprites vs Objects:**
- Sprites: Characters, NPCs, dynamic entities
- Objects: Chests, furniture, static items

**When to use extends:**
- Common tileset for shared tiles
- Base sprites for variants (e.g., chest colors)
- Shared map sections

### Workflow

**Recommended order:**
1. Edit tiles (base terrain)
2. Place objects (furniture, chests)
3. Place sprites (characters, NPCs)
4. Add animated tiles (effects)
5. Configure triggers
6. Save and test

## Getting Help

### Documentation
- [MAP_EDITOR_ENHANCEMENTS.md](./MAP_EDITOR_ENHANCEMENTS.md) - Complete documentation
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference
- [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) - Technical changes

### Console Logs
The editor logs helpful information:
- Tileset loading
- Extends resolution
- Save operations
- Errors

Check browser console (F12) for details.

### Testing
Test with the example package:
- `example/spritz/maps/dungeon-top/map.json` - Has sprites
- `example/spritz/tilesets/sewer/tileset.json` - Uses extends

## Rollback (if needed)

If you need to revert:

1. Keep backups of your packages
2. Manual JSON editing still works
3. Old workflow still available
4. Extends is optional

The enhancements are backward compatible - you can mix old and new workflows.

## What's Next

### Planned Enhancements
- Visual sprite rendering in 3D view
- Light editor (currently read-only)
- Drag-and-drop placement
- Entity property dialogs

### Your Feedback
Help improve the editor:
- Report issues
- Suggest features
- Share workflows

## Summary

✅ **No breaking changes** - everything backward compatible

✅ **Optional features** - use what you need

✅ **Better workflow** - visual placement instead of JSON editing

✅ **Engine compatible** - matches game engine exactly

✅ **Future-ready** - foundation for more enhancements

---

**Ready to start?** Open a map and try the new Sprites mode!
