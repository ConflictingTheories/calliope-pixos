#pragma once

#include "Action.h"
#include <vector>

class MoveAction : public Action {
public:
    MoveAction(GLEngine* engine, Sprite* sprite);
    virtual ~MoveAction();

    void init(const glm::vec3& from, const glm::vec3& to, double length, Zone* zone) override;
    bool tick(double time) override;
    void onStep();

private:
    Zone* zone;
    glm::vec3 from;
    glm::vec3 to;
    double length;
    std::vector<std::shared_ptr<Sprite>> spriteList;
};
