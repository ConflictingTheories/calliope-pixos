#pragma once

#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>
#define GLEW_NO_GLU
#include <GL/glew.h>
#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>
#include <nlohmann/json.hpp>

#include "InputManager.h"
#include "RenderManager.h"
#include "World.h"
#include "ModeManager.h"
#include "ScriptInterpreter.h"
#include "CutsceneManager.h"
#include "Hud.h"
#include "Database.h"
#include "Store.h"
#include "NetworkManager.h"
#include "ResourceManager.h"
#include "AudioManager.h"

class Camera;
class Spritz;

class GLEngine {
private:
    GLFWwindow* window;
    std::unique_ptr<RenderManager> renderManager;
    std::unique_ptr<InputManager> inputManager;
    std::unique_ptr<ModeManager> modeManager;
    std::unique_ptr<World> world;
    std::unique_ptr<ScriptInterpreter> scriptInterpreter;
    std::unique_ptr<CutsceneManager> cutsceneManager;
    std::unique_ptr<Hud> hud;
    std::unique_ptr<Database> database;
    std::unique_ptr<Store> store;
    std::unique_ptr<NetworkManager> networkManager;
    std::unique_ptr<ResourceManager> resourceManager;
    std::unique_ptr<AudioManager> audioManager;
    // Engine-level camera accessible to scripts/events
    std::unique_ptr<Camera> camera;
    std::unique_ptr<Spritz> spritz;

    std::string gamePath;
    nlohmann::json manifest;

    // Game loop
    bool running;
    int frameCount;
    double time;

    // Speech synthesis
    std::string voiceText;
    std::string voiceLang;
    float voiceRate;
    float voiceVolume;
    float voicePitch;

    // Fullscreen
    bool fullscreen;

    // Canvas equivalents
    int width, height;

public:
    // Getters for managers
    RenderManager* getRenderManager() { return renderManager.get(); }
    InputManager* getInputManager() { return inputManager.get(); }
    ModeManager* getModeManager() { return modeManager.get(); }
    World* getWorld();
    ScriptInterpreter* getScriptInterpreter() { return scriptInterpreter.get(); }
    CutsceneManager* getCutsceneManager() { return cutsceneManager.get(); }
    Hud* getHud() { return hud.get(); }
    Database* getDatabase() { return database.get(); }
    Store* getStore() { return store.get(); }
    NetworkManager* getNetworkManager() { return networkManager.get(); }
    ResourceManager* getResourceManager() { return resourceManager.get(); }
    AudioManager* getAudioManager() { return audioManager.get(); }
    Camera* getCamera() { return camera.get(); }
    Spritz* getSpritz() { return spritz.get(); }

    GLFWwindow* getWindow() { return window; }

    InputManager* getGamepad() { return inputManager.get(); }

    // Deprecated: Use inputManager instead
    InputManager* keyboard;
    InputManager* mouse;
    InputManager* touch;

    void toggleFullscreen();

    std::string greeting;

    // Speech synthesis voice
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
    void close();
    int getSelectedObject(const std::string& type = "sprite|object|tile", bool useFrustum = false);
    void setGreeting(const std::string& text);
    void speechSynthesis(const std::string& text, const std::string* voice = nullptr,
                        const std::string* lang = nullptr, float* rate = nullptr,
                        float* volume = nullptr, float* pitch = nullptr);
    glm::vec2 screenSize() const;
};
