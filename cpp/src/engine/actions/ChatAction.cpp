#include "ChatAction.h"
#include "Sprite.h"
#include "GLEngine.h"
#include "Hud.h"
#include <iostream>

ChatAction::ChatAction(GLEngine* engine, Sprite* sprite)
    : Action(engine, ActionType::Dialogue, {}, sprite) {
}

ChatAction::~ChatAction() {}

void ChatAction::init(const std::string &prompt, bool scrolling, const ActionOptions& options) {
    this->text = "";
    this->prompt = prompt;
    this->scrolling = scrolling;
    this->options = options;
    this->completed = false;
    this->lastKey = 0;
    this->loaded = true;
}

bool ChatAction::tick(double time) {
    if (!loaded) return false;

    if (options.autoclose) {
        if (endTime == 0) endTime = time + (options.duration * 1000);
        if (time > endTime) {
            completed = true;
        }
    }
    checkInput(time);
    if (engine && engine->getHud()) {
        engine->getHud()->scrollText(prompt + text, scrolling, options);
    }
    return completed;
}

void ChatAction::checkInput(double time) {
    if (time > lastKey + 100) {
        lastKey = time;
        // Simplified: handle only Enter to complete
        if (engine && engine->getInputManager()) {
            if (engine->getInputManager()->isKeyPressed("Enter")) {
                if (sprite) {
                    sprite->setGreeting(text);
                    if (sprite->getSpeech()) sprite->getSpeech()->clearHud();
                }
                completed = true;
            }
        }
    }
}
