#include "ScriptAction.h"
#include "Zone.h"
#include "ScriptInterpreter.h"

ScriptAction::ScriptAction(GLEngine* engine, Sprite* sprite)
    : Action(engine, ActionType::Script, {}, sprite), zone(nullptr), world(nullptr) {}

ScriptAction::~ScriptAction() {}

void ScriptAction::init(const std::string& triggerId, Zone* zone, std::function<void()> onCompleted) {
    this->zone = zone;
    this->world = zone->getWorld();
    this->triggerId = triggerId;
    this->completed = false;
    this->onCompleted = onCompleted ? onCompleted : []() { /* default callback */ };
    triggerScript();
}

void ScriptAction::triggerScript() {
    if (triggerId.empty()) {
        completed = true;
        return;
    }

    // Execute matching script in zone
    for (auto& script : zone->getScripts()) {
        if (script->getId() == triggerId) {
            script->trigger();
        }
    }
    completed = true;
}

bool ScriptAction::tick(double time) {
    if (!loaded) return false;
    if (completed) {
        onCompleted();
    }
    return completed;
}
