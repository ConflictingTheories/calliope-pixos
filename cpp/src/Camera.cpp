#include "Camera.h"
#include <glm/gtc/matrix_transform.hpp>

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
    return glm::perspective(glm::radians(zoom), aspect, 0.1f, 100.0f);
}
