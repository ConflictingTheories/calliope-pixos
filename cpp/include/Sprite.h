#pragma once

#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "Action.h"

#include <GL/glew.h>

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

    // Rendering/template fields (may be present for characters/avatars)
    std::string src;
    std::string portraitSrc;
    glm::ivec2 sheetSize;
    int tileSize;
    int frames;
    glm::vec2 hotspotOffset;
    glm::vec2 drawOffset;
    bool enableSpeech;
    // GL resources
    GLuint texture;
    GLuint vertexTexBuf;
    GLuint vertexPosBuf;
    GLuint speechTexBuf;
    bool loaded;
    bool templateLoaded;

    // Load a texture from disk into sprite->texture
    void loadTexture(const std::string& path);

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
