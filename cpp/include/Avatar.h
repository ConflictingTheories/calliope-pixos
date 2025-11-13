#pragma once

#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>
#include <unordered_map>
#include <nlohmann/json.hpp>
#include "Sprite.h"
#include "Action.h"
#include "Direction.h"

class GLEngine;
class Zone;

class Avatar : public Sprite {
public:
    Avatar(GLEngine* engine);
    ~Avatar();

    void init() override;
    void update(double dt) override;
    void render() override;

    // Movement
    void moveTo(const glm::vec3& position, float duration = 0.0f);
    void faceDirection(Direction dir);
    Direction getFacingDirection() const;

    // Actions
    void addAction(std::shared_ptr<Action> action);
    void clearActions();

    // Input handling
    void handleInput();
    void performAction(const std::string& action, const std::vector<std::string>& params);

    // Dialogue and menus
    void openMenu(const std::unordered_map<std::string, std::string>& menuConfig = {}, const std::vector<std::string>& defaultMenus = {});
    void showDialogue(const std::string& text, const std::unordered_map<std::string, std::string>& options = {});

    // Walking input
    void handleWalk(const std::string& key, const std::unordered_map<std::string, bool>& touchmap = {});

    // Inventory
    void addItem(const std::string& itemId, int quantity = 1);
    void removeItem(const std::string& itemId, int quantity = 1);
    int getItemCount(const std::string& itemId) const;

    // Dialogue
    void speak(const std::string& text, float duration = 3.0f);

    // Properties
    Direction facing;
    std::unordered_map<std::string, int> inventory;
    std::string gender;
    std::string portrait;
    bool blocking;
    bool override;

    // Lighting
    bool isLit;
    int lightIndex;
    glm::vec3 lightColor;
    float density;

    // Selection
    bool isSelected;

private:
    std::vector<std::shared_ptr<Action>> actionQueue;
    float speechTimer;
    std::string currentSpeech;
    std::vector<std::string> currentActions;
};
