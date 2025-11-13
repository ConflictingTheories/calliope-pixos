#include "Sprite.h"

Sprite::Sprite(GLEngine* engine) : engine(engine), pos(0.0f), scale(1.0f), rotation(0.0f), animFrame(0), animTimer(0.0f), fixed(false), objId(0), speechTimer(0.0f), isLit(false), lightIndex(0), lightColor(1.0f), density(1.0f), isSelected(false) {}

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

void Sprite::addAction(std::shared_ptr<Action> action) {
    actionQueue.push_back(action);
}

void Sprite::clearActions() {
    actionQueue.clear();
}
