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
#include "resource/resource_manager.h"
#include "scene/world.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Callback for when the framebuffer is resized
static void framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    GLEngine* engine = (GLEngine*)glfwGetWindowUserPointer(window);
    if (engine) {
        engine_handle_resize(engine, width, height);
    }
}

int init_engine(GLEngine* engine, int width, int height) {
    memset(engine, 0, sizeof(GLEngine));
    engine->width = width;
    engine->height = height;
    engine->running = 1;
    engine->debug = false;
    engine->debug_height_overlay = false;
    engine->fullscreen = false;
    engine->frame_count = 0;
    
    printf("Initializing Pixos Engine...\n");

    // Initialize GLFW
    if (!glfwInit()) {
        fprintf(stderr, "Failed to initialize GLFW\n");
        return -1;
    }

    // Set GLFW options for OpenGL 3.3 core profile
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    // Create window
    engine->window = glfwCreateWindow(width, height, "Pixos Engine C", NULL, NULL);
    if (!engine->window) {
        fprintf(stderr, "Failed to create GLFW window\n");
        glfwTerminate();
        return -1;
    }

    glfwMakeContextCurrent(engine->window);

    // Initialize GLEW
    glewExperimental = GL_TRUE;
    if (glewInit() != GLEW_OK) {
        fprintf(stderr, "Failed to initialize GLEW\n");
        glfwDestroyWindow(engine->window);
        glfwTerminate();
        return -1;
    }

    // Clear any OpenGL errors from GLEW init
    while (glGetError() != GL_NO_ERROR);

    glfwShowWindow(engine->window);
    glfwSwapInterval(1);  // Enable vsync

    // Set user pointer and callbacks
    glfwSetWindowUserPointer(engine->window, engine);
    glfwSetFramebufferSizeCallback(engine->window, framebuffer_size_callback);

    // Initialize resource manager
    engine->resource_manager = (ResourceManager*)malloc(sizeof(ResourceManager));
    if (!engine->resource_manager) {
        fprintf(stderr, "Failed to allocate resource manager\n");
        glfwDestroyWindow(engine->window);
        glfwTerminate();
        return -1;
    }
    resource_manager_init(engine->resource_manager, engine, "./assets/");

    // Initialize render manager
    engine->render_manager = (RenderManager*)malloc(sizeof(RenderManager));
    if (!engine->render_manager) {
        fprintf(stderr, "Failed to allocate render manager\n");
        free(engine->resource_manager);
        glfwDestroyWindow(engine->window);
        glfwTerminate();
        return -1;
    }
    init_render_manager(engine->render_manager, engine);

    // Initialize input manager
    engine->input_manager = (InputManager*)malloc(sizeof(InputManager));
    if (!engine->input_manager) {
        fprintf(stderr, "Failed to allocate input manager\n");
        render_manager_destroy(engine->render_manager);
        free(engine->render_manager);
        resource_manager_destroy(engine->resource_manager);
        free(engine->resource_manager);
        glfwDestroyWindow(engine->window);
        glfwTerminate();
        return -1;
    }
    init_input_manager(engine->input_manager, engine);

    // Initialize world
    engine->world = (World*)malloc(sizeof(World));
    if (!engine->world) {
        fprintf(stderr, "Failed to allocate world\n");
        free(engine->input_manager);
        render_manager_destroy(engine->render_manager);
        free(engine->render_manager);
        resource_manager_destroy(engine->resource_manager);
        free(engine->resource_manager);
        glfwDestroyWindow(engine->window);
        glfwTerminate();
        return -1;
    }
    world_init(engine->world, "main", engine);

    // Initialize timing
    engine->time = glfwGetTime();
    engine->last_frame_time = engine->time;
    engine->delta_time = 0.0;

    // Check for any OpenGL errors after initialization
    GLenum error;
    while ((error = glGetError()) != GL_NO_ERROR) {
        fprintf(stderr, "OpenGL Error after init: %u\n", error);
    }

    printf("Pixos Engine initialized successfully\n");
    printf("OpenGL Version: %s\n", glGetString(GL_VERSION));
    printf("GLSL Version: %s\n", glGetString(GL_SHADING_LANGUAGE_VERSION));
    printf("Renderer: %s\n", glGetString(GL_RENDERER));
    
    return 0;
}

void update_engine(GLEngine* engine) {
    // Update timing
    double current_time = glfwGetTime();
    engine->delta_time = current_time - engine->last_frame_time;
    engine->last_frame_time = current_time;
    engine->time = current_time;
    
    // Update input
    update_input_manager(engine->input_manager);
    
    // Handle camera input
    InputManager* im = engine->input_manager;
    RenderManager* rm = engine->render_manager;
    
    float camera_speed = 5.0f * (float)engine->delta_time;
    float rotate_speed = 1.0f * (float)engine->delta_time;
    float zoom_speed = 10.0f * (float)engine->delta_time;
    
    // Camera panning
    if (input_manager_is_action_held(im, ACTION_CAMERA_PAN_LEFT)) {
        camera_pan(&rm->camera, -camera_speed, 0.0f);
    }
    if (input_manager_is_action_held(im, ACTION_CAMERA_PAN_RIGHT)) {
        camera_pan(&rm->camera, camera_speed, 0.0f);
    }
    if (input_manager_is_action_held(im, ACTION_CAMERA_PAN_UP)) {
        camera_pan(&rm->camera, 0.0f, camera_speed);
    }
    if (input_manager_is_action_held(im, ACTION_CAMERA_PAN_DOWN)) {
        camera_pan(&rm->camera, 0.0f, -camera_speed);
    }
    
    // Camera zoom
    if (input_manager_is_action_held(im, ACTION_CAMERA_ZOOM_IN)) {
        camera_zoom(&rm->camera, zoom_speed);
    }
    if (input_manager_is_action_held(im, ACTION_CAMERA_ZOOM_OUT)) {
        camera_zoom(&rm->camera, -zoom_speed);
    }
    
    // Camera rotation
    if (input_manager_is_action_held(im, ACTION_CAMERA_ROTATE_LEFT)) {
        camera_rotate(&rm->camera, rotate_speed, 0.0f);
    }
    if (input_manager_is_action_held(im, ACTION_CAMERA_ROTATE_RIGHT)) {
        camera_rotate(&rm->camera, -rotate_speed, 0.0f);
    }
    
    // Mouse scroll for zoom
    double scroll_x, scroll_y;
    input_manager_get_scroll(im, &scroll_x, &scroll_y);
    if (scroll_y != 0.0) {
        camera_zoom(&rm->camera, (float)scroll_y * 2.0f);
    }
    
    // Middle mouse button for camera rotation
    if (input_manager_is_mouse_button_held(im, 2)) {
        double dx, dy;
        input_manager_get_mouse_delta(im, &dx, &dy);
        camera_rotate(&rm->camera, (float)dx * 0.005f, (float)dy * 0.005f);
    }
    
    // Toggle debug with F3
    if (input_manager_is_action_pressed(im, ACTION_DEBUG_TOGGLE)) {
        engine->debug = !engine->debug;
        printf("Debug mode: %s\n", engine->debug ? "ON" : "OFF");
    }
    
    // Update world
    if (engine->world) {
        world_update(engine->world, engine->time);
    }
}

void render_engine(GLEngine* engine) {
    engine->frame_count++;
    
    // Reset debug counters
    render_manager_reset_debug_counters(engine->render_manager);
    
    // Update game state
    update_engine(engine);
    
    // Clear screen
    render_manager_clear_screen(engine->render_manager);
    
    // Activate main shader
    render_manager_activate_main_shader(engine->render_manager);
    
    // Render world (tiles, sprites, objects)
    if (engine->world) {
        world_render(engine->world, engine->render_manager);
    }
    
    // Debug output every 60 frames
    if (engine->debug && engine->frame_count % 60 == 0) {
        printf("Frame: %d, FPS: %.1f, Tiles: %d, Sprites: %d\n",
               engine->frame_count,
               1.0 / engine->delta_time,
               engine->render_manager->debug_tiles_count,
               engine->render_manager->debug_sprites_count);
    }
    
    // Swap buffers
    glfwSwapBuffers(engine->window);
    
    // Poll events
    glfwPollEvents();
    
    // Check if window should close
    if (glfwWindowShouldClose(engine->window)) {
        engine->running = 0;
    }
}

void engine_handle_resize(GLEngine* engine, int width, int height) {
    engine->width = width;
    engine->height = height;
    
    if (engine->render_manager) {
        render_manager_update_projection(engine->render_manager, width, height);
    }
    
    printf("Window resized to %dx%d\n", width, height);
}

void engine_get_screen_size(GLEngine* engine, int* width, int* height) {
    if (width) *width = engine->width;
    if (height) *height = engine->height;
}

void close_engine(GLEngine* engine) {
    printf("Closing Pixos Engine...\n");
    
    if (engine->world) {
        world_destroy(engine->world);
        free(engine->world);
        engine->world = NULL;
    }
    
    if (engine->render_manager) {
        render_manager_destroy(engine->render_manager);
        free(engine->render_manager);
        engine->render_manager = NULL;
    }
    
    if (engine->input_manager) {
        free(engine->input_manager);
        engine->input_manager = NULL;
    }
    
    if (engine->resource_manager) {
        resource_manager_destroy(engine->resource_manager);
        free(engine->resource_manager);
        engine->resource_manager = NULL;
    }
    
    if (engine->window) {
        glfwDestroyWindow(engine->window);
        engine->window = NULL;
    }
    
    glfwTerminate();
    printf("Pixos Engine closed\n");
}
