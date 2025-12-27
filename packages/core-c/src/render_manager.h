#ifndef RENDER_MANAGER_H
#define RENDER_MANAGER_H

typedef struct GLEngine GLEngine;

/**
 * RenderManager - Manages all OpenGL rendering operations.
 */
typedef struct {
    GLEngine* engine;
    // Placeholder for future fields like shaders, camera, etc.
} RenderManager;

/**
 * Initializes the render manager.
 * @param render_manager Pointer to RenderManager struct.
 * @param engine Pointer to GLEngine.
 */
void init_render_manager(RenderManager* render_manager, GLEngine* engine);

/**
 * Clears the screen.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_clear_screen(RenderManager* render_manager);

#endif // RENDER_MANAGER_H
