#pragma once

#include "Action.h"
#include <unordered_map>

struct MenuSection {
    std::string text;
    int x, y, w, h;
    bool active;
    std::unordered_map<std::string, std::string> colours;
};

class PromptAction : public Action {
public:
    PromptAction(GLEngine* engine, Sprite* sprite);
    virtual ~PromptAction();

    void init(const Menu& menu, const std::vector<std::string>& activeMenus, bool scrolling, const ActionOptions& options) override;
    bool tick(double time) override;
    void checkInput(double time) override;

private:
    Menu menuDict;
    std::vector<std::string> activeMenus;
    std::string text;
    bool scrolling = false;
    ActionOptions options;
    double lastKey = 0;
    double endTime = 0;
};
