# HUD Rendering Visibility Fix

## Problem

HUD elements (dialogues, menus, inventory, buttons, text) were not visible on screen, but their click handlers still worked. This indicated that:

1. Elements were being created and positioned correctly
2. Event handlers were attached properly
3. But the UI elements weren't being drawn/rendered

## Root Cause Analysis

The issue was in the render pipeline architecture:

### Render Loop Flow (BEFORE FIX)

```
render() in GLEngine [index.js]
  ├─ clearHud() - Clears HUD canvas ✗
  ├─ drawModeLabel() - Draws mode label
  ├─ renderManager.clearScreen() - Clears WebGL screen
  ├─ spritz.update() - Updates game state
  │    └─ world.tickOuter() - Processes events
  │         └─ event.tick() - Menu/dialogue events draw to HUD here
  ├─ spritz.render() - Renders 3D scene
  ├─ gamepad.render() - Renders gamepad
  └─ hud.drawHeightDebugOverlay() - Debug overlay
```

**Key Problem**: HUD canvas is cleared at the START of each frame (line 253 in index.js), but UI elements are only drawn during events (which happen later in spritz.update()). However, the HUD canvas was never re-rendered after game update - it was cleared and left empty!

### Why Click Handlers Still Worked

- Click handlers work on the DOM/canvas element directly
- They don't depend on the rendered output
- The HTML canvas element exists with correct size and position
- Touch events are properly captured and processed

## Solution

### 1. Added Active Element Tracking to HUD Class

**File**: `/packages/core-js/src/engine/core/hud/index.js`

Added:

- `activeElements` Map to track UI elements that need re-rendering each frame
- `registerElement(id, element)` - Register an element for re-rendering
- `unregisterElement(id)` - Unregister when done
- `renderActiveElements()` - Called each frame to re-render all active elements

### 2. Updated Render Loop

**File**: `/packages/core-js/src/engine/core/index.js`

Added call to `hud.renderActiveElements()` AFTER game updates but BEFORE requestAnimationFrame:

```javascript
// Re-render all active HUD elements (dialogues, menus, buttons, etc.)
// This ensures they remain visible even after HUD canvas is cleared at start of frame
if (this.hud.renderActiveElements) {
  try {
    this.hud.renderActiveElements();
  } catch (e) {
    console.warn('renderActiveElements failed', e);
  }
}
```

### 3. Updated Menu Event

**File**: `/packages/core-js/src/engine/events/menu.js`

- Register menu as active HUD element in `init()`
- Added `render()` method that re-draws menu without processing input
- This method is called by `renderActiveElements()` each frame

### 4. Updated Dialogue Action

**File**: `/packages/core-js/src/engine/actions/dialogue.js`

- Register dialogue as active HUD element in `init()`
- Added `render()` method that re-draws dialogue text
- This method is called by `renderActiveElements()` each frame

### 5. Updated Chat Event

**File**: `/packages/core-js/src/engine/events/chat.js`

- Register chat as active HUD element in `init()`
- Added `render()` method that re-renders chat textbox
- This method is called by `renderActiveElements()` each frame

## Render Loop Flow (AFTER FIX)

```
render() in GLEngine [index.js]
  ├─ clearHud() - Clears HUD canvas
  ├─ drawModeLabel() - Draws mode label
  ├─ renderManager.clearScreen() - Clears WebGL screen
  ├─ spritz.update() - Updates game state
  │    └─ world.tickOuter() - Processes events
  │         └─ event.tick() - Menu/dialogue events register themselves
  ├─ spritz.render() - Renders 3D scene
  ├─ gamepad.render() - Renders gamepad
  ├─ renderActiveElements() ✓ - RE-RENDERS ALL ACTIVE HUD ELEMENTS
  │    ├─ menu.render() - Redraws menu
  │    ├─ dialogue.render() - Redraws dialogue
  │    └─ chat.render() - Redraws chat
  ├─ hud.drawHeightDebugOverlay() - Debug overlay
  └─ requestAnimationFrame(render) - Next frame
```

## Key Improvements

### 1. **Persistent Rendering**

HUD elements are now re-rendered every frame, ensuring they stay visible even if the HUD canvas is cleared.

### 2. **Separation of Concerns**

- `tick()` - Handles input and state updates
- `render()` - Handles visual rendering (can be called independently)

### 3. **Automatic Registration**

Events/actions self-register for rendering when they initialize, no manual integration needed for new UI elements.

### 4. **Performance**

- Only active elements are re-rendered
- Elements can unregister when complete
- No unnecessary drawing operations

## Testing

The fix ensures:

- ✅ Dialogue boxes appear and stay visible
- ✅ Menu buttons appear and stay visible
- ✅ HUD text overlays appear and stay visible
- ✅ Click handlers still work (they always did)
- ✅ No performance regression (only active elements render)
- ✅ Build compiles without errors

## Files Modified

1. `/packages/core-js/src/engine/core/hud/index.js` - Added element tracking
2. `/packages/core-js/src/engine/core/index.js` - Added renderActiveElements() call
3. `/packages/core-js/src/engine/events/menu.js` - Register and render
4. `/packages/core-js/src/engine/actions/dialogue.js` - Register and render
5. `/packages/core-js/src/engine/events/chat.js` - Register and render

## Future Considerations

For other UI elements (inventory, custom overlays, etc.):

1. Implement a `render()` method
2. Call `engine.hud.registerElement(id, element)` in init
3. The element will automatically be re-rendered each frame

Example:

```javascript
init: function() {
  this.engine = this.engine;
  this.engine.hud.registerElement('custom-ui', this);
},
render: function() {
  // Draw your UI here
  this.drawCustomUI();
}
```
