#include "Event.h"
#include "World.h"
#include "GLEngine.h"
#include "Hud.h"
#include "RenderManager.h"
#include "Camera.h"
#include <iostream>
#include <chrono>

Event::Event(GLEngine* engine, const std::string& id)
    : type("event"), world(nullptr), callback(nullptr), loaded(false), pausable(false), templateLoaded(false),
      active(false), repeating(false), duration(0.0f), timer(0.0f), engine(engine) {
    this->id = id;
    auto now = std::chrono::system_clock::now();
    time = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
}

Event::Event(const std::string& type, World* world, std::function<void()> callback)
    : type(type), world(world), callback(callback), loaded(false), pausable(false), templateLoaded(false),
      active(false), repeating(false), duration(0.0f), timer(0.0f), engine(nullptr) {
    auto now = std::chrono::system_clock::now();
    time = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
    id = world ? world->id + "-" + type + "-" + std::to_string(time) : type + "-" + std::to_string(time);
}

Event::~Event() {}

void Event::configure(const std::string& type, World* world, const std::string& id, long time, const nlohmann::json& args) {
    this->world = world;
    this->id = id;
    this->type = type;
    this->startTime = time;
    this->creationArgs = args;
}

void Event::onLoad(const nlohmann::json& args) {
    init(); // Assuming init is synchronous for now
    loaded = true;
}

std::string Event::serialize() const {
    nlohmann::json j;
    j["id"] = id;
    j["time"] = startTime;
    j["world"] = world ? world->id : "";
    j["type"] = type;
    j["args"] = creationArgs;
    return j.dump();
}

void Event::onComplete() {
    if (callback) {
        callback();
    }
}

bool Event::tick(double dt) {
    update(dt);
    if (!repeating && !active) return true;
    return false;
}
