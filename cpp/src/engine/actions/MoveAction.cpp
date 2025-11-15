#include "MoveAction.h"
#include "Zone.h"
#include "Sprite.h"
#include <algorithm>

MoveAction::MoveAction(GLEngine* engine, Sprite* sprite)
    : Action(engine, ActionType::Move, {}, sprite) {}

MoveAction::~MoveAction() {}

void MoveAction::init(const glm::vec3& from, const glm::vec3& to, double length, Zone* zone) {
    this->zone = zone;
    this->from = from;
    this->to = to;
    this->length = length;
    this->spriteList = zone->getSpritesAt(to.x, to.y);
    this->loaded = true;
    this->startTime = 0;
}

bool MoveAction::tick(double time) {
    if (!loaded) return false;

    if (startTime == 0) startTime = time;
    double endTime = startTime + length;
    double frac = (time - startTime) / length;
    if (frac >= 1.0) {
        if (sprite) sprite->pos = to;
        completed = true;
    } else {
        if (sprite) sprite->pos = glm::mix(from, to, frac);
    }

    return completed;
}

void MoveAction::onStep() {
    for (auto& s : spriteList) {
        if (s->onStep) s->onStep();
    }
    completed = true;
}
