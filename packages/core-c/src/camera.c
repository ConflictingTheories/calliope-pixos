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
    cam.shake_intensity = 0.0f;
    cam.shake_duration = 0.0f;
    cam.shake_timer = 0.0f;
    cam.shake_offset = vec3_new(0.0f, 0.0f, 0.0f);
    cam.follow_target = NULL;
    cam.follow_smooth = 0.1f;
    cam.is_following = false;
    camera_look_at(&cam);
    return cam;
}

void camera_look_at(Camera* camera) {
    vec3 eye = vec3_add(camera->position, camera->shake_offset);
    camera->view_matrix = mat4_look_at(eye, camera->target, camera->up);
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

void camera_start_shake(Camera* camera, float intensity, float duration) {
    camera->shake_intensity = intensity;
    camera->shake_duration = duration;
    camera->shake_timer = duration;
}

void camera_follow(Camera* camera, vec3* target, float smooth) {
    camera->follow_target = target;
    camera->follow_smooth = smooth;
    camera->is_following = (target != NULL);
}

void camera_update(Camera* camera, float delta_time) {
    // Update follow
    if (camera->is_following && camera->follow_target) {
        vec3 diff = vec3_sub(*(camera->follow_target), camera->target);
        vec3 move = vec3_scale(diff, camera->follow_smooth);
        camera->target = vec3_add(camera->target, move);
        camera_update_view_from_angles(camera);
    }

    // Update shake
    if (camera->shake_timer > 0) {
        camera->shake_timer -= delta_time;
        if (camera->shake_timer <= 0) {
            camera->shake_offset = vec3_new(0, 0, 0);
        } else {
            float intensity = camera->shake_intensity * (camera->shake_timer / camera->shake_duration);
            camera->shake_offset = vec3_new(
                ((float)rand() / RAND_MAX * 2.0f - 1.0f) * intensity,
                ((float)rand() / RAND_MAX * 2.0f - 1.0f) * intensity,
                ((float)rand() / RAND_MAX * 2.0f - 1.0f) * intensity
            );
        }
        camera_look_at(camera);
    }
}
