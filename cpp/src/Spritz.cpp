#include "Spritz.h"
#include "World.h"
#include <iostream>
#include <nlohmann/json.hpp>

Spritz* Spritz::_instance = nullptr;

Spritz* Spritz::getInstance() {
    return _instance;
}

void Spritz::destroyInstance() {
    if (_instance) {
        delete _instance;
        _instance = nullptr;
    }
}

Spritz::Spritz(GLEngine* eng) : engine(eng) {
    if (!_instance) {
        _instance = this;
    }
    // Load shaders
    vertexShader = R"(
#version 330 core
layout(location=0) in vec3 aPosition;
layout(location=1) in vec2 aTexCoord;

uniform mat4 uProj;
uniform mat4 uModel;

out vec2 vTexCoord;

void main(){
    vTexCoord = aTexCoord;
    gl_Position = uProj * uModel * vec4(aPosition, 1.0);
}
)";

    fragmentShader = R"(
#version 330 core
precision highp float;

uniform vec3 uColor;
uniform sampler2D uTexture;

in vec2 vTexCoord;
out vec4 outColor;

void main(){
    vec4 tex = texture(uTexture, vTexCoord);
    outColor = tex * vec4(uColor, 1.0);
}
)";
}

Spritz::~Spritz() {}

void Spritz::init(const std::string& gamePath, const nlohmann::json& manifest) {
    // Init Game Engine Components
    world = std::make_unique<World>(this, "spritz");
    world->init(gamePath, manifest);
    // show start menu
    nlohmann::json colours = nlohmann::json::object();
    colours["top"] = "#333";
    colours["bottom"] = "#777";
    colours["background"] = "#999";

    nlohmann::json startMenu = nlohmann::json::object();
    startMenu["text"] = "Start Game";
    startMenu["prompt"] = "Please press the button to start...";
    startMenu["x"] = engine->screenSize().x / 2 - 75;
    startMenu["y"] = engine->screenSize().y / 2 - 50;
    startMenu["w"] = 150;
    startMenu["h"] = 75;
    startMenu["quittable"] = false;
    startMenu["colours"] = colours;

    nlohmann::json menuConfig = nlohmann::json::object();
    menuConfig["start"] = startMenu;

    world->startMenu(menuConfig);
}

void Spritz::update(double now) {
    // Build
    world->tickOuter(now);
}

void Spritz::render() {
    // Draw Frame
    world->draw();
}

void Spritz::onKeyEvent(int key, int scancode, int action, int mods) {
    // TODO: Handle key events
}

void Spritz::onMouseEvent(int button, int action, int mods) {
    // Handle mouse events
}

void Spritz::onCursorPos(double xpos, double ypos) {
    // Handle cursor position
}

void Spritz::onScroll(double xoffset, double yoffset) {
    // Handle scroll
}
