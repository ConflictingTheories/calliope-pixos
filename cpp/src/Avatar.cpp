#include "Avatar.h"
#include "GLEngine.h"
#include "InputManager.h"
#include <iostream>
#include <algorithm>

Avatar::Avatar(GLEngine* eng) : Sprite(eng), isLit(true), isSelected(true), facing(Direction::Up), blocking(false), override(false), lightIndex(0), lightColor(1.0f), density(1.0f), speechTimer(0.0f) {}

Avatar::~Avatar() {}

void Avatar::init() {
    std::cout << "Avatar initialized" << std::endl;
}

void Avatar::update(double dt) {
    handleInput();

    // Update action queue
    for (auto it = actionQueue.begin(); it != actionQueue.end(); ) {
        if ((*it)->update(dt)) {
            it = actionQueue.erase(it);
        } else {
            ++it;
        }
    }

    // Update speech timer
    if (speechTimer > 0) {
        speechTimer -= dt;
        if (speechTimer <= 0) {
            speech = "";
        }
    }

    Sprite::update(dt);
}

void Avatar::render() {
    Sprite::render();
}

void Avatar::handleInput() {
    if (!engine->getInputManager()) return;

    // Movement
    if (engine->getInputManager()->isActionPressed(InputAction::MoveUp)) {
        handleWalk("w", {});
    }
    if (engine->getInputManager()->isActionPressed(InputAction::MoveDown)) {
        handleWalk("s", {});
    }
    if (engine->getInputManager()->isActionPressed(InputAction::MoveLeft)) {
        handleWalk("a", {});
    }
    if (engine->getInputManager()->isActionPressed(InputAction::MoveRight)) {
        handleWalk("d", {});
    }

    // Actions
    if (engine->getInputManager()->isActionPressed(InputAction::Interact)) {
        performAction("interact", {});
    }
    if (engine->getInputManager()->isActionPressed(InputAction::Dance)) {
        handleWalk("u", {});
    }
}

void Avatar::moveTo(const glm::vec3& target, float duration) {
    // Create move action
    std::vector<std::string> args = {
        std::to_string(target.x),
        std::to_string(target.y),
        std::to_string(target.z),
        std::to_string(duration)
    };
    auto action = std::make_shared<Action>(engine, ActionType::Move, args, this);
    addAction(action);
}

void Avatar::faceDirection(Direction dir) {
    facing = dir;
    std::vector<std::string> args = {std::to_string(static_cast<int>(dir))};
    auto action = std::make_shared<Action>(engine, ActionType::Face, args, this);
    addAction(action);
}

Direction Avatar::getFacingDirection() const {
    return facing;
}

void Avatar::addAction(std::shared_ptr<Action> action) {
    actionQueue.push_back(action);
    action->init();
}

void Avatar::clearActions() {
    actionQueue.clear();
}

void Avatar::performAction(const std::string& action, const std::vector<std::string>& params) {
    currentActions.push_back(action);
    // TODO: Implement action execution based on action type
    std::cout << "Performing action: " << action << std::endl;
}

void Avatar::openMenu(const std::unordered_map<std::string, std::string>& menuConfig, const std::vector<std::string>& defaultMenus) {
    // TODO: Implement menu opening
    std::cout << "Opening menu" << std::endl;
}

void Avatar::showDialogue(const std::string& text, const std::unordered_map<std::string, std::string>& options) {
    speak(text, 3.0f);
    // TODO: Implement dialogue options
}

void Avatar::handleWalk(const std::string& key, const std::unordered_map<std::string, bool>& touchmap) {
    float moveTime = 600.0f; // ms
    Direction facingDir = Direction::None;

    if (key == "w") facingDir = Direction::Up;
    else if (key == "s") facingDir = Direction::Down;
    else if (key == "a") facingDir = Direction::Left;
    else if (key == "d") facingDir = Direction::Right;
    else if (key == "u") {
        performAction("dance", {"300"});
        return;
    }
    else if (key == "p") {
        performAction("patrol", {std::to_string(pos.x), std::to_string(pos.y + 8), "600"});
        return;
    }
    else if (key == "r") {
        performAction("patrol", {std::to_string(pos.x), std::to_string(pos.y + 8), "200"});
        return;
    }

    // Handle touchmap
    if (touchmap.count("x-dir") && touchmap.at("x-dir")) {
        facingDir = Direction::Right;
    }
    if (touchmap.count("x-dir") && !touchmap.at("x-dir")) {
        facingDir = Direction::Left;
    }
    if (touchmap.count("y-dir") && touchmap.at("y-dir")) {
        facingDir = Direction::Down;
    }
    if (touchmap.count("y-dir") && !touchmap.at("y-dir")) {
        facingDir = Direction::Up;
    }

    // Check for shift/run
    if (engine->getInputManager() && engine->getInputManager()->isKeyHeld("LEFT_SHIFT")) {
        moveTime = 200.0f;
    }

    if (facing != facingDir) {
        faceDirection(facingDir);
    }

    // Calculate movement
    glm::vec3 offset = DirectionUtils::toOffset(facingDir);
    glm::vec3 to = pos + offset;

    // Check if can move
    if (zone.lock() && zone.lock()->isWalkable(to.x, to.y, static_cast<int>(DirectionUtils::reverse(facingDir)))) {
        moveTo(to, moveTime / 1000.0f); // Convert to seconds
    } else {
        faceDirection(facingDir);
    }
}

void Avatar::addItem(const std::string& itemId, int quantity) {
    inventory[itemId] += quantity;
}

void Avatar::removeItem(const std::string& itemId, int quantity) {
    if (inventory.count(itemId)) {
        inventory[itemId] = std::max(0, inventory[itemId] - quantity);
        if (inventory[itemId] == 0) {
            inventory.erase(itemId);
        }
    }
}

int Avatar::getItemCount(const std::string& itemId) const {
    auto it = inventory.find(itemId);
    return it != inventory.end() ? it->second : 0;
}

void Avatar::speak(const std::string& text, float duration) {
    speech = text;
    speechTimer = duration;
}
