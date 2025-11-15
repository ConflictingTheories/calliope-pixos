#include "InteractAction.h"
#include "Sprite.h"
#include "Object.h"
#include "Zone.h"

InteractAction::InteractAction(GLEngine* engine, Sprite* sprite)
    : Action(engine, ActionType::Patrol, {}, sprite), world(nullptr), zone(nullptr) {}

InteractAction::~InteractAction() {}

void InteractAction::init(const glm::vec3& from, Direction facing, World* world) {
    this->world = world;
    this->from = from;
    this->facing = facing;
    this->offset = Direction::toOffset(facing);
    this->to = from + offset;
    this->zone = world->zoneContaining(to.x, to.y);
    this->spriteList = zone->getSpritesAt(to);
    this->objectList = zone->getObjectsAt(to);
    this->completed = false;
    this->lastKey = 0;
    interact();
}

void InteractAction::interact() {
    if (spriteList.empty() && objectList.empty()) {
        completed = true;
        return;
    }

    for (auto& object : objectList) {
        object->faceDir(Direction::reverse(facing));
        object->interact(sprite, [this]() { finish(); });
    }

    for (auto& s : spriteList) {
        s->faceDir(Direction::reverse(facing));
        s->interact(sprite, [this]() { finish(); });
    }
}

void InteractAction::finish() {
    completed = true;
}

bool InteractAction::tick(double time) {
    if (!loaded) return false;
    checkInput(time);
    return completed;
}

void InteractAction::checkInput(double time) {
    if (time > lastKey + 200) {
        // handle input logic if necessary
    }
}
