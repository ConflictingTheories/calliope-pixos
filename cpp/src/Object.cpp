#include "Object.h"

Object::Object(GLEngine* engine, const std::string& id)
    : engine(engine), id(id), objId(0), pos(0.0f), scale(1.0f), rotation(0.0f),
      interactive(false), visible(true), solid(false) {}

Object::~Object() {}

void Object::init() {
    // Default initialization
}

void Object::update(double dt) {
    // Default update logic
}

void Object::render() {
    // Default render logic
}

void Object::onInteract(Sprite* interactor) {
    // Default interaction logic
}

void Object::onSelect() {
    // Default selection logic
}

void Object::onDeselect() {
    // Default deselection logic
}

void Object::faceDir(Direction dir) {
    // Set rotation based on direction
    switch (dir) {
        case Direction::Up: rotation = 0.0f; break;
        case Direction::Down: rotation = 180.0f; break;
        case Direction::Right: rotation = 90.0f; break;
        case Direction::Left: rotation = 270.0f; break;
    }
}

void Object::interact(Sprite* interactor, std::function<void()> callback) {
    onInteract(interactor);
    if (callback) callback();
}
