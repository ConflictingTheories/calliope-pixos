#pragma once

#include "Action.h"
#include "Avatar.h"
#include "World.h"
#include "Object.h"
#include <vector>

class InteractAction : public Action {
public:
    InteractAction(GLEngine* engine, Sprite* sprite);
    virtual ~InteractAction();

    void init(const glm::vec3& from, Direction facing, World* world);
    void interact();
    void finish();
    bool tick(double time) override;
    void checkInput(double time) override;

private:
    World* world;
    Zone* zone;
    glm::vec3 from;
    glm::vec3 to;
    glm::vec3 offset;
    Direction facing;
    std::vector<std::shared_ptr<Sprite>> spriteList;
    std::vector<std::shared_ptr<Object>> objectList;
    bool loaded = false;
    double lastKey = 0;
};
