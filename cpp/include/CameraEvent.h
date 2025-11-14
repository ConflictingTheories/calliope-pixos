#pragma once

#include "Event.h"
#include <glm/glm.hpp>

class CameraEvent : public Event {
public:
    CameraEvent(GLEngine* engine, const glm::vec3& from, const glm::vec3& to, float duration);
    virtual ~CameraEvent();

    void init() override;
    void update(double dt) override;
    void trigger() override;

private:
    glm::vec3 start;
    glm::vec3 end;
    float totalDuration;
    float t;
    bool initialized;
};
