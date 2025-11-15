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
    this->offset = DirectionUtils::toOffset(facing);
    this->to = from + offset;
    this->zone = world->zoneContaining(to.x, to.y).get();
    this->spriteList = zone->getSpritesAt(to.x, to.y);
    this->objectList = zone->getObjectsAt(to.x, to.y);
    this->completed = false;
    this->lastKey = 0;
    this->loaded = true;
    interact();
}

void InteractAction::interact() {
    if (spriteList.empty() && objectList.empty()) {
        completed = true;
        return;
    }

    for (auto& object : objectList) {
        object->faceDir(DirectionUtils::reverse(facing));
        object->interact(sprite, [this]() { finish(); });
    }
    for (auto& s : spriteList) {
        s->faceDir(DirectionUtils::reverse(facing));
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
