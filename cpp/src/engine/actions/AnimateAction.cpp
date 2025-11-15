#include "AnimateAction.h"

AnimateAction::AnimateAction(GLEngine* engine, Sprite* sprite)
    : Action(engine, ActionType::Animation, {}, sprite), length(0), untilFrame(0), startTime(0), loaded(false) {}

AnimateAction::~AnimateAction() {}

void AnimateAction::init(double length, int untilFrame, std::function<void(bool)> finish) {
    this->length = length;
    this->untilFrame = untilFrame;
    this->finish = finish;
    this->startTime = 0; // TODO: Set to current time
    this->loaded = true;
}

bool AnimateAction::tick(double time) {
    if (!loaded) return false;

    double endTime = startTime + length;
    double frac = (time - startTime) / length;
    if (time >= endTime) {
        frac = 1.0;
        if (finish) finish(true);
    }

    int newFrame = static_cast<int>(frac * untilFrame);
    if (newFrame != sprite->getAnimFrame()) {
        sprite->setFrame(newFrame);
    }

    return time >= endTime;
}
