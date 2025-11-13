#pragma once

#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>
#include <functional>
#include <nlohmann/json.hpp>

class GLEngine;
class Sprite;
class Zone;

enum class ActionType {
    Move,
    Face,
    Wait,
    Dialogue,
    Animation,
    Script,
    ChangeZone,
    Patrol,
    Dance,
    Prompt
};

class Action {
public:
    Action(GLEngine* engine, ActionType type, const std::vector<std::string>& args = {}, Sprite* sprite = nullptr);
    virtual ~Action();

    virtual void init();
    virtual bool update(double dt);
    virtual void complete();

    // Properties
    ActionType type;
    std::vector<std::string> args;
    Sprite* sprite;
    Zone* zone;
    bool completed;
    float duration;
    float elapsedTime;

    // Callbacks
    std::function<void()> onComplete;

    GLEngine* engine;

protected:
    virtual void execute();
};
