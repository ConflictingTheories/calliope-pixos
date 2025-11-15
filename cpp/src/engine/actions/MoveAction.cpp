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
    this->spriteList = zone->getSpritesAt(to);
}

bool MoveAction::tick(double time) {
    if (!loaded) return false;

    double endTime = startTime + length;
    double frac = (time - startTime) / length;
    if (time >= endTime) {
        sprite->setPosition(to);
        frac = 1.0;
        onStep();
    } else {
        sprite->setPosition(lerp(from, to, frac));
    }

    return time >= endTime;
}

void MoveAction::onStep() {
    for (auto& s : spriteList) {
        if (s->onStep) s->onStep();
    }
    completed = true;
}
