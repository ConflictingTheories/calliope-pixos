#include "Zone.h"
#include "World.h"
#include "GLEngine.h"
#include "Shader.h"
#include <algorithm>
#include <iostream>
#include <GL/glew.h>
#include <fstream>
#include <filesystem>
#include <sstream>

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

    // Render grid overlay for debugging (tile boundaries)
    renderGrid();

    // Render objects and sprites
    for (auto& objectPair : objects) {
        objectPair.second->render();
    }
    for (auto& spritePair : sprites) {
        spritePair.second->render();
    }
}

void Zone::renderGrid() {
    // Draw grid lines over the tile area using GL_LINES
    auto shader = engine->getRenderManager()->getShader();
    if (!shader) return;
    shader->use();
    shader->setMat4("uProj", engine->getRenderManager()->getProjectionMatrix());
    shader->setMat4("uModel", glm::mat4(1.0f));
    shader->setInt("uTexture", 0);

    // Set color to light gray
    shader->setVec3("uColor", glm::vec3(0.7f, 0.7f, 0.7f));

    std::vector<float> lines;
    // Vertical lines
    for (int x = 0; x <= width; ++x) {
        float wx = bounds[0] + x * tileSize;
        lines.push_back(wx);
        lines.push_back(bounds[1]);
        lines.push_back(0.0f);
        lines.push_back(wx);
        lines.push_back(bounds[1] + height * tileSize);
        lines.push_back(0.0f);
    }
    // Horizontal lines
    for (int y = 0; y <= height; ++y) {
        float wy = bounds[1] + y * tileSize;
        lines.push_back(bounds[0]);
        lines.push_back(wy);
        lines.push_back(0.0f);
        lines.push_back(bounds[0] + width * tileSize);
        lines.push_back(wy);
        lines.push_back(0.0f);
    }

    if (lines.empty()) return;

    GLuint vbo;
    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, lines.size() * sizeof(float), lines.data(), GL_STATIC_DRAW);

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), nullptr);

    glDrawArrays(GL_LINES, 0, (GLsizei)(lines.size() / 3));

    glDisableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glDeleteBuffers(1, &vbo);

    // Reset color to white
    shader->setVec3("uColor", glm::vec3(1.0f));
}

void Zone::renderTiles() {
    // Get the shader from render manager
    auto shader = engine->getRenderManager()->getShader();
    if (!shader) return;

    shader->use();

    // Set projection matrix
    auto renderManager = engine->getRenderManager();
    shader->setMat4("uProj", renderManager->getProjectionMatrix());
    // Ensure model is identity unless otherwise set
    shader->setMat4("uModel", glm::mat4(1.0f));
    // Ensure sampler uses texture unit 0
    shader->setInt("uTexture", 0);

    // Enable vertex attributes
    glEnableVertexAttribArray(0);
    glEnableVertexAttribArray(1);

    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            int tileId = tileMap[y][x];
            if (tileId == 0) continue; // Skip empty tiles

            // Debug: print the first non-zero tileId and its location
            static bool firstTileLogged = false;
            if (!firstTileLogged) {
                glm::vec2 wp = tileToWorld(y, x);
                std::cout << "Zone::renderTiles INFO first non-zero tileId=" << tileId
                          << " at row=" << y << " col=" << x
                          << " worldPos=(" << wp.x << "," << wp.y << ")" << std::endl;
                firstTileLogged = true;
            }

            // Get tileset for this tile by searching the loaded tilesets for one that contains the tileId
            std::shared_ptr<Tileset> tileset = nullptr;
            for (const auto& kv : tilesets) {
                if (kv.second && kv.second->getTile(tileId)) { tileset = kv.second; break; }
            }
            // Fallback: use the first tileset if no specific match found
            if (!tileset && !tilesets.empty()) tileset = tilesets.begin()->second;
            if (!tileset) continue;

            // Bind tileset texture
            tileset->bindTexture();

            // Calculate world position
            glm::vec2 worldPos = tileToWorld(y, x);

            // Get tile UV coordinates
            const Tile* tile = tileset->getTile(tileId);
            if (!tile) {
                static bool missingLogged = false;
                if (!missingLogged) {
                    std::cout << "Zone::renderTiles DEBUG - tileset->getTile(" << tileId << ") returned null\n";
                    missingLogged = true;
                }
                continue;
            }

            // DEBUG: Force tile color to bright red so we can verify geometry is on-screen
            shader->setVec3("uColor", glm::vec3(1.0f, 0.0f, 0.0f));

            // Log the world position and UVs for the first visible tile to help debug
            static bool debugLogged = false;
            if (!debugLogged) {
                std::cout << "Zone::renderTiles DEBUG tileId=" << tileId
                          << " worldPos=(" << worldPos.x << "," << worldPos.y << ")"
                          << " uvMin=(" << tile->uvMin.x << "," << tile->uvMin.y << ")"
                          << " uvMax=(" << tile->uvMax.x << "," << tile->uvMax.y << ")"
                          << std::endl;
                debugLogged = true;
            }

            // Create quad vertices with texture coordinates
            float vertices[] = {
                // positions          // texture coords
                worldPos.x, worldPos.y, 0.0f,                          tile->uvMin.x, tile->uvMax.y,
                worldPos.x + tileSize, worldPos.y, 0.0f,               tile->uvMax.x, tile->uvMax.y,
                worldPos.x + tileSize, worldPos.y + tileSize, 0.0f,   tile->uvMax.x, tile->uvMin.y,
                worldPos.x, worldPos.y, 0.0f,                          tile->uvMin.x, tile->uvMax.y,
                worldPos.x + tileSize, worldPos.y + tileSize, 0.0f,   tile->uvMax.x, tile->uvMin.y,
                worldPos.x, worldPos.y + tileSize, 0.0f,              tile->uvMin.x, tile->uvMin.y
            };

            // Create VBO for this tile
            GLuint tileVBO;
            glGenBuffers(1, &tileVBO);
            glBindBuffer(GL_ARRAY_BUFFER, tileVBO);
            glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

            glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), nullptr);
            glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(3 * sizeof(float)));

            // Draw the tile
            glDrawArrays(GL_TRIANGLES, 0, 6);

            // Clean up
            glDeleteBuffers(1, &tileVBO);
            tileset->unbindTexture();
        }
    }

    glDisableVertexAttribArray(0);
    glDisableVertexAttribArray(1);
    glUseProgram(0);

    std::cout << "Zone::renderTiles() called for " << width << "x" << height << " tiles" << std::endl;
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
    // Set the sprite's zone weak_ptr so it can query zone information
    try {
        sprite->zone = shared_from_this();
    } catch (...) {
        // If shared_from_this fails (Zone not managed by shared_ptr), leave zone empty but continue
    }
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
    // Load basic properties - support multiple map schemas.
    // Some maps use "width"/"height"/"tilewidth"; others use "bounds": [x,y,w,h]
    if (data.contains("width") && data.contains("height")) {
        width = data["width"].get<int>();
        height = data["height"].get<int>();
    } else if (data.contains("bounds") && data["bounds"].is_array() && data["bounds"].size() >= 4) {
        // bounds: [x, y, w, h] where w/h are tile counts
        width = data["bounds"][2].get<int>();
        height = data["bounds"][3].get<int>();
    } else {
        // default size
        width = 16;
        height = 16;
    }

    if (data.contains("tilewidth")) {
        tileSize = data["tilewidth"].get<float>();
    } else if (data.contains("tileSize")) {
        tileSize = data["tileSize"].get<float>();
    } else {
        // default tile size (pixels)
        tileSize = 32.0f;
    }

    bounds = glm::vec4(0, 0, width * tileSize, height * tileSize);

    // Load tilesets first so we can correctly interpret layer GIDs
    loadTilesets(data);

    // Load tile map (tileset info needed for GID mapping)
    loadTileMap(data);

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
    // We'll support multiple map schemas: Tiled 'layers' with tilelayer.data, or package-specific 'cells',
    // and maps that 'extend' other maps. Build a final cells array by merging parents then overlaying local cells.

    nlohmann::json finalCells = nlohmann::json::array();

    // Helper to load cells from a map file path if present
    auto loadCellsFromMapFile = [&](const std::string &path) -> nlohmann::json {
        if (!std::filesystem::exists(path)) return nlohmann::json();
        try {
            std::ifstream f(path);
            if (!f.is_open()) return nlohmann::json();
            nlohmann::json j; f >> j; f.close();
            if (j.contains("cells") && j["cells"].is_array()) return j["cells"];
            // Some maps may have layers; prefer tilelayer data if present
            if (j.contains("layers") && j["layers"].is_array()) {
                for (const auto &layer : j["layers"]) {
                    if (layer.contains("type") && layer["type"] == "tilelayer" && layer.contains("data")) {
                        return layer["data"];
                    }
                }
            }
        } catch (...) {}
        return nlohmann::json();
    };

    // If this map 'extends' others, merge in their cells first (parents applied in order)
    if (data.contains("extends") && data["extends"].is_array()) {
        for (const auto& ext : data["extends"]) {
            if (!ext.is_string()) continue;
            std::string parent = ext.get<std::string>();
            std::string parentMapPath = world->gamePath + "/maps/" + parent + "/map.json";
            std::string parentCellsPath = world->gamePath + "/maps/" + parent + "/cells.json";
            nlohmann::json pcs = loadCellsFromMapFile(parentMapPath);
            if (pcs.is_null() || !pcs.is_array() || pcs.empty()) pcs = loadCellsFromMapFile(parentCellsPath);
            if (pcs.is_array() && !pcs.empty()) {
                if (finalCells.empty()) finalCells = pcs;
                else {
                    // Overlay: fill empty slots in finalCells with parent values
                    size_t maxN = std::max(finalCells.size(), pcs.size());
                    nlohmann::json merged = nlohmann::json::array();
                    // initialize merged with finalCells or nulls
                    for (size_t i = 0; i < maxN; ++i) {
                        if (i < finalCells.size()) merged.push_back(finalCells[i]);
                        else merged.push_back(nullptr);
                    }
                    for (size_t i = 0; i < pcs.size(); ++i) {
                        if (!pcs[i].is_null() && !(pcs[i].is_array() && pcs[i].empty())) merged[i] = pcs[i];
                    }
                    finalCells = merged;
                }
            }
        }
    }

    // If map has top-level cells, overlay them next
    if (data.contains("cells") && data["cells"].is_array()) {
        if (finalCells.empty()) finalCells = data["cells"];
        else {
            size_t maxN = std::max(finalCells.size(), data["cells"].size());
            nlohmann::json merged = nlohmann::json::array();
            for (size_t i = 0; i < maxN; ++i) {
                if (i < finalCells.size()) merged.push_back(finalCells[i]);
                else merged.push_back(nullptr);
            }
            for (size_t i = 0; i < data["cells"].size(); ++i) {
                if (!data["cells"][i].is_null() && !(data["cells"][i].is_array() && data["cells"][i].empty())) merged[i] = data["cells"][i];
            }
            finalCells = merged;
        }
    }

    // If no finalCells yet, check for layers.tilelayer.data (Tiled format)
    if ((finalCells.is_null() || finalCells.empty()) && data.contains("layers") && data["layers"].is_array()) {
        for (const auto& layer : data["layers"]) {
            if (layer.contains("type") && layer["type"] == "tilelayer" && layer.contains("data")) {
                finalCells = layer["data"];
                break;
            }
        }
    }

    // If we have finalCells, populate tileMap from it
    if (finalCells.is_array() && !finalCells.empty()) {
        // Dump sample for diagnostics
        std::cout << "Zone::loadTileMap using finalCells (size=" << finalCells.size() << ") sample:";
        for (size_t s = 0; s < std::min<size_t>(20, finalCells.size()); ++s) std::cout << finalCells[s] << ",";
        std::cout << std::endl;

        for (int y = 0; y < height; ++y) {
            for (int x = 0; x < width; ++x) {
                int idx = y * width + x;
                if (idx < (int)finalCells.size()) {
                    const auto &c = finalCells[idx];
                    if (c.is_array() && c.size() >= 1) {
                        tileMap[y][x] = c[0].get<int>();
                    } else if (c.is_number_integer()) {
                        tileMap[y][x] = c.get<int>();
                    } else {
                        tileMap[y][x] = 0;
                    }
                } else {
                    tileMap[y][x] = 0;
                }
            }
        }
    }

    // If tilesets provide firstGid values, ensure mapping stays as global IDs which Tileset::getTile expects
    if (!tilesets.empty()) {
        // Build a sorted list of tileset firstGid -> tileset id mapping
        std::vector<std::pair<int, std::shared_ptr<Tileset>>> gids;
        for (const auto& kv : tilesets) {
            gids.emplace_back(kv.second->firstGid, kv.second);
        }
        std::sort(gids.begin(), gids.end(), [](const auto &a, const auto &b){ return a.first < b.first; });

        for (int j = 0; j < height; ++j) {
            for (int i = 0; i < width; ++i) {
                int raw = tileMap[j][i];
                if (raw == 0) { tileMap[j][i] = 0; continue; }
                // Find the tileset with the largest firstGid <= raw
                std::shared_ptr<Tileset> chosen = nullptr;
                for (int t = (int)gids.size() - 1; t >= 0; --t) {
                    if (raw >= gids[t].first) { chosen = gids[t].second; break; }
                }
                if (chosen) {
                    int localId = raw; // the Tileset stores tiles with ids = firstGid + index
                    tileMap[j][i] = localId;
                } else {
                    // No tileset matched, leave raw gid
                    tileMap[j][i] = raw;
                }
            }
        }
    }

    int nonZero = 0;
    for (int j = 0; j < height; ++j) for (int i = 0; i < width; ++i) if (tileMap[j][i] != 0) ++nonZero;
    if (nonZero == 0) {
        if (data.contains("cells") && data["cells"].is_array()) {
            std::cout << "Zone::loadTileMap fallback: using top-level 'cells' array (size=" << data["cells"].size() << ")" << std::endl;
            const auto& cells = data["cells"];
            for (int j = 0; j < height; ++j) {
                for (int i = 0; i < width; ++i) {
                    int idx = j * width + i;
                    if (idx < (int)cells.size()) {
                        // cells may contain arrays like [tileId, variant, z, ...]
                        const auto& c = cells[idx];
                        if (c.is_array() && c.size() >= 1) tileMap[j][i] = c[0].get<int>();
                        else if (c.is_number()) tileMap[j][i] = c.get<int>();
                    }
                }
            }
        } else {
            std::cout << "Zone::loadTileMap fallback: no 'cells' array present; tileMap remains empty" << std::endl;
        }
    }

    // If still empty, fill a visible test pattern for debugging (will be removed later)
    int nonZeroAfter = 0;
    for (int j = 0; j < height; ++j) for (int i = 0; i < width; ++i) if (tileMap[j][i] != 0) ++nonZeroAfter;
    if (nonZeroAfter == 0) {
        std::cout << "Zone::loadTileMap - tileMap empty after parsing; filling debug checker pattern" << std::endl;
        for (int j = 0; j < height; ++j) for (int i = 0; i < width; ++i) tileMap[j][i] = ((i + j) % 2) + 1; 
    }

    // Debug: report basic stats about loaded tileMap (reusing nonZero computed above)
    std::cout << "Zone::loadTileMap loaded " << width << "x" << height << " tiles — non-zero=" << nonZero << std::endl;
    if (height > 0 && width > 0) {
        std::cout << "Zone::loadTileMap sample row0: ";
        for (int i = 0; i < std::min(width, 10); ++i) std::cout << tileMap[0][i] << ",";
        std::cout << std::endl;
    }
}

void Zone::loadTilesets(const nlohmann::json& data) {
    // The map can reference tilesets in multiple ways. It may include a "tilesets" array
    // or a simple "tileset" string referencing a tileset directory under the package.
    if (data.contains("tilesets") && data["tilesets"].is_array()) {
        for (const auto& tilesetData : data["tilesets"]) {
            // If element is an object, load directly
            if (tilesetData.is_object()) {
                std::string tid = tilesetData.value("name", "default");
                auto tileset = std::make_shared<Tileset>(engine, tid);
                tileset->loadFromJson(tilesetData, world->gamePath);
                tilesets[tileset->id] = tileset;
            }
        }
    }

    // If map specifies a single tileset name, try to load tileset JSON from package
    if (data.contains("tileset") && data["tileset"].is_string()) {
        std::string tsName = data["tileset"].get<std::string>();
        // Look for tileset JSON under <gamePath>/tilesets/<tsName>/tileset.json or tiles.json
        std::string basePath = world->gamePath + "/tilesets/" + tsName + "/";
        std::vector<std::string> candidates = {"tileset.json", "tiles.json", tsName + ".json"};
        for (const auto& cand : candidates) {
            std::string full = basePath + cand;
            if (std::filesystem::exists(full)) {
                try {
                    std::ifstream f(full);
                    nlohmann::json j;
                    f >> j;
                    // If tileset extends another, attempt to load base first
                    if (j.contains("extends") && j["extends"].is_array()) {
                        for (const auto& ext : j["extends"]) {
                            if (ext.is_string()) {
                                std::string extPath = world->gamePath + "/tilesets/" + ext.get<std::string>() + "/tileset.json";
                                if (std::filesystem::exists(extPath)) {
                                    std::ifstream ef(extPath);
                                    nlohmann::json ej; ef >> ej; ef.close();
                                    auto baseTileset = std::make_shared<Tileset>(engine, ext.get<std::string>());
                                    baseTileset->loadFromJson(ej, world->gamePath);
                                    tilesets[baseTileset->id] = baseTileset;
                                }
                            }
                        }
                    }
                    std::string tid = j.value("name", tsName);
                    auto tileset = std::make_shared<Tileset>(engine, tid);
                    tileset->loadFromJson(j, world->gamePath);
                    tilesets[tileset->id] = tileset;
                    break;
                } catch (const std::exception& e) {
                    std::cerr << "Failed to load tileset JSON: " << full << " - " << e.what() << std::endl;
                }
            }
        }
    }
}

void Zone::loadObjects(const nlohmann::json& data) {
    if (!data.contains("objects")) return;
            for (const auto& o : data["objects"]) {
        try {
            std::string oid = o.value("id", "");
            auto objIdStr = oid.empty() ? ("obj_" + std::to_string(objects.size() + 1)) : oid;
            auto obj = std::make_shared<Object>(engine, objIdStr);
            obj->id = objIdStr;
            // basic position parsing
            if (o.contains("pos") && o["pos"].is_array()) {
                auto arr = o["pos"];
                obj->pos = glm::vec3(
                    arr.size() > 0 ? arr[0].get<float>() * tileSize : 0.0f,
                    arr.size() > 1 ? arr[1].get<float>() * tileSize : 0.0f,
                    arr.size() > 2 ? arr[2].get<float>() : 0.0f
                );
            }
            objects[obj->id] = obj;
        } catch (const std::exception& e) {
            std::cerr << "Zone::loadObjects - failed to parse object: " << e.what() << std::endl;
        }
    }
}

void Zone::loadSprites(const nlohmann::json& data) {
    if (!data.contains("sprites")) return;

    for (const auto& s : data["sprites"]) {
        try {
            std::string sid = s.value("id", "");
            std::string type = s.value("type", "");
            glm::vec3 pos(0.0f);
            if (s.contains("pos") && s["pos"].is_array()) {
                auto arr = s["pos"];
                pos.x = arr.size() > 0 ? arr[0].get<float>() * tileSize : 0.0f;
                pos.y = arr.size() > 1 ? arr[1].get<float>() * tileSize : 0.0f;
                pos.z = arr.size() > 2 ? arr[2].get<float>() : 0.0f;
            }

            std::shared_ptr<Sprite> sprite;
            if (sid == "avatar" || type.rfind("characters/", 0) == 0) {
                auto avatar = std::make_shared<Avatar>(engine);
                avatar->id = sid.empty() ? "avatar" : sid;
                avatar->pos = pos;
                // default facing can be parsed if present
                sprite = avatar;
            } else {
                auto sp = std::make_shared<Sprite>(engine);
                sp->id = sid.empty() ? "sprite_" + std::to_string(sprites.size() + 1) : sid;
                sp->pos = pos;
                sprite = sp;
            }

            // Set zone weak ptr
            // Note: shared_from_this isn't used; we'll set via world on addSprite
            sprite->init();
            // Populate template/rendering fields if present in JSON
            if (s.contains("src") && s["src"].is_string()) sprite->src = s["src"].get<std::string>();
            if (s.contains("portraitSrc") && s["portraitSrc"].is_string()) sprite->portraitSrc = s["portraitSrc"].get<std::string>();
            if (s.contains("sheetSize") && s["sheetSize"].is_array() && s["sheetSize"].size() >= 2) {
                sprite->sheetSize = glm::ivec2(s["sheetSize"][0].get<int>(), s["sheetSize"][1].get<int>());
            }
            if (s.contains("tileSize")) sprite->tileSize = s["tileSize"].get<int>();
            if (s.contains("frames")) sprite->frames = s["frames"].get<int>();
            if (s.contains("hotspotOffset") && s["hotspotOffset"].is_array() && s["hotspotOffset"].size() >= 2) {
                sprite->hotspotOffset = glm::vec2(s["hotspotOffset"][0].get<float>(), s["hotspotOffset"][1].get<float>());
            }
            if (s.contains("drawOffset") && s["drawOffset"].is_array() && s["drawOffset"].size() >= 2) {
                sprite->drawOffset = glm::vec2(s["drawOffset"][0].get<float>(), s["drawOffset"][1].get<float>());
            }
            if (s.contains("enableSpeech")) sprite->enableSpeech = s["enableSpeech"].get<bool>();
            sprite->loaded = true;
            // Attempt to load texture if src points to an asset within gamePath
            if (!sprite->src.empty()) {
                std::string texPath = world->gamePath + "/" + sprite->src;
                sprite->loadTexture(texPath);
            }
            sprite->templateLoaded = true;
            addSprite(sprite);
        } catch (const std::exception& e) {
            std::cerr << "Failed to load sprite: " << e.what() << std::endl;
        }
    }
}

void Zone::loadEvents(const nlohmann::json& data) {
    if (!data.contains("events")) return;
    for (const auto& e : data["events"]) {
        try {
            std::string eid = e.value("id", "");
            if (eid.empty()) {
                std::cerr << "Zone::loadEvents - skipping event with no id" << std::endl;
                continue;
            }
            auto ev = std::make_shared<Event>(engine, eid);
            // Basic timing properties
            if (e.contains("duration")) ev->duration = e["duration"].get<float>();
            if (e.contains("repeating")) ev->repeating = e["repeating"].get<bool>();
            events[ev->id] = ev;
            // Register with world so it can manage lifecycle
            if (world) world->addEvent(ev);
        } catch (const std::exception& ex) {
            std::cerr << "Zone::loadEvents - failed to parse event: " << ex.what() << std::endl;
        }
    }
}

void Zone::addTileset(std::shared_ptr<Tileset> tileset) {
    tilesets[tileset->id] = tileset;
}

void Zone::removeTileset(const std::string& id) {
    auto it = tilesets.find(id);
    if (it != tilesets.end()) {
        tilesets.erase(it);
    }
}

std::shared_ptr<Tileset> Zone::getTilesetById(const std::string& id) const {
    auto it = tilesets.find(id);
    return it != tilesets.end() ? it->second : nullptr;
}

void Zone::runScripts(const std::string& trigger, const std::unordered_map<std::string, std::string>& params) {
    for (const auto& s : scripts) {
        if (!s.is_object()) continue;
        std::string scriptTrigger = s.value("trigger", "");
        std::string scriptId = s.value("id", "");
        if (scriptTrigger == trigger && !scriptId.empty()) {
            std::string scriptPath = "triggers/" + scriptId + ".pxs";
            // Load .pxs script file from gamePath and execute using the embedded Lua ScriptInterpreter
            std::string fullPath = world->gamePath + "/" + scriptPath;
            if (!std::filesystem::exists(fullPath)) {
                std::cerr << "Script not found: " << fullPath << std::endl;
                continue;
            }

            try {
                std::ifstream sf(fullPath);
                std::stringstream buffer;
                buffer << sf.rdbuf();
                std::string scriptContent = buffer.str();

                // Build a string->string context map for the interpreter
                std::unordered_map<std::string, std::string> ctx;
                for (const auto& p : params) {
                    ctx[p.first] = p.second;
                }

                if (world->engine->getScriptInterpreter()) {
                    bool ok = world->engine->getScriptInterpreter()->executePixoScript(scriptContent, ctx);
                    if (!ok) {
                        std::cerr << "Failed to execute pixo script: " << fullPath << std::endl;
                    }
                } else {
                    std::cerr << "No ScriptInterpreter available to run script: " << fullPath << std::endl;
                }
            } catch (const std::exception &e) {
                std::cerr << "Error running script " << fullPath << " : " << e.what() << std::endl;
            }
        }
    }
}
