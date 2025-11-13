#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>

class GLEngine;
class Shader;

class Hud {
public:
    Hud(GLEngine* engine);
    ~Hud();

    void init();
    void update(double dt);
    void render();

    // Text rendering
    void drawText(const std::string& text, const glm::vec2& position, const glm::vec4& color = glm::vec4(1.0f));
    void setGreeting(const std::string& text);

    // UI elements
    void drawButton(const std::string& text, const glm::vec4& bounds, bool pressed = false);
    void drawProgressBar(float progress, const glm::vec4& bounds, const glm::vec4& fillColor = glm::vec4(0.0f, 1.0f, 0.0f, 1.0f));

    // Dialogue
    void showDialogue(const std::string& text, float duration = 3.0f);
    void hideDialogue();

    // Properties
    std::string greeting;
    std::string currentDialogue;
    float dialogueTimer;

    GLEngine* engine;

private:
    std::shared_ptr<Shader> textShader;
    GLuint textVAO, textVBO;
    std::unordered_map<char, glm::vec4> charUVs; // Character to UV coordinates
};
