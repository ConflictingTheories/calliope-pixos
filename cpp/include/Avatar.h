#pragma once
#include "Sprite.h"
#include <glm/glm.hpp>
#include <string>
#include <vector>
#include <unordered_map>

class GLEngine;

class Avatar : public Sprite {
public:
    Avatar(GLEngine* engine);
    ~Avatar();

    void init() override;
    void update(double dt) override;
    void render() override;

    // Avatar-specific methods
    void handleInput();
    void moveTo(const glm::vec3& target, float speed);
    void faceDirection(int direction);
    void performAction(const std::string& action, const std::vector<std::string>& params);

    // Properties
    bool isLit;
    bool isSelected;
    int facing;
    std::string gender;
    std::unordered_map<std::string, std::string> actionDict;
    std::vector<std::string> actionList;
    std::string portrait;
    std::vector<std::string> inventory;
    bool blocking;
    bool override;
    int lightIndex;
    glm::vec3 lightColor;
    float density;

private:
    GLEngine* engine;
    std::vector<std::string> currentActions;
};
