#include "Zone.h"
#include "World.h"
#include "GLEngine.h"
#include "Shader.h"
#include <algorithm>
#include <iostream>
#include <GL/glew.h>

Zone::Zone(const std::string& zoneId, World* w) : id(zoneId), world(w), engine(w->engine) {}

Zone::~Zone() {}

void Zone::init() {
    // Load zone data, tileset, etc.
    bounds = {0, 0, 32, 32}; // Default bounds, should be loaded from data
    // loadTileset("default_tileset"); // Placeholder - removed as method doesn't exist
}

void Zone::update(double dt) {
    for (auto& spritePair : sprites) {
        spritePair.second->update(dt);
    }
    for (auto& objectPair : objects) {
        objectPair.second->update(dt);
    }
}

void Zone::render() {
    // Render tiles first
    renderTiles();

    // Render objects and sprites
    for (auto& objectPair : objects) {
        objectPair.second->render();
    }
    for (auto& spritePair : sprites) {
        spritePair.second->render();
    }
}

void Zone::renderTiles() {
    // Get the shader from render manager
    auto shader = engine->getRenderManager()->getShader();
    if (!shader) return;

    shader->use();

    // Set projection matrix
    auto renderManager = engine->getRenderManager();
    shader->setMat4("uProj", renderManager->getProjectionMatrix());

    // Enable vertex attributes
    glEnableVertexAttribArray(0);

    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            int tileId = tileMap[y][x];
            if (tileId == 0) continue; // Skip empty tiles

            // Calculate world position
            glm::vec2 worldPos = tileToWorld(y, x);

            // Simple color based on tile ID
            float r = (tileId * 37) % 255 / 255.0f;
            float g = (tileId * 71) % 255 / 255.0f;
            float b = (tileId * 113) % 255 / 255.0f;

            // Set color uniform
            shader->setVec3("uColor", glm::vec3(r, g, b));

            // Create quad vertices for this tile
            float vertices[] = {
                worldPos.x, worldPos.y, 0.0f,
                worldPos.x + tileSize, worldPos.y, 0.0f,
                worldPos.x + tileSize, worldPos.y + tileSize, 0.0f,
                worldPos.x, worldPos.y, 0.0f,
                worldPos.x + tileSize, worldPos.y + tileSize, 0.0f,
                worldPos.x, worldPos.y + tileSize, 0.0f
            };

            // Create VBO for this tile
            GLuint tileVBO;
            glGenBuffers(1, &tileVBO);
            glBindBuffer(GL_ARRAY_BUFFER, tileVBO);
            glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

            glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, nullptr);

            // Draw the tile
            glDrawArrays(GL_TRIANGLES, 0, 6);

            // Clean up
            glDeleteBuffers(1, &tileVBO);
        }
    }

    glDisableVertexAttribArray(0);
    glUseProgram(0);
}

bool Zone::isInZone(float x, float y) const {
    return x >= bounds[0] && y >= bounds[1] && x < bounds[2] && y < bounds[3];
}

bool Zone::isWalkable(float x, float y, int direction) const {
    if (!isInZone(x, y)) return false;

    glm::ivec2 tilePos = worldToTile(x, y);

    if (tilePos.x < 0 || tilePos.y < 0 || tilePos.x >= width || tilePos.y >= height) return false;

    int tileId = tileMap[tilePos.y][tilePos.x];
    // Simplified walkability check
    return tileId != 0; // Assume tile 0 is not walkable
}

glm::ivec2 Zone::worldToTile(float x, float y) const {
    return glm::ivec2(
        static_cast<int>((x - bounds[0]) / tileSize),
        static_cast<int>((y - bounds[1]) / tileSize)
    );
}

glm::vec2 Zone::tileToWorld(int row, int col) const {
    return glm::vec2(
        bounds[0] + col * tileSize,
        bounds[1] + row * tileSize
    );
}

void Zone::addSprite(std::shared_ptr<Sprite> sprite) {
    sprites[sprite->id] = sprite;
    // sprite->zone = std::weak_ptr<Zone>(shared_from_this()); // TODO: Fix shared_from_this
    // sortSprites(); // TODO: Implement if needed
}

void Zone::removeSprite(const std::string& id) {
    auto it = sprites.find(id);
    if (it != sprites.end()) {
        sprites.erase(it);
    }
}

std::shared_ptr<Sprite> Zone::getSpriteById(const std::string& id) const {
    auto it = sprites.find(id);
    return it != sprites.end() ? it->second : nullptr;
}

void Zone::addObject(std::shared_ptr<Object> object) {
    objects[object->id] = object;
}

void Zone::removeObject(const std::string& id) {
    auto it = objects.find(id);
    if (it != objects.end()) {
        objects.erase(it);
    }
}

void Zone::loadFromJson(const nlohmann::json& data, const std::string& gamePath) {
    // Load basic properties
    width = data["width"];
    height = data["height"];
    tileSize = data["tilewidth"]; // Assume square tiles

    bounds = glm::vec4(0, 0, width * tileSize, height * tileSize);

    // Load tile map
    loadTileMap(data);

    // Load tilesets
    loadTilesets(data);

    // Load objects
    loadObjects(data);

    // Load sprites
    loadSprites(data);

    // Load events
    loadEvents(data);

    // Load scripts
    if (data.contains("properties")) {
        for (const auto& prop : data["properties"]) {
            if (prop["name"] == "scripts") {
                scripts = prop["value"];
            }
        }
    }
}

void Zone::loadTileMap(const nlohmann::json& data) {
    tileMap.assign(height, std::vector<int>(width, 0));

    if (data.contains("layers")) {
        for (const auto& layer : data["layers"]) {
            if (layer["type"] == "tilelayer") {
                const auto& layerData = layer["data"];
                for (int y = 0; y < height; ++y) {
                    for (int x = 0; x < width; ++x) {
                        int index = y * width + x;
                        tileMap[y][x] = layerData[index];
                    }
                }
            }
        }
    }
}

void Zone::loadTilesets(const nlohmann::json& data) {
    if (data.contains("tilesets")) {
        for (const auto& tilesetData : data["tilesets"]) {
            auto tileset = std::make_shared<Tileset>(engine, tilesetData["name"]);
            tileset->loadFromJson(tilesetData, world->gamePath);
            tilesets[tileset->id] = tileset;
        }
    }
}

void Zone::loadObjects(const nlohmann::json& data) {
    // TODO: Implement object loading
}

void Zone::loadSprites(const nlohmann::json& data) {
    // TODO: Implement sprite loading
}

void Zone::loadEvents(const nlohmann::json& data) {
    // TODO: Implement event loading
}
