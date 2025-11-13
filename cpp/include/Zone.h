#pragma once

#include <glm/glm.hpp>
#include <memory>
#include <vector>
#include <unordered_map>
#include <string>
#include <nlohmann/json.hpp>

class World;
class Sprite;
class Object;
class Tileset;
class Event;
class GLEngine;

#include "Object.h"
#include "Tileset.h"

class Zone {
public:
    Zone(const std::string& id, World* world);
    ~Zone();

    void init();
    void update(double dt);
    void render();

    // Loading
    void loadFromJson(const nlohmann::json& data, const std::string& gamePath);

    // Spatial queries
    bool isInZone(float x, float y) const;
    bool isWalkable(float x, float y, int direction = 0) const;
    glm::ivec2 worldToTile(float x, float y) const;
    glm::vec2 tileToWorld(int row, int col) const;

    // Sprite management
    void addSprite(std::shared_ptr<Sprite> sprite);
    void removeSprite(const std::string& id);
    std::shared_ptr<Sprite> getSpriteById(const std::string& id) const;
    std::vector<std::shared_ptr<Sprite>> getSpritesAt(float x, float y) const;

    // Object management
    void addObject(std::shared_ptr<Object> object);
    void removeObject(const std::string& id);
    std::shared_ptr<Object> getObjectById(const std::string& id) const;

    // Tileset management
    void addTileset(std::shared_ptr<Tileset> tileset);
    void removeTileset(const std::string& id);
    std::shared_ptr<Tileset> getTilesetById(const std::string& id) const;

    // Event management
    void addEvent(std::shared_ptr<Event> event);
    void removeEvent(const std::string& id);

    // Scripting
    void runScripts(const std::string& trigger, const std::unordered_map<std::string, std::string>& params = {});

    // Properties
    std::string id;
    World* world;
    GLEngine* engine;

    glm::vec4 bounds; // x, y, width, height
    int width, height; // in tiles
    float tileSize;

    // Data
    std::vector<std::vector<int>> tileMap;
    std::vector<std::vector<int>> objectMap;
    std::unordered_map<std::string, std::shared_ptr<Sprite>> sprites;
    std::unordered_map<std::string, std::shared_ptr<Object>> objects;
    std::unordered_map<std::string, std::shared_ptr<Tileset>> tilesets;
    std::unordered_map<std::string, std::shared_ptr<Event>> events;

    // Scripts
    std::vector<nlohmann::json> scripts;

private:
    void loadTileMap(const nlohmann::json& data);
    void loadObjects(const nlohmann::json& data);
    void loadSprites(const nlohmann::json& data);
    void loadTilesets(const nlohmann::json& data);
    void loadEvents(const nlohmann::json& data);
};
