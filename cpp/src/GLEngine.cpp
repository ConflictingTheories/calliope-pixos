#include "GLEngine.h"
#include "RenderManager.h"
#include "InputManager.h"
#include "ModeManager.h"
#include "World.h"
#include "Spritz.h"
#include "Camera.h"
#include "Hud.h"
#include "Database.h"
#include "Store.h"
#include "NetworkManager.h"
#include "ResourceManager.h"
#include "AudioManager.h"
#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <filesystem>
#include <nlohmann/json.hpp>
#include <glm/glm.hpp>
#include <GLFW/glfw3.h>
#include "imgui.h"
#include "imgui_impl_glfw.h"
#include "imgui_impl_opengl3.h"

GLEngine::GLEngine() : window(nullptr), initialized(false), running(false), frameCount(0), time(0.0), fullscreen(false), width(800), height(600) {}

GLEngine::GLEngine(const std::string& gamePath, const nlohmann::json& manifest)
    : window(nullptr), initialized(false), running(false), frameCount(0), time(0.0), fullscreen(false), gamePath(gamePath), manifest(manifest), width(800), height(600) {}

GLEngine::~GLEngine() {
    if (window) {
        glfwDestroyWindow(window);
        glfwTerminate();
    }
}

bool GLEngine::init() {
    return init(800, 600, "Pixospritz OpenGL");
}

bool GLEngine::init(int width, int height, const std::string& title) {
    if (!glfwInit()) {
        std::cerr << "Failed to initialize GLFW" << std::endl;
        return false;
    }

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);

    window = glfwCreateWindow(width, height, title.c_str(), nullptr, nullptr);
    if (!window) {
        std::cerr << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return false;
    }

    glfwMakeContextCurrent(window);
    glfwSwapInterval(1); // Enable vsync

    // Set user pointer to this engine
    glfwSetWindowUserPointer(window, this);

    // Set GLFW callbacks
    glfwSetKeyCallback(window, [](GLFWwindow* window, int key, int scancode, int action, int mods) {
        GLEngine* engine = static_cast<GLEngine*>(glfwGetWindowUserPointer(window));
        if (engine && engine->spritz) {
            engine->spritz->onKeyEvent(key, scancode, action, mods);
        }
    });

    glfwSetMouseButtonCallback(window, [](GLFWwindow* window, int button, int action, int mods) {
        GLEngine* engine = static_cast<GLEngine*>(glfwGetWindowUserPointer(window));
        if (engine && engine->spritz) {
            engine->spritz->onMouseEvent(button, action, mods);
        }
    });

    glfwSetCursorPosCallback(window, [](GLFWwindow* window, double xpos, double ypos) {
        GLEngine* engine = static_cast<GLEngine*>(glfwGetWindowUserPointer(window));
        if (engine && engine->spritz) {
            engine->spritz->onCursorPos(xpos, ypos);
        }
    });

    glfwSetScrollCallback(window, [](GLFWwindow* window, double xoffset, double yoffset) {
        GLEngine* engine = static_cast<GLEngine*>(glfwGetWindowUserPointer(window));
        if (engine && engine->spritz) {
            engine->spritz->onScroll(xoffset, yoffset);
        }
    });

    if (glewInit() != GLEW_OK) {
        std::cerr << "Failed to initialize GLEW" << std::endl;
        return false;
    }

    // Initialize managers
    networkManager = std::make_unique<NetworkManager>(this);
    resourceManager = std::make_unique<ResourceManager>(this);
    renderManager = std::make_unique<RenderManager>(this);
    inputManager = std::make_unique<InputManager>(this);
    hud = std::make_unique<Hud>(this);
    database = std::make_unique<Database>(this);
    store = std::make_unique<Store>(this);
    audioManager = std::make_unique<AudioManager>(this);

    // Initialize input manager
    inputManager->init();

    // Initialize HUD
    hud->init();

    // Initialize render manager
    renderManager->init();

    // Deprecated pointers
    keyboard = inputManager.get();
    mouse = inputManager.get();
    touch = inputManager.get();

    // Initialize network if enabled
    if (manifest.contains("network") && manifest["network"]["enabled"]) {
        // networkManager->connect(manifest["network"]["url"], 8080); // TODO: Parse URL
        if (manifest["network"].contains("authority")) {
            // networkManager->setAuthority(manifest["network"]["authority"]);
        }
    }

    // Initialize Spritz
    spritz = std::make_unique<Spritz>(this);
    spritz->init(gamePath, manifest);

    // Setup ImGui context and backends (only once, after OpenGL context is current)
    IMGUI_CHECKVERSION();
    ImGui::CreateContext();
    ImGuiIO& io = ImGui::GetIO(); (void)io;
    ImGui::StyleColorsDark();
    ImGui_ImplGlfw_InitForOpenGL(window, true);
    ImGui_ImplOpenGL3_Init("#version 330");

    initialized = true;
    return true;
}

void GLEngine::render() {
    if (!initialized) return;

    frameCount++;

    // Reset debug counters at the start of each frame
    // if (renderManager && renderManager->resetDebugCounters) {
    //     renderManager->resetDebugCounters();
    // }

    // Clear canvases
    // hud->clearHud();
    // Draw active mode label (if any)
    // if (hud->drawModeLabel) hud->drawModeLabel();
    // renderManager->clearScreen();

    double timestamp = glfwGetTime() * 1000.0; // Convert to milliseconds

    // Update Input Manager
    inputManager->update(timestamp);

    // Object picking pass (for selection) - only if mode has picker enabled
    // if (modeManager->hasPicker()) {
    //     // Enable picker shader
    //     renderManager->activatePickerShaderProgram(false);
    //     spritz->render(this, timestamp); // Render scene for picking pass
    // }

    // Update and render based on the active game mode
    if (!inputManager->handleInput(timestamp)) {
        // If mode doesn't handle input, do default update
        spritz->update(timestamp);
    }

    // Sync input mode with game mode
    // const std::string currentMode = modeManager->getMode();
    // if (currentMode != inputManager->getMode()) {
    //     inputManager->setMode(currentMode);
    // }

    // Core render loop (actually render scene to screen)
    // renderManager->clearScreen();
    // Draw skybox first, with depth writes disabled
    glDepthMask(false);
    // renderManager->renderSkybox();
    glDepthMask(true);
    // Now draw world tiles/objects, then sprites
    // renderManager->activateShaderProgram();

    // modeManager->update(timestamp); // Update active mode

    // Allow particle system to update physics with a stable timestamp
    // if (renderManager->updateParticles) {
    //     try { renderManager->updateParticles(timestamp); } catch (const std::exception& e) { std::cerr << "updateParticles failed: " << e.what() << std::endl; }
    // }

    spritz->render(); // Render scene (might be overridden by mode)

    // cutsceneManager->update(); // Update cutscene (if applicable)
    // renderManager->updateTransition(); // Update transitions

    // Render particles after main scene but before HUD/gamepad
    // if (renderManager->renderParticles) {
    //     try { renderManager->renderParticles(); } catch (const std::exception& e) { std::cerr << "renderParticles failed: " << e.what() << std::endl; }
    // }

    // Render gamepad (may be optimizable?)
    inputManager->renderGamepad();

    // Update debug overlay if enabled
    // TODO: Implement debug overlays

    glfwSwapBuffers(window);
}

void GLEngine::update(float dt) {
    if (inputManager) {
        inputManager->update(dt);
    }
    if (modeManager) {
        modeManager->update(dt);
    }
    if (spritz) {
        spritz->update(dt);
    }
}

void GLEngine::setGreeting(const std::string& text) {
    bool packageSelected = false;
    std::string selectedZip;
    char zipPathBuffer[1024] = "";
    while (!packageSelected && !glfwWindowShouldClose(window)) {
        glfwPollEvents();
        ImGui_ImplOpenGL3_NewFrame();
        ImGui_ImplGlfw_NewFrame();
        ImGui::NewFrame();
        ImGui::Begin("Select Game Package");
        ImGui::Text("Enter the full path to a .zip game package, or paste it here:");
        ImGui::InputText(".zip file path", zipPathBuffer, sizeof(zipPathBuffer));
        if (ImGui::Button("Load Package")) {
            selectedZip = std::string(zipPathBuffer);
            if (!selectedZip.empty() && std::filesystem::exists(selectedZip)) {
                packageSelected = true;
            }
        }
        ImGui::End();
        ImGui::Render();
        int display_w, display_h;
        glfwGetFramebufferSize(window, &display_w, &display_h);
        glViewport(0, 0, display_w, display_h);
        glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
        glfwSwapBuffers(window);
    }
    // Removed ImGui::EndFrame();
    // Extract and load selected package
    if (packageSelected) {
        std::string tempExtracted = std::filesystem::temp_directory_path().string() + "/pixospritz_temp_extracted";
        std::string extractCmd = "unzip -q \"" + selectedZip + "\" -d \"" + tempExtracted + "\"";
        int result = system(extractCmd.c_str());
        if (result == 0) {
            std::string manifestPath = tempExtracted + "/manifest.json";
            if (!std::filesystem::exists(manifestPath)) {
                std::cerr << "Manifest not found in extracted package: " << manifestPath << std::endl;
            } else {
                std::ifstream manifestFile(manifestPath);
                nlohmann::json manifestJson;
                if (manifestFile.is_open()) {
                    manifestFile >> manifestJson;
                    manifestFile.close();
                    // Assign to engine state
                    gamePath = tempExtracted;
                    manifest = manifestJson;
                    // Ensure managers and interpreter exist
                                renderManager = std::make_unique<RenderManager>(this);
                                inputManager = std::make_unique<InputManager>(this);
                                spritz = std::make_unique<Spritz>(this); // Create spritz instead of world
                                modeManager = std::make_unique<ModeManager>(spritz->world.get());
                                scriptInterpreter = std::make_unique<ScriptInterpreter>(this);
                                scriptInterpreter->init();
                                cutsceneManager = std::make_unique<CutsceneManager>(this);
                                // create engine camera
                                camera = std::make_unique<Camera>();
                                camera->init();
                    renderManager->init();
                    spritz->init(gamePath, manifest);
                } else {
                    std::cerr << "Failed to open manifest file: " << manifestPath << std::endl;
                }
            }
        } else {
            std::cerr << "Failed to extract selected ZIP file: " << selectedZip << std::endl;
        }
    }
}

World* GLEngine::getWorld() {
    return spritz ? spritz->world.get() : nullptr;
}

void GLEngine::run() {
    bool packageSelected = !(gamePath.empty() || manifest.empty());
    std::string selectedZip;
    char zipPathBuffer[1024] = "";
    double lastTime = glfwGetTime();
    // If the engine was started with a package already provided, create managers and initialize world
    if (packageSelected) {
        renderManager = std::make_unique<RenderManager>(this);
        inputManager = std::make_unique<InputManager>(this);
        spritz = std::make_unique<Spritz>(this);
        modeManager = std::make_unique<ModeManager>(spritz->world.get());
        scriptInterpreter = std::make_unique<ScriptInterpreter>(this);
        scriptInterpreter->init();
        cutsceneManager = std::make_unique<CutsceneManager>(this);
        camera = std::make_unique<Camera>();
        camera->init();
        renderManager->init();
        spritz->init(gamePath, manifest);
    } else {
        // Initialize managers even if no package is selected yet, to avoid null pointer dereference
        renderManager = std::make_unique<RenderManager>(this);
        inputManager = std::make_unique<InputManager>(this);
        spritz = std::make_unique<Spritz>(this);
        modeManager = std::make_unique<ModeManager>(spritz->world.get());
        scriptInterpreter = std::make_unique<ScriptInterpreter>(this);
        scriptInterpreter->init();
        cutsceneManager = std::make_unique<CutsceneManager>(this);
        camera = std::make_unique<Camera>();
        camera->init();
        renderManager->init();
    }
    while (!glfwWindowShouldClose(window)) {
        double currentTime = glfwGetTime();
        float deltaTime = static_cast<float>(currentTime - lastTime);
        lastTime = currentTime;
        glfwPollEvents();
        ImGui_ImplOpenGL3_NewFrame();
        ImGui_ImplGlfw_NewFrame();
        ImGui::NewFrame();
        int display_w, display_h;
        glfwGetFramebufferSize(window, &display_w, &display_h);
        glViewport(0, 0, display_w, display_h);
        if (!packageSelected) {
            glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            ImGui::Begin("Select Game Package");
            ImGui::Text("Enter the full path to a .zip game package, or paste it here:");
            ImGui::InputText(".zip file path", zipPathBuffer, sizeof(zipPathBuffer));
            if (ImGui::Button("Load Package")) {
                selectedZip = std::string(zipPathBuffer);
                if (!selectedZip.empty() && std::filesystem::exists(selectedZip)) {
                    // Extract and load selected package
                    std::string tempExtracted = std::filesystem::temp_directory_path().string() + "/pixospritz_temp_extracted";
                    std::string extractCmd = "unzip -o -q \"" + selectedZip + "\" -d \"" + tempExtracted + "\"";
                    int result = system(extractCmd.c_str());
                    if (result == 0) {
                        std::string manifestPath = tempExtracted + "/manifest.json";
                        if (std::filesystem::exists(manifestPath)) {
                            std::ifstream manifestFile(manifestPath);
                            nlohmann::json manifestJson;
                            if (manifestFile.is_open()) {
                                manifestFile >> manifestJson;
                                manifestFile.close();
                                gamePath = tempExtracted;
                                manifest = manifestJson;
                                // Now create managers and world
                                renderManager = std::make_unique<RenderManager>(this);
                                inputManager = std::make_unique<InputManager>(this);
                                spritz = std::make_unique<Spritz>(this); // Create spritz instead of world
                                modeManager = std::make_unique<ModeManager>(spritz->world.get());
                                scriptInterpreter = std::make_unique<ScriptInterpreter>(this);
                                scriptInterpreter->init();
                                cutsceneManager = std::make_unique<CutsceneManager>(this);
                                renderManager->init();
                                spritz->init(gamePath, manifest);
                                packageSelected = true;
                            }
                        }
                    }
                }
            }
            ImGui::End();
            ImGui::Render();
            ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
        } else {
            // Only update and render game after package is selected
            update(deltaTime);
            render();
            ImGui::Render();
            ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
        }
        glfwSwapBuffers(window);
    }
}

void GLEngine::close() {
    running = false;
    if (window) {
        glfwSetWindowShouldClose(window, GLFW_TRUE);
    }
}

void GLEngine::shutdown() {
    // Shutdown ImGui (only once)
    ImGui_ImplOpenGL3_Shutdown();
    ImGui_ImplGlfw_Shutdown();
    ImGui::DestroyContext();
    if (scriptInterpreter) {
        scriptInterpreter->shutdown();
        scriptInterpreter.reset();
    }
    if (window) {
        glfwDestroyWindow(window);
        glfwTerminate();
    }
}

int GLEngine::getSelectedObject(const std::string& type, bool useFrustum) {
    // When FreeCam is active, suppress picking
    // TODO: Implement freecam check
    if (false) return -1; // Placeholder
    if (!spritz || !spritz->world || (spritz->world->spriteList.empty() && spritz->world->objectList.empty() && spritz->world->zoneList.empty())) {
        return -1; // No pickable objects
    }

    // TODO: Implement object picking logic using color picking
    // For now, return -1
    return -1;
}

void GLEngine::speechSynthesis(const std::string& text, const std::string* voice, const std::string* lang, float* rate, float* volume, float* pitch) {
    // Placeholder for speech synthesis
    // In WebGL, this uses SpeechSynthesis API
    // In C++, could use a library like espeak or TTS
    voiceText = text;
    if (voice) this->voice = *voice;
    if (lang) voiceLang = *lang;
    if (rate) voiceRate = *rate;
    if (volume) voiceVolume = *volume;
    if (pitch) voicePitch = *pitch;
    // TODO: Implement actual TTS
    std::cout << "Speech: " << text << std::endl;
}

glm::vec2 GLEngine::screenSize() const {
    int width, height;
    glfwGetWindowSize(window, &width, &height);
    return glm::vec2(width, height);
}

void GLEngine::toggleFullscreen() {
    static bool fullscreen = false;
    static int windowed_x, windowed_y, windowed_width, windowed_height;
    
    if (!fullscreen) {
        // Save windowed position and size
        glfwGetWindowPos(window, &windowed_x, &windowed_y);
        glfwGetWindowSize(window, &windowed_width, &windowed_height);
        
        // Get monitor
        GLFWmonitor* monitor = glfwGetPrimaryMonitor();
        const GLFWvidmode* mode = glfwGetVideoMode(monitor);
        
        // Set fullscreen
        glfwSetWindowMonitor(window, monitor, 0, 0, mode->width, mode->height, mode->refreshRate);
        fullscreen = true;
    } else {
        // Restore windowed
        glfwSetWindowMonitor(window, nullptr, windowed_x, windowed_y, windowed_width, windowed_height, 0);
        fullscreen = false;
    }
}
