#pragma once

#include "Action.h"
#include "World.h"
#include <functional>

class ScriptAction : public Action {
public:
    ScriptAction(GLEngine* engine, Sprite* sprite);
    virtual ~ScriptAction();

    void init(const std::string& triggerId, Zone* zone, std::function<void()> onCompleted);
    void triggerScript();
    bool tick(double time) override;

private:
    Zone* zone;
    World* world;
    std::string triggerId;
    std::function<void()> onCompleted;
    bool loaded = false;
};
