#include "Zone.h"
#include "World.h"
#include "GLEngine.h"
#include "Shader.h"
#include "AudioManager.h"
#include "Camera.h"
#include <algorithm>
#include <iostream>
#include <GL/glew.h>
#include <fstream>
#include <filesystem>
#include <sstream>
#include <glm/gtc/matrix_inverse.hpp>

Zone::Zone(const std::string& zoneId, World* w) : id(zoneId), world(w), engine(w->engine) {}

Zone::~Zone() {}

// Basic audio helpers
void Zone::playAudio() {
    if (audio && engine) {
        audio->playMusic(id, 1.0f, true);
    }
}

void Zone::pauseAudio() {
    if (audio && engine) {
        audio->pauseMusic();
    }
}

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
    auto renderManager = engine ? engine->getRenderManager() : nullptr;
    if (!renderManager) return;

    Shader* shader = renderManager->getShader();
    if (!shader) return;

    renderManager->applySceneDefaults(shader);

    shader->use();

    shader->setMat4("uProjectionMatrix", renderManager->getProjectionMatrix());
    glm::mat4 viewMatrix = glm::mat4(1.0f);
    glm::vec3 cameraPosition(0.0f, 0.0f, 10.0f);
    if (engine && engine->getCamera()) {
        viewMatrix = engine->getCamera()->getViewMatrix();
        cameraPosition = engine->getCamera()->getPosition();
    }
    shader->setMat4("uViewMatrix", viewMatrix);
    shader->setVec3("uCameraPosition", cameraPosition);

    glm::mat4 model = glm::mat4(1.0f);
    shader->setMat4("uModelMatrix", model);
    shader->setMat3("uNormalMatrix", glm::mat3(glm::inverseTranspose(model)));

    shader->setFloat("useSampler", 0.0f);
    shader->setFloat("useDiffuse", 0.0f);
    shader->setVec3("uDiffuse", glm::vec3(0.7f));
    shader->setVec4("uColorMultiplier", glm::vec4(1.0f));

    std::vector<float> lines;
    lines.reserve((width + height + 2) * 2 * 8);

    auto appendVertex = [&lines](float x, float y) {
        lines.push_back(x);
        lines.push_back(y);
        lines.push_back(0.0f);
        lines.push_back(0.0f);
        lines.push_back(0.0f);
        lines.push_back(1.0f);
        lines.push_back(0.0f);
        lines.push_back(0.0f);
    };

    for (int x = 0; x <= width; ++x) {
        float wx = bounds[0] + x * tileSize;
        appendVertex(wx, bounds[1]);
        appendVertex(wx, bounds[1] + height * tileSize);
    }

    for (int y = 0; y <= height; ++y) {
        float wy = bounds[1] + y * tileSize;
        appendVertex(bounds[0], wy);
        appendVertex(bounds[0] + width * tileSize, wy);
    }

    if (lines.empty()) return;

    GLuint vbo = 0;
    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, lines.size() * sizeof(float), lines.data(), GL_STATIC_DRAW);

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), nullptr);
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(2);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6 * sizeof(float)));

    glDrawArrays(GL_LINES, 0, static_cast<GLsizei>(lines.size() / 8));

    glDisableVertexAttribArray(0);
    glDisableVertexAttribArray(1);
    glDisableVertexAttribArray(2);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glDeleteBuffers(1, &vbo);

    renderManager->applySceneDefaults(shader);
}

void Zone::renderTiles() {
    // Get the shader from render manager
    auto shader = engine->getRenderManager()->getShader();
    if (!shader) return;

    auto renderManager = engine->getRenderManager();
    renderManager->applySceneDefaults(shader);

    shader->use();

    shader->setMat4("uProjectionMatrix", renderManager->getProjectionMatrix());
    glm::mat4 viewMatrix = glm::mat4(1.0f);
    glm::vec3 cameraPosition(0.0f, 0.0f, 10.0f);
    if (engine && engine->getCamera()) {
        viewMatrix = engine->getCamera()->getViewMatrix();
        cameraPosition = engine->getCamera()->getPosition();
    }
    shader->setMat4("uViewMatrix", viewMatrix);
    shader->setVec3("uCameraPosition", cameraPosition);

    glm::mat4 model = glm::mat4(1.0f);
    shader->setMat4("uModelMatrix", model);
    shader->setMat3("uNormalMatrix", glm::mat3(glm::inverseTranspose(model)));
    shader->setVec4("uColorMultiplier", glm::vec4(1.0f));

    // Build per-tileset vertex lists so we can upload and draw each tileset once.
    std::map<std::shared_ptr<Tileset>, std::vector<float>> perTilesetVerts;
    bool firstTileLogged = false;
    bool debugLogged = false;

    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            int tileId = tileMap[y][x];
            if (tileId == 0) continue;

            // find tileset containing this tile
            std::shared_ptr<Tileset> tileset = nullptr;
            for (const auto& kv : tilesets) {
                if (kv.second && kv.second->getTile(tileId)) { tileset = kv.second; break; }
            }
            if (!tileset && !tilesets.empty()) tileset = tilesets.begin()->second;
            if (!tileset) continue;

            const Tile* tile = tileset->getTile(tileId);
            if (!tile) continue;

            if (!firstTileLogged) {
                glm::vec2 wp = tileToWorld(y, x);
                std::cout << "Zone::renderTiles INFO first non-zero tileId=" << tileId
                          << " at row=" << y << " col=" << x
                          << " worldPos=(" << wp.x << "," << wp.y << ")" << std::endl;
                firstTileLogged = true;
            }

            if (!debugLogged) {
                glm::vec2 worldPosDbg = tileToWorld(y, x);
                std::cout << "Zone::renderTiles DEBUG tileId=" << tileId
                          << " worldPos=(" << worldPosDbg.x << "," << worldPosDbg.y << ")"
                          << " uvMin=(" << tile->uvMin.x << "," << tile->uvMin.y << ")"
                          << " uvMax=(" << tile->uvMax.x << "," << tile->uvMax.y << ")"
                          << std::endl;
                debugLogged = true;
            }

            glm::vec2 worldPos = tileToWorld(y, x);
            if (firstTileLogged) {
                // Compute clip-space position for diagnostic purposes.
                glm::mat4 proj = renderManager->getProjectionMatrix();
                glm::mat4 modelMat = glm::mat4(1.0f);
                glm::mat4 vp = proj * viewMatrix * modelMat;
                glm::vec4 clip = vp * glm::vec4(worldPos.x, worldPos.y, 0.0f, 1.0f);
                glm::vec3 ndc = glm::vec3(clip) / clip.w;
                std::cout << "Zone::renderTiles DX DEBUG clip= (" << clip.x << "," << clip.y << "," << clip.z << "," << clip.w << ") ndc=(" << ndc.x << "," << ndc.y << "," << ndc.z << ")" << std::endl;
                firstTileLogged = false; // only print once
            }
            std::vector<float>& verts = perTilesetVerts[tileset];
            glm::vec3 normal(0.0f, 0.0f, 1.0f);
            verts.insert(verts.end(), {
                worldPos.x, worldPos.y, 0.0f,                     normal.x, normal.y, normal.z, tile->uvMin.x, tile->uvMax.y,
                worldPos.x + tileSize, worldPos.y, 0.0f,          normal.x, normal.y, normal.z, tile->uvMax.x, tile->uvMax.y,
                worldPos.x + tileSize, worldPos.y + tileSize, 0.0f,  normal.x, normal.y, normal.z, tile->uvMax.x, tile->uvMin.y,
                worldPos.x, worldPos.y, 0.0f,                     normal.x, normal.y, normal.z, tile->uvMin.x, tile->uvMax.y,
                worldPos.x + tileSize, worldPos.y + tileSize, 0.0f,  normal.x, normal.y, normal.z, tile->uvMax.x, tile->uvMin.y,
                worldPos.x, worldPos.y + tileSize, 0.0f,         normal.x, normal.y, normal.z, tile->uvMin.x, tile->uvMin.y
            });
        }
    }

    // For each tileset, upload its vertex data once and draw
    for (auto &entry : perTilesetVerts) {
        auto tileset = entry.first;
        auto &verts = entry.second;
        if (verts.empty()) continue;

        tileset->bindTexture();

    // Diagnostic: print texture binding and uniform location to debug sampling issues
    GLint boundTex = 0;
    glGetIntegerv(GL_TEXTURE_BINDING_2D, &boundTex);
    GLint uTexLoc = -1;
        if (shader->id) uTexLoc = glGetUniformLocation(shader->id, "uSampler");
        std::cout << "Zone::renderTiles DEBUG drawing tileset id='" << tileset->id << "' textureId=" << tileset->textureId
                  << " boundTex=" << boundTex << " uTextureLoc=" << uTexLoc << std::endl;

        // Diagnostic: query texture level size to ensure texture data uploaded
        GLint texW = 0, texH = 0;
        glBindTexture(GL_TEXTURE_2D, tileset->textureId);
        glGetTexLevelParameteriv(GL_TEXTURE_2D, 0, GL_TEXTURE_WIDTH, &texW);
        glGetTexLevelParameteriv(GL_TEXTURE_2D, 0, GL_TEXTURE_HEIGHT, &texH);
        std::cout << "Zone::renderTiles DEBUG tileset texture size=" << texW << "x" << texH << std::endl;

        // Diagnostic: read back current uColor uniform if available
        if (uTexLoc >= 0 && shader->id) {
            GLint uColorLoc = glGetUniformLocation(shader->id, "uColorMultiplier");
            if (uColorLoc >= 0) {
                GLfloat color[4] = {0,0,0,0};
                glGetUniformfv(shader->id, uColorLoc, color);
                std::cout << "Zone::renderTiles DEBUG current uColorMultiplier=(" << color[0] << "," << color[1] << "," << color[2] << "," << color[3] << ")" << std::endl;
            }
        }

        GLuint tileVAO = 0, tileVBO = 0;
        glGenVertexArrays(1, &tileVAO);
        glGenBuffers(1, &tileVBO);
        glBindVertexArray(tileVAO);
        glBindBuffer(GL_ARRAY_BUFFER, tileVBO);
        glBufferData(GL_ARRAY_BUFFER, verts.size() * sizeof(float), verts.data(), GL_STATIC_DRAW);

        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), nullptr);
        glEnableVertexAttribArray(0);
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(3 * sizeof(float)));
        glEnableVertexAttribArray(1);
        glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6 * sizeof(float)));
        glEnableVertexAttribArray(2);

        // Draw all vertices as triangles
        // Diagnostic: dump GL state and first vertex data to debug attribute/uv issues
        GLint currentProgram = 0;
        glGetIntegerv(GL_CURRENT_PROGRAM, &currentProgram);
        GLint activeTex = 0;
        glGetIntegerv(GL_ACTIVE_TEXTURE, &activeTex);
        GLint arrayBuf = 0;
        glGetIntegerv(GL_ARRAY_BUFFER_BINDING, &arrayBuf);
        GLint attrib0_enabled = 0, attrib1_enabled = 0;
        glGetVertexAttribiv(0, GL_VERTEX_ATTRIB_ARRAY_ENABLED, &attrib0_enabled);
        glGetVertexAttribiv(1, GL_VERTEX_ATTRIB_ARRAY_ENABLED, &attrib1_enabled);
        std::cout << "Zone::renderTiles DEBUG glState currentProgram=" << currentProgram
                  << " activeTex=" << activeTex << " arrayBuffer=" << arrayBuf
                  << " attrib0_enabled=" << attrib0_enabled << " attrib1_enabled=" << attrib1_enabled
                  << std::endl;
        // Print first two vertices' data (pos.xyz uv.xy) for quick inspection
        if (verts.size() >= 10) {
            std::cout << "Zone::renderTiles DEBUG firstVerts: ";
            for (size_t i = 0; i < std::min<size_t>(10, verts.size()); ++i) std::cout << verts[i] << ",";
            std::cout << std::endl;
        }
        GLsizei vertCount = (GLsizei)(verts.size() / 8);
        glDrawArrays(GL_TRIANGLES, 0, vertCount);

        glDisableVertexAttribArray(0);
        glDisableVertexAttribArray(1);
        glDisableVertexAttribArray(2);
        glBindBuffer(GL_ARRAY_BUFFER, 0);
        glBindVertexArray(0);
        glDeleteBuffers(1, &tileVBO);
        glDeleteVertexArrays(1, &tileVAO);

        tileset->unbindTexture();
    }

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
    spriteDict[sprite->id] = sprite;
    spriteList.push_back(sprite);
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
    auto it2 = spriteDict.find(id);
    if (it2 != spriteDict.end()) {
        spriteDict.erase(it2);
    }
    spriteList.erase(std::remove_if(spriteList.begin(), spriteList.end(), [&](const std::shared_ptr<Sprite>& s) {
        return s->id == id;
    }), spriteList.end());
}

void Zone::removeAllSprites() {
    sprites.clear();
    spriteDict.clear();
    spriteList.clear();
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
    // If this Zone was loaded from a package directory, prefer packagePath for asset lookups
    std::string assetBase = world->gamePath;
    if (!packagePath.empty()) assetBase = packagePath;
    std::cout << "Zone::loadFromJson(" << id << ") assetBase='" << assetBase << "' tileset=" << data.value("tileset", "(none)") << std::endl;
    loadTilesets(data);

    // Load tile map (tileset info needed for GID mapping)
    loadTileMap(data);
    std::cout << "Zone::loadFromJson(" << id << ") tileMap size=" << tileMap.size() << "x" << (tileMap.empty() ? 0 : tileMap[0].size()) << std::endl;

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
    std::string assetBase = world->gamePath;
    if (!packagePath.empty()) assetBase = packagePath;
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
            if (j.is_array()) return j; // cells.json in the example is an array of rows
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
                            if (c[0].is_string()) {
                                std::string name = c[0].get<std::string>();
                                int resolved = 0;
                                for (const auto& kv : tilesets) {
                                    if (!kv.second) continue;
                                    int tid = kv.second->getTextureId(name);
                                    if (tid != 0) { resolved = tid; break; }
                                }
                                tileMap[y][x] = resolved;
                            } else if (c[0].is_number_integer()) {
                                tileMap[y][x] = c[0].get<int>();
                            } else tileMap[y][x] = 0;
                        } else if (c.is_string()) {
                            std::string name = c.get<std::string>();
                            int resolved = 0;
                            for (const auto& kv : tilesets) {
                                if (!kv.second) continue;
                                int tid = kv.second->getTextureId(name);
                                if (tid != 0) { resolved = tid; break; }
                            }
                            tileMap[y][x] = resolved;
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

    // If no finalCells found yet, attempt to load a sidecar cells.json in the package for this zone
    if ((finalCells.is_null() || finalCells.empty())) {
        std::string cellsPath = assetBase + "/maps/" + id + "/cells.json";
        try {
            nlohmann::json adj = loadCellsFromMapFile(cellsPath);
            if (adj.is_array() && !adj.empty()) {
                finalCells = adj;
                std::cout << "Zone::loadTileMap loaded adjacent cells.json: " << cellsPath << " (size=" << finalCells.size() << ")" << std::endl;
                // populate tileMap from finalCells (repeat logic)
                for (int y = 0; y < height; ++y) {
                    for (int x = 0; x < width; ++x) {
                        int idx = y * width + x;
                        if (idx < (int)finalCells.size()) {
                            const auto &c = finalCells[idx];
                            if (c.is_array() && c.size() >= 1) {
                                if (c[0].is_string()) {
                                    std::string name = c[0].get<std::string>();
                                    int resolved = 0;
                                    for (const auto& kv : tilesets) {
                                        if (!kv.second) continue;
                                        int tid = kv.second->getTextureId(name);
                                        if (tid != 0) { resolved = tid; break; }
                                    }
                                    tileMap[y][x] = resolved;
                                } else if (c[0].is_number_integer()) {
                                    tileMap[y][x] = c[0].get<int>();
                                } else tileMap[y][x] = 0;
                            } else if (c.is_string()) {
                                std::string name = c.get<std::string>();
                                int resolved = 0;
                                for (const auto& kv : tilesets) {
                                    if (!kv.second) continue;
                                    int tid = kv.second->getTextureId(name);
                                    if (tid != 0) { resolved = tid; break; }
                                }
                                tileMap[y][x] = resolved;
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
        } catch (...) {}
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
    std::string assetBase = world->gamePath;
    if (!packagePath.empty()) assetBase = packagePath;
    if (data.contains("tilesets") && data["tilesets"].is_array()) {
        for (const auto& tilesetData : data["tilesets"]) {
            // If element is an object, load directly
            if (tilesetData.is_object()) {
                std::string tid = tilesetData.value("name", "default");
                auto tileset = std::make_shared<Tileset>(engine, tid);
                tileset->loadFromJson(tilesetData, assetBase);
                tilesets[tileset->id] = tileset;
            }
        }
    }

    // If map specifies a single tileset name, try to load tileset JSON from package
    if (data.contains("tileset") && data["tileset"].is_string()) {
        std::string tsName = data["tileset"].get<std::string>();
        // Look for tileset JSON under <assetBase>/tilesets/<tsName>/tileset.json or tiles.json
        std::string basePath = assetBase + "/tilesets/" + tsName + "/";
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
                                std::string extPath = assetBase + "/tilesets/" + ext.get<std::string>() + "/tileset.json";
                                if (std::filesystem::exists(extPath)) {
                                    std::ifstream ef(extPath);
                                    nlohmann::json ej; ef >> ej; ef.close();
                                    auto baseTileset = std::make_shared<Tileset>(engine, ext.get<std::string>());
                                    baseTileset->loadFromJson(ej, assetBase);
                                    tilesets[baseTileset->id] = baseTileset;
                                }
                            }
                        }
                    }
                    std::string tid = j.value("name", tsName);
                    auto tileset = std::make_shared<Tileset>(engine, tid);
                    tileset->loadFromJson(j, assetBase);
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

void Zone::runWhenDeleted() {
    // Placeholder for deletion callbacks
}

std::vector<std::shared_ptr<Sprite>> Zone::getSpritesAt(float x, float y) const {
    std::vector<std::shared_ptr<Sprite>> result;
    for (const auto& pair : sprites) {
        if (pair.second->pos.x == x && pair.second->pos.y == y) {
            result.push_back(pair.second);
        }
    }
    return result;
}

std::vector<std::shared_ptr<Object>> Zone::getObjectsAt(float x, float y) const {
    std::vector<std::shared_ptr<Object>> result;
    for (const auto& pair : objects) {
        if (pair.second->pos.x == x && pair.second->pos.y == y) {
            result.push_back(pair.second);
        }
    }
    return result;
}
