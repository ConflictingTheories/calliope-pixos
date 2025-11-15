#include "Sprite.h"
#include "GLEngine.h"
#include "Shader.h"
#include <GL/glew.h>
#include "../third_party/stb_image.h"
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
    // Set model matrix for this sprite
    glm::mat4 model = glm::mat4(1.0f);
    shader->setMat4("uModel", model);

    // Enable vertex attributes
    glEnableVertexAttribArray(0);
    glEnableVertexAttribArray(1);

    // If we have a texture, bind and set color white; otherwise color yellow
    if (texture != 0) {
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, texture);
        shader->setInt("uTexture", 0);
        shader->setVec3("uColor", glm::vec3(1.0f));
    } else {
        shader->setVec3("uColor", glm::vec3(1.0f, 1.0f, 0.0f));
    }

    // Create quad vertices for sprite with texture coordinates
    float halfSize = 16.0f; // 32/2 pixels
    float vertices[] = {
        // positions          // texture coords
        pos.x - halfSize, pos.y - halfSize, pos.z,    0.0f, 1.0f,
        pos.x + halfSize, pos.y - halfSize, pos.z,    1.0f, 1.0f,
        pos.x + halfSize, pos.y + halfSize, pos.z,    1.0f, 0.0f,
        pos.x - halfSize, pos.y - halfSize, pos.z,    0.0f, 1.0f,
        pos.x + halfSize, pos.y + halfSize, pos.z,    1.0f, 0.0f,
        pos.x - halfSize, pos.y + halfSize, pos.z,    0.0f, 0.0f
    };

    // Create VBO for sprite
    GLuint spriteVBO;
    glGenBuffers(1, &spriteVBO);
    glBindBuffer(GL_ARRAY_BUFFER, spriteVBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), nullptr);
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(3 * sizeof(float)));

    // Draw the sprite
    glDrawArrays(GL_TRIANGLES, 0, 6);

    if (texture != 0) {
        glBindTexture(GL_TEXTURE_2D, 0);
    }

    // Clean up
    glDeleteBuffers(1, &spriteVBO);
    glDisableVertexAttribArray(0);
    glDisableVertexAttribArray(1);
    glUseProgram(0);

    // Intentionally quiet: per-frame logging was too verbose for normal runs
}

void Sprite::loadTexture(const std::string& path) {
    if (path.empty()) return;
    if (texture != 0) return; // already loaded
    int w = 0, h = 0, channels = 0;
    unsigned char* img = stbi_load(path.c_str(), &w, &h, &channels, 4);
    if (!img) {
        std::cerr << "Sprite::loadTexture failed to load: " << path << std::endl;
        return;
    }
    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, w, h, 0, GL_RGBA, GL_UNSIGNED_BYTE, img);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glBindTexture(GL_TEXTURE_2D, 0);
    stbi_image_free(img);
    loaded = true;
}

void Sprite::addAction(std::shared_ptr<Action> action) {
    actionQueue.push_back(action);
}

void Sprite::clearActions() {
    actionQueue.clear();
}

void Sprite::setGreeting(const std::string& text) {
    speech = text;
}

Speech* Sprite::getSpeech() {
    return speechBubble;
}

void Sprite::speak(const std::string& text, bool something, Action* action) {
    speech = text;
}

void Sprite::faceDir(Direction dir) {
    // Set rotation based on direction
    switch (dir) {
        case Direction::Up: rotation = 0.0f; break;
        case Direction::Down: rotation = 180.0f; break;
        case Direction::Right: rotation = 90.0f; break;
        case Direction::Left: rotation = 270.0f; break;
    }
}

void Sprite::interact(Sprite* other, std::function<void()> callback) {
    // Default interaction
    if (callback) callback();
}
