#include "Hud.h"
#include "GLEngine.h"
#include "Shader.h"
#include <GL/glew.h>
#include <glm/glm.hpp>
#include <iostream>

Hud::Hud(GLEngine* engine) : engine(engine), dialogueTimer(0.0f) {
    // Initialize text shader or other resources if needed
}

Hud::~Hud() {
    // Cleanup
}

void Hud::init() {
    // Setup text rendering
    textShader = std::make_shared<Shader>("text_vertex.glsl", "text_fragment.glsl");
    // Setup VAO/VBO for text rendering
    glGenVertexArrays(1, &textVAO);
    glGenBuffers(1, &textVBO);
}

void Hud::update(double dt) {
    if (dialogueTimer > 0.0f) {
        dialogueTimer -= dt;
        if (dialogueTimer <= 0.0f) {
            hideDialogue();
        }
    }
}

void Hud::render() {
    // Render UI elements
    if (!currentDialogue.empty()) {
        drawText(currentDialogue, glm::vec2(10.0f, 10.0f));
    }
    // Render other UI
}

void Hud::drawText(const std::string& text, const glm::vec2& position, const glm::vec4& color) {
    // Simple text rendering using shader
    textShader->use();
    textShader->setVec4("uColor", color);
    // Bind VAO and draw text quads
    // This is a placeholder; full implementation would require font atlas
    glBindVertexArray(textVAO);
    // For each character, draw quad
    // ...
    glBindVertexArray(0);
}

void Hud::setGreeting(const std::string& text) {
    greeting = text;
}

void Hud::drawButton(const std::string& text, const glm::vec4& bounds, bool pressed) {
    // Draw button using ImGui or custom rendering
    // Placeholder
    std::cout << "Drawing button: " << text << std::endl;
}

void Hud::drawProgressBar(float progress, const glm::vec4& bounds, const glm::vec4& fillColor) {
    // Draw progress bar
    // Placeholder
}

void Hud::showDialogue(const std::string& text, float duration) {
    currentDialogue = text;
    dialogueTimer = duration;
}

void Hud::scrollText(const std::string& text, bool scrolling, const ActionOptions& options) {
    // Placeholder: for now, just show as dialogue
    showDialogue(text, options.duration > 0 ? options.duration : 3.0f);
}

void Hud::hideDialogue() {
    currentDialogue.clear();
    dialogueTimer = 0.0f;
}
