#pragma once

#include <unordered_map>
#include <string>
#include <functional>

class World;

class ModeManager {
private:
    World* world;
    std::string currentMode;
    std::unordered_map<std::string, std::function<void(double)>> modeUpdateHandlers;
    std::unordered_map<std::string, std::function<bool(double)>> inputHandlers;

public:
    ModeManager(World* world);
    ~ModeManager();

    void setMode(const std::string& mode);
    std::string getCurrentMode() const { return currentMode; }
    void update(double time);
    bool handleInput(double time);

    void registerMode(const std::string& mode, std::function<void(double)> updateHandler, std::function<bool(double)> inputHandler = nullptr);
};
