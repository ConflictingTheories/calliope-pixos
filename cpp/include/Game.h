#pragma once
#include "Camera.h"
#include "Grid.h"
#include "Unit.h"
#include "Renderer.h"
#include "InputHandler.h"
#include <GLFW/glfw3.h>
#include <vector>
#include <memory>

struct Ability
{
    std::string name;
    int mpCost;
    int power;
    int range; // for AOE
};

class Game
{
public:
    Game();
    ~Game();

    void init();
    void run();

private:
    GLFWwindow *window;
    Camera camera;
    Grid grid;
    std::vector<Unit> units;
    Unit *selectedUnit = nullptr;
    Renderer renderer;
    std::unique_ptr<InputHandler> inputHandler;

    std::vector<Ability> abilities = {
        {"Slash", 10, 30, 0},
        {"Fireball", 20, 40, 1},
        {"Warp", 15, 0, 0}};

    void createUnits();
    void update(float deltaTime);
    void render();
    void castAbility(int abilityIndex);
    void moveUnit(Unit &unit, int col, int row);
    void applyDamage(Unit &unit, int dmg);
    void spawnAOE(int cx, int cz, int radius);
    const std::vector<std::string> getAbilityNames() const;
};
