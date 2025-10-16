# TODO: Centralize Input Controls into InputManager

## Steps:
1. Create InputManager class in pixos/jsx/engine/core/input/InputManager.js
   - Aggregate keyboard, mouse, touch, gamepad inputs
   - Support action mappings per mode (e.g., FPS, racing, battle, explore, tactics)
   - Allow hooks for scripting (Lua callbacks)
   - Integrate with ModeManager for mode switches

2. Modify core/index.js to initialize InputManager

3. Refactor avatar.js to use InputManager for input checks

4. Update camera.js to use InputManager for camera controls

5. Update events/camera.js to use InputManager

6. Expose InputManager to Lua in PixosLuaLibrary.js

7. Test input handling across modes

8. Verify scripting integration

9. Update documentation
