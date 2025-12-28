#include "engine.h"
#include <stdio.h>
#include <stdlib.h>

// Callback for when the framebuffer is resized
void framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    GLEngine* engine = (GLEngine*)glfwGetWindowUserPointer(window);
    if (engine) {
        engine->width = width;
        engine->height = height;
        render_manager_update_projection(engine->render_manager, width, height);
    }
}

int init_engine(GLEngine* engine, int width, int height) {
    engine->width = width;
    engine->height = height;
    engine->running = 1;
    printf("Engine running set to: %d\n", engine->running); // Debug print
    engine->time = glfwGetTime();

    // Initialize GLFW
    if (!glfwInit()) {
        fprintf(stderr, "Failed to initialize GLFW\n");
        return -1;
    }

    // Set GLFW options for OpenGL 3.3 core profile
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE); // For macOS

    // Create window
    engine->window = glfwCreateWindow(width, height, "Pixos Engine C", NULL, NULL);
    if (!engine->window) {
        fprintf(stderr, "Failed to create GLFW window\n");
        glfwTerminate();
        return -1;
    }

    glfwMakeContextCurrent(engine->window);

    // Initialize GLEW
    if (glewInit() != GLEW_OK) {
        fprintf(stderr, "Failed to initialize GLEW\n");
        return -1;
    }

    glfwShowWindow(engine->window); // Show the window
    glfwSwapInterval(1);            // Enable vsync

    // Set user pointer and framebuffer size callback
    glfwSetWindowUserPointer(engine->window, engine);
    glfwSetFramebufferSizeCallback(engine->window, framebuffer_size_callback);

    // Initialize managers
    engine->render_manager = malloc(sizeof(RenderManager));
    if (!engine->render_manager) {
        fprintf(stderr, "Failed to allocate render manager\n");
        return -1;
    }
    init_render_manager(engine->render_manager, engine);

    engine->input_manager = malloc(sizeof(InputManager));
    if (!engine->input_manager) {
        fprintf(stderr, "Failed to allocate input manager\n");
        return -1;
    }
    init_input_manager(engine->input_manager, engine);

    // Check for any OpenGL errors after initialization
    GLenum error;
    while ((error = glGetError()) != GL_NO_ERROR) {
        fprintf(stderr, "OpenGL Error after init: %u\n", error);
    }

    printf("GLEngine initialized successfully\n");
    return 0;
}

void render_engine(GLEngine* engine) {
    double current_time = glfwGetTime();
    engine->time = current_time;

    // Update input
    update_input_manager(engine->input_manager);

    // Clear screen
    render_manager_clear_screen(engine->render_manager);

    // Placeholder: Basic render operations
    // TODO: Implement full rendering pipeline

    // Swap buffers
    printf("Before glfwSwapBuffers\n");
    glfwSwapBuffers(engine->window);
    printf("After glfwSwapBuffers\n");
    GLenum error;
    while ((error = glGetError()) != GL_NO_ERROR) {
        fprintf(stderr, "OpenGL Error after glfwSwapBuffers: %u\n", error);
    }

    // Poll events
    glfwPollEvents();

    // Check if window should close
    if (glfwWindowShouldClose(engine->window)) {
        engine->running = 0;
    }
}

void close_engine(GLEngine* engine) {
    if (engine->render_manager) {
        shader_destroy(&engine->render_manager->shader); // Destroy shader program
        glDeleteVertexArrays(1, &engine->render_manager->vao); // Delete VAO
        glDeleteBuffers(1, &engine->render_manager->vbo);     // Delete VBO
        free(engine->render_manager);
    }
    if (engine->input_manager) {
        free(engine->input_manager);
    }
    if (engine->window) {
        glfwDestroyWindow(engine->window);
    }
    glfwTerminate();
    printf("GLEngine closed\n");
}
