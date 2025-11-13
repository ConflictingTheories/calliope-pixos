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
            currentHandlers->update(dt, currentParams);
        } catch (const std::exception& e) {
            std::cerr << "Mode update failed for mode '" << currentMode << "': " << e.what() << std::endl;
        }
    }
}

bool ModeManager::handleInput(double dt) {
    if (currentHandlers && currentHandlers->checkInput) {
        try {
            return currentHandlers->checkInput(dt, currentParams);
        } catch (const std::exception& e) {
            std::cerr << "Mode input handler failed for mode '" << currentMode << "': " << e.what() << std::endl;
        }
    }
    return false;
}

bool ModeManager::handleSelect(std::shared_ptr<void> zone, int row, int cell, const std::string& type) {
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
    registered[name] = handlers;
}

void ModeManager::set(const std::string& name, std::unordered_map<std::string, std::string> params) {
    // Teardown previous mode
    if (currentHandlers && currentHandlers->teardown) {
        try {
            currentHandlers->teardown(currentParams);
        } catch (const std::exception& e) {
            std::cerr << "Mode teardown failed for mode '" << currentMode << "': " << e.what() << std::endl;
        }
    }

    if (registered.find(name) == registered.end()) {
        std::cerr << "Warning: Mode '" << name << "' has not been registered." << std::endl;
        return;
    }

    const auto& handlers = registered[name];
    currentMode = name;
    currentHandlers = const_cast<ModeHandlers*>(&handlers);
    currentParams = params;

    // Setup new mode
    if (currentHandlers->setup) {
        try {
            currentHandlers->setup(currentParams);
        } catch (const std::exception& e) {
            std::cerr << "Mode setup failed for mode '" << currentMode << "': " << e.what() << std::endl;
        }
    }
}

std::string ModeManager::getMode() const {
    return currentMode;
}

bool ModeManager::hasPicker() const {
    return currentHandlers && currentHandlers->picker;
}
