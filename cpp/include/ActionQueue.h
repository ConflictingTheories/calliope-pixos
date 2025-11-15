#ifndef ACTIONQUEUE_H
#define ACTIONQUEUE_H

#include <vector>
#include <functional>

class ActionQueue {
public:
    void add(std::function<void()> action);
    void run(double time);
private:
    std::vector<std::function<void()>> actions;
};

#endif
