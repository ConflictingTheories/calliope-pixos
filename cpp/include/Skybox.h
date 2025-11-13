#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>

class Shader;

class Skybox {
public:
    Skybox();
    ~Skybox();

    void init();
    void loadCubemap(const std::vector<std::string>& faces);
    void render(const glm::mat4& view, const glm::mat4& projection);

    // Properties
    bool loaded;
    GLuint textureId;
    GLuint vao, vbo;

private:
    std::shared_ptr<Shader> shader;
    std::vector<float> vertices;
};
