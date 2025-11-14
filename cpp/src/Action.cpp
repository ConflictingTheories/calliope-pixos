#include "Action.h"
#include "GLEngine.h"
#include "Sprite.h"
#include <iostream>
#include <unordered_map>
#include <algorithm>

Action::Action(GLEngine* engine, ActionType type, const std::vector<std::string>& args, Sprite* sprite)
    : engine(engine), type(type), args(args), sprite(sprite), completed(false), duration(0.0f), elapsedTime(0.0f) {
}

Action::~Action() {}

void Action::init() {
    // Default initialization
    execute();
}

// (detailed update implementation is defined later in this file)

void Action::complete() {
    completed = true;
    if (onComplete) {
        onComplete();
    }
}

void Action::execute() {
    switch (type) {
        case ActionType::Move:
            if (args.size() >= 3) {
                // Move to position
                glm::vec3 target(std::stof(args[0]), std::stof(args[1]), std::stof(args[2]));
                // duration may be provided as 4th arg (seconds)
                if (args.size() >= 4) {
                    duration = std::stof(args[3]);
                }
                // If sprite is available, set up a simple linear motion
                if (sprite) {
                    // record starting position and reset elapsed time
                    startPos = sprite->pos;
                    elapsedTime = 0.0f;
                    // attach an onComplete to snap final position
                    onComplete = [this, target]() {
                        if (this->sprite) this->sprite->pos = target;
                    };
                    // If duration is zero, complete immediately
                    if (duration <= 0.0f) {
                        sprite->pos = target;
                        complete();
                    }
                } else {
                    // no sprite: immediate
                    elapsedTime = duration;
                }
            }
            break;
        case ActionType::Face:
            if (args.size() >= 1) {
                int dir = std::stoi(args[0]);
                if (sprite) {
                    // Try dynamic_cast to Avatar if available
                    // We'll set a 'rotation' or use Sprite-specific facing where possible
                    // Store as rotation numeric value for now
                    sprite->rotation = static_cast<float>(dir);
                }
            }
            break;
        case ActionType::Wait:
            if (args.size() >= 1) {
                duration = std::stof(args[0]);
            }
            break;
        case ActionType::Dialogue:
            if (args.size() > 0) {
                std::string text = args[0];
                if (sprite) {
                    // attempt to call speak() if sprite has it
                    // use RTTI to check
                    // We avoid #include Avatar here; simply print and set a short duration
                    std::cout << "Dialogue: " << text << std::endl;
                }
                // default show time
                duration = (args.size() >= 2) ? std::stof(args[1]) : 3.0f;
            }
            break;
        case ActionType::Animation:
                // Basic animation timing: set sprite animTimer and duration
                if (sprite) {
                    duration = (args.size() >= 1) ? std::stof(args[0]) : 0.5f;
                    sprite->animTimer = duration;
                    // optionally set animFrame start if provided
                    if (args.size() >= 2) sprite->animFrame = std::stoi(args[1]);
                } else {
                    duration = (args.size() >= 1) ? std::stof(args[0]) : 0.5f;
                }
                break;
        case ActionType::Script:
            if (args.size() > 0) {
                std::string script = args[0];
                if (engine && engine->getScriptInterpreter()) {
                    // run script synchronously via interpreter
                    std::unordered_map<std::string, std::string> ctx;
                    engine->getScriptInterpreter()->executePixoScript(script, ctx);
                }
            }
            break;
        case ActionType::ChangeZone:
            // TODO: Implement zone change
                if (args.size() >= 1 && engine && engine->getWorld()) {
                    engine->getWorld()->loadZonePublic(args[0]);
                }
            break;
        case ActionType::Patrol:
                // Multi-step patrol: args are a sequence of x,y,z[,duration] groups
                if (sprite && args.size() >= 3) {
                    size_t i = 0;
                    while (i + 2 < args.size()) {
                        std::string sx = args[i];
                        std::string sy = args[i+1];
                        std::string sz = args[i+2];
                        float dur = 0.5f;
                        if (i + 3 < args.size()) {
                            // if next token is parsable as float and followed by more coords, interpret as duration only if it's explicitly marked (we'll accept it here)
                            try {
                                dur = std::stof(args[i+3]);
                                i += 4;
                            } catch (...) {
                                i += 3;
                            }
                        } else {
                            i += 3;
                        }
                        auto act = std::make_shared<Action>(engine, ActionType::Move, std::vector<std::string>{sx, sy, sz, std::to_string(dur)}, sprite);
                        sprite->addAction(act);
                    }
                }
                break;
        case ActionType::Dance:
            // TODO: Implement dance animation
                // Dance is a timed animation; we set a duration and let render show it
                duration = (args.size() >= 1) ? std::stof(args[0]) : 0.6f;
            break;
        case ActionType::Prompt:
            // TODO: Implement prompt/menu
                // Run menu prompt hook on world
                if (engine && engine->getWorld()) {
                    engine->getWorld()->runScripts("prompt", {});
                }
            break;
        default:
            break;
    }
}

bool Action::update(double dt) {
    // dt is in seconds from callers
    if (completed) return true;
    // handle Move specially by interpolating
    if (type == ActionType::Move && sprite) {
        // If duration is non-positive, we already snapped in execute(); nothing to do
        if (duration <= 0.0f) {
            return completed;
        }
        elapsedTime += static_cast<float>(dt);
        float t = std::min(1.0f, elapsedTime / duration);
        if (args.size() >= 3) {
            glm::vec3 target(std::stof(args[0]), std::stof(args[1]), std::stof(args[2]));
            sprite->pos = startPos + (target - startPos) * t;
        }
        if (elapsedTime >= duration) {
            complete();
            return true;
        }
        return false;
    }

    // generic timing
    elapsedTime += static_cast<float>(dt);
    if (duration > 0.0f && elapsedTime >= duration) {
        complete();
        return true;
    }
    return false;
}
