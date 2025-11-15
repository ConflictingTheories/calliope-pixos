#include "MenuEvent.h"
#include "GLEngine.h"
#include "World.h"
#include "Avatar.h"
#include <iostream>

MenuEvent::MenuEvent(const std::string& type, World* world, std::function<void()> callback, const nlohmann::json& config)
    : Event(type, world, callback), config(config) {
    active = true;
    repeating = false;
    duration = 0.0f;
}

MenuEvent::~MenuEvent() {}

void MenuEvent::init() {
    // immediate trigger
    trigger();
}

void MenuEvent::update(double dt) {
    // one-off event: do nothing
}

void MenuEvent::trigger() {
    if (!world) return;
    try {
        // Convert config to map<string,string> for Avatar::openMenu
        std::unordered_map<std::string, std::string> cfg;
        if (config.is_object()) {
            for (auto it = config.begin(); it != config.end(); ++it) {
                if (it.value().is_string()) cfg[it.key()] = it.value().get<std::string>();
                else cfg[it.key()] = it.value().dump();
            }
        }
        auto avatar = world->getAvatar();
        if (avatar) {
            avatar->openMenu(cfg, {"start"});
        } else {
            world->runScripts("menu_open", {});
        }
    } catch (const std::exception& e) {
        std::cerr << "MenuEvent.trigger threw: " << e.what() << std::endl;
    }
    // mark complete
    active = false;
    onComplete();
}
