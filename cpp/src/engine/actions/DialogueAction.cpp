#include "DialogueAction.h"
#include "Sprite.h"
#include "GLEngine.h"

DialogueAction::DialogueAction(GLEngine* engine, Sprite* sprite)
    : Action(engine, ActionType::Dialogue, {}, sprite) {}

DialogueAction::~DialogueAction() {}

void DialogueAction::init(const std::string& text, bool scrolling, const ActionOptions& options) {
    this->text = text;
    this->displayText = text;
    this->scrolling = scrolling;
    this->options = options;
    this->completed = false;
    this->lastKey = 0;
    this->loaded = true;
}

bool DialogueAction::tick(double time) {
    if (!loaded) return false;

    if (options.autoclose) {
        if (endTime == 0) {
            endTime = time + (options.duration * 1000);
        }
        if (time > endTime) {
            completed = true;
        }
    }

    checkInput(time);
    sprite->speak(displayText, false, this);

    if (completed && options.onClose) {
        if (sprite->getSpeech()) {
            sprite->getSpeech()->clearHud();
        }
        options.onClose();
    }

    return completed;
}

void DialogueAction::checkInput(double time) {
    if (time > lastKey + 100) {
        lastKey = time;
        // Simplified input handling
    }
}
