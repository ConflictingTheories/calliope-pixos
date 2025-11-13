#include "ModeManager.h"
#include "GLEngine.h"
#include <iostream>

ModeManager::ModeManager(GLEngine* eng) : engine(eng), currentMode(""), currentHandlers(nullptr) {}

ModeManager::~ModeManager() {}

void ModeManager::init() {
    // Register default mode
    registerMode("default", {
        nullptr, // setup
        nullptr, // teardown
        nullptr, // update
        nullptr, // checkInput
        nullptr, // onSelect
        false    // picker
    });
}

void ModeManager::update(double dt) {
    if (currentHandlers && currentHandlers->update) {
        try {
            currentHandlers->update(dt);
        } catch (const std::exception& e) {
            std::cerr << "Mode update failed for mode '" << currentMode << "': " << e.what() << std::endl;
        }
    }
}

bool ModeManager::checkInput(int key, int action, int mods) {
    // TODO: Implement input checking
    return false;
}

bool ModeManager::handleSelect(class Zone* zone, int row, int cell, const std::string& type) {
    if (currentHandlers && currentHandlers->onSelect) {
        try {
            return currentHandlers->onSelect(zone, row, cell, type);
        } catch (const std::exception& e) {
            std::cerr << "Mode onSelect handler failed for mode '" << currentMode << "': " << e.what() << std::endl;
        }
    }
    return false;
}

void ModeManager::registerMode(const std::string& name, const ModeHandlers& handlers) {
    registeredModes[name] = handlers;
}

void ModeManager::unregisterMode(const std::string& name) {
    registeredModes.erase(name);
}

void ModeManager::setMode(const std::string& name) {
    // Teardown previous mode
    if (currentHandlers && currentHandlers->teardown) {
        try {
            currentHandlers->teardown();
        } catch (const std::exception& e) {
            std::cerr << "Mode teardown failed for mode '" << currentMode << "': " << e.what() << std::endl;
        }
    }

    if (registeredModes.find(name) == registeredModes.end()) {
        std::cerr << "Warning: Mode '" << name << "' has not been registered." << std::endl;
        return;
    }

    const auto& handlers = registeredModes[name];
    currentMode = name;
    currentHandlers = const_cast<ModeHandlers*>(&handlers);

    // Setup new mode
    if (currentHandlers->setup) {
        try {
            currentHandlers->setup();
        } catch (const std::exception& e) {
            std::cerr << "Mode setup failed for mode '" << currentMode << "': " << e.what() << std::endl;
        }
    }
}

std::string ModeManager::getCurrentMode() const {
    return currentMode;
}

bool ModeManager::hasPicker() const {
    return currentHandlers && currentHandlers->picker;
}
