#include "Event.h"

Event::Event(const std::string& name, std::function<void()> callback) : name(name), callback(callback) {}

Event::~Event() {}

void Event::trigger() {
    if (callback) {
        callback();
    }
}

const std::string& Event::getName() const {
    return name;
}

bool Event::tick(double dt) {
    // Placeholder: assume events complete immediately for now
    return true;
}

void Event::onComplete() {
    // Placeholder: call callback or handle completion
    trigger();
}
