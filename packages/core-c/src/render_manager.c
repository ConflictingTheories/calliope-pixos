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

#include "engine.h"
#include "render_manager.h"
#include "rendering/shaders.h"
#include "platform/platform.h"
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

void render_manager_init_shaders(RenderManager* render_manager) {
    // Main shader
    render_manager->main_shader = shader_create(MAIN_VERTEX_SHADER, MAIN_FRAGMENT_SHADER);
    printf("Main shader created (ID: %u)\n", render_manager->main_shader.program_id);
    
    // Sprite shader
    render_manager->sprite_shader = shader_create(SPRITE_VERTEX_SHADER, SPRITE_FRAGMENT_SHADER);
    printf("Sprite shader created (ID: %u)\n", render_manager->sprite_shader.program_id);
    
    // Tile shader
    render_manager->tile_shader = shader_create(TILE_VERTEX_SHADER, TILE_FRAGMENT_SHADER);
    printf("Tile shader created (ID: %u)\n", render_manager->tile_shader.program_id);
    
    // Picker shader
    render_manager->picker_shader = shader_create(PICKER_VERTEX_SHADER, PICKER_FRAGMENT_SHADER);
    printf("Picker shader created (ID: %u)\n", render_manager->picker_shader.program_id);
    
    // Particle shader
    render_manager->particle_shader = shader_create(SPRITE_VERTEX_SHADER, SPRITE_FRAGMENT_SHADER); // Re-use sprite for now
    printf("Particle shader created (ID: %u)\n", render_manager->particle_shader.program_id);
    
    // Set current shader to main
    render_manager->current_shader = &render_manager->main_shader;
}

void init_render_manager(RenderManager* render_manager, GLEngine* engine) {
    memset(render_manager, 0, sizeof(RenderManager));
    render_manager->engine = engine;
    render_manager->initialized = false;
    render_manager->is_picker_pass = false;
    render_manager->matrix_stack_index = 0;

    // Initialize camera
    vec3 cam_pos = vec3_new(0.0f, 10.0f, 10.0f);
    vec3 cam_target = vec3_new(0.0f, 0.0f, 0.0f);
    vec3 cam_up = vec3_new(0.0f, 1.0f, 0.0f);
    render_manager->camera = camera_create(cam_pos, cam_target, cam_up);
    render_manager->camera.yaw = -M_PI / 2.0f;
    render_manager->camera.pitch = -M_PI / 4.0f;  // 45 degree angle
    render_manager->camera.distance = 15.0f;
    camera_update_view_from_angles(&render_manager->camera);

    // Initialize matrices
    render_manager->model_matrix = mat4_identity();
    render_manager->view_matrix = render_manager->camera.view_matrix;
    render_manager_update_projection(render_manager, engine->width, engine->height);

    // Initialize light manager
    light_manager_init(&render_manager->light_manager);

    // Initialize particle manager
    particle_manager_init(&render_manager->particle_manager, engine);
    
    // Initialize LOD manager
    lod_manager_init(&render_manager->lod_manager, engine);
    
    // Add a default ambient light
    vec3 light_pos = vec3_new(5.0f, 10.0f, 5.0f);
    vec3 light_color = vec3_new(1.0f, 1.0f, 0.9f);
    vec3 attenuation = vec3_new(1.0f, 0.09f, 0.032f);
    vec3 direction = vec3_new(0.0f, -1.0f, 0.0f);
    vec3 scattering = vec3_new(0.1f, 0.1f, 0.1f);
    light_manager_add_light(&render_manager->light_manager, "sun", 
                           light_pos, light_color, attenuation,
                           direction, 0.5f, scattering, true);

    // Initialize shaders
    render_manager_init_shaders(render_manager);

    // Set up OpenGL viewport
    glViewport(0, 0, engine->width, engine->height);

    // Enable depth testing
    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_LEQUAL);

    // Enable blending
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    // Enable back-face culling
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);

    // Clear color - green like JS version
    glClearColor(0.0f, 0.5f, 0.0f, 1.0f);

    // Initialize debug counters
    render_manager->debug_tiles_count = 0;
    render_manager->debug_sprites_count = 0;
    render_manager->debug_tiles_drawn = &render_manager->debug_tiles_count;
    render_manager->debug_sprites_drawn = &render_manager->debug_sprites_count;

    render_manager->initialized = true;
    printf("RenderManager initialized\n");
}

void render_manager_update_projection(RenderManager* render_manager, int width, int height) {
    float aspect = (float)width / (float)height;
    render_manager->projection_matrix = mat4_perspective(M_PI / 4.0f, aspect, 0.1f, 100.0f);
    glViewport(0, 0, width, height);
}

void render_manager_clear_screen(RenderManager* render_manager) {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    
    // Update view matrix from camera
    render_manager->view_matrix = render_manager->camera.view_matrix;
    
    // Extract frustum
    mat4 vp = mat4_multiply(render_manager->projection_matrix, render_manager->view_matrix);
    frustum_extract(&render_manager->frustum, vp);
    
    // Reset model matrix
    render_manager->model_matrix = mat4_identity();
}

void render_manager_activate_main_shader(RenderManager* render_manager) {
    render_manager->current_shader = &render_manager->main_shader;
    render_manager->is_picker_pass = false;
    shader_use(&render_manager->main_shader);
    render_manager_set_matrix_uniforms(render_manager);
    
    // Set light uniforms
    light_manager_set_uniforms(&render_manager->light_manager, &render_manager->main_shader);
}

void render_manager_activate_sprite_shader(RenderManager* render_manager) {
    render_manager->current_shader = &render_manager->sprite_shader;
    render_manager->is_picker_pass = false;
    shader_use(&render_manager->sprite_shader);
    render_manager_set_matrix_uniforms(render_manager);
}

void render_manager_activate_tile_shader(RenderManager* render_manager) {
    render_manager->current_shader = &render_manager->tile_shader;
    render_manager->is_picker_pass = false;
    shader_use(&render_manager->tile_shader);
    render_manager_set_matrix_uniforms(render_manager);
    
    // Set ambient strength
    shader_set_float(&render_manager->tile_shader, "uAmbientStrength", 
                    render_manager->light_manager.ambient_strength);
}

void render_manager_activate_picker_shader(RenderManager* render_manager) {
    render_manager->current_shader = &render_manager->picker_shader;
    render_manager->is_picker_pass = true;
    shader_use(&render_manager->picker_shader);
    render_manager_set_matrix_uniforms(render_manager);
}

void render_manager_set_matrix_uniforms(RenderManager* render_manager) {
    Shader* shader = render_manager->current_shader;
    if (!shader) return;
    
    // Set matrices
    shader_set_mat4(shader, "uProjectionMatrix", render_manager->projection_matrix.m);
    shader_set_mat4(shader, "uViewMatrix", render_manager->view_matrix.m);
    shader_set_mat4(shader, "uModelMatrix", render_manager->model_matrix.m);
    
    // Set scale (default 1,1,1)
    shader_set_vec3(shader, "uScale", 1.0f, 1.0f, 1.0f);
    
    // Set camera position
    shader_set_vec3(shader, "uCameraPosition", 
                   render_manager->camera.position.x,
                   render_manager->camera.position.y,
                   render_manager->camera.position.z);
}

void render_manager_push_matrix(RenderManager* render_manager) {
    if (render_manager->matrix_stack_index >= MATRIX_STACK_SIZE - 1) {
        fprintf(stderr, "Matrix stack overflow!\n");
        return;
    }
    render_manager->model_matrix_stack[render_manager->matrix_stack_index++] = render_manager->model_matrix;
}

void render_manager_pop_matrix(RenderManager* render_manager) {
    if (render_manager->matrix_stack_index <= 0) {
        fprintf(stderr, "Matrix stack underflow!\n");
        return;
    }
    render_manager->model_matrix = render_manager->model_matrix_stack[--render_manager->matrix_stack_index];
}

void render_manager_translate(RenderManager* render_manager, vec3 translation) {
    render_manager->model_matrix = mat4_translate(render_manager->model_matrix, translation);
}

void render_manager_rotate(RenderManager* render_manager, float angle, vec3 axis) {
    render_manager->model_matrix = mat4_rotate(render_manager->model_matrix, angle, axis);
}

void render_manager_scale(RenderManager* render_manager, vec3 scale) {
    // Manual scaling (mat4_scale would need to be added to matrix4.c)
    mat4 scale_mat = mat4_identity();
    scale_mat.m[0] = scale.x;
    scale_mat.m[5] = scale.y;
    scale_mat.m[10] = scale.z;
    render_manager->model_matrix = mat4_multiply(render_manager->model_matrix, scale_mat);
}

void render_manager_reset_model_matrix(RenderManager* render_manager) {
    render_manager->model_matrix = mat4_identity();
}

GLuint render_manager_create_buffer(RenderManager* render_manager, const float* data, size_t size, GLenum usage) {
    (void)render_manager;  // Unused for now
    GLuint buffer;
    glGenBuffers(1, &buffer);
    glBindBuffer(GL_ARRAY_BUFFER, buffer);
    glBufferData(GL_ARRAY_BUFFER, size, data, usage);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    return buffer;
}

void render_manager_reset_debug_counters(RenderManager* render_manager) {
    render_manager->debug_tiles_count = 0;
    render_manager->debug_sprites_count = 0;
}

void render_manager_destroy(RenderManager* render_manager) {
    if (!render_manager) return;
    
    shader_destroy(&render_manager->main_shader);
    shader_destroy(&render_manager->sprite_shader);
    shader_destroy(&render_manager->tile_shader);
    shader_destroy(&render_manager->picker_shader);
    
    if (render_manager->vao) {
        glDeleteVertexArrays(1, &render_manager->vao);
    }
    if (render_manager->vbo) {
        glDeleteBuffers(1, &render_manager->vbo);
    }
    
    light_manager_clear(&render_manager->light_manager);
    
    printf("RenderManager destroyed\n");
}
