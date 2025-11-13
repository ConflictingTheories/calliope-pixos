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

enum class InputAction {
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
    void bindAction(InputAction action, InputType type, int key);
    void unbindAction(InputAction action, InputType type);
    bool isActionPressed(InputAction action) const;
    bool isActionJustPressed(InputAction action) const;

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
    void addActionHook(InputAction action, std::function<void()> hook);
    void removeActionHook(InputAction action);

    GLEngine* engine;

private:
    GLFWwindow* window;
    std::string currentMode;

    // Mouse states
    double mouseX, mouseY;
    double mouseDeltaX, mouseDeltaY;
    int gamepadCount;
    std::vector<float> gamepadAxes;
    std::vector<unsigned char> gamepadButtons;

    // Key states
    std::unordered_map<int, bool> keyStates;
    std::unordered_map<int, bool> keyStatesPrev;
    std::unordered_map<int, bool> keyPressed;

    // Mouse states
    glm::vec2 mousePosition;
    glm::vec2 mousePositionPrev;
    std::unordered_map<int, bool> mouseButtonStates;
    std::unordered_map<int, bool> mouseButtonStatesPrev;

    // Action mappings
    std::unordered_map<std::string, std::unordered_map<InputAction, ActionMapping>> modeMappings;

    // Action states
    std::unordered_map<InputAction, bool> actionStates;
    std::unordered_map<InputAction, bool> actionStatesPrev;

    // Hooks
    std::unordered_map<InputAction, std::vector<std::function<void()>>> actionHooks;

    void updateActionStates();
    void processActionHooks();
    void handleGamepad();
};
