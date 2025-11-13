#pragma once

#include <SDL2/SDL.h>
#include <unordered_map>
#include <string>
#include <vector>

class GLEngine;

enum class InputAction {
    MoveUp,
    MoveDown,
    MoveLeft,
    MoveRight,
    Interact,
    Dance,
    // Add more actions as needed
};

class InputManager {
private:
    GLEngine* engine;
    std::unordered_map<std::string, bool> keyPressed;
    std::unordered_map<std::string, bool> keyReleased;
    std::unordered_map<std::string, bool> keyHeld;

    // Mouse state
    double mouseX, mouseY;
    bool mouseLeftPressed, mouseRightPressed;

    // Gamepad state (simplified)
    SDL_GameController* gamepad;

public:
    InputManager(GLEngine* engine);
    ~InputManager();

    void update(float dt);
    bool isActionPressed(InputAction action);
    bool isKeyPressed(const std::string& key);
    bool isKeyHeld(const std::string& key);
    bool isMouseButtonPressed(int button);

    // Getters
    double getMouseX() const { return mouseX; }
    double getMouseY() const { return mouseY; }

private:
    void handleKeyboard();
    void handleMouse();
    void handleGamepad();
};
