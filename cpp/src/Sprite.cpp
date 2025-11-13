#include "Sprite.h"
#include <GL/glew.h>

Sprite::Sprite(GLEngine* engine) : engine(engine), pos(0.0f), scale(1.0f), rotation(0.0f), animFrame(0), animTimer(0.0f), fixed(false), objId(0), speechTimer(0.0f), isLit(false), lightIndex(0), lightColor(1.0f), density(1.0f), isSelected(false) {}

Sprite::~Sprite() {}

void Sprite::init() {
    // Default initialization
}

void Sprite::update(double dt) {
    // Default update logic
}

void Sprite::render() {
    // Simple sprite rendering - render a colored quad at sprite position
    glColor3f(1.0f, 1.0f, 0.0f); // Yellow for sprites
    glBegin(GL_QUADS);
    glVertex2f(pos.x - 0.5f, pos.y - 0.5f);
    glVertex2f(pos.x + 0.5f, pos.y - 0.5f);
    glVertex2f(pos.x + 0.5f, pos.y + 0.5f);
    glVertex2f(pos.x - 0.5f, pos.y + 0.5f);
    glEnd();
}

void Sprite::addAction(std::shared_ptr<Action> action) {
    actionQueue.push_back(action);
}

void Sprite::clearActions() {
    actionQueue.clear();
}
