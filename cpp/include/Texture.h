#pragma once

#include <string>
#include <GL/glew.h>

class GLEngine;

class Texture {
public:
    Texture(GLEngine* engine, const std::string& id);
    ~Texture();

    void init();
    void loadFromFile(const std::string& path);
    void bind();
    void unbind();

    GLuint getTextureId() const { return textureId; }
    int getWidth() const { return width; }
    int getHeight() const { return height; }

private:
    GLEngine* engine;
    std::string id;
    GLuint textureId;
    int width, height;
};
