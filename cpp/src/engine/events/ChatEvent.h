#pragma once

#include "Event.h"
#include <string>
#include <chrono>

class ChatEvent : public Event {
public:
    std::string text;
    std::string prompt;
    bool scrolling;
    int line;
    EventOptions options;
    bool completed;
    std::chrono::system_clock::time_point lastKey;
    double endTime;

    ChatEvent(GLEngine* engine, const std::string& id);
    void init() override;
    void init(const std::string& prompt, bool scrolling, const EventOptions& options);
    bool tick(double time) override;
    void update(double dt) override;
    void checkInput(double time);
};
