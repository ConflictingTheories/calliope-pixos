#pragma once
#include <memory>
#include <string>
#include "RenderManager.h"
#include "InputManager.h"
#include "ModeManager.h"
#include "World.h"

// Forward declaration for GLFW
struct GLFWwindow;

class GLEngine {
public:
    GLEngine();
    ~GLEngine();

    void init(int width, int height, const std::string& title);
    void run();
    void shutdown();

    // Managers
    std::unique_ptr<RenderManager> renderManager;
    std::unique_ptr<InputManager> inputManager;
    std::unique_ptr<ModeManager> modeManager;
    std::unique_ptr<World> world;

    // Window
    GLFWwindow* window;
    int windowWidth, windowHeight;
    std::string windowTitle;

    // Game state
    bool isRunning;
    double lastTime;
    double deltaTime;

private:
    void update(double dt);
    void render();
    void handleInput();

    static void framebufferSizeCallback(GLFWwindow* window, int width, int height);
    static void keyCallback(GLFWwindow* window, int key, int scancode, int action, int mods);
    static void mouseCallback(GLFWwindow* window, double xpos, double ypos);
};
