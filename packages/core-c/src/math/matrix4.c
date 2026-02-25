#include "matrix4.h"
#include <math.h>
#include <string.h>

#define EPSILON 0.000001f

mat4 mat4_identity(void) {
    mat4 out;
    memset(out.m, 0, sizeof(float) * 16);
    out.m[0] = 1.0f;
    out.m[5] = 1.0f;
    out.m[10] = 1.0f;
    out.m[15] = 1.0f;
    return out;
}

mat4 mat4_perspective(float fovy, float aspect, float near, float far) {
    mat4 out = mat4_identity();
    float f = 1.0f / tanf(fovy / 2.0f);
    out.m[0] = f / aspect;
    out.m[5] = f;
    out.m[10] = (far + near) / (near - far);
    out.m[11] = -1.0f;
    out.m[14] = (2.0f * far * near) / (near - far);
    out.m[15] = 0.0f;
    return out;
}

mat4 mat4_look_at(vec3 eye, vec3 center, vec3 up) {
    mat4 out;
    
    if (fabsf(eye.x - center.x) < EPSILON &&
        fabsf(eye.y - center.y) < EPSILON &&
        fabsf(eye.z - center.z) < EPSILON) {
        return mat4_identity();
    }

    vec3 z = vec3_normalize(vec3_sub(eye, center));
    vec3 x = vec3_normalize(vec3_cross(up, z));
    vec3 y = vec3_cross(z, x);

    out.m[0] = x.x;
    out.m[1] = y.x;
    out.m[2] = z.x;
    out.m[3] = 0.0f;
    out.m[4] = x.y;
    out.m[5] = y.y;
    out.m[6] = z.y;
    out.m[7] = 0.0f;
    out.m[8] = x.z;
    out.m[9] = y.z;
    out.m[10] = z.z;
    out.m[11] = 0.0f;
    out.m[12] = -vec3_dot(x, eye);
    out.m[13] = -vec3_dot(y, eye);
    out.m[14] = -vec3_dot(z, eye);
    out.m[15] = 1.0f;

    return out;
}

mat4 mat4_translate(mat4 m, vec3 v) {
    mat4 out = m;
    out.m[12] = m.m[0] * v.x + m.m[4] * v.y + m.m[8] * v.z + m.m[12];
    out.m[13] = m.m[1] * v.x + m.m[5] * v.y + m.m[9] * v.z + m.m[13];
    out.m[14] = m.m[2] * v.x + m.m[6] * v.y + m.m[10] * v.z + m.m[14];
    out.m[15] = m.m[3] * v.x + m.m[7] * v.y + m.m[11] * v.z + m.m[15];
    return out;
}

mat4 mat4_rotate(mat4 m, float rad, vec3 axis) {
    mat4 out;
    float len = vec3_length(axis);
    if (len < EPSILON) {
        return m;
    }

    vec3 a = vec3_scale(axis, 1.0f / len);
    float s = sinf(rad);
    float c = cosf(rad);
    float t = 1.0f - c;

    float b00 = a.x * a.x * t + c;
    float b01 = a.y * a.x * t + a.z * s;
    float b02 = a.z * a.x * t - a.y * s;
    float b10 = a.x * a.y * t - a.z * s;
    float b11 = a.y * a.y * t + c;
    float b12 = a.z * a.y * t + a.x * s;
    float b20 = a.x * a.z * t + a.y * s;
    float b21 = a.y * a.z * t - a.x * s;
    float b22 = a.z * a.z * t + c;

    out.m[0] = m.m[0] * b00 + m.m[4] * b01 + m.m[8] * b02;
    out.m[1] = m.m[1] * b00 + m.m[5] * b01 + m.m[9] * b02;
    out.m[2] = m.m[2] * b00 + m.m[6] * b01 + m.m[10] * b02;
    out.m[3] = m.m[3] * b00 + m.m[7] * b01 + m.m[11] * b02;
    out.m[4] = m.m[0] * b10 + m.m[4] * b11 + m.m[8] * b12;
    out.m[5] = m.m[1] * b10 + m.m[5] * b11 + m.m[9] * b12;
    out.m[6] = m.m[2] * b10 + m.m[6] * b11 + m.m[10] * b12;
    out.m[7] = m.m[3] * b10 + m.m[7] * b11 + m.m[11] * b12;
    out.m[8] = m.m[0] * b20 + m.m[4] * b21 + m.m[8] * b22;
    out.m[9] = m.m[1] * b20 + m.m[5] * b21 + m.m[9] * b22;
    out.m[10] = m.m[2] * b20 + m.m[6] * b21 + m.m[10] * b22;
    out.m[11] = m.m[3] * b20 + m.m[7] * b21 + m.m[11] * b22;

    out.m[12] = m.m[12];
    out.m[13] = m.m[13];
    out.m[14] = m.m[14];
    out.m[15] = m.m[15];
    
    return out;
}

mat4 mat4_multiply(mat4 a, mat4 b) {
    mat4 out;
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            out.m[i * 4 + j] = 0;
            for (int k = 0; k < 4; k++) {
                out.m[i * 4 + j] += a.m[k * 4 + j] * b.m[i * 4 + k];
            }
        }
    }
    return out;
}

void mat4_set(mat4* dest, mat4 src) {
    memcpy(dest->m, src.m, sizeof(float) * 16);
}

mat4 mat4_ortho(float left, float right, float bottom, float top, float near, float far) {
    mat4 out = mat4_identity();
    
    float lr = 1.0f / (left - right);
    float bt = 1.0f / (bottom - top);
    float nf = 1.0f / (near - far);
    
    out.m[0] = -2.0f * lr;
    out.m[5] = -2.0f * bt;
    out.m[10] = 2.0f * nf;
    out.m[12] = (left + right) * lr;
    out.m[13] = (top + bottom) * bt;
    out.m[14] = (far + near) * nf;
    out.m[15] = 1.0f;
    
    return out;
}

mat4 mat4_scale(mat4 m, vec3 v) {
    mat4 out = m;
    out.m[0] *= v.x;
    out.m[1] *= v.x;
    out.m[2] *= v.x;
    out.m[3] *= v.x;
    out.m[4] *= v.y;
    out.m[5] *= v.y;
    out.m[6] *= v.y;
    out.m[7] *= v.y;
    out.m[8] *= v.z;
    out.m[9] *= v.z;
    out.m[10] *= v.z;
    out.m[11] *= v.z;
    return out;
}
