#include "World.h"
#include "GLEngine.h"
#include "Avatar.h"
#include "Event.h"
#include <algorithm>
#include <iostream>
#include <fstream>
#include <nlohmann/json.hpp>

World::World(GLEngine* eng) : engine(eng) {}

World::~World() {}

void World::init(const std::string& gamePath, const nlohmann::json& manifest) {
    this->gamePath = gamePath;
    this->manifest = manifest;

    // Load initial zones from manifest
    if (manifest.contains("initialZones")) {
        for (const auto& zoneId : manifest["initialZones"]) {
            loadZone(zoneId);
        }
    }

    std::cout << "World initialized with " << zones.size() << " zones" << std::endl;
}

void World::loadZone(const std::string& zoneId) {
    std::string mapPath = gamePath + "/maps/" + zoneId + "/map.json";
    std::ifstream mapFile(mapPath);
    if (!mapFile.is_open()) {
        std::cerr << "Failed to load map: " << mapPath << std::endl;
        return;
    }

    nlohmann::json mapData;
    mapFile >> mapData;
    mapFile.close();

    auto zone = std::make_shared<Zone>(zoneId, this);
    zone->loadFromJson(mapData, gamePath);
    addZone(zone);

    std::cout << "Loaded zone: " << zoneId << std::endl;
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

void World::addRemoteAvatar(int clientId, const std::unordered_map<std::string, float>& avatarData) {
    if (remoteAvatars.find(clientId) != remoteAvatars.end()) {
        // Update existing
        updateRemoteAvatar(clientId, avatarData);
        return;
    }

    auto avatar = std::make_shared<Avatar>(engine);
    avatar->id = "remote_" + std::to_string(clientId);
    avatar->pos = glm::vec3(avatarData.at("x"), avatarData.at("y"), avatarData.at("z"));
    avatar->facing = avatarData.at("facing");

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

void World::updateRemoteAvatar(int clientId, const std::unordered_map<std::string, float>& avatarData) {
    auto it = remoteAvatars.find(clientId);
    if (it != remoteAvatars.end()) {
        auto avatar = it->second;
        avatar->pos.x = avatarData.at("x");
        avatar->pos.y = avatarData.at("y");
        avatar->pos.z = avatarData.at("z");
        avatar->facing = avatarData.at("facing");
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
