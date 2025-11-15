#ifndef SPRITZ_H
#define SPRITZ_H

#include <memory>
#include <string>
#include <nlohmann/json.hpp>
#include "GLEngine.h"

class World;

class Spritz {
public:
    static Spritz* getInstance();
    static void destroyInstance();

    Spritz(GLEngine* engine);
    virtual ~Spritz();

    void init(const std::string& gamePath, const nlohmann::json& manifest);
    void update(double now);
    void render();
    void onKeyEvent(int key, int scancode, int action, int mods);
    void onMouseEvent(int button, int action, int mods);
    void onCursorPos(double xpos, double ypos);
    void onScroll(double xoffset, double yoffset);

    // Shaders
    std::string vertexShader;
    std::string fragmentShader;

    // Effects (placeholder)
    // std::map<std::string, std::string> effects;

private:
    static Spritz* _instance;
    GLEngine* engine;

public:
    GLEngine* getEngine() const { return engine; }
    std::unique_ptr<World> world;
};

#endif // SPRITZ_H
