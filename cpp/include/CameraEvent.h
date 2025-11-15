#pragma once

#include "Event.h"
#include <glm/glm.hpp>

class GLEngine;

class CameraEvent : public Event {
public:
    CameraEvent(const std::string& type, World* world, std::function<void()> callback, GLEngine* engine, const glm::vec3& from, const glm::vec3& to, float duration);
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
