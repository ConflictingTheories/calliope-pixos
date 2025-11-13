#include <GL/glew.h>
#include "RenderManager.h"
#include "GLEngine.h"
#include <iostream>

RenderManager::RenderManager(GLEngine* eng) : engine(eng) {}

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

    camera.init();
}

void RenderManager::clearScreen() {
    glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

void RenderManager::render() {
    // Set up camera view matrix
    viewMatrix = camera.getViewMatrix();

    // Render skybox first
    renderSkybox();

    // Set up main shader
    shaderProgram.use();

    // Set matrices
    shaderProgram.setMat4("uProjection", projectionMatrix);
    shaderProgram.setMat4("uView", viewMatrix);
    shaderProgram.setMat4("uModel", modelMatrix);

    // Set camera position
    shaderProgram.setVec3("uCameraPos", camera.position);

    // Set lights
    for (size_t i = 0; i < lights.size(); ++i) {
        const auto& light = lights[i];
        std::string prefix = "lights[" + std::to_string(i) + "]";
        shaderProgram.setVec3(prefix + ".position", light.position);
        shaderProgram.setVec3(prefix + ".color", light.color);
        shaderProgram.setFloat(prefix + ".attenuation", light.attenuation);
        shaderProgram.setVec3(prefix + ".direction", light.direction);
        shaderProgram.setFloat(prefix + ".density", light.density);
        shaderProgram.setFloat(prefix + ".scatteringCoefficients", light.scatteringCoefficients);
        shaderProgram.setBool(prefix + ".enabled", light.enabled);
    }

    // Render world
    if (engine->world) {
        engine->world->render();
    }
}

void RenderManager::initProjection() {
    float aspect = static_cast<float>(engine->windowWidth) / engine->windowHeight;
    projectionMatrix = glm::perspective(glm::radians(45.0f), aspect, 0.1f, 1000.0f);
}

void RenderManager::setupShaders() {
    // Main shader
    shaderProgram.load("vertex.glsl", "fragment.glsl");

    // Picker shader for object selection
    pickerProgram.load("picker_vertex.glsl", "picker_fragment.glsl");

    // Skybox shader
    skyboxShader.load("skybox_vertex.glsl", "skybox_fragment.glsl");
}

void RenderManager::setupLights() {
    // Default ambient light
    addLight(0, glm::vec3(0.0f, 10.0f, 0.0f), glm::vec3(1.0f, 1.0f, 1.0f), 0.1f, glm::vec3(0.0f, -1.0f, 0.0f), 1.0f, 0.1f, true);
}

void RenderManager::setupSkybox() {
    // TODO: Load skybox textures
}

void RenderManager::addLight(int id, const glm::vec3& pos, const glm::vec3& color, float attenuation, const glm::vec3& direction, float density, float scattering, bool enabled) {
    if (id >= lights.size()) {
        lights.resize(id + 1);
    }
    lights[id] = {pos, color, attenuation, direction, density, scattering, enabled};
}

void RenderManager::removeLight(int id) {
    if (id < lights.size()) {
        lights[id].enabled = false;
    }
}

void RenderManager::setSkyboxShader(const std::string& shaderName) {
    // TODO: Load and set skybox shader
}

void RenderManager::renderSkybox() {
    // TODO: Render skybox
}
