#include "Zone.h"
#include "World.h"
#include "GLEngine.h"
#include <algorithm>
#include <iostream>

Zone::Zone(const std::string& zoneId, World* w) : id(zoneId), world(w), engine(w->engine) {}

Zone::~Zone() {}

void Zone::init() {
    // Load zone data, tileset, etc.
    bounds = {0, 0, 32, 32}; // Default bounds, should be loaded from data
    loadTileset("default_tileset"); // Placeholder
}

void Zone::update(double dt) {
    for (auto& sprite : spriteList) {
        sprite->update(dt);
    }
    for (auto& object : objectList) {
        object->update(dt);
    }
}

void Zone::render() {
    // Render tiles first
    renderTiles();

    // Render objects and sprites
    for (auto& object : objectList) {
        object->render();
    }
    for (auto& sprite : spriteList) {
        sprite->render();
    }
}

bool Zone::isInZone(float x, float y) const {
    return x >= bounds[0] && y >= bounds[1] && x < bounds[2] && y < bounds[3];
}

bool Zone::isWalkable(float x, float y, int direction) const {
    if (!isInZone(x, y)) return false;

    int ix = static_cast<int>(x - bounds[0]);
    int iy = static_cast<int>(y - bounds[1]);

    if (ix < 0 || iy < 0 || ix >= cells.size() || iy >= cells[0].size()) return false;

    int tileId = cells[ix][iy];
    // Simplified walkability check
    return tileId != 0; // Assume tile 0 is not walkable
}

float Zone::getHeight(float x, float y) const {
    if (!isInZone(x, y)) return 0.0f;

    // Simplified height calculation
    return 0.0f;
}

void Zone::addSprite(std::shared_ptr<Sprite> sprite) {
    sprites[sprite->id] = sprite;
    spriteList.push_back(sprite);
    sprite->zone = shared_from_this();
    sortSprites();
}

void Zone::removeSprite(const std::string& id) {
    auto it = sprites.find(id);
    if (it != sprites.end()) {
        spriteList.erase(std::remove(spriteList.begin(), spriteList.end(), it->second), spriteList.end());
        sprites.erase(it);
    }
}

std::shared_ptr<Sprite> Zone::getSpriteById(const std::string& id) const {
    auto it = sprites.find(id);
    return it != sprites.end() ? it->second : nullptr;
}

void Zone::addObject(std::shared_ptr<Object> object) {
    objects[object->id] = object;
    objectList.push_back(object);
}

void Zone::removeObject(const std::string& id) {
    auto it = objects.find(id);
    if (it != objects.end()) {
        objectList.erase(std::remove(objectList.begin(), objectList.end(), it->second), objectList.end());
        objects.erase(it);
    }
}

void Zone::loadTileset(const std::string& tilesetPath) {
    tileset = std::make_shared<Tileset>();
    tileset->load(tilesetPath);

    // Initialize cells with default data
    int width = static_cast<int>(bounds[2] - bounds[0]);
    int height = static_cast<int>(bounds[3] - bounds[1]);
    cells.assign(width, std::vector<int>(height, 1)); // Default to walkable tile
}

void Zone::renderTiles() {
    if (!tileset) return;

    // TODO: Implement proper tile rendering with VBOs and shaders
    // For now, placeholder - actual rendering will be handled by RenderManager
}

void Zone::sortSprites() {
    std::sort(spriteList.begin(), spriteList.end(), [](const std::shared_ptr<Sprite>& a, const std::shared_ptr<Sprite>& b) {
        return a->pos.y < b->pos.y;
    });
}
