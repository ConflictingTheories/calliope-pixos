#pragma once
#include <cmath>

// Vector3 struct
struct Vec3 {
    float x, y, z;
    Vec3(float x = 0.0f, float y = 0.0f, float z = 0.0f) : x(x), y(y), z(z) {}
    Vec3 operator+(const Vec3& other) const { return Vec3(x + other.x, y + other.y, z + other.z); }
};

// Matrix4 struct (column-major)
struct Mat4 {
    float m[16];
    Mat4() {
        for (int i = 0; i < 16; ++i) m[i] = 0.0f;
        m[0] = m[5] = m[10] = m[15] = 1.0f;
    }
    float& operator[](int i) { return m[i]; }
    const float& operator[](int i) const { return m[i]; }
};

// Vector3 functions
inline Vec3 vec3(float x = 0.0f, float y = 0.0f, float z = 0.0f) { return Vec3(x, y, z); }
inline Vec3 add(const Vec3& a, const Vec3& b) { return Vec3(a.x + b.x, a.y + b.y, a.z + b.z); }
inline Vec3 sub(const Vec3& a, const Vec3& b) { return Vec3(a.x - b.x, a.y - b.y, a.z - b.z); }
inline Vec3 mulS(const Vec3& v, float s) { return Vec3(v.x * s, v.y * s, v.z * s); }
inline float dot(const Vec3& a, const Vec3& b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
inline Vec3 cross(const Vec3& a, const Vec3& b) {
    return Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}
inline float length(const Vec3& v) { return std::sqrt(v.x * v.x + v.y * v.y + v.z * v.z); }
inline Vec3 normalize(const Vec3& v) {
    float len = length(v);
    if (len > 0.0f) return mulS(v, 1.0f / len);
    return v;
}

// Matrix4 functions
inline Mat4 mat4Identity() { return Mat4(); }
inline Mat4 mat4Multiply(const Mat4& a, const Mat4& b) {
    Mat4 result;
    for (int i = 0; i < 4; ++i) {
        for (int j = 0; j < 4; ++j) {
            result[i * 4 + j] = 0.0f;
            for (int k = 0; k < 4; ++k) {
                result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
            }
        }
    }
    return result;
}
inline Mat4 mat4Translate(float tx, float ty, float tz) {
    Mat4 result = mat4Identity();
    result[12] = tx;
    result[13] = ty;
    result[14] = tz;
    return result;
}
inline Mat4 mat4Scale(float sx, float sy, float sz) {
    Mat4 result = mat4Identity();
    result[0] = sx;
    result[5] = sy;
    result[10] = sz;
    return result;
}
inline Mat4 mat4RotateX(float a) {
    Mat4 result = mat4Identity();
    float c = std::cos(a), s = std::sin(a);
    result[5] = c; result[6] = -s;
    result[9] = s; result[10] = c;
    return result;
}
inline Mat4 mat4RotateY(float a) {
    Mat4 result = mat4Identity();
    float c = std::cos(a), s = std::sin(a);
    result[0] = c; result[2] = s;
    result[8] = -s; result[10] = c;
    return result;
}
inline Mat4 mat4Perspective(float fovy, float aspect, float near, float far) {
    Mat4 result;
    float f = 1.0f / std::tan(fovy / 2.0f);
    result[0] = f / aspect;
    result[5] = f;
    result[10] = (far + near) / (near - far);
    result[11] = -1.0f;
    result[14] = (2.0f * far * near) / (near - far);
    result[15] = 0.0f;
    return result;
}
inline Mat4 mat4LookAt(const Vec3& eye, const Vec3& center, const Vec3& up) {
    Vec3 f = normalize(sub(center, eye));
    Vec3 s = normalize(cross(f, up));
    Vec3 u = cross(s, f);
    Mat4 result = mat4Identity();
    result[0] = s.x; result[4] = s.y; result[8] = s.z;
    result[1] = u.x; result[5] = u.y; result[9] = u.z;
    result[2] = -f.x; result[6] = -f.y; result[10] = -f.z;
    result[12] = -dot(s, eye);
    result[13] = -dot(u, eye);
    result[14] = dot(f, eye);
    return result;
}

// Matrix4 inverse (simplified for affine matrices)
inline Mat4 mat4Inverse(const Mat4& m) {
    // Assuming m is affine (last row is 0 0 0 1)
    Mat4 inv;
    // Transpose rotation part
    inv[0] = m[0]; inv[1] = m[4]; inv[2] = m[8]; inv[3] = 0;
    inv[4] = m[1]; inv[5] = m[5]; inv[6] = m[9]; inv[7] = 0;
    inv[8] = m[2]; inv[9] = m[6]; inv[10] = m[10]; inv[11] = 0;
    // Translate
    inv[12] = - (m[0] * m[12] + m[1] * m[13] + m[2] * m[14]);
    inv[13] = - (m[4] * m[12] + m[5] * m[13] + m[6] * m[14]);
    inv[14] = - (m[8] * m[12] + m[9] * m[13] + m[10] * m[14]);
    inv[15] = 1.0f;
    return inv;
}

// Matrix4 operator*
inline Mat4 operator*(const Mat4& a, const Mat4& b) {
    return mat4Multiply(a, b);
}

// Transform point
inline Vec3 transformPoint(const Mat4& m, const Vec3& p) {
    float x = m[0] * p.x + m[4] * p.y + m[8] * p.z + m[12];
    float y = m[1] * p.x + m[5] * p.y + m[9] * p.z + m[13];
    float z = m[2] * p.x + m[6] * p.y + m[10] * p.z + m[14];
    float w = m[3] * p.x + m[7] * p.y + m[11] * p.z + m[15];
    return Vec3(x / w, y / w, z / w);
}
