#ifndef ENGINE_H
#define ENGINE_H

#include <GLFW/glfw3.h>

// Forward declarations
struct RenderManager;
struct InputManager;

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
    int running;
    double time;
} GLEngine;

#include "render_manager.h"
#include "input_manager.h"

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
 * Closes the game engine and cleans up resources.
 * @param engine Pointer to GLEngine struct.
 */
void close_engine(GLEngine* engine);

#endif // ENGINE_H
