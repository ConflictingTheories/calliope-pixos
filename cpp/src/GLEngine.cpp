#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include "GLEngine.h"
#include <iostream>
#include <chrono>

GLEngine::GLEngine()
    : window(nullptr), windowWidth(1280), windowHeight(720), windowTitle("Pixospritz OpenGL"),
      isRunning(false), lastTime(0.0), deltaTime(0.0) {}

GLEngine::~GLEngine() {
    shutdown();
}

void GLEngine::init(int width, int height, const std::string& title) {
    windowWidth = width;
    windowHeight = height;
    windowTitle = title;

    // Initialize GLFW
    if (!glfwInit()) {
        throw std::runtime_error("Failed to initialize GLFW");
    }

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    window = glfwCreateWindow(windowWidth, windowHeight, windowTitle.c_str(), nullptr, nullptr);
    if (!window) {
        glfwTerminate();
        throw std::runtime_error("Failed to create GLFW window");
    }

    glfwMakeContextCurrent(window);
    glfwSetWindowUserPointer(window, this);
    glfwSetFramebufferSizeCallback(window, framebufferSizeCallback);
    glfwSetKeyCallback(window, keyCallback);
    glfwSetCursorPosCallback(window, mouseCallback);

    // Initialize GLEW
    if (glewInit() != GLEW_OK) {
        throw std::runtime_error("Failed to initialize GLEW");
    }

    // Initialize managers
    renderManager = std::make_unique<RenderManager>(this);
    inputManager = std::make_unique<InputManager>(this);
    modeManager = std::make_unique<ModeManager>(this);
    world = std::make_unique<World>(this);

    // Initialize components
    renderManager->init();
    inputManager->init();
    modeManager->init();
    world->init();

    isRunning = true;
    lastTime = glfwGetTime();
}

void GLEngine::run() {
    while (isRunning && !glfwWindowShouldClose(window)) {
        double currentTime = glfwGetTime();
        deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        update(deltaTime);
        render();

        glfwSwapBuffers(window);
        glfwPollEvents();
    }
}

void GLEngine::shutdown() {
    if (window) {
        glfwDestroyWindow(window);
        window = nullptr;
    }
    glfwTerminate();
}

void GLEngine::update(double dt) {
    inputManager->update(dt);
    modeManager->update(dt);
    world->update(dt);
}

void GLEngine::render() {
    renderManager->clearScreen();
    world->render();
    renderManager->render();
}

void GLEngine::handleInput() {
    // Input is handled via callbacks and InputManager
}

void GLEngine::framebufferSizeCallback(GLFWwindow* window, int width, int height) {
    GLEngine* engine = static_cast<GLEngine*>(glfwGetWindowUserPointer(window));
    if (engine) {
        engine->windowWidth = width;
        engine->windowHeight = height;
        glViewport(0, 0, width, height);
        if (engine->renderManager) {
            engine->renderManager->initProjection();
        }
    }
}

void GLEngine::keyCallback(GLFWwindow* window, int key, int scancode, int action, int mods) {
    GLEngine* engine = static_cast<GLEngine*>(glfwGetWindowUserPointer(window));
    if (engine && engine->inputManager) {
        engine->inputManager->handleKey(key, scancode, action, mods);
    }
}

void GLEngine::mouseCallback(GLFWwindow* window, double xpos, double ypos) {
    GLEngine* engine = static_cast<GLEngine*>(glfwGetWindowUserPointer(window));
    if (engine && engine->inputManager) {
        engine->inputManager->handleMouse(xpos, ypos);
    }
}
