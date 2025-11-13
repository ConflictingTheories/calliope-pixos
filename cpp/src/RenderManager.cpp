#include <GL/glew.h>
#include "RenderManager.h"
#include "GLEngine.h"
#include <iostream>

RenderManager::RenderManager(GLEngine* eng) : engine(eng), modelMatrix(1.0f) {}

RenderManager::~RenderManager() {}

void RenderManager::init() {
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);
    glFrontFace(GL_CCW);

    setupShaders();
    setupLights();
    setupSkybox();
    initProjection();

    // Camera init if needed
}

void RenderManager::clearScreen() {
    glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

void RenderManager::render() {
    // Set up camera view matrix
    if (camera) {
        // TODO: Get view matrix from camera
    }

    // Render skybox first
    renderSkybox();

    // Set up main shader
    if (shaderProgram) {
        // TODO: Use shader
    }

    // Render world
    if (engine->world) {
        // TODO: Render world
    }
}

void RenderManager::initProjection() {
    float aspect = static_cast<float>(engine->windowWidth) / engine->windowHeight;
    projectionMatrix = glm::perspective(glm::radians(45.0f), aspect, 0.1f, 1000.0f);
}

void RenderManager::setupShaders() {
    // TODO: Load shaders
}

void RenderManager::setupLights() {
    // Default ambient light
    addLight(0, glm::vec3(0.0f, 10.0f, 0.0f), glm::vec3(1.0f, 1.0f, 1.0f), 0.1f, glm::vec3(0.0f, -1.0f, 0.0f), 1.0f, 0.1f, true);
}

void RenderManager::setupSkybox() {
    // TODO: Load skybox textures
}

void RenderManager::addLight(int id, const glm::vec3& pos, const glm::vec3& color, float attenuation, const glm::vec3& direction, float density, float scattering, bool enabled) {
    if (id >= static_cast<int>(lights.size())) {
        lights.resize(id + 1);
    }
    lights[id] = {pos, color, attenuation, direction, density, scattering, enabled};
}

void RenderManager::removeLight(int id) {
    if (id < static_cast<int>(lights.size())) {
        lights[id].enabled = false;
    }
}

void RenderManager::renderSkybox() {
    // TODO: Render skybox
}

// Stub implementations
void RenderManager::resize(int width, int height) {}
void RenderManager::setCamera(std::shared_ptr<Camera> cam) { camera = cam; }
std::shared_ptr<Camera> RenderManager::getCamera() const { return camera; }
void RenderManager::setSkybox(std::shared_ptr<Skybox> sb) { skybox = sb; }
std::shared_ptr<Shader> RenderManager::loadShader(const std::string& vertexPath, const std::string& fragmentPath) { return nullptr; }
std::shared_ptr<Shader> RenderManager::getShader(const std::string& name) const { return nullptr; }
glm::mat4 RenderManager::getProjectionMatrix() const { return projectionMatrix; }
glm::mat4 RenderManager::getViewMatrix() const { return viewMatrix; }
void RenderManager::renderZone(class Zone* zone) {}
void RenderManager::renderSprite(class Sprite* sprite) {}
void RenderManager::renderObject(class Object* object) {}
void RenderManager::renderTransition(float progress, bool direction) {}
void RenderManager::setDebugMode(bool enabled) { debugMode = enabled; }
bool RenderManager::isDebugMode() const { return debugMode; }
