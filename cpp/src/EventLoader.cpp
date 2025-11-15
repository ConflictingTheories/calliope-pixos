#include "EventLoader.h"
#include "Event.h"
// #include "MenuEvent.h"
#include "GLEngine.h"
#include "World.h"
// #include "CameraEvent.h"
#include <chrono>
#include <glm/glm.hpp>

EventLoader::EventLoader(GLEngine* engine, const std::string& type, const nlohmann::json& args, World* world, std::function<void()> callback)
    : engine(engine), type(type), args(args), world(world), callback(callback) {
    long time = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    std::string id = world->id + "-" + type + "-" + std::to_string(time);
    loadedEvent = load(type,
        [args](std::shared_ptr<Event> event) {
            event->onLoad(args);
        },
        [type, world, id, time, args](std::shared_ptr<Event> event) {
            event->configure(type, world, id, time, args);
        });
}

std::shared_ptr<Event> EventLoader::load(const std::string& type, std::function<void(std::shared_ptr<Event>)> afterLoad, std::function<void(std::shared_ptr<Event>)> runConfigure) {
    if (instances.find(type) == instances.end()) {
        instances[type] = {};
    }
    // New Instance
    std::shared_ptr<Event> instance;
    if (type == "menu") {
        // instance = std::make_shared<MenuEvent>(type, world, callback, args);
        instance = std::make_shared<Event>(type, world, callback);
    } else if (type == "camera") {
        // args should be ["pan", {from, to, duration}]
        if (args.is_array() && args.size() >= 2) {
            std::string action = args[0];
            auto params = args[1];
            if (params.contains("from") && params.contains("to") && params.contains("duration")) {
                glm::vec3 from(params["from"][0], params["from"][1], params["from"][2]);
                glm::vec3 to(params["to"][0], params["to"][1], params["to"][2]);
                float duration = params["duration"];
                // instance = std::make_shared<CameraEvent>(type, world, callback, engine, from, to, duration);
                instance = std::make_shared<Event>(type, world, callback);
            } else {
                instance = std::make_shared<Event>(type, world, callback);
            }
        } else {
            instance = std::make_shared<Event>(type, world, callback);
        }
    } else {
        instance = std::make_shared<Event>(type, world, callback);
    }
    // Assign properties (in JS it's Object.assign from require, here we can set specific properties if needed)
    instance->templateLoaded = true; // Not in base, but for compatibility

    // Notify existing
    for (auto& pair : instances[type]) {
        if (pair.first->afterLoad) pair.first->afterLoad(pair.first);
    }
    // construct
    if (runConfigure) runConfigure(instance);
    // load
    if (afterLoad) {
        if (instance->templateLoaded) afterLoad(instance);
        else instances[type].push_back({instance, afterLoad});
    }

    return instance;
}
