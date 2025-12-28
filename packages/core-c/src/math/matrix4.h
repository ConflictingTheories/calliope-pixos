#ifndef MATRIX4_H
#define MATRIX4_H

#include "vector.h"

typedef struct {
    float m[16];
} mat4;

// Creates an identity matrix
mat4 mat4_identity(void);

// Creates a perspective projection matrix
mat4 mat4_perspective(float fovy, float aspect, float near, float far);

// Creates a look-at view matrix
mat4 mat4_look_at(vec3 eye, vec3 center, vec3 up);

// Translates a matrix by a vector
mat4 mat4_translate(mat4 m, vec3 v);

// Rotates a matrix around an axis by an angle
mat4 mat4_rotate(mat4 m, float rad, vec3 axis);

// Multiplies two matrices
mat4 mat4_multiply(mat4 a, mat4 b);

// Copies a matrix
void mat4_set(mat4* dest, mat4 src);

#endif // MATRIX4_H
