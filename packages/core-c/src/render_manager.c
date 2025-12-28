#include "engine.h"
#include "render_manager.h"
#include <GLFW/glfw3.h>
#include <stdio.h>
#include <math.h> // For M_PI

// Basic vertex shader source
const char* vertex_shader_src = R"(
#version 330 core
layout (location = 0) in vec3 aPos;

uniform mat4 projection;
uniform mat4 view;

void main() {
    gl_Position = projection * view * vec4(aPos, 1.0);
}
)";

// Basic fragment shader source (outputs a fixed color)
const char* fragment_shader_src = R"(
#version 330 core
out vec4 FragColor;

void main() {
    FragColor = vec4(0.0f, 0.5f, 0.0f, 1.0f); // Green color
}
)";

// Vertex data for a simple triangle
static float vertices[] = {
    -0.5f, -0.5f, 0.0f, // Bottom-left
     0.5f, -0.5f, 0.0f, // Bottom-right
     0.0f,  0.5f, 0.0f  // Top
};

void init_render_manager(RenderManager* render_manager, GLEngine* engine) {
    render_manager->engine = engine;

    // Initialize camera
    vec3 cam_pos = vec3_new(0.0f, 0.0f, 5.0f);
    vec3 cam_target = vec3_new(0.0f, 0.0f, 0.0f);
    vec3 cam_up = vec3_new(0.0f, 1.0f, 0.0f); // Y-up
    render_manager->camera = camera_create(cam_pos, cam_target, cam_up);
    // Initial camera setup (using angles for more control later)
    render_manager->camera.yaw = -M_PI / 2.0f; // Look along -X initially
    render_manager->camera.pitch = 0.0f;
    render_manager->camera.distance = 5.0f;
    camera_update_view_from_angles(&render_manager->camera);

    // Initialize projection matrix
    render_manager_update_projection(render_manager, engine->width, engine->height);

    // Create and compile our shader program
    render_manager->shader = shader_create(vertex_shader_src, fragment_shader_src);

    // Generate VAO and VBO
    glGenVertexArrays(1, &render_manager->vao);
    glGenBuffers(1, &render_manager->vbo);

    // Bind VAO
    glBindVertexArray(render_manager->vao);

    // Bind VBO and buffer data
    glBindBuffer(GL_ARRAY_BUFFER, render_manager->vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    // Configure vertex attributes
    // Position attribute
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    // Unbind VBO and VAO
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);

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

void render_manager_update_projection(RenderManager* render_manager, int width, int height) {
    float aspect = (float)width / (float)height;
    render_manager->projection_matrix = mat4_perspective(M_PI / 4.0f, aspect, 0.1f, 100.0f);
    // Also update viewport if this is called on resize
    glViewport(0, 0, width, height);
}

void render_manager_clear_screen(RenderManager* render_manager) {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    // Use shader
    shader_use(&render_manager->shader);

    // Set uniforms
    shader_set_mat4(&render_manager->shader, "projection", render_manager->projection_matrix.m);
    shader_set_mat4(&render_manager->shader, "view", render_manager->camera.view_matrix.m);

    // Bind VAO and draw
    glBindVertexArray(render_manager->vao);
    glDrawArrays(GL_TRIANGLES, 0, 3);
    glBindVertexArray(0);
}
