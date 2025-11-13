#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <string>

class Shader {
public:
    Shader();
    Shader(const std::string& vertexPath, const std::string& fragmentPath);
    ~Shader();

    void init(const std::string& vertexSource, const std::string& fragmentSource);
    void compileShaders(const char* vertexSource, const char* fragmentSource);
    void use() const;
    void unuse() const;

    // Uniform setters
    void setBool(const std::string& name, bool value) const;
    void setInt(const std::string& name, int value) const;
    void setFloat(const std::string& name, float value) const;
    void setVec2(const std::string& name, const glm::vec2& value) const;
    void setVec3(const std::string& name, const glm::vec3& value) const;
    void setVec4(const std::string& name, const glm::vec4& value) const;
    void setMat2(const std::string& name, const glm::mat2& value) const;
    void setMat3(const std::string& name, const glm::mat3& value) const;
    void setMat4(const std::string& name, const glm::mat4& value) const;

    // Program ID
    GLuint id;

private:
    void checkCompileErrors(GLuint shader, const std::string& type) const;
    GLint getUniformLocation(const std::string& name) const;
    std::string loadShaderSource(const std::string& path) const;
    unsigned int compileShader(const std::string& source, unsigned int type) const;

    mutable std::unordered_map<std::string, GLint> uniformCache;
};
