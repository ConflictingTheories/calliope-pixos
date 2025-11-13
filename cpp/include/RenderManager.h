#pragma once

#include <memory>
#include <vector>
#include <string>
#include <unordered_map>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

class GLEngine;
class Camera;
class Light;
class Skybox;
class Shader;
class Zone;
class Sprite;
class Object;

struct LightData {
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
    void resize(int width, int height);

    // Camera
    void setCamera(std::shared_ptr<Camera> camera);
    std::shared_ptr<Camera> getCamera() const;

    // Lighting
    void addLight(int id, const glm::vec3& pos, const glm::vec3& color, float attenuation, const glm::vec3& direction, float density, float scattering, bool enabled);
    void removeLight(int id);

    // Skybox
    void setSkybox(std::shared_ptr<Skybox> skybox);

    // Shaders
    std::shared_ptr<Shader> loadShader(const std::string& vertexPath, const std::string& fragmentPath);
    std::shared_ptr<Shader> getShader(const std::string& name) const;

    // Matrices
    glm::mat4 getProjectionMatrix() const;
    glm::mat4 getViewMatrix() const;
    void initProjection();

    // Rendering functions
    void renderZone(class Zone* zone);
    void renderSprite(class Sprite* sprite);
    void renderObject(class Object* object);

    // Transitions
    void renderTransition(float progress, bool direction);

    // Debug
    void setDebugMode(bool enabled);
    bool isDebugMode() const;

    GLEngine* engine;

private:
    void updateMatrices();
    void setupShaders();
    void setupLights();
    void setupSkybox();
    void renderSkybox();

    std::shared_ptr<Camera> camera;
    std::vector<LightData> lights;
    std::shared_ptr<Skybox> skybox;
    std::unordered_map<std::string, std::shared_ptr<Shader>> shaders;

    std::shared_ptr<Shader> shaderProgram;
    std::shared_ptr<Shader> pickerProgram;
    std::shared_ptr<Shader> skyboxShader;

    glm::mat4 projectionMatrix;
    glm::mat4 viewMatrix;
    glm::mat4 modelMatrix;

    int screenWidth, screenHeight;
    bool debugMode;

    // Transition buffers
    unsigned int transitionVAO, transitionVBO;
    std::shared_ptr<Shader> transitionShader;
};
