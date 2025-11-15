#include "Spritz.h"
#include "World.h"
#include <iostream>

Spritz::Spritz(GLEngine* eng) : engine(eng) {
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

void Spritz::init() {
    // Init Game Engine Components
    world = std::make_unique<World>(this, "world");
    // Load Zones - TODO - Add injection / Props to make more Dynamic
    // For now, assume world init handles it
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
