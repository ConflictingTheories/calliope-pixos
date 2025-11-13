#include "Action.h"
#include "GLEngine.h"
#include "Sprite.h"
#include <iostream>

Action::Action(GLEngine* engine, ActionType type, const std::vector<std::string>& args, Sprite* sprite)
    : engine(engine), type(type), args(args), sprite(sprite), completed(false), duration(0.0f), elapsedTime(0.0f) {
}

Action::~Action() {}

void Action::init() {
    // Default initialization
    execute();
}

bool Action::update(double dt) {
    elapsedTime += dt;
    if (duration > 0 && elapsedTime >= duration) {
        complete();
        return true;
    }
    return false;
}

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
                // TODO: Implement movement logic
                std::cout << "Moving sprite to " << target.x << ", " << target.y << ", " << target.z << std::endl;
            }
            break;
        case ActionType::Face:
            if (args.size() >= 1) {
                // Face direction
                // TODO: Implement facing logic
                std::cout << "Facing direction " << args[0] << std::endl;
            }
            break;
        case ActionType::Wait:
            if (args.size() >= 1) {
                duration = std::stof(args[0]);
            }
            break;
        case ActionType::Dialogue:
            // TODO: Implement dialogue
            std::cout << "Showing dialogue: " << (args.size() > 0 ? args[0] : "No text") << std::endl;
            break;
        case ActionType::Animation:
            // TODO: Implement animation
            break;
        case ActionType::Script:
            // TODO: Implement script execution
            break;
        case ActionType::ChangeZone:
            // TODO: Implement zone change
            break;
        case ActionType::Patrol:
            // TODO: Implement patrol
            break;
        case ActionType::Dance:
            // TODO: Implement dance animation
            break;
        case ActionType::Prompt:
            // TODO: Implement prompt/menu
            break;
        default:
            break;
    }
}
