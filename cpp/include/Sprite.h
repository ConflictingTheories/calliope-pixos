#pragma once
#include <glm/glm.hpp>
#include <string>
#include <memory>

class Zone;

class Sprite {
public:
    Sprite();
    virtual ~Sprite();

    virtual void init();
    virtual void update(double dt);
    virtual void render();

    // Properties
    std::string id;
    glm::vec3 pos;
    glm::vec3 scale;
    float facing;
    bool walkable;
    bool blocking;
    bool override;

    // Zone reference
    std::weak_ptr<Zone> zone;
};
