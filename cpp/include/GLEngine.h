#pragma once

#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>

#include "InputManager.h"
#include "RenderManager.h"
#include "ModeManager.h"
#include "World.h"
#include "ScriptInterpreter.h"
#include "CutsceneManager.h"

class Camera;

class GLEngine {
private:
    GLFWwindow* window;
    std::unique_ptr<RenderManager> renderManager;
    std::unique_ptr<InputManager> inputManager;
    std::unique_ptr<ModeManager> modeManager;
    std::unique_ptr<World> world;
    std::unique_ptr<ScriptInterpreter> scriptInterpreter;
    std::unique_ptr<CutsceneManager> cutsceneManager;
    // Engine-level camera accessible to scripts/events
    std::unique_ptr<Camera> camera;

    std::string gamePath;
    nlohmann::json manifest;

public:
    // Getters for managers
    RenderManager* getRenderManager() { return renderManager.get(); }
    InputManager* getInputManager() { return inputManager.get(); }
    ModeManager* getModeManager() { return modeManager.get(); }
    World* getWorld() { return world.get(); }
    ScriptInterpreter* getScriptInterpreter() { return scriptInterpreter.get(); }
    CutsceneManager* getCutsceneManager() { return cutsceneManager.get(); }
    Camera* getCamera() { return camera.get(); }

    GLFWwindow* getWindow() { return window; }

    std::string greeting;

    // Speech synthesis voice - placeholder
    std::string voice;

    bool initialized;

public:
    GLEngine();
    GLEngine(const std::string& gamePath, const nlohmann::json& manifest);
    ~GLEngine();

    bool init();
    bool init(int width, int height, const std::string& title);
    void render();
    void update(float dt);
    void run();
    void shutdown();
    void setGreeting(const std::string& text);
    void speechSynthesis(const std::string& text, const std::string* voice = nullptr,
                        const std::string* lang = nullptr, float* rate = nullptr,
                        float* volume = nullptr, float* pitch = nullptr);
    glm::vec2 screenSize() const;
};
