#pragma once
#include <memory>
#include <vector>
#include <unordered_map>
#include <string>
#include <glm/glm.hpp>
#include "Sprite.h"
#include "Object.h"
#include "Tileset.h"

class World;
class GLEngine;

class Zone : public std::enable_shared_from_this<Zone> {
public:
    Zone(const std::string& zoneId, World* world);
    ~Zone();

    void init();
    void update(double dt);
    void render();

    bool isInZone(float x, float y) const;
    bool isWalkable(float x, float y, int direction) const;
    float getHeight(float x, float y) const;

    void addSprite(std::shared_ptr<Sprite> sprite);
    void removeSprite(const std::string& id);
    std::shared_ptr<Sprite> getSpriteById(const std::string& id) const;

    void addObject(std::shared_ptr<Object> object);
    void removeObject(const std::string& id);

    // Tiles
    void loadTileset(const std::string& tilesetPath);
    void renderTiles();

    // Bounds
    std::vector<float> bounds; // [minX, minY, maxX, maxY]

    // ID and references
    std::string id;
    World* world;
    GLEngine* engine;

private:
    std::unordered_map<std::string, std::shared_ptr<Sprite>> sprites;
    std::vector<std::shared_ptr<Sprite>> spriteList;
    std::unordered_map<std::string, std::shared_ptr<Object>> objects;
    std::vector<std::shared_ptr<Object>> objectList;

    std::shared_ptr<Tileset> tileset;
    std::vector<std::vector<int>> cells; // Tile data

    void sortSprites();
};
