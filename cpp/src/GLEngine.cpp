#include "GLEngine.h"
#include "RenderManager.h"
#include "InputManager.h"
#include "ModeManager.h"
#include "World.h"
#include <iostream>
#include <nlohmann/json.hpp>

GLEngine::GLEngine()
    : window(nullptr), initialized(false) {
}

GLEngine::GLEngine(const std::string& gamePath, const nlohmann::json& manifest)
    : window(nullptr), initialized(false), gamePath(gamePath), manifest(manifest) {
}

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

    if (glewInit() != GLEW_OK) {
        std::cerr << "Failed to initialize GLEW" << std::endl;
        return false;
    }

    // Initialize managers
    renderManager = std::make_unique<RenderManager>(this);
    inputManager = std::make_unique<InputManager>(this);
    modeManager = std::make_unique<ModeManager>(this);
    world = std::make_unique<World>(this);

    // Initialize render manager
    renderManager->init();

    // Initialize world if manifest is available
    if (!manifest.empty()) {
        world->init(gamePath, manifest);
    }

    initialized = true;
    return true;
}

void GLEngine::render() {
    if (!initialized) return;

    renderManager->render();
    glfwSwapBuffers(window);
}

void GLEngine::update(float dt) {
    if (!initialized) return;

    inputManager->update(dt);
    modeManager->update(dt);
    world->update(dt);
}

void GLEngine::setGreeting(const std::string& text) {
    greeting = text;
    std::cout << "Setting GREETING: " << text << std::endl;
}

void GLEngine::speechSynthesis(const std::string& text, const std::string* voice,
                              const std::string* lang, float* rate,
                              float* volume, float* pitch) {
    // Placeholder - implement speech synthesis if needed
    std::cout << "Speech synthesis: " << text << std::endl;
}

glm::vec2 GLEngine::screenSize() const {
    int width, height;
    glfwGetWindowSize(window, &width, &height);
    return glm::vec2(width, height);
}

void GLEngine::run() {
    double lastTime = glfwGetTime();
    while (!glfwWindowShouldClose(window)) {
        double currentTime = glfwGetTime();
        float deltaTime = static_cast<float>(currentTime - lastTime);
        lastTime = currentTime;

        update(deltaTime);
        render();

        glfwPollEvents();
    }
}

void GLEngine::shutdown() {
    if (window) {
        glfwDestroyWindow(window);
        glfwTerminate();
    }
}
