#include "CameraEvent.h"
#include "GLEngine.h"
#include "Camera.h"
#include <iostream>

CameraEvent::CameraEvent(const std::string& type, World* world, std::function<void()> callback, GLEngine* engine, const glm::vec3& from, const glm::vec3& to, float duration)
    : Event(type, world, callback), start(from), end(to), totalDuration(duration), t(0.0f), initialized(false) {
    this->engine = engine;
    active = true;
    this->duration = totalDuration;
}

CameraEvent::~CameraEvent() {}

void CameraEvent::init() {
    // set camera immediately to start
    if (engine && engine->getCamera()) {
        engine->getCamera()->setPosition(start);
        engine->getCamera()->setTarget(start);
        // updateVectors may be provided by Camera class
        engine->getCamera()->updateVectors();
    }
    initialized = true;
}

void CameraEvent::update(double dt) {
    if (!initialized) init();
    if (!engine || !engine->getCamera()) return;
    t += static_cast<float>(dt);
    float alpha = totalDuration > 0.0f ? glm::clamp(t / totalDuration, 0.0f, 1.0f) : 1.0f;
    glm::vec3 cur = glm::mix(start, end, alpha);
    engine->getCamera()->setTarget(cur);
    engine->getCamera()->updateVectors();
    if (alpha >= 1.0f) {
        active = false;
        // World will call onComplete when the event is removed
    }
}

void CameraEvent::trigger() {
    // nothing special
}
