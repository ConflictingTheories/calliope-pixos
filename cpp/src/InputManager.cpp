#include "InputManager.h"
#include "GLEngine.h"
#include <iostream>
#include <algorithm>

InputManager::InputManager(GLEngine* eng) : engine(eng), currentMode("default"), mouseX(0.0), mouseY(0.0), mouseDeltaX(0.0), mouseDeltaY(0.0), gamepadCount(0) {}

InputManager::~InputManager() {}

void InputManager::init() {
    // Set default mappings
    setModeMappings("default", {
        actions: {
            {"move_up", {"w", "", "", "swipe_up"}},
            {"move_down", {"s", "", "", "swipe_down"}},
            {"move_left", {"a", "", "", "swipe_left"}},
            {"move_right", {"d", "", "", "swipe_right"}},
            {"interact", {"k", "a", "", "tap"}},
            {"select", {"", "", "left", "tap"}},
            {"select_right", {"", "", "right", ""}},
            {"camera_pan_left", {"ArrowLeft", "", "", ""}},
            {"camera_pan_right", {"ArrowRight", "", "", ""}},
            {"camera_pan_up", {"ArrowUp", "", "", ""}},
            {"camera_pan_down", {"ArrowDown", "", "", ""}},
            {"camera_zoom_in", {"q", "", "", ""}},
            {"camera_zoom_out", {"e", "", "", ""}},
            {"camera_rotate_left", {"z", "", "", ""}},
            {"camera_rotate_right", {"x", "", "", ""}},
            {"menu", {"m", "y", "", ""}},
            {"run", {"r", "y", "", ""}},
            {"bind_camera", {"b", "", "", ""}},
            {"fixed_camera", {"c", "", "", ""}},
            {"help", {"h", "", "", ""}},
            {"chat", {" ", "", "", ""}},
            {"clear_speech", {"Escape", "", "", ""}},
            {"patrol", {"p", "", "", ""}},
            {"dance", {"u", "", "", ""}},
            {"height_up", {"y", "", "", ""}},
            {"height_down", {"f", "", "", ""}}
        }
    });

    // Initialize gamepad
    gamepadCount = glfwJoystickPresent(GLFW_JOYSTICK_1) ? 1 : 0;
    if (gamepadCount > 0) {
        gamepadAxes.resize(6, 0.0f);
        gamepadButtons.resize(14, 0);
    }
}

void InputManager::update(double dt) {
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
    keyPressed[key] = pressed && !keyPressed[key];
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

void InputManager::setModeMappings(const std::string& mode, const ModeMappings& mappings) {
    this->mappings[mode] = mappings;
}

void InputManager::addActionHook(const std::string& action, std::function<void(const std::string&, const std::string&)> callback) {
    hooks[action].push_back(callback);
}

void InputManager::registerActionHook(const std::string& action, std::function<void(const std::string&, const std::string&)> hook) {
    addActionHook(action, hook);
}

void InputManager::removeActionHook(const std::string& action, std::function<void(const std::string&, const std::string&)> callback) {
    auto& actionHooks = hooks[action];
    actionHooks.erase(std::remove_if(actionHooks.begin(), actionHooks.end(),
        [&](const std::function<void(const std::string&, const std::string&)>& f) {
            return f.target<void(const std::string&, const std::string&)>() == callback.target<void(const std::string&, const std::string&)>();
        }), actionHooks.end());
}

void InputManager::updateActionStates() {
    const auto& modeMappings = mappings[currentMode];
    const auto& actions = modeMappings.actions;

    for (const auto& [action, mapping] : actions) {
        bool active = false;

        if (!mapping.keyboard.empty() && checkKeyboard(mapping.keyboard)) {
            active = true;
        }
        if (!mapping.gamepad.empty() && checkGamepad(mapping.gamepad)) {
            active = true;
        }
        if (!mapping.mouse.empty() && checkMouse(mapping.mouse)) {
            active = true;
        }
        if (!mapping.touch.empty() && checkTouch(mapping.touch)) {
            active = true;
        }

        bool wasActive = actionStates[action];
        actionStates[action] = active;
        actionPressed[action] = active && !wasActive;

        if (active && !wasActive) {
            lastActionTime[action] = glfwGetTime();
            for (const auto& hook : hooks[action]) {
                hook(action, currentMode);
            }
        }
    }
}

bool InputManager::isActionActive(const std::string& action) const {
    auto it = actionStates.find(action);
    return it != actionStates.end() && it->second;
}

bool InputManager::isActionPressed(const std::string& action) const {
    auto it = actionPressed.find(action);
    return it != actionPressed.end() && it->second;
}

void InputManager::setMode(const std::string& mode) {
    if (mappings.find(mode) != mappings.end() || mode == "default") {
        currentMode = mode;
        if (engine->modeManager) {
            engine->modeManager->set(mode);
        }
    } else {
        std::cout << "Input mode '" << mode << "' not found, staying in '" << currentMode << "'" << std::endl;
    }
}

std::string InputManager::getMode() const {
    return currentMode;
}

std::string InputManager::getActionInput(const std::string& action) const {
    const auto& modeMappings = mappings.at(currentMode);
    const auto& mapping = modeMappings.actions.at(action);

    if (!mapping.keyboard.empty() && checkKeyboard(mapping.keyboard)) {
        return "keyboard:" + mapping.keyboard;
    }
    if (!mapping.gamepad.empty() && checkGamepad(mapping.gamepad)) {
        return "gamepad:" + mapping.gamepad;
    }
    if (!mapping.mouse.empty() && checkMouse(mapping.mouse)) {
        return "mouse:" + mapping.mouse;
    }
    if (!mapping.touch.empty() && checkTouch(mapping.touch)) {
        return "touch:" + mapping.touch;
    }
    return "";
}

void InputManager::bindAction(const std::string& action, const std::string& inputType, const std::string& inputValue) {
    if (mappings[currentMode].actions.find(action) == mappings[currentMode].actions.end()) {
        mappings[currentMode].actions[action] = {"", "", "", ""};
    }
    if (inputType == "keyboard") {
        mappings[currentMode].actions[action].keyboard = inputValue;
    } else if (inputType == "gamepad") {
        mappings[currentMode].actions[action].gamepad = inputValue;
    } else if (inputType == "mouse") {
        mappings[currentMode].actions[action].mouse = inputValue;
    } else if (inputType == "touch") {
        mappings[currentMode].actions[action].touch = inputValue;
    }
}

void InputManager::unbindAction(const std::string& action, const std::string& inputType) {
    if (mappings[currentMode].actions.find(action) != mappings[currentMode].actions.end()) {
        if (inputType == "keyboard") {
            mappings[currentMode].actions[action].keyboard = "";
        } else if (inputType == "gamepad") {
            mappings[currentMode].actions[action].gamepad = "";
        } else if (inputType == "mouse") {
            mappings[currentMode].actions[action].mouse = "";
        } else if (inputType == "touch") {
            mappings[currentMode].actions[action].touch = "";
        }
    }
}

bool InputManager::checkKeyboard(const std::string& key) const {
    int glfwKey = GLFW_KEY_UNKNOWN;
    if (key == "w") glfwKey = GLFW_KEY_W;
    else if (key == "s") glfwKey = GLFW_KEY_S;
    else if (key == "a") glfwKey = GLFW_KEY_A;
    else if (key == "d") glfwKey = GLFW_KEY_D;
    else if (key == "q") glfwKey = GLFW_KEY_Q;
    else if (key == "e") glfwKey = GLFW_KEY_E;
    else if (key == "r") glfwKey = GLFW_KEY_R;
    else if (key == "m") glfwKey = GLFW_KEY_M;
    else if (key == "h") glfwKey = GLFW_KEY_H;
    else if (key == "b") glfwKey = GLFW_KEY_B;
    else if (key == "c") glfwKey = GLFW_KEY_C;
    else if (key == "p") glfwKey = GLFW_KEY_P;
    else if (key == "u") glfwKey = GLFW_KEY_U;
    else if (key == "y") glfwKey = GLFW_KEY_Y;
    else if (key == "f") glfwKey = GLFW_KEY_F;
    else if (key == "k") glfwKey = GLFW_KEY_K;
    else if (key == "z") glfwKey = GLFW_KEY_Z;
    else if (key == "x") glfwKey = GLFW_KEY_X;
    else if (key == " ") glfwKey = GLFW_KEY_SPACE;
    else if (key == "Escape") glfwKey = GLFW_KEY_ESCAPE;
    else if (key == "ArrowLeft") glfwKey = GLFW_KEY_LEFT;
    else if (key == "ArrowRight") glfwKey = GLFW_KEY_RIGHT;
    else if (key == "ArrowUp") glfwKey = GLFW_KEY_UP;
    else if (key == "ArrowDown") glfwKey = GLFW_KEY_DOWN;

    auto it = keyStates.find(glfwKey);
    return it != keyStates.end() && it->second;
}

bool InputManager::checkGamepad(const std::string& button) const {
    if (gamepadButtons.empty()) return false;

    int buttonIndex = -1;
    if (button == "a") buttonIndex = 0;
    else if (button == "b") buttonIndex = 1;
    else if (button == "x") buttonIndex = 2;
    else if (button == "y") buttonIndex = 3;
    else if (button == "left") buttonIndex = 4;
    else if (button == "right") buttonIndex = 5;
    else if (button == "up") buttonIndex = 6;
    else if (button == "down") buttonIndex = 7;
    else if (button == "start") buttonIndex = 8;
    else if (button == "select") buttonIndex = 9;

    if (buttonIndex >= 0 && buttonIndex < gamepadButtons.size()) {
        return gamepadButtons[buttonIndex] == GLFW_PRESS;
    }

    // Check axes for directional inputs
    if (button == "up" && gamepadAxes.size() > 1) return gamepadAxes[1] < -0.5f;
    if (button == "down" && gamepadAxes.size() > 1) return gamepadAxes[1] > 0.5f;
    if (button == "left" && gamepadAxes.size() > 0) return gamepadAxes[0] < -0.5f;
    if (button == "right" && gamepadAxes.size() > 0) return gamepadAxes[0] > 0.5f;

    return false;
}

bool InputManager::checkMouse(const std::string& button) const {
    // TODO: Implement mouse button checking
    return false;
}

bool InputManager::checkTouch(const std::string& gesture) const {
    // TODO: Implement touch gesture checking
    return false;
}
