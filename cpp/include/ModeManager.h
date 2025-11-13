#pragma once

#include <unordered_map>
#include <string>
#include <functional>

class GLEngine;

class ModeManager {
private:
    GLEngine* engine;
    std::string currentMode;
    std::unordered_map<std::string, std::function<void(float)>> modeUpdateHandlers;

public:
    ModeManager(GLEngine* engine);
    ~ModeManager();

    void setMode(const std::string& mode);
    std::string getCurrentMode() const { return currentMode; }
    void update(float dt);

    void registerMode(const std::string& mode, std::function<void(float)> updateHandler);
};
