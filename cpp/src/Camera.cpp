#include "Camera.h"
#include <glm/gtc/matrix_transform.hpp>

Camera::Camera() : position(0.0f, 0.0f, 3.0f), target(0.0f), up(0.0f, 1.0f, 0.0f), front(0.0f, 0.0f, -1.0f), right(1.0f, 0.0f, 0.0f), worldUp(0.0f, 1.0f, 0.0f), fov(45.0f), nearPlane(0.1f), farPlane(100.0f), yaw(-90.0f), pitch(0.0f), zoomLevel(45.0f), mouseSensitivity(0.1f), movementSpeed(2.5f), bound(false) {}

Camera::~Camera() {}

void Camera::init()
{
    updateVectors();
}

void Camera::update(float deltaTime)
{
    // Update camera vectors based on yaw and pitch
    updateVectors();
}

void Camera::updateVectors()
{
    glm::vec3 front;
    front.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
    front.y = sin(glm::radians(pitch));
    front.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
    this->front = glm::normalize(front);

    right = glm::normalize(glm::cross(front, worldUp));
    up = glm::normalize(glm::cross(right, front));
}

glm::mat4 Camera::getViewMatrix() const
{
    return glm::lookAt(position, position + front, up);
}

glm::mat4 Camera::getProjectionMatrix(float aspect) const
{
    return glm::perspective(glm::radians(zoomLevel), aspect, nearPlane, farPlane);
}
