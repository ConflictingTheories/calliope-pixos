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
