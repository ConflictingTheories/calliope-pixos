#include "MenuEvent.h"
#include "GLEngine.h"
#include "World.h"
#include "Avatar.h"
#include <iostream>

MenuEvent::MenuEvent(GLEngine* engine, const std::string& id, const nlohmann::json& config, World* world)
    : Event(engine, id), config(config), world(world) {
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
    if (onComplete) onComplete();
}
