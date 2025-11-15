#include "engine/events/CameraEvent.h"
#include "RenderManager.h"
#include "Camera.h"
#include <iostream>
#include <chrono>

CameraEvent::CameraEvent(GLEngine* engine, const std::string& id)
    : Event(engine, id), cameraAction(""), completed(false) {
    startTime = std::chrono::system_clock::now();
}

void CameraEvent::init() {
    // Default init
}

void CameraEvent::init(const std::string& cameraAction, const CameraEventOptions& options) {
    this->engine = world->getEngine();
    this->cameraAction = cameraAction;
    this->options = options;
    this->completed = false;
    this->startTime = std::chrono::system_clock::now();
}

bool CameraEvent::tick(double time) {
    if (!loaded) return false;

    auto camera = engine->getRenderManager()->getCamera();
    double progress = 0.0;
    if (options.duration) {
        auto now = std::chrono::system_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(now - startTime).count();
        progress = elapsed / (options.duration * 1000.0);
        if (progress >= 1.0) {
            completed = true;
        }
    }

    // Update camera logic here
    return completed;
}

void CameraEvent::update(double dt) {
    // Update logic
}
