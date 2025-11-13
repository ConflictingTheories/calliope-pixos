#pragma once
#include <GLFW/glfw3.h>
#include <unordered_map>
#include <string>
#include <functional>
#include <vector>
#include <memory>

class GLEngine;

struct ActionMapping {
    std::string keyboard;
    std::string gamepad;
    std::string mouse;
    std::string touch;
};

struct ModeMappings {
    std::unordered_map<std::string, ActionMapping> actions;
};

class InputManager {
public:
    InputManager(GLEngine* engine);
    ~InputManager();

    void init();
    void update(double dt);

    void handleKey(int key, int scancode, int action, int mods);
    void handleMouse(double xpos, double ypos);
    void handleMouseButton(int button, int action, int mods);
    void handleGamepad();

    void setModeMappings(const std::string& mode, const ModeMappings& mappings);
    void addActionHook(const std::string& action, std::function<void(const std::string&, const std::string&)> callback);
    void registerActionHook(const std::string& action, std::function<void(const std::string&, const std::string&)> hook);
    void removeActionHook(const std::string& action, std::function<void(const std::string&, const std::string&)> callback);

    bool isActionActive(const std::string& action) const;
    bool isActionPressed(const std::string& action) const;
    void setMode(const std::string& mode);
    std::string getMode() const;
    std::string getActionInput(const std::string& action) const;
    void bindAction(const std::string& action, const std::string& inputType, const std::string& inputValue);
    void unbindAction(const std::string& action, const std::string& inputType);

    // Mouse state
    double mouseX, mouseY;
    double mouseDeltaX, mouseDeltaY;

    // Keyboard state
    std::unordered_map<int, bool> keyStates;
    std::unordered_map<int, bool> keyPressed;

    // Gamepad state
    int gamepadCount;
    std::vector<float> gamepadAxes;
    std::vector<unsigned char> gamepadButtons;

private:
    GLEngine* engine;
    std::unordered_map<std::string, ModeMappings> mappings;
    std::string currentMode;
    std::unordered_map<std::string, std::vector<std::function<void(const std::string&, const std::string&)>>> hooks;
    std::unordered_map<std::string, bool> actionStates;
    std::unordered_map<std::string, bool> actionPressed;
    std::unordered_map<std::string, double> lastActionTime;

    void updateActionStates();
    bool checkKeyboard(const std::string& key) const;
    bool checkGamepad(const std::string& button) const;
    bool checkMouse(const std::string& button) const;
    bool checkTouch(const std::string& gesture) const;
};
