#pragma once
#include <string>
#include <glm/glm.hpp>
#include "MathUtils.h"

class Shader
{
public:
    Shader();
    Shader(const std::string &vertexPath, const std::string &fragmentPath);
    ~Shader();

    void use() const;
    unsigned int getProgram() const { return program; }
    void load(const std::string &vertexPath, const std::string &fragmentPath);

    void setMat4(const std::string &name, const glm::mat4 &mat) const;
    void setVec3(const std::string &name, const glm::vec3 &vec) const;
    void setFloat(const std::string &name, float value) const;
    void setBool(const std::string &name, bool value) const;

    void setUniform(const std::string &name, const glm::mat4 &mat) const;
    void setUniform(const std::string &name, const glm::vec3 &vec) const;
    void setUniform(const std::string &name, float value) const;

private:
    unsigned int program;
    std::string loadShaderSource(const std::string &path) const;
    unsigned int compileShader(const std::string &source, unsigned int type) const;
};
