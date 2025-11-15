#include "Hud.h"
#include "GLEngine.h"
#include <iostream>

Hud* Hud::_instance = nullptr;

Hud::Hud(GLEngine* engine) {
    if (!_instance) {
        this->engine = engine;
        this->backdropImage = nullptr;
        _instance = this;
    }
}

Hud* Hud::getInstance(GLEngine* engine) {
    if (!_instance) {
        _instance = new Hud(engine);
    }
    return _instance;
}

void Hud::init() {
    // Setup anything needed at the start (run once)
    this->ctx = engine->getContext();
}

void Hud::drawButton(const std::string& text, int x, int y, int w, int h, const std::map<std::string, std::string>& colours) {
    // Drawing logic for the button
    std::cout << "Drawing button: " << text << " at (" << x << ", " << y << ") with dimensions (" << w << ", " << h << ")" << std::endl;
}