#include "Event.h"

Event::Event(GLEngine* engine, const std::string& id) : engine(engine), id(id), objId(0), active(false), repeating(false), duration(0.0f), timer(0.0f), elapsedTime(0.0f) {}

Event::~Event() {}

void Event::init() {
    // Default implementation
}

void Event::update(double dt) {
    elapsedTime += dt;
    if (elapsedTime >= duration) {
        trigger();
        if (!repeating) {
            active = false;
        } else {
            elapsedTime = 0.0f;
        }
    }
}

void Event::trigger() {
    if (onTrigger) {
        onTrigger();
    }
}

bool Event::tick(double dt) {
    update(dt);
    return !active;
}

void Event::reset() {
    elapsedTime = 0.0f;
    active = true;
}
