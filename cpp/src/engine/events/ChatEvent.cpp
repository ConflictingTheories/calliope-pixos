#include "engine/events/ChatEvent.h"
#include "Hud.h"
#include <iostream>
#include <chrono>

ChatEvent::ChatEvent(GLEngine* engine, const std::string& id)
    : Event(engine, id), text(""), prompt(""), scrolling(false), line(0), completed(false), endTime(0.0) {
    lastKey = std::chrono::system_clock::now();
}

void ChatEvent::init() {
    // Default init if no args
}

void ChatEvent::init(const std::string& prompt, bool scrolling, const EventOptions& options) {
    this->engine = world->getEngine();
    this->text = "";
    this->prompt = prompt;
    this->scrolling = scrolling;
    this->line = 0;
    this->options = options;
    this->completed = false;
    this->lastKey = std::chrono::system_clock::now();
}

bool ChatEvent::tick(double time) {
    if (!loaded) return false;

    if (options.autoclose) {
        if (!endTime) {
            endTime = time + 10000; // Default to 10 seconds
        }
        if (time > endTime) {
            completed = true;
        }
    }

    checkInput(time);
    engine->getHud()->scrollText(prompt + text, scrolling, options);
    return completed;
}

void ChatEvent::update(double dt) {
    // Update logic if needed
}

void ChatEvent::checkInput(double time) {
    if (time > std::chrono::duration_cast<std::chrono::milliseconds>(lastKey.time_since_epoch()).count() + 200) {
        lastKey = std::chrono::system_clock::now();
        // Handle input logic here
    }
}
