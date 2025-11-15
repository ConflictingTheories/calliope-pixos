#pragma once

#include "Event.h"
#include <nlohmann/json.hpp>
#include <unordered_map>

class World;

class MenuEvent : public Event {
public:
    MenuEvent(const std::string& type, World* world, std::function<void()> callback, const nlohmann::json& config);
    virtual ~MenuEvent();

    void init() override;
    void update(double dt) override;
    void trigger() override;

    nlohmann::json config;
};
