#pragma once
#include <string>
#include <functional>

class Event {
public:
    Event(const std::string& name, std::function<void()> callback);
    ~Event();

    void trigger();
    const std::string& getName() const;
    std::string id;
    bool tick(double dt);
    void onComplete();

private:
    std::string name;
    std::function<void()> callback;
};
