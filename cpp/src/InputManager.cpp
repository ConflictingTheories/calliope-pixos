#include "InputManager.h"
#include "GLEngine.h"
#include <GLFW/glfw3.h>
#include <SDL2/SDL.h>
#include <iostream>

InputManager::InputManager(GLEngine* engine)
    : engine(engine), mouseX(0), mouseY(0), mouseLeftPressed(false), mouseRightPressed(false), gamepad(nullptr) {
    if (SDL_Init(SDL_INIT_GAMECONTROLLER) < 0) {
        std::cerr << "SDL could not initialize! SDL_Error: " << SDL_GetError() << std::endl;
    }

    // Open first available gamepad
    for (int i = 0; i < SDL_NumJoysticks(); ++i) {
        if (SDL_IsGameController(i)) {
            gamepad = SDL_GameControllerOpen(i);
            if (gamepad) {
                std::cout << "Gamepad connected: " << SDL_GameControllerName(gamepad) << std::endl;
                break;
            }
        }
    }
}

InputManager::~InputManager() {
    if (gamepad) {
        SDL_GameControllerClose(gamepad);
    }
    SDL_Quit();
}

void InputManager::update(float dt) {
    // Poll SDL events for gamepad
    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        // Handle SDL events if needed
    }

    handleKeyboard();
    handleMouse();
    handleGamepad();
}

bool InputManager::isActionPressed(InputAction action) {
    switch (action) {
        case InputAction::MoveUp:
            return isKeyPressed("W") || (gamepad && SDL_GameControllerGetButton(gamepad, SDL_CONTROLLER_BUTTON_DPAD_UP));
        case InputAction::MoveDown:
            return isKeyPressed("S") || (gamepad && SDL_GameControllerGetButton(gamepad, SDL_CONTROLLER_BUTTON_DPAD_DOWN));
        case InputAction::MoveLeft:
            return isKeyPressed("A") || (gamepad && SDL_GameControllerGetButton(gamepad, SDL_CONTROLLER_BUTTON_DPAD_LEFT));
        case InputAction::MoveRight:
            return isKeyPressed("D") || (gamepad && SDL_GameControllerGetButton(gamepad, SDL_CONTROLLER_BUTTON_DPAD_RIGHT));
        case InputAction::Interact:
            return isKeyPressed("E") || (gamepad && SDL_GameControllerGetButton(gamepad, SDL_CONTROLLER_BUTTON_A));
        case InputAction::Dance:
            return isKeyPressed("U") || (gamepad && SDL_GameControllerGetButton(gamepad, SDL_CONTROLLER_BUTTON_X));
        default:
            return false;
    }
}

bool InputManager::isKeyPressed(const std::string& key) {
    return keyPressed[key];
}

bool InputManager::isKeyHeld(const std::string& key) {
    return keyHeld[key];
}

bool InputManager::isMouseButtonPressed(int button) {
    if (button == GLFW_MOUSE_BUTTON_LEFT) return mouseLeftPressed;
    if (button == GLFW_MOUSE_BUTTON_RIGHT) return mouseRightPressed;
    return false;
}

void InputManager::handleKeyboard() {
    GLFWwindow* window = engine->getWindow();

    // Clear previous state
    keyPressed.clear();
    keyReleased.clear();

    // Check common keys
    std::vector<std::pair<std::string, int>> keys = {
        {"W", GLFW_KEY_W}, {"A", GLFW_KEY_A}, {"S", GLFW_KEY_S}, {"D", GLFW_KEY_D},
        {"E", GLFW_KEY_E}, {"U", GLFW_KEY_U}, {"SPACE", GLFW_KEY_SPACE}
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

void InputManager::handleGamepad() {
    if (!gamepad) return;

    // Update gamepad state if needed
    SDL_GameControllerUpdate();
}
