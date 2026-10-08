#ifndef CAMERA_H
#define CAMERA_H

#include "math/vector.h"
#include "math/matrix4.h"

typedef struct {
    mat4 view_matrix;
    vec3 position;
    vec3 target;
    vec3 up;
    float yaw;
    float pitch;
    float distance;
    
    // Shake state
    float shake_intensity;
    float shake_duration;
    float shake_timer;
    vec3 shake_offset;
    
    // Follow state
    vec3* follow_target;
    float follow_smooth;
    bool is_following;
} Camera;

// Creates a new camera
Camera camera_create(vec3 position, vec3 target, vec3 up);

// Updates the camera's view matrix based on its position, target, and up vectors
void camera_look_at(Camera* camera);

// Updates the camera's view matrix based on yaw, pitch, and distance from the target
void camera_update_view_from_angles(Camera* camera);

// Rotates the camera (changes yaw and pitch)
void camera_rotate(Camera* camera, float dx, float dy);

// Zooms the camera (changes distance)
void camera_zoom(Camera* camera, float delta);

// Pans the camera (moves the target)
void camera_pan(Camera* camera, float dx, float dy);

// Starts a camera shake
void camera_start_shake(Camera* camera, float intensity, float duration);

// Sets a target for the camera to follow
void camera_follow(Camera* camera, vec3* target, float smooth);

// Updates the camera state (call each frame)
void camera_update(Camera* camera, float delta_time);

#endif // CAMERA_H
