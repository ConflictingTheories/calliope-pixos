#include "engine.h"
#include "input_manager.h"
#include <GLFW/glfw3.h>
#include <stdio.h>

void init_input_manager(InputManager* input_manager, GLEngine* engine) {
    input_manager->engine = engine;

    // Placeholder: Set up input callbacks, key mappings, etc. in future
    printf("InputManager initialized\n");
}

void update_input_manager(InputManager* input_manager) {
    // Placeholder: Poll and update input states
    // For now, just handle window close via ESC key
    if (glfwGetKey(input_manager->engine->window, GLFW_KEY_ESCAPE) == GLFW_PRESS) {
        glfwSetWindowShouldClose(input_manager->engine->window, GLFW_TRUE);
    }
}
