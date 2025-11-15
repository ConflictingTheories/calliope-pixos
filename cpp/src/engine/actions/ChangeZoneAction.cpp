#include "ChangeZoneAction.h"
#include "GLEngine.h"
#include "World.h"
#include "Zone.h"
#include "Sprite.h"
#include <iostream>

ChangeZoneAction::ChangeZoneAction(GLEngine* engine, Sprite* sprite)
    : Action(engine, ActionType::ChangeZone, {}, sprite), startTime(0), loaded(false) {
}

ChangeZoneAction::~ChangeZoneAction() {}

void ChangeZoneAction::init(const std::string& fromZoneId, const glm::vec3& from, const std::string& toZoneId, const glm::vec3& to, double length) {
    // TODO: Implement fade out/in logic
    this->fromZoneId = fromZoneId;
    this->toZoneId = toZoneId;
    this->from = from;
    this->to = to;
    this->length = length;
    this->startTime = 0; // TODO: Set to current time
    this->loaded = true;

    // Load zones
    if (sprite && sprite->zone.lock()) {
        auto world = sprite->zone.lock()->world;
        this->fromZone = world->loadZone(fromZoneId);
        this->toZone = world->loadZone(toZoneId);
    }
}

bool ChangeZoneAction::tick(double time) {
    if (!loaded || !toZone || !fromZone) return false;

    // TODO: Implement zone loading check, facing, position interpolation, zone switching
    double endTime = startTime + length;
    double frac = (time - startTime) / length;
    if (time >= endTime) {
        // Set final position
        sprite->pos = to;
        return true;
    }

    // Interpolate position
    sprite->pos = glm::mix(from, to, static_cast<float>(frac));

    return false;
}
