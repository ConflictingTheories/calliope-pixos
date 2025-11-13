#pragma once

#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <memory>
#include <unordered_map>
#include <string>
#include <vector>

class GLEngine;

enum class InputType {
    Keyboard,
    Mouse,
    Gamepad
};

enum class Action {
    MoveUp,
    MoveDown,
    MoveLeft,
    MoveRight,
    Interact,
    Menu,
    CameraZoomIn,
    CameraZoomOut,
    CameraPanUp,
    CameraPanDown,
    CameraPanLeft,
    CameraPanRight,
    CameraBind,
    CameraUnbind,
    Dance,
    Patrol,
    ChangeZone,
    FaceDirection,
    Dialogue,
    Script,
    Prompt
};

struct ActionMapping {
    InputType type;
    int key; // GLFW key code or button
    std::string description;
};

class InputManager {
public:
    InputManager(GLEngine* engine);
    ~InputManager();

    void init();
    void update(double dt);

    // Input handling
    void handleKey(int key, int scancode, int action, int mods);
    void handleMouse(double xpos, double ypos);
    void handleMouseButton(int button, int action, int mods);
    void handleScroll(double xoffset, double yoffset);

    // Action mapping
    void bindAction(Action action, InputType type, int key);
    void unbindAction(Action action, InputType type);
    bool isActionPressed(Action action) const;
    bool isActionJustPressed(Action action) const;

    // Mouse
    glm::vec2 getMousePosition() const;
    glm::vec2 getMouseDelta() const;
    bool isMouseButtonPressed(int button) const;

    // Keyboard
    bool isKeyPressed(int key) const;
    bool isKeyJustPressed(int key) const;

    // Gamepad (if supported)
    bool isGamepadConnected() const;
    glm::vec2 getLeftStick() const;
    glm::vec2 getRightStick() const;
    float getLeftTrigger() const;
    float getRightTrigger() const;

    // Mode-specific mappings
    void setMode(const std::string& mode);
    std::string getCurrentMode() const;

    // Hooks for scripting
    void addActionHook(Action action, std::function<void()> hook);
    void removeActionHook(Action action);

    GLEngine* engine;

private:
    GLFWwindow* window;
    std::string currentMode;

    // Key states
    std::unordered_map<int, bool> keyStates;
    std::unordered_map<int, bool> keyStatesPrev;

    // Mouse states
    glm::vec2 mousePosition;
    glm::vec2 mousePositionPrev;
    std::unordered_map<int, bool> mouseButtonStates;
    std::unordered_map<int, bool> mouseButtonStatesPrev;

    // Action mappings
    std::unordered_map<std::string, std::unordered_map<Action, ActionMapping>> modeMappings;

    // Action states
    std::unordered_map<Action, bool> actionStates;
    std::unordered_map<Action, bool> actionStatesPrev;

    // Hooks
    std::unordered_map<Action, std::vector<std::function<void()>>> actionHooks;

    void updateActionStates();
    void processActionHooks();
};
