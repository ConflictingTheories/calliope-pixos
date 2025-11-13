#include "ModeManager.h"
#include "GLEngine.h"
#include <iostream>

ModeManager::ModeManager(GLEngine* engine)
    : engine(engine), currentMode("default") {
}

ModeManager::~ModeManager() {
}

void ModeManager::setMode(const std::string& mode) {
    if (currentMode != mode) {
        std::cout << "Switching mode from " << currentMode << " to " << mode << std::endl;
        currentMode = mode;
    }
}

void ModeManager::update(float dt) {
    auto it = modeUpdateHandlers.find(currentMode);
    if (it != modeUpdateHandlers.end()) {
        it->second(dt);
    }
}

void ModeManager::registerMode(const std::string& mode, std::function<void(float)> updateHandler) {
    modeUpdateHandlers[mode] = updateHandler;
}
