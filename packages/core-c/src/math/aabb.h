#ifndef AABB_H
#define AABB_H

#include "vector.h"
#include <stdbool.h>

/**
 * Axis-Aligned Bounding Box (AABB)
 */
typedef struct {
    vec3 min;
    vec3 max;
} AABB;

/**
 * Creates a new AABB from min and max points.
 */
static inline AABB aabb_new(vec3 min, vec3 max) {
    AABB aabb = {min, max};
    return aabb;
}

/**
 * Checks if two AABBs intersect.
 */
static inline bool aabb_intersects(AABB a, AABB b) {
    return (a.min.x <= b.max.x && a.max.x >= b.min.x) &&
           (a.min.y <= b.max.y && a.max.y >= b.min.y) &&
           (a.min.z <= b.max.z && a.max.z >= b.min.z);
}

/**
 * Checks if a point is inside an AABB.
 */
static inline bool aabb_contains_point(AABB aabb, vec3 point) {
    return (point.x >= aabb.min.x && point.x <= aabb.max.x) &&
           (point.y >= aabb.min.y && point.y <= aabb.max.y) &&
           (point.z >= aabb.min.z && point.z <= aabb.max.z);
}

/**
 * Calculates the center of an AABB.
 */
static inline vec3 aabb_center(AABB aabb) {
    return vec3_scale(vec3_add(aabb.min, aabb.max), 0.5f);
}

/**
 * Calculates the size of an AABB.
 */
static inline vec3 aabb_size(AABB aabb) {
    return vec3_sub(aabb.max, aabb.min);
}

/**
 * Merges two AABBs into one that contains both.
 */
static inline AABB aabb_merge(AABB a, AABB b) {
    AABB result;
    result.min.x = (a.min.x < b.min.x) ? a.min.x : b.min.x;
    result.min.y = (a.min.y < b.min.y) ? a.min.y : b.min.y;
    result.min.z = (a.min.z < b.min.z) ? a.min.z : b.min.z;
    result.max.x = (a.max.x > b.max.x) ? a.max.x : b.max.x;
    result.max.y = (a.max.y > b.max.y) ? a.max.y : b.max.y;
    result.max.z = (a.max.z > b.max.z) ? a.max.z : b.max.z;
    return result;
}

#endif // AABB_H
