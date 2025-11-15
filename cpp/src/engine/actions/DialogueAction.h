#pragma once

#include "Action.h"

class DialogueAction : public Action {
public:
    DialogueAction(GLEngine* engine, Sprite* sprite);
    virtual ~DialogueAction();

    void init(const std::string& text, bool scrolling, const ActionOptions& options) override;
    bool tick(double time) override;
    void checkInput(double time) override;

private:
    std::string text;
    std::string displayText;
    bool scrolling = false;
    ActionOptions options;
    double lastKey = 0;
    double endTime = 0;
};
