#pragma once

#include <glm/glm.hpp>
#include <memory>
#include <vector>
#include <unordered_map>
#include <string>
#include <nlohmann/json.hpp>
#include <map>
#include "Zone.h"
#include "Event.h"
#include "Avatar.h"
#include "ModeManager.h"
#include "ActionQueue.h"

class GLEngine;
class Spritz;

class World {
public:
    World(Spritz* spritz, const std::string& id);
    ~World();

    void init(const std::string& gamePath, const nlohmann::json& manifest);
    // Public wrapper for script bindings to load zones
    void loadZonePublic(const std::string& zoneId);
    void update(double dt);
    void render();

    void addZone(std::shared_ptr<Zone> zone);
    void removeZone(const std::string& zoneId);
    void removeAllZones();
    std::shared_ptr<Zone> getZoneById(const std::string& id) const;
    std::shared_ptr<Sprite> getSpriteById(const std::string& id) const;
    std::shared_ptr<Zone> zoneContaining(float x, float y) const;

    // Avatar management
    std::shared_ptr<Avatar> createAvatar(const nlohmann::json& avatarData);
    void addAvatar(std::shared_ptr<Avatar> avatar);
    void removeAvatar(std::shared_ptr<Avatar> avatar);
    std::shared_ptr<Avatar> getAvatar() const;

    // Remote avatars for networking
    void addRemoteAvatar(const std::string& clientId, const nlohmann::json& avatarData);
    void removeRemoteAvatar(const std::string& clientId);
    void updateRemoteAvatar(const std::string& clientId, const nlohmann::json& avatarData);
    void applyRemoteAction(const std::string& clientId, const std::string& action, const nlohmann::json& params, const std::string& spriteId);

    // Event management
    void addEvent(std::shared_ptr<Event> event);
    void removeEvent(const std::string& eventId);
    void removeAllActions();

    // Scripting - run world-level or zone-level triggers
    void runScripts(const std::string& trigger, const std::unordered_map<std::string, std::string>& params = {});

    // Pathfinding
    std::vector<std::vector<float>> pathFind(const std::vector<float>& from, const std::vector<float>& to) const;

    // Tick and input handling
    void tick(double time);
    void tickOuter(double time);
    void checkInput(double time);
    void startMenu(const nlohmann::json& menuConfig, const std::vector<std::string>& defaultMenus = {"start"});
    void runAfterTick(const std::function<void()>& action);

    // Drawing
    void draw();

    // Engine reference
    Spritz* spritz;
    GLEngine* engine;
    std::string id;
    int objId;
    std::string gamePath;
    nlohmann::json manifest;

    // Zone management
    std::unordered_map<std::string, std::shared_ptr<Zone>> zoneDict;
    std::vector<std::shared_ptr<Zone>> zoneList;

    // Remote avatars
    std::map<std::string, std::shared_ptr<Avatar>> remoteAvatars;

    // Sprite management
    std::unordered_map<std::string, std::shared_ptr<Sprite>> spriteDict;
    std::vector<std::shared_ptr<Sprite>> spriteList;

    // Object management
    std::unordered_map<std::string, std::shared_ptr<Sprite>> objectDict;
    std::vector<std::shared_ptr<Sprite>> objectList;

    // Tileset management
    std::unordered_map<std::string, std::shared_ptr<Tileset>> tilesetDict;
    std::vector<std::shared_ptr<Tileset>> tilesetList;

    // Event management
    std::vector<std::shared_ptr<Event>> eventList;
    std::unordered_map<std::string, std::shared_ptr<Event>> eventDict;

    // Timing and state
    double lastKey;
    double lastZoneTransitionTime;
    bool isPaused;

    // Managers
    std::shared_ptr<ModeManager> modeManager;
    std::shared_ptr<ActionQueue> afterTickActions;

    // Menu configuration
    nlohmann::json menuConfig;

private:
    void loadZone(const std::string& zoneId);
    void loadZoneFromZip(const std::string& zoneId, const std::string& zipPath, bool skipCache = false, const nlohmann::json& transitionParams = {});
    void createTestZone();
    void sortZones();
    bool canWalk(const std::vector<float>& neighbour, const std::string& jsonNeighbour, const std::vector<std::string>& visited) const;
    std::vector<std::vector<float>> getNeighbours(float x, float y) const;
};
