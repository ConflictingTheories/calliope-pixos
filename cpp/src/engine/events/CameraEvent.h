#pragma once

#include "Event.h"
#include <string>
#include <chrono>

class CameraEvent : public Event {
public:
    std::string cameraAction;
    CameraEventOptions options;
    bool completed;
    std::chrono::system_clock::time_point startTime;

    CameraEvent(GLEngine* engine, const std::string& id);
    void init() override;
    void init(const std::string& cameraAction, const CameraEventOptions& options);
    bool tick(double time) override;
    void update(double dt) override;
};
