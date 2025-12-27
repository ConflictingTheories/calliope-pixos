#include "engine.h"
#include "render_manager.h"
#include <GLFW/glfw3.h>
#include <stdio.h>

void init_render_manager(RenderManager* render_manager, GLEngine* engine) {
    render_manager->engine = engine;

    // Set up OpenGL viewport
    glViewport(0, 0, engine->width, engine->height);

    // Enable depth testing
    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_LEQUAL);

    // Enable blending
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    // Clear color
    glClearColor(0.0f, 1.0f, 0.0f, 1.0f); // Green background like JS version

    printf("RenderManager initialized\n");
}

void render_manager_clear_screen(RenderManager* render_manager) {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}
