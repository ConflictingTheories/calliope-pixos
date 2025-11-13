# Pixospritz C++ Port TODO

## Core Engine Port
- [ ] Create GLEngine.h/.cpp (main engine class, game loop, managers orchestration)

## Managers Port
- [ ] Create RenderManager.h/.cpp (OpenGL rendering, shaders, cameras, lights, skybox, particles)
- [ ] Create InputManager.h/.cpp (SDL-based input handling, keyboard/mouse/gamepad/touch)
- [ ] Create ModeManager.h/.cpp (game modes, Lua scripting integration)

## Scene Management
- [ ] Create World.h/.cpp (zone management, sprites, objects, events)
- [ ] Create Zone.h/.cpp (map zones, tiles, sprites, objects, rendering)
- [ ] Create Avatar.h/.cpp (player character, actions, input handling)

## Rendering
- [ ] Adapt WebGL shaders to OpenGL GLSL
- [ ] Implement camera system (perspective, orthographic, FreeCam)
- [ ] Implement lighting system (point lights, attenuation)
- [ ] Implement skybox rendering
- [ ] Implement particle system

## Input
- [ ] Map JS input mappings to SDL events
- [ ] Support keyboard, mouse, gamepad input
- [ ] Implement action mappings and hooks

## Scripting
- [ ] Integrate Lua for PixoScript and Lua scripting
- [ ] Create ScriptInterpreter.h/.cpp

## Networking
- [ ] Add WebSocket-like networking for multiplayer
- [ ] Create NetworkManager.h/.cpp

## Dependencies and Build
- [ ] Update CMakeLists.txt for SDL2, Lua, OpenGL, GLM, etc.
- [ ] Install required libraries

## Testing and Iteration
- [ ] Build and run basic game loop
- [ ] Test rendering pipeline
- [ ] Test input handling
- [ ] Test scene loading
- [ ] Add transitions, particles, audio
- [ ] Full feature parity with JS version
