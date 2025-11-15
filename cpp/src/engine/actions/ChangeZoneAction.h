#pragma once

#include "Action.h"
#include <string>
#include <glm/glm.hpp>

class ChangeZoneAction : public Action {
public:
    ChangeZoneAction(GLEngine* engine, Sprite* sprite);
    virtual ~ChangeZoneAction();

    void init(const std::string& fromZoneId, const glm::vec3& from, const std::string& toZoneId, const glm::vec3& to, double length);
    bool tick(double time);

private:
    // stored data
    std::string fromZoneId;
    std::string toZoneId;
    glm::vec3 from;
    glm::vec3 to;
    double length = 0;
    std::shared_ptr<Zone> fromZone;
    std::shared_ptr<Zone> toZone;
    double startTime;
    bool loaded;
};
