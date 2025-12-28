#include "engine.h"
#include <stdio.h>

int main(void) {
    GLEngine engine;

    // Initialize engine with window size
    if (init_engine(&engine, 800, 600) != 0) {
        fprintf(stderr, "Failed to initialize engine\n");
        return -1;
    }

    // Main render loop
    while (engine.running) {
        printf("In main loop\n");
        render_engine(&engine);
    }

    // Clean up
    close_engine(&engine);

    return 0;
}
