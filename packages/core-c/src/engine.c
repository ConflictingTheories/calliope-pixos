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
#include "platform/platform.h"
#include "resource/resource_manager.h"
#include "scene/world.h"
#include "rendering/gles_compat.h"
#include "hud/hud_manager.h"
#include "cutscene/cutscene_manager.h"
#include "game_loader.h"

#ifdef ENABLE_AUDIO
#include "audio/audio_manager.h"
#endif

#ifdef ENABLE_LUA
#include "scripting/lua_manager.h"
#endif

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Callback for when the framebuffer is resized (desktop only)
#ifdef USE_GLFW
static void framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    GLEngine* engine = (GLEngine*)glfwGetWindowUserPointer(window);
    if (engine) {
        engine_handle_resize(engine, width, height);
    }
}
#endif

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

    // Initialize platform (creates window/display and GL context)
    engine->platform = platform_init(width, height, "Pixos Engine C", false);
    if (!engine->platform) {
        fprintf(stderr, "Failed to initialize platform\n");
        return -1;
    }

#ifdef USE_GLFW
    // Set user pointer and callbacks for desktop
    GLFWwindow* window = (GLFWwindow*)platform_get_glfw_window(engine->platform);
    glfwSetWindowUserPointer(window, engine);
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
#endif

    // Initialize resource manager
    engine->resource_manager = (ResourceManager*)malloc(sizeof(ResourceManager));
    if (!engine->resource_manager) {
        fprintf(stderr, "Failed to allocate resource manager\n");
        platform_shutdown(engine->platform);
        free(engine->platform);
        return -1;
    }
    resource_manager_init(engine->resource_manager, engine, "./assets/");

    // Initialize render manager
    engine->render_manager = (RenderManager*)malloc(sizeof(RenderManager));
    if (!engine->render_manager) {
        fprintf(stderr, "Failed to allocate render manager\n");
        free(engine->resource_manager);
        platform_shutdown(engine->platform);
        free(engine->platform);
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
        platform_shutdown(engine->platform);
        free(engine->platform);
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
        platform_shutdown(engine->platform);
        free(engine->platform);
        return -1;
    }
    world_init(engine->world, "main", engine);

#ifdef ENABLE_AUDIO
    // Initialize audio manager
    engine->audio = (AudioManager*)malloc(sizeof(AudioManager));
    if (engine->audio) {
        if (audio_manager_init(engine->audio) != 0) {
            fprintf(stderr, "Warning: Failed to initialize audio manager\n");
            free(engine->audio);
            engine->audio = NULL;
        }
    }
#endif

#ifdef ENABLE_LUA
    // Initialize Lua scripting manager
    engine->lua = (LuaManager*)malloc(sizeof(LuaManager));
    if (engine->lua) {
        if (lua_manager_init(engine->lua, engine) != 0) {
            fprintf(stderr, "Warning: Failed to initialize Lua manager\n");
            free(engine->lua);
            engine->lua = NULL;
        }
    }
#endif

    // Initialize HUD manager
    engine->hud = (HudManager*)malloc(sizeof(HudManager));
    if (engine->hud) {
        if (hud_manager_init(engine->hud, engine) != 0) {
            fprintf(stderr, "Warning: Failed to initialize HUD manager\n");
            free(engine->hud);
            engine->hud = NULL;
        } else {
            // Try to load a default font
            const char* font_paths[] = {
                "./assets/fonts/minecraftia.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
                NULL
            };
            bool font_loaded = false;
            for (int i = 0; font_paths[i] && !font_loaded; i++) {
                if (hud_manager_load_font(engine->hud, &engine->hud->primary_font, 
                                          font_paths[i], 24.0f) == 0) {
                    font_loaded = true;
                }
            }
            if (!font_loaded) {
                fprintf(stderr, "Warning: Could not load any fonts\n");
            }
        }
    }

    // Initialize cutscene manager
    engine->cutscene = (CutsceneManager*)malloc(sizeof(CutsceneManager));
    if (engine->cutscene) {
        if (cutscene_manager_init(engine->cutscene, engine) != 0) {
            fprintf(stderr, "Warning: Failed to initialize cutscene manager\n");
            free(engine->cutscene);
            engine->cutscene = NULL;
        }
    }

    // Initialize game loader (for embedded device game selection)
    engine->game_loader = (GameLoader*)malloc(sizeof(GameLoader));
    if (engine->game_loader) {
        if (game_loader_init(engine->game_loader, engine) != 0) {
            fprintf(stderr, "Warning: Failed to initialize game loader\n");
            // Non-fatal - continue without game loader
        }
    }

    // Initialize timing
    engine->time = platform_get_time(engine->platform);
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

/* Headless mode initialization - no graphics, for testing game logic */
int init_engine_headless(GLEngine* engine, int width, int height) {
    memset(engine, 0, sizeof(GLEngine));
    engine->width = width;
    engine->height = height;
    engine->running = 1;
    engine->debug = false;
    engine->debug_height_overlay = false;
    engine->fullscreen = false;
    engine->frame_count = 0;
    engine->headless = true;
    
    printf("Initializing Pixos Engine (HEADLESS MODE)...\n");
    
    // Initialize platform in headless mode
    engine->platform = platform_init_headless(width, height);
    if (!engine->platform) {
        fprintf(stderr, "Failed to initialize platform (headless)\n");
        return -1;
    }
    
    // Initialize resource manager
    engine->resource_manager = (ResourceManager*)malloc(sizeof(ResourceManager));
    if (!engine->resource_manager) {
        fprintf(stderr, "Failed to allocate resource manager\n");
        platform_shutdown(engine->platform);
        return -1;
    }
    resource_manager_init(engine->resource_manager, engine, "./assets/");
    
    // Initialize input manager
    engine->input_manager = (InputManager*)malloc(sizeof(InputManager));
    if (!engine->input_manager) {
        fprintf(stderr, "Failed to allocate input manager\n");
        resource_manager_destroy(engine->resource_manager);
        free(engine->resource_manager);
        platform_shutdown(engine->platform);
        return -1;
    }
    init_input_manager(engine->input_manager, engine);
    
    // Initialize world
    engine->world = (World*)malloc(sizeof(World));
    if (!engine->world) {
        fprintf(stderr, "Failed to allocate world\n");
        free(engine->input_manager);
        resource_manager_destroy(engine->resource_manager);
        free(engine->resource_manager);
        platform_shutdown(engine->platform);
        return -1;
    }
    world_init(engine->world, "main", engine);
    
    // Initialize game loader (for embedded device game selection)
    engine->game_loader = (GameLoader*)malloc(sizeof(GameLoader));
    if (engine->game_loader) {
        if (game_loader_init(engine->game_loader, engine) != 0) {
            fprintf(stderr, "Warning: Failed to initialize game loader\n");
        }
    }
    
    // Initialize timing (use simple time since we don't have platform timing in headless)
    engine->time = 0.0;
    engine->last_frame_time = 0.0;
    engine->delta_time = 0.0;
    
    printf("Pixos Engine initialized in HEADLESS mode\n");
    printf("Virtual display: %dx%d\n", width, height);
    printf("No graphics rendering - logic testing only\n");
    
    return 0;
}

void update_engine(GLEngine* engine) {
    // Update timing
    double current_time = platform_get_time(engine->platform);
    engine->delta_time = current_time - engine->last_frame_time;
    engine->last_frame_time = current_time;
    engine->time = current_time;
    
    // Update input
    update_input_manager(engine->input_manager);

#ifdef ENABLE_AUDIO
    // Update audio (handles fades, cleanup)
    if (engine->audio) {
        audio_manager_update(engine->audio, (float)engine->delta_time);
    }
#endif
    
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

    // Update cutscenes
    if (engine->cutscene) {
        cutscene_manager_update(engine->cutscene, engine->delta_time);
    }
}

void render_engine(GLEngine* engine) {
    engine->frame_count++;
    
    // Reset debug counters
    render_manager_reset_debug_counters(engine->render_manager);
    
    // Update game state
    update_engine(engine);
    
    // Check if game loader is showing selector
    if (engine->game_loader && engine->game_loader->show_selector) {
        // Update and render game selector UI
        game_loader_update_selector(engine->game_loader, engine);
        game_loader_render_selector(engine->game_loader, engine);
        
        // Swap buffers and poll events
        platform_swap_buffers(engine->platform);
        platform_poll_events(engine->platform);
        
        // Check if window should close
        if (platform_should_close(engine->platform)) {
            engine->running = 0;
        }
        return;
    }
    
    // Clear screen
    render_manager_clear_screen(engine->render_manager);
    
    // Activate main shader
    render_manager_activate_main_shader(engine->render_manager);
    
    // Render world (tiles, sprites, objects)
    if (engine->world) {
        world_render(engine->world, engine->render_manager);
    }
    
    // Render HUD overlay (on top of 3D scene)
    if (engine->hud) {
        hud_manager_update(engine->hud, engine->delta_time);
        hud_manager_render(engine->hud);
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
    platform_swap_buffers(engine->platform);
    
    // Poll events
    platform_poll_events(engine->platform);
    
    // Check if window should close
    if (platform_should_close(engine->platform)) {
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

    // Destroy game loader first (unloads any loaded game)
    if (engine->game_loader) {
        game_loader_destroy(engine->game_loader, engine);
        free(engine->game_loader);
        engine->game_loader = NULL;
    }

    // Destroy cutscene manager
    if (engine->cutscene) {
        cutscene_manager_destroy(engine->cutscene);
        free(engine->cutscene);
        engine->cutscene = NULL;
    }

    // Destroy HUD manager
    if (engine->hud) {
        hud_manager_destroy(engine->hud);
        free(engine->hud);
        engine->hud = NULL;
    }

#ifdef ENABLE_LUA
    if (engine->lua) {
        lua_manager_destroy(engine->lua);
        free(engine->lua);
        engine->lua = NULL;
    }
#endif

#ifdef ENABLE_AUDIO
    if (engine->audio) {
        audio_manager_destroy(engine->audio);
        free(engine->audio);
        engine->audio = NULL;
    }
#endif
    
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
    
    if (engine->platform) {
        platform_shutdown(engine->platform);
        free(engine->platform);
        engine->platform = NULL;
    }
    
    printf("Pixos Engine closed\n");
}
