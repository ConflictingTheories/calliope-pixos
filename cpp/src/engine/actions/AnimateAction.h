#pragma once

#include "Action.h"

class AnimateAction : public Action {
public:
    AnimateAction(GLEngine* engine, Sprite* sprite);
    virtual ~AnimateAction();

    void init(double length, int untilFrame, std::function<void(bool)> finish);
    bool tick(double time);

private:
    double length;
    int untilFrame;
    std::function<void(bool)> finish;
    double startTime;
    bool loaded;
};
