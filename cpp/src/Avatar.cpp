#include "Avatar.h"
#include "GLEngine.h"
#include <iostream>

Avatar::Avatar(GLEngine* eng) : Sprite(), engine(eng), isLit(true), isSelected(true), facing(0), blocking(false), override(false), lightIndex(0), lightColor(1.0f), density(1.0f) {}

Avatar::~Avatar() {}

void Avatar::init() {
    std::cout << "Avatar initialized" << std::endl;
}

void Avatar::update(double dt) {
    handleInput();

    // Update current actions
    // TODO: Implement action queue and execution

    Sprite::update(dt);
}

void Avatar::render() {
    Sprite::render();
}

void Avatar::handleInput() {
    if (!engine->inputManager) return;

    // Movement
    if (engine->inputManager->isActionActive("move_up")) {
        pos.y += 0.1f;
        facing = 0; // Up
    }
    if (engine->inputManager->isActionActive("move_down")) {
        pos.y -= 0.1f;
        facing = 2; // Down
    }
    if (engine->inputManager->isActionActive("move_left")) {
        pos.x -= 0.1f;
        facing = 3; // Left
    }
    if (engine->inputManager->isActionActive("move_right")) {
        pos.x += 0.1f;
        facing = 1; // Right
    }

    // Actions
    if (engine->inputManager->isActionPressed("interact")) {
        performAction("interact", {});
    }
    if (engine->inputManager->isActionPressed("run")) {
        performAction("run", {});
    }
}

void Avatar::moveTo(const glm::vec3& target, float speed) {
    glm::vec3 direction = glm::normalize(target - pos);
    pos += direction * speed;
}

void Avatar::faceDirection(int direction) {
    facing = direction;
}

void Avatar::performAction(const std::string& action, const std::vector<std::string>& params) {
    currentActions.push_back(action);
    // TODO: Implement action execution based on action type
    std::cout << "Performing action: " << action << std::endl;
}
