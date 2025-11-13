#pragma once

#include <memory>
#include <unordered_map>
#include <string>
#include <functional>

class GLEngine;

struct ModeHandlers {
    std::function<void()> setup;
    std::function<void()> teardown;
    std::function<void(double)> update;
    std::function<bool(int, int, int, const std::string&)> checkInput;
    std::function<bool(class Zone*, int, int, const std::string&)> onSelect;
    bool picker = false;
};

class ModeManager {
public:
    ModeManager(GLEngine* engine);
    ~ModeManager();

    void init();
    void update(double dt);

    // Mode registration
    void registerMode(const std::string& name, const ModeHandlers& handlers);
    void unregisterMode(const std::string& name);

    // Mode switching
    void setMode(const std::string& name);
    std::string getCurrentMode() const;

    // Input and selection handling
    bool checkInput(int key, int action, int mods);
    bool handleSelect(class Zone* zone, int row, int cell, const std::string& type);

    // Picker mode
    bool hasPicker() const;

    GLEngine* engine;

private:
    std::string currentMode;
    std::unordered_map<std::string, ModeHandlers> registeredModes;
    ModeHandlers* currentHandlers;
    std::unordered_map<std::string, std::string> currentParams;
};
