#include "engine.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

static void print_usage(const char* progname) {
    printf("Usage: %s [options]\n", progname);
    printf("Options:\n");
    printf("  --headless     Run in headless mode (no graphics, for testing)\n");
    printf("  --width N      Set display width (default: 640 for ARM, 800 for desktop)\n");
    printf("  --height N     Set display height (default: 480 for ARM, 600 for desktop)\n");
    printf("  --help         Show this help message\n");
}

int main(int argc, char* argv[]) {
    printf("[Main] Engine starting (argc=%d)...\n", argc);
    fflush(stdout);
    
    GLEngine engine;
    bool headless = false;
    int width = 640;   // Default for ARM
    int height = 480;
    
    printf("[Main] Variables initialized\n");
    fflush(stdout);
    
#ifndef PLATFORM_ARM_LINUX
    width = 800;   // Larger default for desktop
    height = 600;
#endif
    
    // Parse command line arguments
    printf("[Main] Parsing %d arguments...\n", argc);
    fflush(stdout);
    
    for (int i = 1; i < argc; i++) {
        printf("[Main] Checking arg[%d]='%s'\n", i, argv[i] ? argv[i] : "(null)");
        fflush(stdout);
        
        if (strcmp(argv[i], "--headless") == 0 || strcmp(argv[i], "-H") == 0) {
            headless = true;
            printf("[Main] Headless mode enabled\n");
            fflush(stdout);
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
    
    printf("[Main] Args parsed, headless=%d\n", headless);
    fflush(stdout);
    
    // Also check environment variable for headless mode
    printf("[Main] Checking PIXOS_HEADLESS env...\n");
    fflush(stdout);
    
    const char* env_headless = getenv("PIXOS_HEADLESS");
    printf("[Main] getenv returned: %s\n", env_headless ? env_headless : "(null)");
    fflush(stdout);
    
    if (env_headless && strcmp(env_headless, "1") == 0) {
        headless = true;
    }
    
    printf("[Main] headless=%d, width=%d, height=%d\n", headless, width, height);
    fflush(stdout);

    // Initialize engine
    int result;
    if (headless) {
        printf("[Main] Calling init_engine_headless...\n");
        fflush(stdout);
        result = init_engine_headless(&engine, width, height);
    } else {
        printf("[Main] Calling init_engine...\n");
        fflush(stdout);
        result = init_engine(&engine, width, height);
    }
    
    printf("[Main] Engine init returned: %d\n", result);
    fflush(stdout);
    
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
