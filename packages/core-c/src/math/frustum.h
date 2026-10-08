#ifndef FRUSTUM_H
#define FRUSTUM_H

#include "vector.h"
#include "matrix4.h"
#include <stdbool.h>

/**
 * A plane in 3D space: Ax + By + Cz + D = 0
 */
typedef struct {
    float normal[3];
    float distance;
} Plane;

/**
 * A view frustum defined by 6 planes.
 */
typedef struct {
    Plane planes[6];
} Frustum;

/**
 * Extracts frustum planes from a view-projection matrix.
 * @param frustum Pointer to Frustum struct
 * @param vp View-Projection matrix
 */
void frustum_extract(Frustum* frustum, mat4 vp);

/**
 * Checks if a point is inside the frustum.
 */
bool frustum_contains_point(Frustum* frustum, vec3 point);

/**
 * Checks if a bounding sphere is inside the frustum.
 */
bool frustum_contains_sphere(Frustum* frustum, vec3 center, float radius);

/**
 * Checks if a bounding box (AABB) is inside the frustum.
 */
bool frustum_contains_aabb(Frustum* frustum, vec3 min, vec3 max);

#endif // FRUSTUM_H
