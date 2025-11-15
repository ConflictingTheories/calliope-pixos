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

// ChatEvent Implementation
void ChatEvent::init(const std::string& prompt, bool scrolling, const EventOptions& options) {
    this->engine = world->getEngine();
    this->text = "";
    this->prompt = prompt;
    this->scrolling = scrolling;
    this->line = 0;
    this->options = options;
    this->completed = false;
    this->lastKey = std::chrono::system_clock::now();
}

bool ChatEvent::tick(double time) {
    if (!loaded) return false;

    if (options.autoclose) {
        if (!endTime) {
            endTime = time + 10000; // Default to 10 seconds
        }
        if (time > endTime) {
            completed = true;
        }
    }

    checkInput(time);
    engine->getHud()->scrollText(prompt + text, scrolling, options);
    return completed;
}

void ChatEvent::checkInput(double time) {
    if (time > lastKey + 200) {
        lastKey = time;
        // Handle input logic here
    }
}

// MenuEvent Implementation
void MenuEvent::init(const Menu& menu, const std::vector<std::string>& activeMenus, bool scrolling, const EventOptions& options) {
    this->engine = world->getEngine();
    this->menuDict = menu;
    this->activeMenus = activeMenus;
    this->scrolling = scrolling;
    this->options = options;
    this->completed = false;
    this->lastKey = std::chrono::system_clock::now();
}

bool MenuEvent::tick(double time) {
    if (!loaded) return false;

    if (options.autoclose) {
        if (!endTime) {
            endTime = time + 10000; // Default to 10 seconds
        }
        if (time > endTime) {
            completed = true;
        }
    }

    // Update menu logic here
    return completed;
}

// CameraEvent Implementation
void CameraEvent::init(const std::string& cameraAction, const CameraEventOptions& options) {
    this->engine = world->getEngine();
    this->cameraAction = cameraAction;
    this->options = options;
    this->completed = false;
    this->startTime = std::chrono::system_clock::now();
}

bool CameraEvent::tick(double time) {
    if (!loaded) return false;

    auto camera = engine->getRenderManager()->getCamera();
    double progress = 0.0;
    if (options.duration) {
        progress = (time - startTime) / (options.duration * 1000);
        if (progress >= 1.0) {
            completed = true;
        }
    }

    // Update camera logic here
    return completed;
}
