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

#ifndef PLATFORM_H
#define PLATFORM_H

#include <stdbool.h>
#include <stdint.h>

/* Platform detection */
#if defined(PLATFORM_ARM_LINUX)
    /* ARM Linux - defined by CMake when cross-compiling */
    #define USE_GLES 1
    #define USE_EGL_GBM 1
#elif defined(PLATFORM_MACOS) || defined(__APPLE__)
    #define USE_DESKTOP_GL 1
    #define USE_GLFW 1
#elif defined(PLATFORM_LINUX) || defined(__linux__)
    /* Desktop Linux - not ARM Linux */
    #ifndef USE_GLES
        #define USE_DESKTOP_GL 1
        #define USE_GLFW 1
    #endif
#elif defined(_WIN32) || defined(_WIN64)
    #define PLATFORM_WINDOWS
    #define USE_DESKTOP_GL 1
    #define USE_GLFW 1
#endif

/* Include appropriate OpenGL headers */
#ifdef USE_GLES
    #ifdef USE_EGL_GBM
        #include <EGL/egl.h>
        #include <EGL/eglext.h>
    #endif
    #include <GLES2/gl2.h>
    #include <GLES2/gl2ext.h>
    /* GLES 3.0 optional */
    #ifdef USE_GLES3
        #include <GLES3/gl3.h>
    #endif
#endif

#ifdef USE_GLFW
    #include <GL/glew.h>
    #include <GLFW/glfw3.h>
#endif

/* Platform context - opaque handle */
typedef struct PlatformContext PlatformContext;

/* Display/window information */
typedef struct PlatformDisplayInfo {
    int width;
    int height;
    int refresh_rate;
    float aspect_ratio;
    bool fullscreen;
} PlatformDisplayInfo;

/* Input event types */
typedef enum PlatformInputType {
    PLATFORM_INPUT_KEY,
    PLATFORM_INPUT_BUTTON,
    PLATFORM_INPUT_AXIS,
    PLATFORM_INPUT_TOUCH
} PlatformInputType;

/* Key/button states */
typedef enum PlatformInputState {
    PLATFORM_INPUT_RELEASED = 0,
    PLATFORM_INPUT_PRESSED = 1,
    PLATFORM_INPUT_REPEAT = 2
} PlatformInputState;

/* Input event structure */
typedef struct PlatformInputEvent {
    PlatformInputType type;
    PlatformInputState state;
    int code;           /* Key code or button code */
    float value;        /* For analog inputs */
    int x, y;           /* For touch/mouse position */
} PlatformInputEvent;

/* Input callback type */
typedef void (*PlatformInputCallback)(PlatformInputEvent* event, void* user_data);

/**
 * Initialize the platform layer.
 * @param width Desired window/display width (0 for native)
 * @param height Desired window/display height (0 for native)
 * @param title Window title (may be ignored on some platforms)
 * @param fullscreen Whether to use fullscreen mode
 * @return Platform context or NULL on failure
 */
PlatformContext* platform_init(int width, int height, const char* title, bool fullscreen);

/**
 * Initialize the platform layer in headless mode (no graphics).
 * Used for testing game logic without display hardware.
 * @param width Virtual display width
 * @param height Virtual display height
 * @return Platform context or NULL on failure
 */
PlatformContext* platform_init_headless(int width, int height);

/**
 * Shutdown the platform layer and free resources.
 * @param ctx Platform context
 */
void platform_shutdown(PlatformContext* ctx);

/**
 * Get display information.
 * @param ctx Platform context
 * @param info Output display info struct
 */
void platform_get_display_info(PlatformContext* ctx, PlatformDisplayInfo* info);

/**
 * Swap buffers (present frame).
 * @param ctx Platform context
 */
void platform_swap_buffers(PlatformContext* ctx);

/**
 * Poll for input events.
 * @param ctx Platform context
 */
void platform_poll_events(PlatformContext* ctx);

/**
 * Check if the platform should close (quit signal received).
 * @param ctx Platform context
 * @return true if should close
 */
bool platform_should_close(PlatformContext* ctx);

/**
 * Set input event callback.
 * @param ctx Platform context
 * @param callback Callback function
 * @param user_data User data passed to callback
 */
void platform_set_input_callback(PlatformContext* ctx, PlatformInputCallback callback, void* user_data);

/**
 * Get current time in seconds.
 * @param ctx Platform context
 * @return Time in seconds since init
 */
double platform_get_time(PlatformContext* ctx);

/**
 * Sleep for specified milliseconds.
 * @param ms Milliseconds to sleep
 */
void platform_sleep(int ms);

/**
 * Make the GL context current on this thread.
 * @param ctx Platform context
 */
void platform_make_current(PlatformContext* ctx);

/**
 * Set vsync mode.
 * @param ctx Platform context
 * @param enabled Whether to enable vsync
 */
void platform_set_vsync(PlatformContext* ctx, bool enabled);

#ifdef USE_GLFW
/**
 * Get GLFW window handle (desktop platforms only).
 * @param ctx Platform context
 * @return GLFW window pointer
 */
void* platform_get_glfw_window(PlatformContext* ctx);
#endif

#endif /* PLATFORM_H */
