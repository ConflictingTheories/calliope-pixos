#pragma once

#include "Action.h"
#include <unordered_map>

class PromptAction : public Action {
public:
    PromptAction(GLEngine* engine, Sprite* sprite);
    virtual ~PromptAction();

    void init(const Menu& menu, const std::vector<std::string>& activeMenus, bool scrolling, const ActionOptions& options);
    bool tick(double time) override;
    void checkInput(double time) override;

private:
    Menu menuDict;
    std::vector<std::string> activeMenus;
    std::string text;
    bool scrolling = false;
    ActionOptions options;
    bool loaded = false;
    double endTime = 0;
    double lastKey = 0;
};
