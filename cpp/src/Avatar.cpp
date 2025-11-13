#include "Avatar.h"
#include "GLEngine.h"
#include <iostream>

Avatar::Avatar(GLEngine* eng) : Sprite(eng), isLit(true), isSelected(true), facing(Direction::Up), blocking(false), override(false), lightIndex(0), lightColor(1.0f), density(1.0f) {}

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
    if (!engine->getInputManager()) return;

    // Movement
    if (engine->getInputManager()->isActionPressed(InputAction::MoveUp)) {
        pos.y += 0.1f;
        facing = Direction::Up;
    }
    if (engine->getInputManager()->isActionPressed(InputAction::MoveDown)) {
        pos.y -= 0.1f;
        facing = Direction::Down;
    }
    if (engine->getInputManager()->isActionPressed(InputAction::MoveLeft)) {
        pos.x -= 0.1f;
        facing = Direction::Left;
    }
    if (engine->getInputManager()->isActionPressed(InputAction::MoveRight)) {
        pos.x += 0.1f;
        facing = Direction::Right;
    }

    // Actions
    if (engine->getInputManager()->isActionPressed(InputAction::Interact)) {
        performAction("interact", {});
    }
    if (engine->getInputManager()->isActionPressed(InputAction::Dance)) {
        performAction("dance", {});
    }
}

void Avatar::moveTo(const glm::vec3& target, float speed) {
    glm::vec3 direction = glm::normalize(target - pos);
    pos += direction * speed;
}

void Avatar::faceDirection(Direction dir) {
    facing = dir;
}

void Avatar::performAction(const std::string& action, const std::vector<std::string>& params) {
    currentActions.push_back(action);
    // TODO: Implement action execution based on action type
    std::cout << "Performing action: " << action << std::endl;
}
