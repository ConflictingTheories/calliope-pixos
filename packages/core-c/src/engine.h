/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

#ifndef ENGINE_H
#define ENGINE_H

#include "platform/platform.h"
#include <stdbool.h>

// Forward declarations
struct RenderManager;
struct InputManager;
struct ResourceManager;
struct World;
struct AudioManager;
struct LuaManager;
struct HudManager;
struct CutsceneManager;
struct GameLoader;

// Engine typedef for scripting compatibility
typedef struct GLEngine Engine;

/**
 * Main Pixos Graphics & Game Engine struct.
 * Orchestrates the main game loop, rendering, input handling, and resource management.
 */
struct GLEngine {
    int width;
    int height;
    PlatformContext* platform;      // Platform abstraction
    struct RenderManager* render_manager;
    struct InputManager* input_manager;
    struct ResourceManager* resource_manager;
    struct HudManager* hud;         // HUD/UI manager
    // Cutscene manager
    struct CutsceneManager* cutscene;  // Cutscene manager
    
    // Game loader (for embedded device game selection)
    struct GameLoader* game_loader;
    
    struct World* world;
    
    // Audio manager (optional, enabled via ENABLE_AUDIO)
    struct AudioManager* audio;
    
    // Lua scripting manager (optional, enabled via ENABLE_LUA)
    struct LuaManager* lua;
    
    // Game state flags storage
    void* game_flags;               // Hash table for game flags
    
    int running;
    double time;
    double delta_time;
    double last_frame_time;
    int frame_count;
    
    // Debug flags
    bool debug;
    bool debug_height_overlay;
    
    // Fullscreen state
    bool fullscreen;
};

#include "render_manager.h"
#include "input_manager.h"
#include "resource/resource_manager.h"
#include "scene/world.h"

/**
 * Initializes the game engine.
 * @param engine Pointer to GLEngine struct.
 * @param width Window width.
 * @param height Window height.
 * @return 0 on success, -1 on failure.
 */
int init_engine(GLEngine* engine, int width, int height);

/**
 * Main render loop for the game engine.
 * @param engine Pointer to GLEngine struct.
 */
void render_engine(GLEngine* engine);

/**
 * Updates the game state (called before rendering).
 * @param engine Pointer to GLEngine struct.
 */
void update_engine(GLEngine* engine);

/**
 * Closes the game engine and cleans up resources.
 * @param engine Pointer to GLEngine struct.
 */
void close_engine(GLEngine* engine);

/**
 * Handles window resize events.
 * @param engine Pointer to GLEngine struct.
 * @param width New width.
 * @param height New height.
 */
void engine_handle_resize(GLEngine* engine, int width, int height);

/**
 * Gets the current screen size.
 * @param engine Pointer to GLEngine struct.
 * @param width Output width.
 * @param height Output height.
 */
void engine_get_screen_size(GLEngine* engine, int* width, int* height);

#endif // ENGINE_H
