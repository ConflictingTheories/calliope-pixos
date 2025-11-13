#include "Object.h"

Object::Object() : pos(0.0f), scale(1.0f), size(1.0f), walkable(true), blocking(false), override(false) {}

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
