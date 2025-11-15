#include "engine/events/MenuEvent.h"
#include <iostream>
#include <chrono>

MenuEvent::MenuEvent(GLEngine* engine, const std::string& id)
    : Event(engine, id), scrolling(false), completed(false) {
    lastKey = std::chrono::system_clock::now();
}

void MenuEvent::init() {
    // Default init
}

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
        // Similar to ChatEvent
        completed = true; // Placeholder
    }

    // Update menu logic here
    return completed;
}

void MenuEvent::update(double dt) {
    // Update logic
}
