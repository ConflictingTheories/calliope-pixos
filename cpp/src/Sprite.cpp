#include "Sprite.h"

Sprite::Sprite() : pos(0.0f), scale(1.0f), facing(0.0f), walkable(true), blocking(false), override(false) {}

Sprite::~Sprite() {}

void Sprite::init() {
    // Default initialization
}

void Sprite::update(double dt) {
    // Default update logic
}

void Sprite::render() {
    // Simple sprite rendering - render a colored quad
    // TODO: Use modern OpenGL with VBOs and shaders
    // For now, placeholder - actual rendering will be handled by RenderManager
}
