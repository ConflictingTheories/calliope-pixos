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
    // Default render logic
}
