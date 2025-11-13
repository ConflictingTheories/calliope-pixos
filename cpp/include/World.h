#pragma once

#include <memory>
#include <vector>
#include <unordered_map>
#include <string>
#include <nlohmann/json.hpp>
#include "Zone.h"
#include "Event.h"
#include "Avatar.h"

class GLEngine;

class World {
public:
    World(GLEngine* engine);
    ~World();

    void init(const std::string& gamePath, const nlohmann::json& manifest);
    void update(double dt);
    void render();

    void addZone(std::shared_ptr<Zone> zone);
    void removeZone(const std::string& zoneId);
    std::shared_ptr<Zone> getZoneById(const std::string& id) const;
    std::shared_ptr<Zone> zoneContaining(float x, float y) const;

    // Avatar management
    void addAvatar(std::shared_ptr<Avatar> avatar);
    void removeAvatar(std::shared_ptr<Avatar> avatar);
    std::shared_ptr<Avatar> getAvatar() const;

    // Remote avatars for networking
    void addRemoteAvatar(int clientId, const std::unordered_map<std::string, float>& avatarData);
    void removeRemoteAvatar(int clientId);
    void updateRemoteAvatar(int clientId, const std::unordered_map<std::string, float>& avatarData);

    // Event management
    void addEvent(std::shared_ptr<Event> event);
    void removeEvent(const std::string& eventId);

    // Pathfinding
    std::vector<std::vector<float>> pathFind(const std::vector<float>& from, const std::vector<float>& to) const;

    // Engine reference
    GLEngine* engine;
    std::string gamePath;
    nlohmann::json manifest;

private:
    std::unordered_map<std::string, std::shared_ptr<Zone>> zones;
    std::vector<std::shared_ptr<Zone>> zoneList;
    std::unordered_map<int, std::shared_ptr<Avatar>> remoteAvatars;
    std::unordered_map<std::string, std::shared_ptr<Event>> events;
    std::vector<std::shared_ptr<Event>> eventList;

    void sortZones();
    bool canWalk(const std::vector<float>& neighbour, const std::string& jsonNeighbour, const std::vector<std::string>& visited) const;
    std::vector<std::vector<float>> getNeighbours(float x, float y) const;
};
