#include "ActionQueue.h"

void ActionQueue::add(std::function<void()> action) {
    actions.push_back(action);
}

void ActionQueue::run(double time) {
    for (auto& action : actions) {
        action();
    }
    actions.clear();
}
