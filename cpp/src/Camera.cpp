#include "Camera.h"
#include <algorithm>
#include <cmath>

void Camera::update(float deltaAzimuth, float deltaElevation, float deltaDistance)
{
    azimuth += deltaAzimuth;
    elevation = std::max(0.12f, std::min(3.14159f / 2.0f - 0.05f, elevation + deltaElevation));
    distance = std::max(3.0f, std::min(60.0f, distance + deltaDistance));
}

Vec3 Camera::getEye() const
{
    return target + vec3(
                        distance * std::cos(elevation) * std::sin(azimuth),
                        distance * std::sin(elevation),
                        distance * std::cos(elevation) * std::cos(azimuth));
}

Mat4 Camera::getViewMatrix() const
{
    return mat4LookAt(getEye(), target, vec3(0.0f, 1.0f, 0.0f));
}

Mat4 Camera::getProjectionMatrix(float aspect) const
{
    return mat4Perspective(3.14159f / 4.0f, aspect, 0.1f, 200.0f);
}
