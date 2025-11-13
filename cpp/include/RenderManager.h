#pragma once
#include <memory>
#include <vector>
#include <string>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "Camera.h"
#include "Shader.h"

class GLEngine;

struct Light {
    glm::vec3 position;
    glm::vec3 color;
    float attenuation;
    glm::vec3 direction;
    float density;
    float scatteringCoefficients;
    bool enabled;
};

class RenderManager {
public:
    RenderManager(GLEngine* engine);
    ~RenderManager();

    void init();
    void clearScreen();
    void render();
    void initProjection();

    // Shaders
    Shader shaderProgram;
    Shader pickerProgram;
    Shader skyboxShader;

    // Camera
    Camera camera;

    // Lighting
    std::vector<Light> lights;
    void addLight(int id, const glm::vec3& pos, const glm::vec3& color, float attenuation, const glm::vec3& direction, float density, float scattering, bool enabled);
    void removeLight(int id);

    // Skybox
    void setSkyboxShader(const std::string& shaderName);
    void renderSkybox();

    // Matrices
    glm::mat4 projectionMatrix;
    glm::mat4 viewMatrix;
    glm::mat4 modelMatrix;

    // Engine reference
    GLEngine* engine;

private:
    void setupShaders();
    void setupLights();
    void setupSkybox();
};
