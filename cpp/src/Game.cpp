#include "Game.h"
#include <iostream>
#include <chrono>

Game::Game() : window(nullptr), selectedUnit(nullptr) {}

Game::~Game()
{
    if (window)
        glfwDestroyWindow(window);
    glfwTerminate();
}

void Game::init()
{
    if (!glfwInit())
        throw std::runtime_error("Failed to initialize GLFW");

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    window = glfwCreateWindow(1280, 720, "Disgaea OpenGL", nullptr, nullptr);
    if (!window)
        throw std::runtime_error("Failed to create GLFW window");

    glfwMakeContextCurrent(window);
    glfwSwapInterval(1); // VSync

    if (glewInit() != GLEW_OK)
        throw std::runtime_error("Failed to initialize GLEW");

    renderer.init(window);
    createUnits();
    inputHandler = std::make_unique<InputHandler>(window, camera, grid, units, selectedUnit);
}

void Game::run()
{
    auto lastTime = std::chrono::high_resolution_clock::now();
    while (!glfwWindowShouldClose(window))
    {
        auto currentTime = std::chrono::high_resolution_clock::now();
        float deltaTime = std::chrono::duration<float>(currentTime - lastTime).count();
        lastTime = currentTime;

        update(deltaTime);
        render();

        glfwSwapBuffers(window);
        glfwPollEvents();
    }
}

void Game::createUnits()
{
    static int uid = 1;
    units.emplace_back(uid++, "Laharl", 2, 3, 120, 60, true, vec3(0.27f, 0.66f, 1.0f));
    units.emplace_back(uid++, "Etna", 3, 4, 90, 80, true, vec3(0.27f, 0.66f, 1.0f));
    units.emplace_back(uid++, "Prisoner", 8, 3, 150, 20, false, vec3(1.0f, 0.48f, 0.48f));
    units.emplace_back(uid++, "Monster", 9, 5, 110, 30, false, vec3(1.0f, 0.48f, 0.48f));
    // Auto-select Laharl
    selectedUnit = &units[0];
}

void Game::update(float deltaTime)
{
    inputHandler->update(deltaTime);
    // Handle keyboard for abilities (only if not pressed last frame to avoid spam)
    static bool keyPressed[3] = {false, false, false};
    for (int i = 0; i < 3; ++i)
    {
        int key = GLFW_KEY_1 + i;
        if (glfwGetKey(window, key) == GLFW_PRESS)
        {
            if (!keyPressed[i])
            {
                castAbility(i);
                keyPressed[i] = true;
            }
        }
        else
        {
            keyPressed[i] = false;
        }
    }
}

void Game::render()
{
    int fbWidth, fbHeight;
    glfwGetFramebufferSize(window, &fbWidth, &fbHeight);
    glViewport(0, 0, fbWidth, fbHeight);
    int winWidth, winHeight;
    glfwGetWindowSize(window, &winWidth, &winHeight);
    renderer.render(camera, units, grid, selectedUnit, fbWidth, fbHeight);
    renderer.renderUI(selectedUnit, getAbilityNames(), [this](int index) { castAbility(index); }, winWidth, winHeight);
}

void Game::castAbility(int abilityIndex)
{
    if (!selectedUnit || abilityIndex >= abilities.size())
        return;
    const auto &ability = abilities[abilityIndex];
    if (selectedUnit->mp < ability.mpCost)
        return;
    selectedUnit->mp -= ability.mpCost;

    // Simplified: assume target is current mouse position or something
    // For now, just apply to first enemy
    if (ability.name == "Slash")
    {
        for (auto &unit : units)
        {
            if (!unit.isAlly && !unit.isDead())
            {
                applyDamage(unit, ability.power);
                break;
            }
        }
    }
    else if (ability.name == "Fireball")
    {
        spawnAOE(5, 4, 1); // Example AOE
        for (auto &unit : units)
        {
            int dx = std::abs(unit.col - 5);
            int dz = std::abs(unit.row - 4);
            if (std::max(dx, dz) <= 1)
            {
                applyDamage(unit, ability.power);
            }
        }
    }
    else if (ability.name == "Warp")
    {
        // Warp ally to random position
        for (auto &unit : units)
        {
            if (unit.isAlly && &unit != selectedUnit)
            {
                moveUnit(unit, 6, 6);
                break;
            }
        }
    }
}

void Game::moveUnit(Unit &unit, int col, int row)
{
    unit.col = col;
    unit.row = row;
    unit.displayPos = vec3(col * grid.tileSize, 0.0f, row * grid.tileSize);
}

void Game::applyDamage(Unit &unit, int dmg)
{
    unit.takeDamage(dmg);
    // Damage float could be implemented with text rendering, but skipped for simplicity
}

void Game::spawnAOE(int cx, int cz, int radius)
{
    // AOE visualization could be added, but skipped for simplicity
}

const std::vector<std::string> Game::getAbilityNames() const
{
    std::vector<std::string> names;
    for (const auto &ability : abilities)
    {
        names.push_back(ability.name);
    }
    return names;
}
