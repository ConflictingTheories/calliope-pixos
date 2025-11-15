#pragma once

#include <memory>
#include <string>
#include <unordered_map>
#include <vector>
#include <functional>
#include <nlohmann/json.hpp>

class GLEngine;
class World;
class Event;

class EventLoader {
public:
    EventLoader(GLEngine* engine, const std::string& type, const nlohmann::json& args, World* world, std::function<void()> callback = nullptr);

    std::shared_ptr<Event> getEvent() const { return loadedEvent; }

    std::shared_ptr<Event> load(const std::string& type, std::function<void(std::shared_ptr<Event>)> afterLoad = nullptr, std::function<void(std::shared_ptr<Event>)> runConfigure = nullptr);

private:
    GLEngine* engine;
    std::string type;
    nlohmann::json args;
    World* world;
    std::function<void()> callback;
    std::unordered_map<std::string, std::vector<std::pair<std::shared_ptr<Event>, std::function<void(std::shared_ptr<Event>)>>>> instances;
    std::vector<nlohmann::json> definitions;
    std::unordered_map<std::string, nlohmann::json> assets;
    std::shared_ptr<Event> loadedEvent;
};
