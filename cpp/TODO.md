# C++ Pixospritz Port TODO

## Core Engine Fixes
- [ ] Fix blank window: Implement proper rendering in RenderManager for zones, sprites, tiles
- [ ] Initialize world and avatar when manifest is loaded
- [ ] Add virtual console UI system for file selection and game rendering
- [ ] Implement multiple canvases (game, HUD, gamepad) like JS version

## Avatar Implementation
- [ ] Complete Avatar movement logic with zone walking checks
- [ ] Implement action queue processing and execution
- [ ] Add input handling for movement and actions
- [ ] Fix zone change logic and pathfinding integration

## Rendering System
- [x] Port WebGL shaders to OpenGL GLSL
- [x] Implement tile and sprite rendering in Zone::render()
- [ ] Add camera system and projection matrices
- [ ] Implement lighting and effects

## UI and File Selection
- [ ] Create virtual console interface for ZIP file selection
- [ ] Implement start menu and game initialization
- [ ] Add HUD canvas for UI elements
- [ ] Add gamepad canvas for mobile controls

## World and Zone Loading
- [ ] Complete Zone::loadFromJson() for objects and sprites
- [ ] Implement tileset loading and rendering
- [ ] Add event system integration
- [ ] Fix pathfinding and zone transitions

## Input and Controls
- [ ] Complete InputManager with mode-specific mappings
- [ ] Add touch and gamepad support
- [ ] Implement action binding system

## Networking and Scripting
- [ ] Add basic networking support
- [ ] Integrate Lua scripting
- [ ] Implement PixoScript interpreter

## Testing and Integration
- [ ] Test with example game package
- [ ] Verify avatar movement and interactions
- [ ] Ensure rendering matches JS version behavior
- [ ] Add error handling and logging
