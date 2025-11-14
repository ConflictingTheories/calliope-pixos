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

void Camera::setPosition(const glm::vec3& pos) {
    position = pos;
}

void Camera::setTarget(const glm::vec3& t) {
    target = t;
    // recompute front vector relative to target
    front = glm::normalize(target - position);
}

void Camera::setUp(const glm::vec3& u) {
    up = u;
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
