#pragma once

#include <glm/glm.hpp>
#include <memory>
#include <vector>
#include <GL/glew.h>

class GLEngine;
class Shader;

class RenderManager {
private:
    GLEngine* engine;
    std::unique_ptr<Shader> defaultShader;
    GLuint VAO, VBO;
    glm::mat4 projectionMatrix;

public:
    RenderManager(GLEngine* engine);
    ~RenderManager();

    void init();
    void render();
    void setProjectionMatrix(const glm::mat4& proj);

    // Shader management
    Shader* getDefaultShader() { return defaultShader.get(); }
    Shader* getShader() { return defaultShader.get(); }

    // Buffer creation
    GLuint createBuffer(const std::vector<float>& data, GLenum usage, int components);

    // Get projection matrix
    const glm::mat4& getProjectionMatrix() const { return projectionMatrix; }

private:
    void initShaders();
    void createFallbackShader();
    void initBuffers();
};
