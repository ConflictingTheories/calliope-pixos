#include "Camera.h"
#include <glm/gtc/matrix_transform.hpp>
#include <algorithm>
#include <cmath>

Camera::Camera()
        : position(0.0f, 48.0f, 64.0f),
            target(0.0f, 0.0f, 0.0f),
            up(0.0f, 1.0f, 0.0f),
            front(0.0f, 0.0f, -1.0f),
            right(1.0f, 0.0f, 0.0f),
            worldUp(0.0f, 1.0f, 0.0f),
            fov(45.0f),
            nearPlane(0.1f),
            farPlane(500.0f),
            yaw(-90.0f),
            pitch(-35.0f),
            zoomLevel(45.0f),
            mouseSensitivity(0.1f),
            movementSpeed(2.5f),
            bound(false) {
        updateVectors();
}

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
    glm::vec3 newFront;
    newFront.x = std::cos(glm::radians(yaw)) * std::cos(glm::radians(pitch));
    newFront.y = std::sin(glm::radians(pitch));
    newFront.z = std::sin(glm::radians(yaw)) * std::cos(glm::radians(pitch));

    if (glm::length(newFront) < 1e-5f) {
        newFront = front;
    }

    front = glm::normalize(newFront);
    right = glm::normalize(glm::cross(front, worldUp));
    up = glm::normalize(glm::cross(right, front));
    target = position + front;
}

glm::mat4 Camera::getViewMatrix() const
{
    return glm::lookAt(position, target, up);
}

glm::mat4 Camera::getProjectionMatrix(float aspect) const
{
    return glm::perspective(glm::radians(zoomLevel), aspect, nearPlane, farPlane);
}

void Camera::setPosition(const glm::vec3& pos) {
    position = pos;
    target = position + front;
}

void Camera::setTarget(const glm::vec3& t) {
    target = t;
    glm::vec3 direction = glm::normalize(target - position);
    if (glm::length(direction) < 1e-5f) {
        direction = glm::vec3(0.0f, 0.0f, -1.0f);
    }
    front = direction;
    yaw = glm::degrees(std::atan2(front.z, front.x));
    pitch = glm::degrees(std::asin(std::clamp(front.y, -1.0f, 1.0f)));
    updateVectors();
}

void Camera::setUp(const glm::vec3& u) {
    up = u;
    worldUp = u;
    updateVectors();
}

void Camera::move(const glm::vec3& delta) {
    position += delta;
    target += delta;
}

void Camera::rotate(float dyaw, float dpitch) {
    yaw += dyaw;
    pitch += dpitch;
    updateVectors();
}

void Camera::zoom(float factor) {
    zoomLevel = std::max(1.0f, std::min(90.0f, zoomLevel + factor));
}

void Camera::bindToSprite(std::shared_ptr<Sprite> sprite) {
    boundSprite = sprite;
    bound = true;
}

void Camera::unbind() {
    boundSprite.reset();
    bound = false;
}

bool Camera::isBound() const { return bound; }
