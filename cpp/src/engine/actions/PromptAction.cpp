#include "PromptAction.h"
#include "Sprite.h"
#include "GLEngine.h"

PromptAction::PromptAction(GLEngine* engine, Sprite* sprite)
    : Action(engine, ActionType::Prompt, {}, sprite) {}

PromptAction::~PromptAction() {}

void PromptAction::init(const Menu& menu, const std::vector<std::string>& activeMenus, bool scrolling, const ActionOptions& options) {
    this->engine = sprite->getEngine();
    this->text = "";
    this->scrolling = scrolling;
    this->options = options;
    this->completed = false;
    this->lastKey = 0;
    this->menuDict = menu;
    this->activeMenus = activeMenus;
}

bool PromptAction::tick(double time) {
    if (!loaded) return false;

    if (options.autoclose) {
        if (!endTime) {
            endTime = time + 10000; // default 10s
        }
        if (time > endTime) {
            completed = true;
        }
    }

    checkInput(time);

    for (const auto& kv : menuDict) {
        const std::string& id = kv.first;
        const MenuSection& section = kv.second;
        if (std::find(activeMenus.begin(), activeMenus.end(), id) != activeMenus.end()) {
            auto colors = section.colours;
            if (section.active) {
                colors["background"] = "#555";
            }
            engine->getHud()->drawButton(section.text, section.x, section.y, section.w, section.h, colors);
        }
    }

    return completed;
}

void PromptAction::checkInput(double time) {
    if (time > lastKey + 100) {
        lastKey = time;
        // Optionally handle key presses here
    }
}
