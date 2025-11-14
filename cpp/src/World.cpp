#include "World.h"
#include "GLEngine.h"
#include "Avatar.h"
#include "Event.h"
#include <algorithm>
#include <iostream>
#include <fstream>
#include <sstream>
#include <nlohmann/json.hpp>

World::World(GLEngine* eng) : engine(eng) {}

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
    if (!zones.empty()) {
        auto avatar = std::make_shared<Avatar>(engine);
        avatar->id = "avatar";
        // Place avatar at center of first zone
        auto firstZone = zoneList.front();
        avatar->pos = glm::vec3((firstZone->width * firstZone->tileSize) / 2.0f,
                                (firstZone->height * firstZone->tileSize) / 2.0f,
                                0.0f);
        addAvatar(avatar);
    }

    std::cout << "World initialized with " << zones.size() << " zones" << std::endl;
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
    } catch (const std::exception& e) {
        std::cerr << "Error loading zone " << zoneId << ": " << e.what() << std::endl;
        // Create test zone as fallback
        createTestZone();
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

    zones[zone->id] = zone;
    zoneList.push_back(zone);
    sortZones();

    std::cout << "Created test zone with " << zone->width << "x" << zone->height << " tiles" << std::endl;
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
    zones[zone->id] = zone;
    zoneList.push_back(zone);
    sortZones();
}

void World::removeZone(const std::string& zoneId) {
    auto it = zones.find(zoneId);
    if (it != zones.end()) {
        zoneList.erase(std::remove(zoneList.begin(), zoneList.end(), it->second), zoneList.end());
        zones.erase(it);
    }
}

std::shared_ptr<Zone> World::getZoneById(const std::string& id) const {
    auto it = zones.find(id);
    return it != zones.end() ? it->second : nullptr;
}

std::shared_ptr<Sprite> World::getSpriteById(const std::string& id) const {
    for (const auto& zp : zoneList) {
        if (!zp) continue;
        auto sp = zp->getSpriteById(id);
        if (sp) return sp;
    }
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

void World::addAvatar(std::shared_ptr<Avatar> avatar) {
    // Add to appropriate zone
    auto zone = zoneContaining(avatar->pos.x, avatar->pos.y);
    if (zone) {
        zone->addSprite(avatar);
    }
}

void World::removeAvatar(std::shared_ptr<Avatar> avatar) {
    auto zone = avatar->zone.lock();
    if (zone) {
        zone->removeSprite(avatar->id);
    }
}

std::shared_ptr<Avatar> World::getAvatar() const {
    // Return the local player avatar
    for (auto& zone : zoneList) {
        auto avatar = zone->getSpriteById("avatar");
        if (avatar) {
            return std::static_pointer_cast<Avatar>(avatar);
        }
    }
    return nullptr;
}

void World::addRemoteAvatar(int clientId, const nlohmann::json& avatarData) {
    if (remoteAvatars.find(clientId) != remoteAvatars.end()) {
        // Update existing
        updateRemoteAvatar(clientId, avatarData);
        return;
    }

    auto avatar = std::make_shared<Avatar>(engine);
    avatar->id = avatarData.value("id", std::string("remote_" + std::to_string(clientId)));
    avatar->pos = glm::vec3(avatarData.value("x", 0.0f), avatarData.value("y", 0.0f), avatarData.value("z", 0.0f));
    if (avatarData.contains("facing")) avatar->facing = static_cast<Direction>(avatarData["facing"].get<int>());

    // Try to copy a local avatar template so remote avatars render similarly
    auto localTemplate = getAvatar();
    if (localTemplate) {
        try {
            avatar->src = localTemplate->src;
            avatar->portraitSrc = localTemplate->portraitSrc;
            avatar->sheetSize = localTemplate->sheetSize;
            avatar->tileSize = localTemplate->tileSize;
            avatar->frames = localTemplate->frames;
            avatar->hotspotOffset = localTemplate->hotspotOffset;
            avatar->drawOffset = localTemplate->drawOffset;
            avatar->enableSpeech = localTemplate->enableSpeech;
            // copy GL resources where present
            avatar->texture = localTemplate->texture;
            avatar->vertexTexBuf = localTemplate->vertexTexBuf;
            avatar->vertexPosBuf = localTemplate->vertexPosBuf;
            avatar->speechTexBuf = localTemplate->speechTexBuf;
            avatar->loaded = true;
            avatar->templateLoaded = true;
        } catch (...) {}
    }

    auto zone = zoneContaining(avatar->pos.x, avatar->pos.y);
    if (zone) {
        zone->addSprite(avatar);
    }

    remoteAvatars[clientId] = avatar;
}

void World::removeRemoteAvatar(int clientId) {
    auto it = remoteAvatars.find(clientId);
    if (it != remoteAvatars.end()) {
        auto avatar = it->second;
        auto zone = avatar->zone.lock();
        if (zone) {
            zone->removeSprite(avatar->id);
        }
        remoteAvatars.erase(it);
    }
}
void World::updateRemoteAvatar(int clientId, const nlohmann::json& avatarData) {
    auto it = remoteAvatars.find(clientId);
    if (it != remoteAvatars.end()) {
        auto avatar = it->second;
        if (avatarData.contains("x")) avatar->pos.x = avatarData["x"].get<float>();
        if (avatarData.contains("y")) avatar->pos.y = avatarData["y"].get<float>();
        if (avatarData.contains("z")) avatar->pos.z = avatarData["z"].get<float>();
        if (avatarData.contains("facing")) avatar->facing = static_cast<Direction>(avatarData["facing"].get<int>());
        // update other render properties if present
        if (avatarData.contains("animFrame")) avatar->animFrame = avatarData["animFrame"].get<int>();
    }
}

void World::addEvent(std::shared_ptr<Event> event) {
    if (events.find(event->id) == events.end()) {
        events[event->id] = event;
        eventList.push_back(event);
    }
}

void World::removeEvent(const std::string& eventId) {
    auto it = events.find(eventId);
    if (it != events.end()) {
        eventList.erase(std::remove(eventList.begin(), eventList.end(), it->second), eventList.end());
        events.erase(it);
    }
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
    if (!zone) return false;
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
