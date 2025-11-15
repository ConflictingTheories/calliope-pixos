#include "Sprite.h"
#include "GLEngine.h"
#include "Camera.h"
#include "Shader.h"
#include <GL/glew.h>
#include "../third_party/stb_image.h"
#include <iostream>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/matrix_inverse.hpp>

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
    auto renderManager = engine ? engine->getRenderManager() : nullptr;
    if (!renderManager) return;

    Shader* shader = renderManager->getShader();
    if (!shader) return;

    renderManager->applySceneDefaults(shader);
    shader->use();

    shader->setMat4("uProjectionMatrix", renderManager->getProjectionMatrix());

    glm::mat4 viewMatrix = glm::mat4(1.0f);
    glm::vec3 cameraPosition(0.0f, 0.0f, 10.0f);
    if (engine && engine->getCamera()) {
        viewMatrix = engine->getCamera()->getViewMatrix();
        cameraPosition = engine->getCamera()->getPosition();
    }
    shader->setMat4("uViewMatrix", viewMatrix);
    shader->setVec3("uCameraPosition", cameraPosition);

    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, pos);
    model = glm::rotate(model, glm::radians(rotation), glm::vec3(0.0f, 0.0f, 1.0f));
    model = glm::scale(model, glm::vec3(scale.x, scale.y, 1.0f));
    shader->setMat4("uModelMatrix", model);
    shader->setMat3("uNormalMatrix", glm::mat3(glm::inverseTranspose(model)));

    shader->setFloat("useSampler", texture != 0 ? 1.0f : 0.0f);
    shader->setFloat("useDiffuse", 0.0f);
    shader->setVec4("uColorMultiplier", isSelected ? glm::vec4(1.0f, 0.8f, 0.2f, 1.0f) : glm::vec4(1.0f));
    shader->setFloat("isSelected", isSelected ? 1.0f : 0.0f);

    if (texture != 0) {
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, texture);
        shader->setInt("uSampler", 0);
    }

    constexpr float halfSize = 16.0f;
    const glm::vec3 normal(0.0f, 0.0f, 1.0f);
    float vertices[] = {
        // positions                   // normals             // texcoords
        -halfSize, -halfSize, 0.0f,     normal.x, normal.y, normal.z, 0.0f, 1.0f,
         halfSize, -halfSize, 0.0f,     normal.x, normal.y, normal.z, 1.0f, 1.0f,
         halfSize,  halfSize, 0.0f,     normal.x, normal.y, normal.z, 1.0f, 0.0f,
        -halfSize, -halfSize, 0.0f,     normal.x, normal.y, normal.z, 0.0f, 1.0f,
         halfSize,  halfSize, 0.0f,     normal.x, normal.y, normal.z, 1.0f, 0.0f,
        -halfSize,  halfSize, 0.0f,     normal.x, normal.y, normal.z, 0.0f, 0.0f
    };

    GLuint spriteVBO = 0;
    glGenBuffers(1, &spriteVBO);
    GLuint spriteVAO = 0;
    glGenVertexArrays(1, &spriteVAO);
    glBindVertexArray(spriteVAO);

    glBindBuffer(GL_ARRAY_BUFFER, spriteVBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), nullptr);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6 * sizeof(float)));
    glEnableVertexAttribArray(2);

    // Diagnostic: dump GL state before draw
    GLint currentProgram = 0;
    glGetIntegerv(GL_CURRENT_PROGRAM, &currentProgram);
    GLint activeTex = 0;
    glGetIntegerv(GL_ACTIVE_TEXTURE, &activeTex);
    GLint arrayBuf = 0;
    glGetIntegerv(GL_ARRAY_BUFFER_BINDING, &arrayBuf);
    GLint attrib0_enabled = 0, attrib1_enabled = 0;
    glGetVertexAttribiv(0, GL_VERTEX_ATTRIB_ARRAY_ENABLED, &attrib0_enabled);
    glGetVertexAttribiv(1, GL_VERTEX_ATTRIB_ARRAY_ENABLED, &attrib1_enabled);
    std::cout << "Sprite::render DEBUG glState currentProgram=" << currentProgram
              << " activeTex=" << activeTex << " arrayBuffer=" << arrayBuf
              << " attrib0_enabled=" << attrib0_enabled << " attrib1_enabled=" << attrib1_enabled
              << std::endl;
    std::cout << "Sprite::render DEBUG firstVerts: ";
    for (int i = 0; i < 10; ++i) std::cout << vertices[i] << ",";
    std::cout << std::endl;

    // Draw the sprite
    glDrawArrays(GL_TRIANGLES, 0, 6);

    // Clean up
    glBindVertexArray(0);
    if (spriteVAO) {
        glDeleteVertexArrays(1, &spriteVAO);
    }
    glDeleteBuffers(1, &spriteVBO);
    if (texture != 0) {
        glBindTexture(GL_TEXTURE_2D, 0);
    }

    shader->unuse();
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
