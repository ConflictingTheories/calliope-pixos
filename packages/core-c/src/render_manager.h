#ifndef RENDER_MANAGER_H
#define RENDER_MANAGER_H

typedef struct GLEngine GLEngine;

/**
 * RenderManager - Manages all OpenGL rendering operations.
 */
#include "camera.h"
#include "rendering/shader.h" // Include shader header

typedef struct RenderManager {
    GLEngine* engine;
    Camera camera; // The camera managed by this render manager
    mat4 projection_matrix; // The projection matrix
    Shader shader; // The shader program used for rendering
    GLuint vao; // Vertex Array Object
    GLuint vbo; // Vertex Buffer Object
    // Placeholder for future fields like other shaders, etc.
} RenderManager;

/**
 * Initializes the render manager.
 * @param render_manager Pointer to RenderManager struct.
 * @param engine Pointer to GLEngine.
 */
void init_render_manager(RenderManager* render_manager, GLEngine* engine);

/**
 * Updates the projection matrix, typically on window resize.
 * @param render_manager Pointer to RenderManager struct.
 * @param width New window width.
 * @param height New window height.
 */
void render_manager_update_projection(RenderManager* render_manager, int width, int height);

/**
 * Clears the screen.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_clear_screen(RenderManager* render_manager);

#endif // RENDER_MANAGER_H
