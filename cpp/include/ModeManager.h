#pragma once
#include <unordered_map>
#include <string>
#include <functional>
#include <memory>

class GLEngine;

struct ModeHandlers {
    std::function<void(std::unordered_map<std::string, std::string>)> setup;
    std::function<void(std::unordered_map<std::string, std::string>)> teardown;
    std::function<void(double, std::unordered_map<std::string, std::string>)> update;
    std::function<bool(double, std::unordered_map<std::string, std::string>)> checkInput;
    std::function<bool(std::shared_ptr<void>, int, int, std::string)> onSelect;
    bool picker;
};

class ModeManager {
public:
    ModeManager(GLEngine* engine);
    ~ModeManager();

    void init();
    void update(double dt);
    bool handleInput(double dt);
    bool handleSelect(std::shared_ptr<void> zone, int row, int cell, const std::string& type);

    void registerMode(const std::string& name, const ModeHandlers& handlers);
    void set(const std::string& name, std::unordered_map<std::string, std::string> params = {});
    std::string getMode() const;
    bool hasPicker() const;

private:
    GLEngine* engine;
    std::string currentMode;
    std::unordered_map<std::string, ModeHandlers> registered;
    ModeHandlers* currentHandlers;
    std::unordered_map<std::string, std::string> currentParams;
};
