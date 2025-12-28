#include "camera.h"
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

Camera camera_create(vec3 position, vec3 target, vec3 up) {
    Camera cam;
    cam.position = position;
    cam.target = target;
    cam.up = up;
    cam.distance = vec3_length(vec3_sub(target, position));
    // TODO: Calculate yaw and pitch from position and target
    cam.yaw = 0.0f;
    cam.pitch = 0.0f;
    camera_look_at(&cam);
    return cam;
}

void camera_look_at(Camera* camera) {
    camera->view_matrix = mat4_look_at(camera->position, camera->target, camera->up);
}

void camera_update_view_from_angles(Camera* camera) {
    float x = camera->target.x + camera->distance * cosf(camera->pitch) * cosf(camera->yaw);
    float y = camera->target.y + camera->distance * cosf(camera->pitch) * sinf(camera->yaw);
    float z = camera->target.z + camera->distance * sinf(camera->pitch);
    camera->position = vec3_new(x, y, z);
    camera_look_at(camera);
}

void camera_rotate(Camera* camera, float dx, float dy) {
    camera->yaw += dx;
    camera->pitch += dy;

    // Clamp pitch to avoid flipping
    if (camera->pitch > (float)M_PI / 2.0f - 0.01f) {
        camera->pitch = (float)M_PI / 2.0f - 0.01f;
    }
    if (camera->pitch < -(float)M_PI / 2.0f + 0.01f) {
        camera->pitch = -(float)M_PI / 2.0f + 0.01f;
    }

    camera_update_view_from_angles(camera);
}

void camera_zoom(Camera* camera, float delta) {
    camera->distance -= delta;
    if (camera->distance < 0.1f) {
        camera->distance = 0.1f;
    }
    camera_update_view_from_angles(camera);
}

void camera_pan(Camera* camera, float dx, float dy) {
    vec3 right = vec3_normalize(vec3_cross(vec3_sub(camera->target, camera->position), camera->up));
    vec3 pan_up = vec3_normalize(vec3_cross(right, vec3_sub(camera->target, camera->position)));

    vec3 move_right = vec3_scale(right, dx);
    vec3 move_up = vec3_scale(pan_up, dy);

    camera->target = vec3_add(camera->target, move_right);
    camera->target = vec3_add(camera->target, move_up);

    camera_update_view_from_angles(camera);
}
