#pragma once
#include "MathUtils.h"

struct Camera
{
    float azimuth = -3.14159f / 4.0f;
    float elevation = 3.14159f / 5.0f;
    float distance = 30.0f;
    Vec3 target = vec3(11.0f, 0.0f, 7.0f);

    void update(float deltaAzimuth, float deltaElevation, float deltaDistance);
    Vec3 getEye() const;
    Mat4 getViewMatrix() const;
    Mat4 getProjectionMatrix(float aspect) const;
};
