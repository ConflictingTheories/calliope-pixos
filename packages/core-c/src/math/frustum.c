#include "frustum.h"
#include <math.h>

static void normalize_plane(Plane* p) {
    float mag = sqrtf(p->normal[0] * p->normal[0] + 
                      p->normal[1] * p->normal[1] + 
                      p->normal[2] * p->normal[2]);
    p->normal[0] /= mag;
    p->normal[1] /= mag;
    p->normal[2] /= mag;
    p->distance /= mag;
}

void frustum_extract(Frustum* frustum, mat4 vp) {
    float* m = vp.m;

    // Right plane
    frustum->planes[0].normal[0] = m[3] - m[0];
    frustum->planes[0].normal[1] = m[7] - m[4];
    frustum->planes[0].normal[2] = m[11] - m[8];
    frustum->planes[0].distance = m[15] - m[12];
    normalize_plane(&frustum->planes[0]);

    // Left plane
    frustum->planes[1].normal[0] = m[3] + m[0];
    frustum->planes[1].normal[1] = m[7] + m[4];
    frustum->planes[1].normal[2] = m[11] + m[8];
    frustum->planes[1].distance = m[15] + m[12];
    normalize_plane(&frustum->planes[1]);

    // Bottom plane
    frustum->planes[2].normal[0] = m[3] + m[1];
    frustum->planes[2].normal[1] = m[7] + m[5];
    frustum->planes[2].normal[2] = m[11] + m[9];
    frustum->planes[2].distance = m[15] + m[13];
    normalize_plane(&frustum->planes[2]);

    // Top plane
    frustum->planes[3].normal[0] = m[3] - m[1];
    frustum->planes[3].normal[1] = m[7] - m[5];
    frustum->planes[3].normal[2] = m[11] - m[9];
    frustum->planes[3].distance = m[15] - m[13];
    normalize_plane(&frustum->planes[3]);

    // Far plane
    frustum->planes[4].normal[0] = m[3] - m[2];
    frustum->planes[4].normal[1] = m[7] - m[6];
    frustum->planes[4].normal[2] = m[11] - m[10];
    frustum->planes[4].distance = m[15] - m[14];
    normalize_plane(&frustum->planes[4]);

    // Near plane
    frustum->planes[5].normal[0] = m[3] + m[2];
    frustum->planes[5].normal[1] = m[7] + m[6];
    frustum->planes[5].normal[2] = m[11] + m[10];
    frustum->planes[5].distance = m[15] + m[14];
    normalize_plane(&frustum->planes[5]);
}

bool frustum_contains_sphere(Frustum* frustum, vec3 center, float radius) {
    for (int i = 0; i < 6; i++) {
        float dist = frustum->planes[i].normal[0] * center.x +
                     frustum->planes[i].normal[1] * center.y +
                     frustum->planes[i].normal[2] * center.z +
                     frustum->planes[i].distance;
        if (dist < -radius) {
            return false;
        }
    }
    return true;
}

bool frustum_contains_aabb(Frustum* frustum, vec3 min, vec3 max) {
    for (int i = 0; i < 6; i++) {
        float px = (frustum->planes[i].normal[0] > 0) ? max.x : min.x;
        float py = (frustum->planes[i].normal[1] > 0) ? max.y : min.y;
        float pz = (frustum->planes[i].normal[2] > 0) ? max.z : min.z;

        if (frustum->planes[i].normal[0] * px +
            frustum->planes[i].normal[1] * py +
            frustum->planes[i].normal[2] * pz +
            frustum->planes[i].distance < 0) {
            return false;
        }
    }
    return true;
}
