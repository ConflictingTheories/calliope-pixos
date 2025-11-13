#pragma once

#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "Action.h"

class Zone;
class GLEngine;
class RenderManager;


class Sprite {
public:
    Sprite(GLEngine* engine);
    virtual ~Sprite();

    virtual void init();
    virtual void update(double dt);
    virtual void render();

    // Position and movement
    glm::vec3 pos;
    glm::vec3 scale;
    float rotation;

    // Animation
    int animFrame;
    float animTimer;
    bool fixed;

    // Identification
    std::string id;
    int objId;

    // Zone relationship
    std::weak_ptr<Zone> zone;

    // Actions
    void addAction(std::shared_ptr<Action> action);
    void clearActions();

    // Properties
    std::unordered_map<std::string, std::string> actionDict;
    std::vector<std::string> actionList;

    // Speech
    std::string speech;
    float speechTimer;

    // Lighting
    bool isLit;
    int lightIndex;
    glm::vec3 lightColor;
    float density;

    // Selection
    bool isSelected;

    GLEngine* engine;

protected:
    std::vector<std::shared_ptr<Action>> actionQueue;
};
