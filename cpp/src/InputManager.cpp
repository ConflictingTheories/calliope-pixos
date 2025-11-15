#include "InputManager.h"
#include "GLEngine.h"
#include <GLFW/glfw3.h>
#include <iostream>
#include <algorithm>

InputManager::InputManager(GLEngine* engine)
    : engine(engine), currentMode("default"), mouseX(0), mouseY(0), mouseLeftPressed(false), mouseRightPressed(false),
      touchActive(false), touchX(0), touchY(0), gamepadId(-1) {
    // Initialize default mappings
    setModeMappings("default", {
        .actions = {
            {"move_up", {"w", "up", "", "swipe_up"}},
            {"move_down", {"s", "down", "", "swipe_down"}},
            {"move_left", {"a", "left", "", "swipe_left"}},
            {"move_right", {"d", "right", "", "swipe_right"}},
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
            {"height_down", {"f", "", "", ""}},
        }
    });
}

InputManager::~InputManager() {
    // Cleanup if needed
}

void InputManager::init() {
    // GLFW callbacks are set in GLEngine
}

void InputManager::update(double timestamp) {
    handleKeyboard();
    handleMouse();
    handleTouch();
    handleGamepad();

    const ModeMappings& modeMappings = mappings[currentMode];
    const auto& actions = modeMappings.actions;

    // Update action states
    for (const auto& pair : actions) {
        const std::string& action = pair.first;
        const ActionMapping& mapping = pair.second;
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

        // Trigger hooks for single-press events (rising edge)
        if (active && !wasActive) {
            lastActionTime[action] = timestamp;
            if (hooks.count(action)) {
                for (const auto& hook : hooks[action]) {
                    hook(action, currentMode);
                }
            }
        }
    }
}

bool InputManager::handleInput(double timestamp) {
    // TODO: Implement mode-specific input handling
    // For now, return false to allow default update
    return false;
}

void InputManager::setMode(const std::string& mode) {
    if (mappings.count(mode) || mode == "default") {
        currentMode = mode;
        // TODO: Notify mode manager
    } else {
        std::cerr << "Input mode \"" << mode << "\" not found, staying in \"" << currentMode << "\"" << std::endl;
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

void InputManager::removeActionHook(const std::string& action, const std::function<void(const std::string&, const std::string&)>& callback) {
    auto& vec = hooks[action];
    // Use a lambda to find the callback by comparing targets
    auto it = std::find_if(vec.begin(), vec.end(), [&](const std::function<void(const std::string&, const std::string&)>& f) {
        return f.target<void(const std::string&, const std::string&)>() == callback.target<void(const std::string&, const std::string&)>();
    });
    if (it != vec.end()) {
        vec.erase(it);
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

void InputManager::renderGamepad() {
    // TODO: Implement gamepad rendering for mobile
}

void InputManager::handleKeyboard() {
    GLFWwindow* window = engine->getWindow();

    // Clear previous state
    keyPressed.clear();
    keyReleased.clear();

    // Check common keys
    std::vector<std::pair<std::string, int>> keys = {
        {"w", GLFW_KEY_W}, {"a", GLFW_KEY_A}, {"s", GLFW_KEY_S}, {"d", GLFW_KEY_D},
        {"k", GLFW_KEY_K}, {"ArrowLeft", GLFW_KEY_LEFT}, {"ArrowRight", GLFW_KEY_RIGHT},
        {"ArrowUp", GLFW_KEY_UP}, {"ArrowDown", GLFW_KEY_DOWN}, {"q", GLFW_KEY_Q},
        {"e", GLFW_KEY_E}, {"z", GLFW_KEY_Z}, {"x", GLFW_KEY_X}, {"m", GLFW_KEY_M},
        {"r", GLFW_KEY_R}, {"b", GLFW_KEY_B}, {"c", GLFW_KEY_C}, {"h", GLFW_KEY_H},
        {" ", GLFW_KEY_SPACE}, {"Escape", GLFW_KEY_ESCAPE}, {"p", GLFW_KEY_P},
        {"u", GLFW_KEY_U}, {"y", GLFW_KEY_Y}, {"f", GLFW_KEY_F}
    };

    for (const auto& key : keys) {
        int state = glfwGetKey(window, key.second);
        if (state == GLFW_PRESS) {
            keyPressed[key.first] = true;
            keyHeld[key.first] = true;
        } else if (state == GLFW_RELEASE) {
            keyReleased[key.first] = true;
            keyHeld[key.first] = false;
        }
    }
}

void InputManager::handleMouse() {
    GLFWwindow* window = engine->getWindow();
    glfwGetCursorPos(window, &mouseX, &mouseY);

    mouseLeftPressed = glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS;
    mouseRightPressed = glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_RIGHT) == GLFW_PRESS;
}

void InputManager::handleTouch() {
    // TODO: Implement touch handling
}

void InputManager::handleGamepad() {
    // TODO: Implement gamepad handling
}

bool InputManager::checkKeyboard(const std::string& key) const {
    auto it = keyPressed.find(key);
    return it != keyPressed.end() && it->second;
}

bool InputManager::checkGamepad(const std::string& button) const {
    // TODO: Implement gamepad checking
    return false;
}

bool InputManager::checkMouse(const std::string& button) const {
    if (button == "left") return mouseLeftPressed;
    if (button == "right") return mouseRightPressed;
    return false;
}

bool InputManager::checkTouch(const std::string& gesture) const {
    // TODO: Implement touch checking
    return false;
}

std::unordered_map<std::string, int> InputManager::checkInput() {
    std::unordered_map<std::string, int> inputMap;
    // TODO: Populate input map based on current input state
    return inputMap;
}

bool InputManager::isKeyPressed(const std::string& key) const {
    auto it = keyPressed.find(key);
    return it != keyPressed.end() && it->second;
}
