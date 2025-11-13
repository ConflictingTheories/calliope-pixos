#pragma once

#include <memory>
#include <vector>
#include <string>
#include <GL/glew.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

class GLEngine;
class Camera;
class Light;
class Skybox;
class Shader;

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
    void addLight(std::shared_ptr<Light> light);
    void removeLight(std::shared_ptr<Light> light);

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

    std::shared_ptr<Camera> camera;
    std::vector<std::shared_ptr<Light>> lights;
    std::shared_ptr<Skybox> skybox;
    std::unordered_map<std::string, std::shared_ptr<Shader>> shaders;

    glm::mat4 projectionMatrix;
    glm::mat4 viewMatrix;

    int screenWidth, screenHeight;
    bool debugMode;

    // Transition buffers
    GLuint transitionVAO, transitionVBO;
    std::shared_ptr<Shader> transitionShader;
};
