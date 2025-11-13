#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>
#include <unordered_map>
#include <nlohmann/json.hpp>

class GLEngine;

struct Tile {
    int id;
    std::string name;
    bool walkable;
    bool interactive;
    glm::vec2 uvMin;
    glm::vec2 uvMax;
    std::unordered_map<std::string, std::string> properties;
};

class Tileset {
public:
    Tileset(GLEngine* engine, const std::string& id);
    ~Tileset();

    void init();
    void loadFromJson(const nlohmann::json& data, const std::string& gamePath);
    void bindTexture();
    void unbindTexture();

    // Tile queries
    const Tile* getTile(int id) const;
    bool isTileWalkable(int id) const;
    bool isTileInteractive(int id) const;

    // Properties
    std::string id;
    std::string name;
    std::string imagePath;
    int tileWidth, tileHeight;
    int imageWidth, imageHeight;
    int columns, rows;
    int tileCount;
    int firstGid;

    // OpenGL
    GLuint textureId;
    std::vector<Tile> tiles;

    GLEngine* engine;

private:
    void loadTexture(const std::string& path);
    void generateTiles();
};
