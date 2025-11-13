#pragma once

#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>
#include <functional>
#include <nlohmann/json.hpp>

class GLEngine;
class Zone;

class Event {
public:
    Event(GLEngine* engine, const std::string& id);
    virtual ~Event();

    virtual void init();
    virtual void update(double dt);
    virtual void trigger();

    // Timing
    bool tick(double dt);
    void reset();

    // Properties
    std::string id;
    int objId;
    bool active;
    bool repeating;
    float duration;
    float timer;

    // Callbacks
    std::function<void()> onTrigger;
    std::function<void()> onComplete;

    GLEngine* engine;

protected:
    float elapsedTime;
};
