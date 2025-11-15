#pragma once

#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <unordered_map>
#include <nlohmann/json.hpp>

#include "Avatar.h"

class GLEngine;
class Zone;
class Sprite;

class Object {
public:
    Object(GLEngine* engine, const std::string& id);
    virtual ~Object();

    virtual void init();
    virtual void update(double dt);
    virtual void render();

    // Interaction
    virtual void onInteract(Sprite* interactor);
    virtual void onSelect();
    virtual void onDeselect();
    void faceDir(Direction dir);
    void interact(Sprite* interactor, std::function<void()> callback);

    // Properties
    std::string id;
    int objId;
    glm::vec3 pos;
    glm::vec3 scale;
    float rotation;

    bool interactive;
    bool visible;
    bool solid;

    // Custom properties
    std::unordered_map<std::string, std::string> properties;

    GLEngine* engine;
    std::weak_ptr<Zone> zone;
};
