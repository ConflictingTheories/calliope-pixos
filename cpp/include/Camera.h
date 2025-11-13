#pragma once

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <memory>

class Sprite;

class Camera {
public:
    Camera();
    ~Camera();

    void init();
    void update(float deltaTime);

    // Position and orientation
    void setPosition(const glm::vec3& pos);
    void setTarget(const glm::vec3& target);
    void setUp(const glm::vec3& up);

    // Movement
    void move(const glm::vec3& delta);
    void rotate(float yaw, float pitch);
    void zoom(float factor);

    // Binding
    void bindToSprite(std::shared_ptr<Sprite> sprite);
    void unbind();
    bool isBound() const;

    // Matrices
    glm::mat4 getViewMatrix() const;
    glm::mat4 getProjectionMatrix(float aspectRatio) const;

    // Properties
    glm::vec3 position;
    glm::vec3 target;
    glm::vec3 up;
    glm::vec3 front;
    glm::vec3 right;
    glm::vec3 worldUp;
    float fov;
    float nearPlane;
    float farPlane;
    float yaw, pitch;
    float zoomLevel;
    float mouseSensitivity;
    float movementSpeed;

    bool bound;
    std::weak_ptr<Sprite> boundSprite;

public:
    void updateVectors();
private:
    glm::mat4 viewMatrix;
};
