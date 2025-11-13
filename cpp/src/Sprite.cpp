#include "Sprite.h"
#include "GLEngine.h"
#include "Shader.h"
#include <GL/glew.h>
#include <iostream>

Sprite::Sprite(GLEngine* engine) : engine(engine), pos(0.0f), scale(1.0f), rotation(0.0f), animFrame(0), animTimer(0.0f), fixed(false), objId(0), speechTimer(0.0f), isLit(false), lightIndex(0), lightColor(1.0f), density(1.0f), isSelected(false) {}

Sprite::~Sprite() {}

void Sprite::init() {
    // Default initialization
}

void Sprite::update(double dt) {
    // Default update logic
}

void Sprite::render() {
    // Get the shader from render manager
    auto shader = engine->getRenderManager()->getShader();
    if (!shader) return;

    shader->use();

    // Set projection matrix
    auto renderManager = engine->getRenderManager();
    shader->setMat4("uProj", renderManager->getProjectionMatrix());

    // Enable vertex attributes
    glEnableVertexAttribArray(0);

    // Set sprite color (yellow for avatar)
    shader->setVec3("uColor", glm::vec3(1.0f, 1.0f, 0.0f));

    // Create quad vertices for sprite
    float size = 0.5f;
    float vertices[] = {
        pos.x - size, pos.y - size, pos.z,
        pos.x + size, pos.y - size, pos.z,
        pos.x + size, pos.y + size, pos.z,
        pos.x - size, pos.y - size, pos.z,
        pos.x + size, pos.y + size, pos.z,
        pos.x - size, pos.y + size, pos.z
    };

    // Create VBO for sprite
    GLuint spriteVBO;
    glGenBuffers(1, &spriteVBO);
    glBindBuffer(GL_ARRAY_BUFFER, spriteVBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, nullptr);

    // Draw the sprite
    glDrawArrays(GL_TRIANGLES, 0, 6);

    // Clean up
    glDeleteBuffers(1, &spriteVBO);
    glDisableVertexAttribArray(0);
    glUseProgram(0);

    std::cout << "Sprite::render() called at (" << pos.x << ", " << pos.y << ", " << pos.z << ")" << std::endl;
}

void Sprite::addAction(std::shared_ptr<Action> action) {
    actionQueue.push_back(action);
}

void Sprite::clearActions() {
    actionQueue.clear();
}
