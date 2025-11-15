#pragma once

#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>
#include <functional>
#include <nlohmann/json.hpp>

class GLEngine;
class World;

class Event {
public:
    Event(const std::string& type, World* world, std::function<void()> callback = nullptr);
    Event(GLEngine* engine, const std::string& id);
    virtual ~Event();

    virtual void init() {}
    virtual void update(double dt) {}
    virtual void configure(const std::string& type, World* world, const std::string& id, long time, const nlohmann::json& args);
    virtual void onLoad(const nlohmann::json& args);

    std::string serialize() const;

    void onComplete();

    // Properties
    std::string type;
    World* world;
    std::function<void()> callback;
    long time;
    std::string id;
    long startTime;
    nlohmann::json creationArgs;
    bool loaded;
    bool pausable;
    bool templateLoaded;

    // Timing
    bool active;
    bool repeating;
    float duration;
    float timer;

    // Callbacks
    std::function<void()> onTrigger;

    virtual void trigger() {}
    virtual bool tick(double dt);

    GLEngine* engine;
};
