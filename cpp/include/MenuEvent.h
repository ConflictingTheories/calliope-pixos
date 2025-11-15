#pragma once

#include "Event.h"
#include <nlohmann/json.hpp>
#include <unordered_map>

class World;

class MenuEvent : public Event {
public:
    MenuEvent(GLEngine* engine, const std::string& id, const nlohmann::json& config, World* world);
    virtual ~MenuEvent();

    void init() override;
    void update(double dt) override;
    void trigger() override;

    nlohmann::json config;
    World* world;
};
