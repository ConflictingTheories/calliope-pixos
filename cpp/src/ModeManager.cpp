#include "ModeManager.h"
#include "World.h"
#include <iostream>

ModeManager::ModeManager(World* world)
    : world(world), currentMode("default") {
}

ModeManager::~ModeManager() {
}

void ModeManager::setMode(const std::string& mode) {
    if (currentMode != mode) {
        std::cout << "Switching mode from " << currentMode << " to " << mode << std::endl;
        currentMode = mode;
    }
}

void ModeManager::update(double time) {
    auto it = modeUpdateHandlers.find(currentMode);
    if (it != modeUpdateHandlers.end()) {
        it->second(time);
    }
}

bool ModeManager::handleInput(double time) {
    auto it = inputHandlers.find(currentMode);
    if (it != inputHandlers.end()) {
        return it->second(time);
    }
    return false;
}

void ModeManager::registerMode(const std::string& mode, std::function<void(double)> updateHandler, std::function<bool(double)> inputHandler) {
    modeUpdateHandlers[mode] = updateHandler;
    if (inputHandler) {
        inputHandlers[mode] = inputHandler;
    }
}
