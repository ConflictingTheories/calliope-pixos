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

#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <stdbool.h>

// Forward declarations
struct RenderManager;
struct InputManager;
struct ResourceManager;
struct World;

/**
 * Main Pixos Graphics & Game Engine struct.
 * Orchestrates the main game loop, rendering, input handling, and resource management.
 */
typedef struct GLEngine {
    int width;
    int height;
    GLFWwindow* window;
    struct RenderManager* render_manager;
    struct InputManager* input_manager;
    struct ResourceManager* resource_manager;
    struct World* world;
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
} GLEngine;

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
