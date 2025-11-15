#include "GLEngine.h"
#include "RenderManager.h"
#include "InputManager.h"
#include "ModeManager.h"
#include "World.h"
#include "Spritz.h"
#include "Camera.h"
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

GLEngine::GLEngine() : window(nullptr), initialized(false) {}

GLEngine::GLEngine(const std::string& gamePath, const nlohmann::json& manifest)
    : window(nullptr), initialized(false), gamePath(gamePath), manifest(manifest) {}

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

    // Managers and world will be created after package selection in run()

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

    // Clear the screen
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    if (renderManager) {
        renderManager->render();
    }
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

glm::vec2 GLEngine::screenSize() const {
    int width, height;
    glfwGetWindowSize(window, &width, &height);
    return glm::vec2(width, height);
}
