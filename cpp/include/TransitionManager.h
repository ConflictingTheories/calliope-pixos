#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <memory>
#include <string>

class Shader;

class TransitionManager {
public:
    TransitionManager();
    ~TransitionManager();

    void init();
    void renderTransition(float progress, const std::string& effect = "fade", bool directionIn = true);

    // Effect management
    void loadTransitionShaders();
    void setTransitionEffect(const std::string& effect);

    // Properties
    std::string currentEffect;
    bool directionIn; // true for in, false for out

private:
    std::unordered_map<std::string, std::shared_ptr<Shader>> transitionShaders;
    GLuint quadVAO, quadVBO;
    std::vector<float> quadVertices;
};
