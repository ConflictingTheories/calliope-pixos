# Menu System Fixes

## Issues Fixed

### 1. Menu Not Disappearing After Game Loads

**Problem:** When a game is loaded through the menu, the "Load Game" menu UI continues to display even though the game has started. The menu event is marked as completed, but the HUD continues rendering it.

**Root Cause:** The menu event registers itself with the HUD's active elements system but never unregisters when it completes. The HUD keeps calling the `render()` method on the completed menu, causing it to persist on screen.

**Solution:**

- Store the HUD element ID when registering the menu (`this.hudElementId = \`menu-${Date.now()}\``)
- In the `unhookListener()` method (called when the menu completes), unregister the menu from the HUD: `this.engine.hud.unregisterElement(this.hudElementId)`

**Files Changed:**

- [src/engine/events/menu.js](src/engine/events/menu.js#L45-L50) - Store HUD element ID during init
- [src/engine/events/menu.js](src/engine/events/menu.js#L122-L130) - Unregister from HUD on completion

### 2. Third Button Not Clickable in Multi-Button Menus

**Problem:** When displaying a menu with multiple buttons (e.g., "Click me", "Click me Again", "Click me one more time"), only the first two buttons respond to clicks. The third button doesn't register clicks correctly.

**Root Cause:** The menu input handler was using browser viewport coordinates (`clientX`/`clientY`) directly for collision detection against button bounds that are defined in canvas coordinates. When the canvas is scaled via CSS (or positioned differently in the viewport), there's a mismatch between the click coordinates and the button positions, causing collision detection to fail for buttons positioned lower on the screen.

**Solution:**
Convert browser viewport coordinates to canvas coordinates before performing collision detection:

1. Get the canvas element's bounding rectangle using `getBoundingClientRect()`
2. Calculate the scale factors between the internal canvas size and displayed size
3. Convert the click coordinates: `(clientX - rect.left) * scaleX` and `(clientY - rect.top) * scaleY`

This ensures that clicks are checked against button bounds in the correct coordinate system.

**Files Changed:**

- [src/engine/events/menu.js](src/engine/events/menu.js#L142-L182) - Added `convertToCanvasCoordinates()` helper and coordinate conversion for touch/mouse events
- [src/engine/actions/prompt.js](src/engine/actions/prompt.js#L72-L113) - Applied the same coordinate conversion fix

## Technical Details

### Coordinate System Issue

The menu system's button collision detection uses this logic:

```javascript
if (x < w.x + w.w && x > w.x && y < w.y + w.h && y > w.y)
```

Where:

- `x`, `y` are the click coordinates
- `w.x`, `w.y` are the button's top-left position in canvas coordinates
- `w.w`, `w.h` are the button's width and height

The problem occurred when:

1. A button is defined at canvas position (100, 300)
2. The canvas is displayed in the viewport with scaling or offset
3. A user clicks at browser coordinates (150, 400)
4. The code was comparing (150, 400) directly against (100, 300) bounds
5. Result: Click outside button bounds, even though it's visually on the button

### The Fix

The coordinate conversion accounts for:

- **Canvas offset**: The canvas's position relative to the viewport (`rect.left`, `rect.top`)
- **Scale factor**: The ratio between internal canvas resolution and display size (`scaleX`, `scaleY`)

This ensures clicks anywhere on the screen map correctly to canvas coordinates.

## Testing

To verify the fixes work:

1. **Load Game Menu Test:**
   - Load a game through the example Spritz game loader
   - Verify the "Load Game File" menu disappears after selecting a game file
   - The game should display without the menu overlay

2. **Multi-Button Click Test:**
   - Load a game with a menu containing 3+ buttons
   - Click each button sequentially
   - All buttons should respond to clicks, including those positioned lower on the screen

## Related Code

- [Menu Event Handler](src/engine/events/menu.js) - Handles menu input and rendering
- [Prompt Action](src/engine/actions/prompt.js) - Similar input handling for prompts
- [HUD Management](src/engine/core/hud/index.js) - Manages active HUD elements
- [WebGL View](src/components/WebGLView.jsx) - Provides pre-computed canvas coordinates
