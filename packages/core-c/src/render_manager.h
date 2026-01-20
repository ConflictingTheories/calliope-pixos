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

#ifndef RENDER_MANAGER_H
#define RENDER_MANAGER_H

#include "rendering/gles_compat.h"
#include "rendering/shaders.h"
#include "rendering/lighting.h"
#include "math/vector.h"
#include "math/matrix4.h"
#include "math/frustum.h"
#include "camera.h"
#include "rendering/shader.h"
#include "rendering/light_manager.h"
#include "rendering/particle_manager.h"
#include "rendering/lod_manager.h"

typedef struct GLEngine GLEngine;

/**
 * RenderManager - Manages all OpenGL rendering operations.
 */

// Matrix stack size
#define MATRIX_STACK_SIZE 32

typedef struct RenderManager {
    GLEngine* engine;
    
    // Camera
    Camera camera;
    
    // Matrices
    mat4 model_matrix;
    mat4 view_matrix;
    mat4 projection_matrix;
    
    // Frustum for culling
    Frustum frustum;
    
    // Matrix stack
    // for hierarchical transformations
    mat4 model_matrix_stack[MATRIX_STACK_SIZE];
    int matrix_stack_index;
    
    // Shaders
    Shader shader;
    Shader main_shader;
    Shader sprite_shader;
    Shader tile_shader;
    Shader picker_shader;
    Shader particle_shader;
    Shader* current_shader;
    
    // Managers
    LightManager light_manager;
    ParticleManager particle_manager;
    LodManager lod_manager;
    
    // Legacy - for backward compatibility
    Shader shader;
    GLuint vao;
    GLuint vbo;
    
    // State
    bool is_picker_pass;
    bool initialized;
    
    // Debug counters
    int* debug_tiles_drawn;
    int* debug_sprites_drawn;
    int debug_tiles_count;
    int debug_sprites_count;
} RenderManager;

/**
 * Initializes the render manager.
 * @param render_manager Pointer to RenderManager struct.
 * @param engine Pointer to GLEngine.
 */
void init_render_manager(RenderManager* render_manager, GLEngine* engine);

/**
 * Initializes all shader programs.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_init_shaders(RenderManager* render_manager);

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

/**
 * Activates the main shader program.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_activate_main_shader(RenderManager* render_manager);

/**
 * Activates the sprite shader program.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_activate_sprite_shader(RenderManager* render_manager);

/**
 * Activates the tile shader program.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_activate_tile_shader(RenderManager* render_manager);

/**
 * Activates the picker shader program for object selection.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_activate_picker_shader(RenderManager* render_manager);

/**
 * Sets common uniforms on the current shader.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_set_matrix_uniforms(RenderManager* render_manager);

/**
 * Pushes the current model matrix onto the stack.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_push_matrix(RenderManager* render_manager);

/**
 * Pops the model matrix from the stack.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_pop_matrix(RenderManager* render_manager);

/**
 * Translates the model matrix.
 * @param render_manager Pointer to RenderManager struct.
 * @param translation Translation vector.
 */
void render_manager_translate(RenderManager* render_manager, vec3 translation);

/**
 * Rotates the model matrix.
 * @param render_manager Pointer to RenderManager struct.
 * @param angle Angle in radians.
 * @param axis Rotation axis.
 */
void render_manager_rotate(RenderManager* render_manager, float angle, vec3 axis);

/**
 * Scales the model matrix.
 * @param render_manager Pointer to RenderManager struct.
 * @param scale Scale vector.
 */
void render_manager_scale(RenderManager* render_manager, vec3 scale);

/**
 * Resets the model matrix to identity.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_reset_model_matrix(RenderManager* render_manager);

/**
 * Creates a GPU buffer.
 * @param render_manager Pointer to RenderManager struct.
 * @param data Data to upload.
 * @param size Size of data in bytes.
 * @param usage GL usage hint (GL_STATIC_DRAW, etc.)
 * @return Buffer ID.
 */
GLuint render_manager_create_buffer(RenderManager* render_manager, const float* data, size_t size, GLenum usage);

/**
 * Resets debug counters.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_reset_debug_counters(RenderManager* render_manager);

/**
 * Destroys the render manager.
 * @param render_manager Pointer to RenderManager struct.
 */
void render_manager_destroy(RenderManager* render_manager);

#endif // RENDER_MANAGER_H
