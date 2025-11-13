#include "Tileset.h"
#include <iostream>

Tileset::Tileset() : tileWidth(32), tileHeight(32), tilesPerRow(16), totalTiles(256), loaded(false) {}

Tileset::~Tileset() {}

void Tileset::load(const std::string& path) {
    texturePath = path;
    loaded = true;
    std::cout << "Tileset loaded: " << path << std::endl;
}

glm::vec3 Tileset::getTileVertices(int tileId, const glm::vec3& pos) const {
    // Simplified vertex calculation
    return pos;
}

glm::vec2 Tileset::getTileTexCoords(int tileId, int variant) const {
    // Simplified texture coordinate calculation
    return glm::vec2(0.0f, 0.0f);
}

int Tileset::getWalkability(int tileId) const {
    // Simplified walkability (assume all tiles are walkable)
    return 15; // All directions
}
