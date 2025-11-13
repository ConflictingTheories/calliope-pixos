#include "Tileset.h"
#include <iostream>

Tileset::Tileset(GLEngine* engine, const std::string& id) : engine(engine), id(id), tileWidth(32), tileHeight(32), imageWidth(0), imageHeight(0), columns(0), rows(0), tileCount(0), firstGid(0), textureId(0) {}

Tileset::~Tileset() {
    if (textureId != 0) {
        glDeleteTextures(1, &textureId);
    }
}

void Tileset::init() {
    // Initialize tileset
}

void Tileset::loadFromJson(const nlohmann::json& data, const std::string& gamePath) {
    name = data["name"];
    imagePath = gamePath + "/" + data["image"].get<std::string>();
    tileWidth = data["tilewidth"];
    tileHeight = data["tileheight"];
    imageWidth = data["imagewidth"];
    imageHeight = data["imageheight"];
    columns = data["columns"];
    rows = imageHeight / tileHeight;
    tileCount = data["tilecount"];
    firstGid = data["firstgid"];

    loadTexture(imagePath);
    generateTiles();
}

void Tileset::bindTexture() {
    glBindTexture(GL_TEXTURE_2D, textureId);
}

void Tileset::unbindTexture() {
    glBindTexture(GL_TEXTURE_2D, 0);
}

const Tile* Tileset::getTile(int id) const {
    for (const auto& tile : tiles) {
        if (tile.id == id) {
            return &tile;
        }
    }
    return nullptr;
}

bool Tileset::isTileWalkable(int id) const {
    const Tile* tile = getTile(id);
    return tile ? tile->walkable : false;
}

bool Tileset::isTileInteractive(int id) const {
    const Tile* tile = getTile(id);
    return tile ? tile->interactive : false;
}

void Tileset::loadTexture(const std::string& path) {
    // TODO: Load texture using stb_image or similar
    // For now, create a placeholder texture
    glGenTextures(1, &textureId);
    glBindTexture(GL_TEXTURE_2D, textureId);
    // Placeholder: create a 1x1 white texture
    unsigned char data[] = {255, 255, 255, 255};
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 1, 1, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glBindTexture(GL_TEXTURE_2D, 0);
}

void Tileset::generateTiles() {
    tiles.clear();
    for (int i = 0; i < tileCount; ++i) {
        Tile tile;
        tile.id = firstGid + i;
        tile.name = "Tile " + std::to_string(tile.id);
        tile.walkable = true; // Default to walkable
        tile.interactive = false; // Default to non-interactive

        int x = (i % columns) * tileWidth;
        int y = (i / columns) * tileHeight;
        tile.uvMin = glm::vec2((float)x / imageWidth, (float)y / imageHeight);
        tile.uvMax = glm::vec2((float)(x + tileWidth) / imageWidth, (float)(y + tileHeight) / imageHeight);

        tiles.push_back(tile);
    }
}
