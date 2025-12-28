#ifndef SHADER_H
#define SHADER_H

#include <GL/glew.h>

typedef struct {
    GLuint program_id;
} Shader;

// Creates and compiles a shader from source code
GLuint compile_shader(const char* shader_code, GLenum shader_type);

// Links compiled shaders into a program
GLuint link_program(GLuint vertex_shader, GLuint fragment_shader);

// Creates a shader program from vertex and fragment shader source codes
Shader shader_create(const char* vertex_shader_src, const char* fragment_shader_src);

// Uses the shader program
void shader_use(Shader* shader);

// Deletes the shader program
void shader_destroy(Shader* shader);

// Uniform setters
void shader_set_mat4(Shader* shader, const char* name, float* value);
void shader_set_vec3(Shader* shader, const char* name, float x, float y, float z);
void shader_set_float(Shader* shader, const char* name, float value);
void shader_set_int(Shader* shader, const char* name, int value);

#endif // SHADER_H
