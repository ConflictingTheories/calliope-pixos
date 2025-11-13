#pragma once
#include <string>
#include <vector>
#include <glm/glm.hpp>

class Tileset {
public:
    Tileset();
    ~Tileset();

    void load(const std::string& path);
    glm::vec3 getTileVertices(int tileId, const glm::vec3& pos) const;
    glm::vec2 getTileTexCoords(int tileId, int variant) const;
    int getWalkability(int tileId) const;

    // Properties
    int tileWidth;
    int tileHeight;
    int tilesPerRow;
    int totalTiles;
    std::string texturePath;
    bool loaded;
};
