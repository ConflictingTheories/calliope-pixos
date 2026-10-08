#include "engine.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

static void print_usage(const char* progname) {
    printf("Usage: %s [options]\n", progname);
    printf("Options:\n");
    printf("  --headless, -H  Run in headless mode (no graphics, for testing)\n");
    printf("  --width N       Set display width (default: 640 for ARM, 800 for desktop)\n");
    printf("  --height N      Set display height (default: 480 for ARM, 600 for desktop)\n");
    printf("  --help, -h      Show this help message\n");
}

int main(int argc, char* argv[]) {
    GLEngine engine;
    bool headless = false;
    int width = 640;   // Default for ARM
    int height = 480;
    
#ifndef PLATFORM_ARM_LINUX
    width = 800;   // Larger default for desktop
    height = 600;
#endif
    
    // Parse command line arguments
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--headless") == 0 || strcmp(argv[i], "-H") == 0) {
            headless = true;
        } else if (strcmp(argv[i], "--width") == 0 && i + 1 < argc) {
            width = atoi(argv[++i]);
        } else if (strcmp(argv[i], "--height") == 0 && i + 1 < argc) {
            height = atoi(argv[++i]);
        } else if (strcmp(argv[i], "--help") == 0 || strcmp(argv[i], "-h") == 0) {
            print_usage(argv[0]);
            return 0;
        } else {
            fprintf(stderr, "Unknown option: %s\n", argv[i]);
            print_usage(argv[0]);
            return 1;
        }
    }
    
    // Also check environment variable for headless mode
    const char* env_headless = getenv("PIXOS_HEADLESS");
    if (env_headless && strcmp(env_headless, "1") == 0) {
        headless = true;
    }

    // Initialize engine
    int result;
    if (headless) {
        result = init_engine_headless(&engine, width, height);
    } else {
        result = init_engine(&engine, width, height);
    }
    
    if (result != 0) {
        fprintf(stderr, "Failed to initialize engine\n");
        return -1;
    }

    // Main render loop
    int frame_limit = headless ? 300 : 0;  // Limit frames in headless mode for testing
    int frames = 0;
    
    while (engine.running) {
        if (!headless) {
            render_engine(&engine);
        } else {
            // Headless: just update logic, no rendering
            update_engine(&engine);
            platform_swap_buffers(engine.platform);  // This simulates vsync in headless
            
            frames++;
            if (frame_limit > 0 && frames >= frame_limit) {
                printf("[Headless] Completed %d frames, exiting.\n", frames);
                engine.running = 0;
            }
        }
    }

    // Clean up
    close_engine(&engine);

    return 0;
}
