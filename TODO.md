# C++ Pixospritz Engine Port TODO

## 1. Core Engine Port
- [x] Create GLEngine.h/.cpp (main engine class, orchestrates loop, managers)
- [ ] Implement main game loop (init, run, shutdown)
- [ ] Integrate GLFW for window management
- [ ] Handle manifest loading and game initialization

## 2. Managers Port
- [ ] RenderManager.h/.cpp (OpenGL rendering, shaders, cameras, lights)
- [ ] InputManager.h/.cpp (SDL-based input handling for keyboard/mouse/gamepad)
- [ ] ModeManager.h/.cpp (game modes like explore, fight, debug)
- [ ] NetworkManager.h/.cpp (WebSocket-like networking for multiplayer)

## 3. Scene Management
- [x] World.h/.cpp (manages zones, sprites, objects, events)
- [x] Zone.h/.cpp (map zones with tiles, sprites, objects)
- [x] Avatar.h/.cpp (player-controlled character)
- [x] Sprite.h/.cpp (base sprite class)
- [x] Object.h/.cpp (game objects)

## 4. Rendering System
- [ ] Port WebGL shaders to GLSL (vertex.glsl, fragment.glsl)
- [ ] Implement camera system (Camera.h/.cpp)
- [ ] Lighting system (LightManager.h/.cpp)
- [ ] Skybox rendering
- [ ] Particle system
- [ ] Screen transitions (fade, cross, etc.)

## 5. Input Handling
- [ ] Map JS input mappings to SDL events
- [ ] Support keyboard, mouse, gamepad, touch
- [ ] Action bindings per mode
- [ ] Object picking (color-based selection)

## 6. Scripting Integration
- [ ] Integrate Lua for PixoScript and Lua scripts
- [ ] PixoScriptInterpreter.h/.cpp
- [ ] PixosLuaInterpreter.h/.cpp
- [ ] Library functions for scripting

## 7. Resource Management
- [ ] ResourceManager.h/.cpp (load textures, models, audio)
- [ ] Support for zip-based game packages
- [ ] Texture loading and management
- [ ] Audio system (if applicable)

## 8. Dependencies and Build
- [ ] Update CMakeLists.txt for all libraries (OpenGL, GLFW, GLEW, SDL2, Lua, GLM, nlohmann/json)
- [ ] Ensure cross-platform compatibility (macOS, Windows, Linux)
- [ ] Build and test basic loop

## 9. Testing and Integration
- [ ] Test rendering with basic scene
- [ ] Test input handling
- [ ] Load and render zones from manifest
- [ ] Implement avatar movement and interactions
- [ ] Add networking for multiplayer
- [ ] Full game loop testing

## 10. Advanced Features
- [ ] Cutscene system
- [ ] HUD and UI rendering
- [ ] Audio playback
- [ ] Save/load game state
- [ ] Performance optimizations
