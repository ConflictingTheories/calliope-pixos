#include "shader.h"
#include <stdio.h>
#include <stdlib.h> // For malloc, free
#include <string.h> // For strlen

// Utility function to check shader compilation/linking errors
static void check_shader_error(GLuint shader, GLenum type, const char* message) {
    GLint success;
    GLchar info_log[1024];
    if (type == GL_COMPILE_STATUS) {
        glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
        if (!success) {
            glGetShaderInfoLog(shader, 1024, NULL, info_log);
            fprintf(stderr, "ERROR::SHADER_COMPILATION_ERROR of type: %s\n%s\n", message, info_log);
        }
    } else if (type == GL_LINK_STATUS) {
        glGetProgramiv(shader, GL_LINK_STATUS, &success);
        if (!success) {
            glGetProgramInfoLog(shader, 1024, NULL, info_log);
            fprintf(stderr, "ERROR::PROGRAM_LINKING_ERROR of type: %s\n%s\n", message, info_log);
        }
    } else {
        fprintf(stderr, "ERROR::UNKNOWN_SHADER_ERROR_TYPE\n");
    }
}

GLuint compile_shader(const char* shader_code, GLenum shader_type) {
    GLuint shader = glCreateShader(shader_type);
    glShaderSource(shader, 1, &shader_code, NULL);
    glCompileShader(shader);
    check_shader_error(shader, GL_COMPILE_STATUS, (shader_type == GL_VERTEX_SHADER ? "VERTEX" : "FRAGMENT"));
    return shader;
}

GLuint link_program(GLuint vertex_shader, GLuint fragment_shader) {
    GLuint program = glCreateProgram();
    glAttachShader(program, vertex_shader);
    glAttachShader(program, fragment_shader);
    glLinkProgram(program);
    check_shader_error(program, GL_LINK_STATUS, "PROGRAM");
    // Delete the shaders as they're linked into our program now and no longer necessary
    glDeleteShader(vertex_shader);
    glDeleteShader(fragment_shader);
    return program;
}

Shader shader_create(const char* vertex_shader_src, const char* fragment_shader_src) {
    Shader shader;
    GLuint vertex_shader = compile_shader(vertex_shader_src, GL_VERTEX_SHADER);
    GLuint fragment_shader = compile_shader(fragment_shader_src, GL_FRAGMENT_SHADER);
    shader.program_id = link_program(vertex_shader, fragment_shader);
    return shader;
}

void shader_use(Shader* shader) {
    glUseProgram(shader->program_id);
}

void shader_destroy(Shader* shader) {
    glDeleteProgram(shader->program_id);
    shader->program_id = 0; // Mark as invalid
}

// Uniform setters
void shader_set_mat4(Shader* shader, const char* name, float* value) {
    glUniformMatrix4fv(glGetUniformLocation(shader->program_id, name), 1, GL_FALSE, value);
}

void shader_set_vec3(Shader* shader, const char* name, float x, float y, float z) {
    glUniform3f(glGetUniformLocation(shader->program_id, name), x, y, z);
}

void shader_set_float(Shader* shader, const char* name, float value) {
    glUniform1f(glGetUniformLocation(shader->program_id, name), value);
}

void shader_set_int(Shader* shader, const char* name, int value) {
    glUniform1i(glGetUniformLocation(shader->program_id, name), value);
}
