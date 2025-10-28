#include "Shader.h"
#include <fstream>
#include <iostream>
#include <vector>

Shader::Shader(const std::string& vertexPath, const std::string& fragmentPath) {
    std::string vertexSource = loadShaderSource(vertexPath);
    std::string fragmentSource = loadShaderSource(fragmentPath);

    GLuint vertexShader = compileShader(vertexSource, GL_VERTEX_SHADER);
    GLuint fragmentShader = compileShader(fragmentSource, GL_FRAGMENT_SHADER);

    program = glCreateProgram();
    glAttachShader(program, vertexShader);
    glAttachShader(program, fragmentShader);
    glLinkProgram(program);

    GLint success;
    glGetProgramiv(program, GL_LINK_STATUS, &success);
    if (!success) {
        char infoLog[512];
        glGetProgramInfoLog(program, 512, nullptr, infoLog);
        std::cerr << "Shader program linking failed: " << infoLog << std::endl;
        throw std::runtime_error("Shader linking failed");
    }

    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);
}

Shader::~Shader() {
    glDeleteProgram(program);
}

void Shader::use() const {
    glUseProgram(program);
}

void Shader::setUniform(const std::string& name, const Mat4& mat) const {
    GLint location = glGetUniformLocation(program, name.c_str());
    glUniformMatrix4fv(location, 1, GL_FALSE, mat.m);
}

void Shader::setUniform(const std::string& name, const Vec3& vec) const {
    GLint location = glGetUniformLocation(program, name.c_str());
    glUniform3f(location, vec.x, vec.y, vec.z);
}

void Shader::setUniform(const std::string& name, float value) const {
    GLint location = glGetUniformLocation(program, name.c_str());
    glUniform1f(location, value);
}

std::string Shader::loadShaderSource(const std::string& path) const {
    std::ifstream file(path);
    if (!file.is_open()) {
        throw std::runtime_error("Failed to open shader file: " + path);
    }
    std::string source((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
    return source;
}

GLuint Shader::compileShader(const std::string& source, GLenum type) const {
    GLuint shader = glCreateShader(type);
    const char* src = source.c_str();
    glShaderSource(shader, 1, &src, nullptr);
    glCompileShader(shader);

    GLint success;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        char infoLog[512];
        glGetShaderInfoLog(shader, 512, nullptr, infoLog);
        std::cerr << "Shader compilation failed: " << infoLog << std::endl;
        throw std::runtime_error("Shader compilation failed");
    }
    return shader;
}
