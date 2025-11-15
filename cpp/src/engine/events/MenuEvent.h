#pragma once

#include "Event.h"
#include <string>
#include <vector>
#include <unordered_map>
#include <chrono>

struct MenuSection {
    std::string title;
    std::vector<std::string> items;
};

using Menu = std::unordered_map<std::string, MenuSection>;

class MenuEvent : public Event {
public:
    Menu menuDict;
    std::vector<std::string> activeMenus;
    bool scrolling;
    EventOptions options;
    bool completed;
    std::chrono::system_clock::time_point lastKey;

    MenuEvent(GLEngine* engine, const std::string& id);
    void init() override;
    void init(const Menu& menu, const std::vector<std::string>& activeMenus, bool scrolling, const EventOptions& options);
    bool tick(double time) override;
    void update(double dt) override;
};
