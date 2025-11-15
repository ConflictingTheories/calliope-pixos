#pragma once

#include <unordered_map>
#include <string>
#include <vector>
#include <functional>
#include <nlohmann/json.hpp>

class GLEngine;

enum class InputAction {
    MoveUp,
    MoveDown,
    MoveLeft,
    MoveRight,
    Interact,
    Dance,
    Select,
    SelectRight,
    CameraPanLeft,
    CameraPanRight,
    CameraPanUp,
    CameraPanDown,
    CameraZoomIn,
    CameraZoomOut,
    CameraRotateLeft,
    CameraRotateRight,
    Menu,
    Run,
    BindCamera,
    FixedCamera,
    Help,
    Chat,
    ClearSpeech,
    Patrol,
    DanceAction,
    HeightUp,
    HeightDown,
};

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
private:
    GLEngine* engine;
    std::unordered_map<std::string, ModeMappings> mappings;
    std::unordered_map<std::string, std::vector<std::function<void(const std::string&, const std::string&)>>> hooks;
    std::string currentMode;
    std::unordered_map<std::string, bool> actionStates;
    std::unordered_map<std::string, double> lastActionTime;
    std::unordered_map<std::string, bool> actionPressed;

    // Keyboard state
    std::unordered_map<std::string, bool> keyPressed;
    std::unordered_map<std::string, bool> keyReleased;
    std::unordered_map<std::string, bool> keyHeld;

    // Mouse state
    double mouseX, mouseY;
    bool mouseLeftPressed, mouseRightPressed;

    // Touch state (simplified)
    bool touchActive;
    double touchX, touchY;

    // Gamepad state (simplified)
    int gamepadId;
    std::unordered_map<std::string, float> gamepadAxes;
    std::unordered_map<std::string, bool> gamepadButtons;

public:
    InputManager(GLEngine* engine);
    ~InputManager();

    void init();
    void update(double timestamp);
    bool handleInput(double timestamp);
    void setMode(const std::string& mode);
    std::string getMode() const { return currentMode; }
    void setModeMappings(const std::string& mode, const ModeMappings& mappings);
    void addActionHook(const std::string& action, std::function<void(const std::string&, const std::string&)> callback);
    void registerActionHook(const std::string& action, std::function<void(const std::string&, const std::string&)> hook);
    void removeActionHook(const std::string& action, const std::function<void(const std::string&, const std::string&)>& callback);
    bool isActionActive(const std::string& action) const;
    bool isActionPressed(const std::string& action) const;
    bool isKeyHeld(const std::string& key) const;
    std::string getActionInput(const std::string& action) const;

    // Gamepad rendering (for mobile)
    void renderGamepad();

    // Getters
    double getMouseX() const { return mouseX; }
    double getMouseY() const { return mouseY; }
    double getTouchX() const { return touchX; }
    double getTouchY() const { return touchY; }

    // Additional methods for World.cpp
    std::unordered_map<std::string, int> checkInput();
    bool isKeyPressed(const std::string& key) const;

private:
    void handleKeyboard();
    void handleMouse();
    void handleTouch();
    void handleGamepad();
    bool checkKeyboard(const std::string& key) const;
    bool checkGamepad(const std::string& button) const;
    bool checkMouse(const std::string& button) const;
    bool checkTouch(const std::string& gesture) const;
};
