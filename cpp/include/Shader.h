#pragma once
#include <GL/glew.h>
#include <string>
#include "MathUtils.h"

class Shader
{
public:
    Shader(const std::string &vertexPath, const std::string &fragmentPath);
    ~Shader();

    void use() const;
    GLuint getProgram() const { return program; }

    void setUniform(const std::string &name, const Mat4 &mat) const;
    void setUniform(const std::string &name, const Vec3 &vec) const;
    void setUniform(const std::string &name, float value) const;

private:
    GLuint program;
    std::string loadShaderSource(const std::string &path) const;
    GLuint compileShader(const std::string &source, GLenum type) const;
};
