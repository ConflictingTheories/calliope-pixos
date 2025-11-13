#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <vector>
#include <memory>

class Shader;

struct Particle {
    glm::vec3 position;
    glm::vec3 velocity;
    glm::vec4 color;
    float life;
    float size;
};

class ParticleSystem {
public:
    ParticleSystem();
    ~ParticleSystem();

    void init();
    void update(double dt);
    void render(const glm::mat4& view, const glm::mat4& projection);

    // Particle management
    void emit(const glm::vec3& position, const glm::vec3& velocity, const glm::vec4& color, float life, float size);
    void clear();

    // Properties
    int maxParticles;
    float emissionRate;
    glm::vec3 gravity;
    bool enabled;

private:
    std::vector<Particle> particles;
    std::shared_ptr<Shader> shader;
    GLuint vao, vbo;
    int lastUsedParticle;
};
