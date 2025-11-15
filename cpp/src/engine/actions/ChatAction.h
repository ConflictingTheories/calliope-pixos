#pragma once

#include "Action.h"
#include <string>
#include <chrono>

class ChatAction : public Action {
public:
    ChatAction(GLEngine* engine, Sprite* sprite);
    virtual ~ChatAction();

    void init(const std::string &prompt, bool scrolling, const ActionOptions& options) override;
    bool tick(double time) override;
    void checkInput(double time) override;

private:
    std::string prompt;
    std::string text;
    bool scrolling;
    ActionOptions options;
    double endTime = 0;
    double lastKey = 0;
};
