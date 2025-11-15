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
    // Movement start position (for Move actions)
    glm::vec3 startPos;

    // Callbacks
    std::function<void()> onComplete;

    GLEngine* engine;

protected:
    virtual void execute();
};

// Options used by various actions (e.g., Dialogue/Chat/Prompt)
struct ActionOptions {
    bool autoclose = false;
    double duration = 0.0; // seconds
    std::function<void()> onClose;
    std::unordered_map<std::string, std::string> extras;
};

// Menu section used by PromptAction; mirrors JS 'menu' structure
struct MenuSection {
    std::string text;
    int x = 0;
    int y = 0;
    int w = 0;
    int h = 0;
    bool active = false;
    std::unordered_map<std::string, std::string> colours;
};

using Menu = std::unordered_map<std::string, MenuSection>;
