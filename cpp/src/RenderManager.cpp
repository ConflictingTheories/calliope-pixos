#include "RenderManager.h"
#include "GLEngine.h"
#include "Shader.h"
#include <glm/gtc/matrix_transform.hpp>
#include <iostream>

RenderManager::RenderManager(GLEngine* engine)
    : engine(engine), VAO(0), VBO(0) {
}

RenderManager::~RenderManager() {
    if (VAO) glDeleteVertexArrays(1, &VAO);
    if (VBO) glDeleteBuffers(1, &VBO);
}

void RenderManager::init() {
    initShaders();
    initBuffers();

    // Set up projection matrix
    glm::vec2 screenSize = engine->screenSize();
    projectionMatrix = glm::ortho(0.0f, screenSize.x, screenSize.y, 0.0f, -1.0f, 1.0f);
}

void RenderManager::render() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glClearColor(0.2f, 0.3f, 0.3f, 1.0f);

    // Use default shader
    if (defaultShader) {
        defaultShader->use();
        defaultShader->setMat4("projection", projectionMatrix);
    }

    // Render world
    if (engine->getWorld()) {
        engine->getWorld()->render();
    }
}

void RenderManager::setProjectionMatrix(const glm::mat4& proj) {
    projectionMatrix = proj;
}

void RenderManager::initShaders() {
    defaultShader = std::make_unique<Shader>("shaders/vertex.glsl", "shaders/fragment.glsl");
}

void RenderManager::initBuffers() {
    // Create a simple quad for rendering
    float vertices[] = {
        // positions
        0.0f, 1.0f, 0.0f,
        1.0f, 0.0f, 0.0f,
        0.0f, 0.0f, 0.0f,

        0.0f, 1.0f, 0.0f,
        1.0f, 1.0f, 0.0f,
        1.0f, 0.0f, 0.0f
    };

    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);

    glBindVertexArray(VAO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
}
