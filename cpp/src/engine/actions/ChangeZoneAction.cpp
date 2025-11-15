#include "ChangeZoneAction.h"
#include "GLEngine.h"
#include "World.h"
#include "Zone.h"
#include "Sprite.h"
#include <iostream>

ChangeZoneAction::ChangeZoneAction(GLEngine* engine, Sprite* sprite)
    : Action(engine, ActionType::ChangeZone, {}, sprite) {
}

ChangeZoneAction::~ChangeZoneAction() {}

void ChangeZoneAction::init(const std::string& fromZoneId, const glm::vec3& from, const std::string& toZoneId, const glm::vec3& to, double length) {
    auto engine = sprite->getZone()->getWorld()->getEngine();

    // Fade out
    if (engine->getRenderManager()) {
        engine->getRenderManager()->startTransition("cross", "out", 500);
    }

    this->fromZone = sprite->getZone()->getWorld()->loadZone(fromZoneId);
    this->toZone = sprite->getZone()->getWorld()->loadZone(toZoneId);
    this->from = from;
    this->to = to;
    this->length = length;

    // Fade in
    if (engine->getRenderManager()) {
        engine->getRenderManager()->startTransition("cross", "in", 500);
    }
}

bool ChangeZoneAction::tick(double time) {
    if (!toZone || !fromZone) return false;

    if (!toZone->isLoaded() || !fromZone->isLoaded()) return false;

    double endTime = startTime + length;
    double frac = (time - startTime) / length;
    if (time >= endTime) {
        sprite->setPosition(to);
        frac = 1.0;
    } else {
        sprite->setPosition(lerp(from, to, frac));
    }

    return time >= endTime;
}
