#include "vector.h"

/* vec2 operations */

vec2 vec2_new(float x, float y) {
    vec2 v = {x, y};
    return v;
}

vec2 vec2_add(vec2 a, vec2 b) {
    vec2 result = {a.x + b.x, a.y + b.y};
    return result;
}

vec2 vec2_sub(vec2 a, vec2 b) {
    vec2 result = {a.x - b.x, a.y - b.y};
    return result;
}

vec2 vec2_scale(vec2 v, float s) {
    vec2 result = {v.x * s, v.y * s};
    return result;
}

float vec2_dot(vec2 a, vec2 b) {
    return a.x * b.x + a.y * b.y;
}

float vec2_length(vec2 v) {
    return sqrtf(v.x * v.x + v.y * v.y);
}

vec2 vec2_normalize(vec2 v) {
    float len = vec2_length(v);
    if (len > 0) {
        return vec2_scale(v, 1.0f / len);
    }
    return v;
}

/* vec3 operations */

vec3 vec3_new(float x, float y, float z) {
    vec3 v = {x, y, z};
    return v;
}

vec3 vec3_add(vec3 a, vec3 b) {
    vec3 result = {a.x + b.x, a.y + b.y, a.z + b.z};
    return result;
}

vec3 vec3_sub(vec3 a, vec3 b) {
    vec3 result = {a.x - b.x, a.y - b.y, a.z - b.z};
    return result;
}

vec3 vec3_scale(vec3 v, float s) {
    vec3 result = {v.x * s, v.y * s, v.z * s};
    return result;
}

vec3 vec3_cross(vec3 a, vec3 b) {
    vec3 result = {
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x
    };
    return result;
}

float vec3_dot(vec3 a, vec3 b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

float vec3_length(vec3 v) {
    return sqrtf(v.x * v.x + v.y * v.y + v.z * v.z);
}

vec3 vec3_normalize(vec3 v) {
    float len = vec3_length(v);
    if (len > 0) {
        return vec3_scale(v, 1.0f / len);
    }
    return v;
}
