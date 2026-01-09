#ifndef VECTOR_H
#define VECTOR_H

#include <math.h>

typedef struct {
    float x;
    float y;
} vec2;

typedef struct {
    float x;
    float y;
    float z;
} vec3;

typedef struct {
    float x;
    float y;
    float z;
    float w;
} vec4;

// vec2 operations
vec2 vec2_new(float x, float y);
vec2 vec2_add(vec2 a, vec2 b);
vec2 vec2_sub(vec2 a, vec2 b);
vec2 vec2_scale(vec2 v, float s);
float vec2_dot(vec2 a, vec2 b);
float vec2_length(vec2 v);
vec2 vec2_normalize(vec2 v);

// Creates a new vec3
vec3 vec3_new(float x, float y, float z);

// Adds two vectors
vec3 vec3_add(vec3 a, vec3 b);

// Subtracts two vectors
vec3 vec3_sub(vec3 a, vec3 b);

// Scales a vector by a scalar
vec3 vec3_scale(vec3 v, float s);

// Calculates the cross product of two vectors
vec3 vec3_cross(vec3 a, vec3 b);

// Calculates the dot product of two vectors
float vec3_dot(vec3 a, vec3 b);

// Calculates the length of a vector
float vec3_length(vec3 v);

// Normalizes a vector
vec3 vec3_normalize(vec3 v);

#endif // VECTOR_H
