#pragma once

#include <glm/glm.hpp>

enum class LightType {
    Directional,
    Point,
    Spot
};

class Light {
public:
    Light(LightType type = LightType::Point);
    ~Light();

    void init();

    // Properties
    LightType type;
    glm::vec3 position;
    glm::vec3 direction;
    glm::vec3 color;
    float intensity;
    float range;
    float attenuation;
    float scatteringCoefficient;
    float density;

    bool enabled;
};
