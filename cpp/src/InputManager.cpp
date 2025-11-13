#include "InputManager.h"
#include "GLEngine.h"
#include <iostream>
#include <algorithm>

InputManager::InputManager(GLEngine* eng) : engine(eng), currentMode("default"), mouseX(0.0), mouseY(0.0), mouseDeltaX(0.0), mouseDeltaY(0.0), gamepadCount(0) {}

InputManager::~InputManager() {}

void InputManager::init() {
    // Initialize gamepad
    gamepadCount = glfwJoystickPresent(GLFW_JOYSTICK_1) ? 1 : 0;
    if (gamepadCount > 0) {
        gamepadAxes.resize(6, 0.0f);
        gamepadButtons.resize(14, 0);
    }
}

void InputManager::update(double dt) {
    // Update previous states
    keyStatesPrev = keyStates;

    // Update mouse delta
    double newMouseX, newMouseY;
    glfwGetCursorPos(engine->window, &newMouseX, &newMouseY);
    mouseDeltaX = newMouseX - mouseX;
    mouseDeltaY = newMouseY - mouseY;
    mouseX = newMouseX;
    mouseY = newMouseY;

    // Update gamepad
    handleGamepad();

    // Update action states
    updateActionStates();
}

void InputManager::handleKey(int key, int scancode, int action, int mods) {
    bool pressed = (action == GLFW_PRESS);
    keyStates[key] = pressed;
    keyPressed[key] = pressed && !keyStatesPrev[key];
}

void InputManager::handleMouse(double xpos, double ypos) {
    mouseX = xpos;
    mouseY = ypos;
}

void InputManager::handleMouseButton(int button, int action, int mods) {
    // TODO: Implement mouse button handling
}

void InputManager::handleGamepad() {
    if (gamepadCount > 0) {
        int axesCount, buttonCount;
        const float* axes = glfwGetJoystickAxes(GLFW_JOYSTICK_1, &axesCount);
        const unsigned char* buttons = glfwGetJoystickButtons(GLFW_JOYSTICK_1, &buttonCount);

        if (axes) {
            gamepadAxes.assign(axes, axes + std::min(axesCount, 6));
        }
        if (buttons) {
            gamepadButtons.assign(buttons, buttons + std::min(buttonCount, 14));
        }
    }
}

void InputManager::updateActionStates() {
    // TODO: Implement action state updates
}

void InputManager::processActionHooks() {
    // TODO: Implement action hooks
}

// Stub implementations for missing methods
bool InputManager::isKeyJustPressed(int key) const {
    auto it = keyPressed.find(key);
    return it != keyPressed.end() && it->second;
}

glm::vec2 InputManager::getMousePosition() const {
    return glm::vec2(mouseX, mouseY);
}

glm::vec2 InputManager::getMouseDelta() const {
    return glm::vec2(mouseDeltaX, mouseDeltaY);
}

bool InputManager::isMouseButtonPressed(int button) const {
    auto it = mouseButtonStates.find(button);
    return it != mouseButtonStates.end() && it->second;
}

bool InputManager::isGamepadConnected() const {
    return gamepadCount > 0;
}

glm::vec2 InputManager::getLeftStick() const {
    if (gamepadAxes.size() >= 2) {
        return glm::vec2(gamepadAxes[0], gamepadAxes[1]);
    }
    return glm::vec2(0.0f);
}

glm::vec2 InputManager::getRightStick() const {
    if (gamepadAxes.size() >= 4) {
        return glm::vec2(gamepadAxes[2], gamepadAxes[3]);
    }
    return glm::vec2(0.0f);
}

float InputManager::getLeftTrigger() const {
    if (gamepadAxes.size() >= 5) {
        return gamepadAxes[4];
    }
    return 0.0f;
}

float InputManager::getRightTrigger() const {
    if (gamepadAxes.size() >= 6) {
        return gamepadAxes[5];
    }
    return 0.0f;
}

void InputManager::setMode(const std::string& mode) {
    currentMode = mode;
}

std::string InputManager::getCurrentMode() const {
    return currentMode;
}

void InputManager::bindAction(InputAction action, InputType type, int key) {
    // TODO: Implement
}

void InputManager::unbindAction(InputAction action, InputType type) {
    // TODO: Implement
}

bool InputManager::isActionPressed(InputAction action) const {
    // TODO: Implement
    return false;
}

bool InputManager::isActionJustPressed(InputAction action) const {
    // TODO: Implement
    return false;
}

void InputManager::addActionHook(InputAction action, std::function<void()> hook) {
    // TODO: Implement
}

void InputManager::removeActionHook(InputAction action) {
    // TODO: Implement
}
