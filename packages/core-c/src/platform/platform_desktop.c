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

/* Desktop platform implementation using GLFW + GLEW */

#include "platform.h"

#ifdef USE_GLFW

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#ifdef _WIN32
    #include <windows.h>
#else
    #include <unistd.h>
#endif

/* Platform context structure */
struct PlatformContext {
    GLFWwindow* window;
    int width;
    int height;
    bool fullscreen;
    double start_time;
    
    /* Input callback */
    PlatformInputCallback input_callback;
    void* input_user_data;
};

/* Forward declarations for GLFW callbacks */
static void glfw_key_callback(GLFWwindow* window, int key, int scancode, int action, int mods);
static void glfw_mouse_button_callback(GLFWwindow* window, int button, int action, int mods);
static void glfw_cursor_pos_callback(GLFWwindow* window, double xpos, double ypos);
static void glfw_framebuffer_size_callback(GLFWwindow* window, int width, int height);

PlatformContext* platform_init(int width, int height, const char* title, bool fullscreen) {
    PlatformContext* ctx = (PlatformContext*)calloc(1, sizeof(PlatformContext));
    if (!ctx) {
        fprintf(stderr, "Failed to allocate platform context\n");
        return NULL;
    }
    
    ctx->width = width > 0 ? width : 800;
    ctx->height = height > 0 ? height : 600;
    ctx->fullscreen = fullscreen;
    
    printf("[Platform] Initializing desktop platform (GLFW + GLEW)...\n");
    
    /* Initialize GLFW */
    if (!glfwInit()) {
        fprintf(stderr, "[Platform] Failed to initialize GLFW\n");
        free(ctx);
        return NULL;
    }
    
    /* Set OpenGL version hints */
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    
#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif
    
    /* Create window */
    GLFWmonitor* monitor = NULL;
    if (fullscreen) {
        monitor = glfwGetPrimaryMonitor();
        const GLFWvidmode* mode = glfwGetVideoMode(monitor);
        ctx->width = mode->width;
        ctx->height = mode->height;
    }
    
    ctx->window = glfwCreateWindow(ctx->width, ctx->height, 
                                   title ? title : "Pixos Engine", 
                                   monitor, NULL);
    if (!ctx->window) {
        fprintf(stderr, "[Platform] Failed to create GLFW window\n");
        glfwTerminate();
        free(ctx);
        return NULL;
    }
    
    /* Make context current */
    glfwMakeContextCurrent(ctx->window);
    
    /* Initialize GLEW */
    glewExperimental = GL_TRUE;
    GLenum glew_error = glewInit();
    if (glew_error != GLEW_OK) {
        fprintf(stderr, "[Platform] Failed to initialize GLEW: %s\n", 
                glewGetErrorString(glew_error));
        glfwDestroyWindow(ctx->window);
        glfwTerminate();
        free(ctx);
        return NULL;
    }
    
    /* Clear any OpenGL errors from GLEW init */
    while (glGetError() != GL_NO_ERROR);
    
    /* Store context in window user pointer for callbacks */
    glfwSetWindowUserPointer(ctx->window, ctx);
    
    /* Set up callbacks */
    glfwSetKeyCallback(ctx->window, glfw_key_callback);
    glfwSetMouseButtonCallback(ctx->window, glfw_mouse_button_callback);
    glfwSetCursorPosCallback(ctx->window, glfw_cursor_pos_callback);
    glfwSetFramebufferSizeCallback(ctx->window, glfw_framebuffer_size_callback);
    
    /* Show window and enable vsync */
    glfwShowWindow(ctx->window);
    glfwSwapInterval(1);
    
    /* Record start time */
    ctx->start_time = glfwGetTime();
    
    printf("[Platform] Desktop platform initialized\n");
    printf("[Platform] OpenGL Version: %s\n", glGetString(GL_VERSION));
    printf("[Platform] GLSL Version: %s\n", glGetString(GL_SHADING_LANGUAGE_VERSION));
    printf("[Platform] Renderer: %s\n", glGetString(GL_RENDERER));
    printf("[Platform] Display: %dx%d\n", ctx->width, ctx->height);
    
    return ctx;
}

void platform_shutdown(PlatformContext* ctx) {
    if (!ctx) return;
    
    printf("[Platform] Shutting down desktop platform...\n");
    
    if (ctx->window) {
        glfwDestroyWindow(ctx->window);
    }
    glfwTerminate();
    free(ctx);
}

void platform_get_display_info(PlatformContext* ctx, PlatformDisplayInfo* info) {
    if (!ctx || !info) return;
    
    glfwGetFramebufferSize(ctx->window, &info->width, &info->height);
    info->fullscreen = ctx->fullscreen;
    info->aspect_ratio = (float)info->width / (float)info->height;
    
    /* Get refresh rate from primary monitor */
    GLFWmonitor* monitor = glfwGetPrimaryMonitor();
    if (monitor) {
        const GLFWvidmode* mode = glfwGetVideoMode(monitor);
        info->refresh_rate = mode->refreshRate;
    } else {
        info->refresh_rate = 60;
    }
}

void platform_swap_buffers(PlatformContext* ctx) {
    if (!ctx || !ctx->window) return;
    glfwSwapBuffers(ctx->window);
}

void platform_poll_events(PlatformContext* ctx) {
    if (!ctx) return;
    glfwPollEvents();
}

bool platform_should_close(PlatformContext* ctx) {
    if (!ctx || !ctx->window) return true;
    return glfwWindowShouldClose(ctx->window);
}

void platform_set_input_callback(PlatformContext* ctx, PlatformInputCallback callback, void* user_data) {
    if (!ctx) return;
    ctx->input_callback = callback;
    ctx->input_user_data = user_data;
}

double platform_get_time(PlatformContext* ctx) {
    if (!ctx) return 0.0;
    return glfwGetTime() - ctx->start_time;
}

void platform_sleep(int ms) {
#ifdef _WIN32
    Sleep(ms);
#else
    usleep(ms * 1000);
#endif
}

void platform_make_current(PlatformContext* ctx) {
    if (!ctx || !ctx->window) return;
    glfwMakeContextCurrent(ctx->window);
}

void platform_set_vsync(PlatformContext* ctx, bool enabled) {
    if (!ctx) return;
    glfwSwapInterval(enabled ? 1 : 0);
}

void* platform_get_glfw_window(PlatformContext* ctx) {
    if (!ctx) return NULL;
    return ctx->window;
}

/* GLFW Callbacks */

static void glfw_key_callback(GLFWwindow* window, int key, int scancode, int action, int mods) {
    (void)scancode;
    (void)mods;
    
    PlatformContext* ctx = (PlatformContext*)glfwGetWindowUserPointer(window);
    if (!ctx || !ctx->input_callback) return;
    
    PlatformInputEvent event = {0};
    event.type = PLATFORM_INPUT_KEY;
    event.code = key;
    
    switch (action) {
        case GLFW_PRESS:
            event.state = PLATFORM_INPUT_PRESSED;
            break;
        case GLFW_RELEASE:
            event.state = PLATFORM_INPUT_RELEASED;
            break;
        case GLFW_REPEAT:
            event.state = PLATFORM_INPUT_REPEAT;
            break;
    }
    
    ctx->input_callback(&event, ctx->input_user_data);
}

static void glfw_mouse_button_callback(GLFWwindow* window, int button, int action, int mods) {
    (void)mods;
    
    PlatformContext* ctx = (PlatformContext*)glfwGetWindowUserPointer(window);
    if (!ctx || !ctx->input_callback) return;
    
    PlatformInputEvent event = {0};
    event.type = PLATFORM_INPUT_BUTTON;
    event.code = button;
    event.state = (action == GLFW_PRESS) ? PLATFORM_INPUT_PRESSED : PLATFORM_INPUT_RELEASED;
    
    double xpos, ypos;
    glfwGetCursorPos(window, &xpos, &ypos);
    event.x = (int)xpos;
    event.y = (int)ypos;
    
    ctx->input_callback(&event, ctx->input_user_data);
}

static void glfw_cursor_pos_callback(GLFWwindow* window, double xpos, double ypos) {
    PlatformContext* ctx = (PlatformContext*)glfwGetWindowUserPointer(window);
    if (!ctx || !ctx->input_callback) return;
    
    /* Only send axis events when a button is held */
    if (glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS ||
        glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_RIGHT) == GLFW_PRESS) {
        
        PlatformInputEvent event = {0};
        event.type = PLATFORM_INPUT_AXIS;
        event.x = (int)xpos;
        event.y = (int)ypos;
        
        ctx->input_callback(&event, ctx->input_user_data);
    }
}

static void glfw_framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    PlatformContext* ctx = (PlatformContext*)glfwGetWindowUserPointer(window);
    if (!ctx) return;
    
    ctx->width = width;
    ctx->height = height;
    glViewport(0, 0, width, height);
}

#endif /* USE_GLFW */
