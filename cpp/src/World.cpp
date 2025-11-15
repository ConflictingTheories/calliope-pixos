#include "World.h"
#include "GLEngine.h"
#include "Spritz.h"
#include "Avatar.h"
#include "Event.h"
#include "ModeManager.h"
#include "ActionQueue.h"
#include "MenuEvent.h"
#include "Direction.h"
#include <algorithm>
#include <iostream>
#include <fstream>
#include <sstream>
#include <nlohmann/json.hpp>
#include <chrono>
#include <filesystem>

World::World(Spritz* spritz, const std::string& id)
    : spritz(spritz), engine(spritz ? spritz->getEngine() : nullptr), id(id), objId(rand() % 1000 + 1),
      lastKey(0), lastZoneTransitionTime(0), isPaused(true) {
    modeManager = std::make_shared<ModeManager>(this);
    afterTickActions = std::make_shared<ActionQueue>();
    // menuConfig is initialized as empty
}

World::~World() {}

void World::init(const std::string& gamePath, const nlohmann::json& manifest) {
    this->gamePath = gamePath;
    this->manifest = manifest;
    // Try to load zones specified by manifest (initialZones or maps)
    bool loadedAny = false;
    if (manifest.contains("initialZones") && manifest["initialZones"].is_array()) {
        for (const auto& zoneId : manifest["initialZones"]) {
            if (zoneId.is_string()) {
                loadZone(zoneId.get<std::string>());
                loadedAny = true;
            }
        }
    }
    // Older manifests may list maps instead
    if (!loadedAny && manifest.contains("maps") && manifest["maps"].is_array()) {
        for (const auto& m : manifest["maps"]) {
            if (m.is_string()) {
                loadZone(m.get<std::string>());
                loadedAny = true;
            }
        }
    }

    // Fallback to create a test zone if nothing loaded
    if (!loadedAny) {
        createTestZone();
    }

    // Create and add avatar if zones exist
    if (!zoneDict.empty()) {
        auto avatar = std::make_shared<Avatar>(engine);
        avatar->id = "avatar";
        // Place avatar at center of first zone
        auto firstZone = zoneList.front();
        avatar->pos = glm::vec3((firstZone->width * firstZone->tileSize) / 2.0f,
                                (firstZone->height * firstZone->tileSize) / 2.0f,
                                0.0f);
        addAvatar(avatar);
    }

    std::cout << "World initialized with " << zoneDict.size() << " zones" << std::endl;
}

void World::loadZonePublic(const std::string& zoneId) {
    loadZone(zoneId);
}

void World::loadZone(const std::string& zoneId) {
    std::string mapPath = gamePath + "/maps/" + zoneId + "/map.json";
    std::ifstream mapFile(mapPath);
    if (!mapFile.is_open()) {
        std::cerr << "Failed to load map: " << mapPath << std::endl;
        return;
    }
    // Diagnostic: read and print raw JSON contents for debugging
    std::stringstream ss;
    ss << mapFile.rdbuf();
    std::string raw = ss.str();
    std::cout << "World::loadZone reading map file: " << mapPath << " (size=" << raw.size() << ")" << std::endl;
    std::cout << "----- map.json begin -----\n" << raw << "\n----- map.json end -----\n";
    mapFile.clear();
    mapFile.seekg(0);

    nlohmann::json mapData;
    mapFile >> mapData;
    mapFile.close();

    auto zone = std::make_shared<Zone>(zoneId, this);
    try {
        zone->loadFromJson(mapData, gamePath);
        addZone(zone);
        std::cout << "Loaded zone: " << zoneId << std::endl;

        // TEST HOOK: if PIXOS_TEST_TRIGGER is set to a trigger id, run it after loading the zone.
        // This is a gated helper used during local development to exercise script-driven events
        // without changing production code paths. To use: export PIXOS_TEST_TRIGGER=zone/room_clear_path
        const char* testTrigger = std::getenv("PIXOS_TEST_TRIGGER");
        if (testTrigger && std::string(testTrigger) == "zone/room_clear_path") {
            std::cout << "PIXOS_TEST_TRIGGER detected, running trigger: " << testTrigger << std::endl;
            try {
                // runScripts will dispatch to matching zone scripts
                runScripts(std::string(testTrigger));
                // fallback: some example scripts live under triggers/zone/... — try executing that specific file if present
                // Try a few likely candidate paths (some packages use .pxs, some .lua; some place zone scripts under triggers/zone)
                std::vector<std::string> candidates = {
                    gamePath + "/triggers/zone/room_clear_path.pxs",
                    gamePath + "/triggers/zone/room_clear_path.lua",
                    gamePath + "/triggers/clear-path.pxs",
                    gamePath + "/triggers/clear-path.lua",
                    gamePath + "/triggers/room_clear_path.pxs",
                    gamePath + "/triggers/room_clear_path.lua"
                };
                for (const auto& exampleScript : candidates) {
                    if (std::filesystem::exists(exampleScript)) {
                        if (engine && engine->getScriptInterpreter()) {
                            std::cout << "Executing example script directly: " << exampleScript << std::endl;
                            std::ifstream sf(exampleScript);
                            std::stringstream buffer;
                            buffer << sf.rdbuf();
                            engine->getScriptInterpreter()->executePixoScript(buffer.str(), {});
                        }
                        break;
                    }
                }
            } catch (const std::exception& e) {
                std::cerr << "Error running test trigger: " << e.what() << std::endl;
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error loading zone " << zoneId << ": " << e.what() << std::endl;
        // Create test zone as fallback
        createTestZone();
    }
}

void World::loadZoneFromZip(const std::string& zoneId, const std::string& zipPath, bool skipCache, const nlohmann::json& transitionParams) {
    // Support a directory-based package as a pragmatic fallback for ZIP archives.
    // If `zipPath` is a directory containing maps/{zoneId}/map.json this will load it.
    namespace fs = std::filesystem;
    try {
        if (!fs::exists(zipPath)) {
            std::cerr << "loadZoneFromZip: package path does not exist: " << zipPath << std::endl;
            return;
        }

        // If caller passed a real directory containing a 'maps' folder, use that.
        std::string mapsBase = zipPath + "/maps/" + zoneId;
        std::string mapFilePath = mapsBase + "/map.json";
        std::string cellFilePath = mapsBase + "/cells.json";

        if (fs::is_directory(zipPath) && fs::exists(mapFilePath)) {
            std::ifstream mapFile(mapFilePath);
            if (!mapFile.is_open()) {
                std::cerr << "Failed to open map.json at: " << mapFilePath << std::endl;
                return;
            }
            nlohmann::json mapData;
            mapFile >> mapData;
            mapFile.close();

            nlohmann::json cellData = nlohmann::json::object();
            if (fs::exists(cellFilePath)) {
                std::ifstream cf(cellFilePath);
                if (cf.is_open()) {
                    try { cf >> cellData; } catch (...) { cellData = nlohmann::json::object(); }
                    cf.close();
                }
            }

            auto z = std::make_shared<Zone>(zoneId, this);
            try {
                // Prefer a loader that accepts both map and cell data if available; fall back to map-only.
                z->loadFromJson(mapData, gamePath);

                    // audio: pause audio on existing zones, play on the new one (if supported)
                    for (auto& existing : zoneList) {
                        if (existing && existing->audio) existing->pauseAudio();
                    }
                    if (z->audio) z->playAudio();

                // Register zone
                addZone(z);
                zoneDict[zoneId] = z;

                std::cout << "Loaded zone from package: " << zoneId << " (from " << zipPath << ")" << std::endl;
                return;
            } catch (const std::exception& e) {
                std::cerr << "Error loading zone from package: " << e.what() << std::endl;
                return;
            }
        }

        // Not a directory with map.json; full ZIP archives are not implemented yet.
        std::cerr << "loadZoneFromZip: zip archive support not implemented; pass an extracted directory instead: " << zipPath << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "loadZoneFromZip exception: " << e.what() << std::endl;
    }
}

void World::createTestZone() {
    auto zone = std::make_shared<Zone>("test_zone", this);
    zone->width = 16;
    zone->height = 16;
    zone->tileSize = 32.0f; // 32 pixels per tile
    zone->bounds = {0.0f, 0.0f, 16.0f * 32.0f, 16.0f * 32.0f};

    // Create a simple tile map (16x16 grid)
    zone->tileMap.resize(16, std::vector<int>(16, 0));
    for (int y = 0; y < 16; ++y) {
        for (int x = 0; x < 16; ++x) {
            // Create a checkerboard pattern
            zone->tileMap[y][x] = ((x + y) % 2) + 1; // 1 or 2
        }
    }

    // Create a test tileset
    auto tileset = std::make_shared<Tileset>(engine, "default");
    tileset->tileWidth = 32;
    tileset->tileHeight = 32;
    tileset->columns = 2;
    tileset->rows = 1;
    tileset->tileCount = 2;
    tileset->firstGid = 1;

    // Generate tiles
    tileset->generateTiles();

    zone->addTileset(tileset);

    zoneDict[zone->id] = zone;
    zoneList.push_back(zone);
    sortZones();

    std::cout << "Created test zone with " << zone->width << "x" << zone->height << " tiles" << std::endl;
}

void World::tick(double time) {
    for (auto& z : zoneDict) {
        z.second->update(time);
    }
    afterTickActions->run(time);
}

void World::tickOuter(double time) {
    checkInput(time);
    std::sort(eventList.begin(), eventList.end(), [](const std::shared_ptr<Event>& a, const std::shared_ptr<Event>& b) {
        double dt = a->timer - b->timer;
        if (dt == 0.0) return a->id > b->id;
        return dt < 0.0;
    });
    std::vector<std::shared_ptr<Event>> toRemove;
    for (auto& event : eventList) {
        if (!event->active || event->timer > time) continue;
        if (event->tick(time)) {
            toRemove.push_back(event);
            event->onComplete();
        }
    }
    for (auto& event : toRemove) {
        removeEvent(event->id);
    }
    if (!isPaused) tick(time);
    if (!isPaused && modeManager) {
        try {
            modeManager->update(time);
        } catch (const std::exception& e) {
            std::cerr << "mode update error: " << e.what() << std::endl;
        }
    }
}

void World::checkInput(double time) {
    if (time > lastKey + 200) {
        lastKey = time;

        if (modeManager) {
            try {
                if (modeManager->handleInput(time)) return;
            } catch (const std::exception& e) {
                std::cerr << "mode input handler error: " << e.what() << std::endl;
            }
        }
        // Try to mirror the JS behavior: allow a 'start' button to open the start menu
        if (!engine) return;
        auto im = engine->getInputManager();
        if (im) {
            // Map SPACE -> start menu (best-effort mapping for desktop)
            if (im->isKeyPressed("SPACE")) {
                try {
                    startMenu(menuConfig);
                } catch (...) {
                }
            }

            // Map TAB -> toggle fullscreen (best-effort)
            if (im->isKeyPressed("TAB")) {
                GLFWwindow* w = engine->getWindow();
                if (w) {
                    GLFWmonitor* mon = glfwGetWindowMonitor(w);
                    if (mon) {
                        // switch to windowed mode with a sane default size
                        glfwSetWindowMonitor(w, nullptr, 100, 100, 1024, 768, GLFW_DONT_CARE);
                    } else {
                        GLFWmonitor* primary = glfwGetPrimaryMonitor();
                        if (primary) {
                            const GLFWvidmode* mode = glfwGetVideoMode(primary);
                            if (mode) glfwSetWindowMonitor(w, primary, 0, 0, mode->width, mode->height, mode->refreshRate);
                        }
                    }
                }
            }
        }
    }
}

void World::startMenu(const nlohmann::json& menuConfig, const std::vector<std::string>& defaultMenus) {
    // Create a MenuEvent and add it to the world event queue so it follows the same lifecycle
    std::string evId = "menu-" + std::to_string(objId++);
    auto ev = std::make_shared<MenuEvent>(engine, evId, menuConfig, this);
    ev->onComplete = [this]() {
        // nothing special for now
    };
    addEvent(ev);
}

void World::runAfterTick(const std::function<void()>& action) {
    afterTickActions->add(action);
}

void World::draw() {
    for (auto& z : zoneDict) {
        z.second->render();
    }
}

void World::update(double dt) {
    for (auto& zone : zoneList) {
        zone->update(dt);
    }

    // Update events
    std::vector<std::string> toRemove;
    for (auto& event : eventList) {
        if (event->tick(dt)) {
            toRemove.push_back(event->id);
            event->onComplete();
        }
    }
    for (const auto& id : toRemove) {
        removeEvent(id);
    }
}

void World::render() {
    for (auto& zone : zoneList) {
        zone->render();
    }
}

void World::addZone(std::shared_ptr<Zone> zone) {
    zoneDict[zone->id] = zone;
    zoneList.push_back(zone);
    sortZones();
}

void World::removeZone(const std::string& zoneId) {
    auto it = zoneDict.find(zoneId);
    if (it != zoneDict.end()) {
        zoneList.erase(std::remove(zoneList.begin(), zoneList.end(), it->second), zoneList.end());
        zoneDict.erase(it);
    }
}

void World::removeAllZones() {
    for (auto& z : zoneList) {
        // TODO: if (z->audio) pause audio
        // z->removeAllSprites();
        // z->runWhenDeleted();
    }
    zoneList.clear();
    zoneDict.clear();
}

std::shared_ptr<Zone> World::getZoneById(const std::string& id) const {
    auto it = zoneDict.find(id);
    return it != zoneDict.end() ? it->second : nullptr;
}

std::shared_ptr<Sprite> World::getSpriteById(const std::string& id) const {
    auto it = spriteDict.find(id);
    if (it != spriteDict.end()) return it->second;
    return nullptr;
}

std::shared_ptr<Zone> World::zoneContaining(float x, float y) const {
    for (auto& zone : zoneList) {
        if (zone->isInZone(x, y)) {
            return zone;
        }
    }
    return nullptr;
}

std::shared_ptr<Avatar> World::createAvatar(const nlohmann::json& avatarData) {
    auto zone = zoneContaining(avatarData.value("x", 0.0f), avatarData.value("y", 0.0f));
    if (zone) {
        auto avatar = std::make_shared<Avatar>(engine);
        avatar->id = avatarData.value("id", "avatar");
        avatar->pos = glm::vec3(avatarData.value("x", 0.0f), avatarData.value("y", 0.0f), avatarData.value("z", 0.0f));
        avatar->facing = static_cast<Direction>(avatarData.value("facing", 0));
        // TODO: Set other properties from avatarData
        zone->addSprite(avatar);
        return avatar;
    }
    return nullptr;
}

void World::addAvatar(std::shared_ptr<Avatar> avatar) {
    // Add to appropriate zone
    auto zone = zoneContaining(avatar->pos.x, avatar->pos.y);
    if (zone) {
        zone->addSprite(avatar);
        spriteDict[avatar->id] = avatar;
        spriteList.push_back(avatar);
    }
}

void World::removeAvatar(std::shared_ptr<Avatar> avatar) {
    auto zone = avatar->zone.lock();
    if (zone) {
        zone->removeSprite(avatar->id);
    }
    spriteDict.erase(avatar->id);
    spriteList.erase(std::remove(spriteList.begin(), spriteList.end(), avatar), spriteList.end());
}

std::shared_ptr<Avatar> World::getAvatar() const {
    auto it = spriteDict.find("avatar");
    if (it != spriteDict.end()) {
        return std::static_pointer_cast<Avatar>(it->second);
    }
    return nullptr;
}

void World::addRemoteAvatar(const std::string& clientId, const nlohmann::json& avatarData) {
    if (remoteAvatars.find(clientId) != remoteAvatars.end()) {
        updateRemoteAvatar(clientId, avatarData);
        return;
    }

    auto avatar = std::make_shared<Avatar>(engine);
    std::string baseId = avatarData.value("id", "player");
    std::string spriteId = baseId + "-" + clientId;
    avatar->id = spriteId;
    avatar->pos = glm::vec3(avatarData.value("x", 0.0f), avatarData.value("y", 0.0f), avatarData.value("z", 0.0f));
    avatar->facing = static_cast<Direction>(avatarData.value("facing", 0));
    avatar->isSelected = false;

    // Copy template from local avatar
    auto localTemplate = getAvatar();
    if (localTemplate) {
        avatar->src = localTemplate->src;
        avatar->portraitSrc = localTemplate->portraitSrc;
        avatar->sheetSize = localTemplate->sheetSize;
        avatar->tileSize = localTemplate->tileSize;
        avatar->frames = localTemplate->frames;
        avatar->hotspotOffset = localTemplate->hotspotOffset;
        avatar->drawOffset = localTemplate->drawOffset;
        avatar->enableSpeech = localTemplate->enableSpeech;
        avatar->texture = localTemplate->texture;
        avatar->vertexTexBuf = localTemplate->vertexTexBuf;
        avatar->vertexPosBuf = localTemplate->vertexPosBuf;
        avatar->speechTexBuf = localTemplate->speechTexBuf;
        avatar->loaded = true;
        avatar->templateLoaded = true;
    } else {
        std::cerr << "No local avatar template found; remote avatar may not render correctly" << std::endl;
    }

    auto zone = zoneContaining(avatar->pos.x, avatar->pos.y);
    if (zone) {
        zone->addSprite(avatar);
        spriteDict[avatar->id] = avatar;
        spriteList.push_back(avatar);
        std::cout << "Added remote avatar for client " << clientId << " as sprite '" << avatar->id << "' to zone " << zone->id << std::endl;
    }

    remoteAvatars[clientId] = avatar;
}

void World::removeRemoteAvatar(const std::string& clientId) {
    auto it = remoteAvatars.find(clientId);
    if (it != remoteAvatars.end()) {
        auto avatar = it->second;
        auto zone = avatar->zone.lock();
        if (zone) {
            zone->removeSprite(avatar->id);
        }
        spriteDict.erase(avatar->id);
        spriteList.erase(std::remove(spriteList.begin(), spriteList.end(), avatar), spriteList.end());
        remoteAvatars.erase(it);
    }
}

void World::updateRemoteAvatar(const std::string& clientId, const nlohmann::json& avatarData) {
    auto it = remoteAvatars.find(clientId);
    if (it != remoteAvatars.end()) {
        auto avatar = it->second;
        if (avatarData.contains("x")) avatar->pos.x = avatarData["x"];
        if (avatarData.contains("y")) avatar->pos.y = avatarData["y"];
        if (avatarData.contains("z")) avatar->pos.z = avatarData["z"];
        if (avatarData.contains("facing")) avatar->facing = static_cast<Direction>(avatarData["facing"].get<int>());
        if (avatarData.contains("animFrame")) avatar->animFrame = avatarData["animFrame"];
        if (!avatar->loaded) {
            avatar->loaded = true;
            avatar->templateLoaded = true;
        }
    }
}

void World::applyRemoteAction(const std::string& clientId, const std::string& action, const nlohmann::json& params, const std::string& spriteId) {
    auto it = remoteAvatars.find(clientId);
    if (it != remoteAvatars.end()) {
        auto avatar = it->second;
        // TODO: Implement performAction
        // avatar->performAction(action, params);
    }
}

void World::addEvent(std::shared_ptr<Event> event) {
    if (eventDict.find(event->id) == eventDict.end()) {
        eventDict[event->id] = event;
        eventList.push_back(event);
    }
}

void World::removeEvent(const std::string& eventId) {
    auto it = eventDict.find(eventId);
    if (it != eventDict.end()) {
        eventList.erase(std::remove(eventList.begin(), eventList.end(), it->second), eventList.end());
        eventDict.erase(it);
    }
}

void World::removeAllActions() {
    eventList.clear();
    eventDict.clear();
}

void World::runScripts(const std::string& trigger, const std::unordered_map<std::string, std::string>& params) {
    // Run zone scripts matching trigger
    for (auto& z : zoneList) {
        if (z) z->runScripts(trigger, params);
    }
}

std::vector<std::vector<float>> World::pathFind(const std::vector<float>& from, const std::vector<float>& to) const {
    std::vector<std::vector<float>> steps;
    std::vector<std::string> visited;
    bool found = false;

    std::function<void(const std::vector<float>&, const std::vector<std::vector<float>>&)> buildPath =
        [&](const std::vector<float>& neighbour, const std::vector<std::vector<float>>& path) {
            if (found) return;
            std::string jsonNeighbour = std::to_string(neighbour[0]) + "," + std::to_string(neighbour[1]);
            if (std::find(visited.begin(), visited.end(), jsonNeighbour) != visited.end()) return;
            if (neighbour[0] == to[0] && neighbour[1] == to[1]) {
                found = true;
                steps = path;
                steps.push_back(to);
                return;
            }
            if (!canWalk(neighbour, jsonNeighbour, visited)) return;
            visited.push_back(jsonNeighbour);
            auto neighbours = getNeighbours(neighbour[0], neighbour[1]);
            for (auto& n : neighbours) {
                std::vector<std::vector<float>> newPath = path;
                newPath.push_back({neighbour[0], neighbour[1], 600.0f});
                buildPath(n, newPath);
            }
        };

    auto initialNeighbours = getNeighbours(from[0], from[1]);
    for (auto& neighbour : initialNeighbours) {
        buildPath(neighbour, {{from[0], from[1], 600.0f}});
    }

    return steps;
}

void World::sortZones() {
    std::sort(zoneList.begin(), zoneList.end(), [](const std::shared_ptr<Zone>& a, const std::shared_ptr<Zone>& b) {
        return a->bounds[1] < b->bounds[1];
    });
}

bool World::canWalk(const std::vector<float>& neighbour, const std::string& jsonNeighbour, const std::vector<std::string>& visited) const {
    auto zone = zoneContaining(neighbour[0], neighbour[1]);
    if (!zone || std::find(visited.begin(), visited.end(), jsonNeighbour) != visited.end()) return false;
    return zone->isWalkable(neighbour[0], neighbour[1], 0); // Simplified, no direction check
}

std::vector<std::vector<float>> World::getNeighbours(float x, float y) const {
    return {
        {x, y + 1, 0}, // up
        {x, y - 1, 2}, // down
        {x - 1, y, 3}, // left
        {x + 1, y, 1}  // right
    };
}
