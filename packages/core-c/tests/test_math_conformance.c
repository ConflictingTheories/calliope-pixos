/*
 * P6-07 — Native conformance subset (provisional).
 *
 * Scope note: the full conformance subset (package manifest/load,
 * script/save cases against JS golden hashes) awaits P6-06 (approved native
 * product scope). These math cases are scope-independent: pure functions,
 * deterministic, no GL context required. They pin the C math behavior that
 * the JS engine (pixospritz-math) must agree with.
 *
 * Build: via CTest (add_subdirectory(tests) in the top-level CMakeLists).
 * Returns 0 on success, 1 on any failure.
 */
#include <stdio.h>
#include <math.h>
#include "math/vector.h"
#include "math/matrix4.h"
#include "math/aabb.h"

#define EPS 1e-5f

static int failures = 0;
static int checks = 0;

#define CHECK(cond) do { \
    checks++; \
    if (!(cond)) { failures++; printf("FAIL %s:%d: %s\n", __FILE__, __LINE__, #cond); } \
} while (0)

#define CHECKF(a, b) CHECK(fabsf((a) - (b)) < EPS)

static void test_vec3(void) {
    vec3 a = vec3_new(1.0f, 2.0f, 3.0f);
    vec3 b = vec3_new(4.0f, -1.0f, 0.5f);
    vec3 s = vec3_add(a, b);
    CHECKF(s.x, 5.0f); CHECKF(s.y, 1.0f); CHECKF(s.z, 3.5f);
    vec3 d = vec3_sub(a, b);
    CHECKF(d.x, -3.0f); CHECKF(d.y, 3.0f); CHECKF(d.z, 2.5f);
    CHECKF(vec3_dot(a, b), 1.0f*4.0f + 2.0f*-1.0f + 3.0f*0.5f);
    vec3 c = vec3_cross(vec3_new(1,0,0), vec3_new(0,1,0));
    CHECKF(c.x, 0.0f); CHECKF(c.y, 0.0f); CHECKF(c.z, 1.0f);
    vec3 n = vec3_normalize(vec3_new(0.0f, 3.0f, 4.0f));
    CHECKF(n.x, 0.0f); CHECKF(n.y, 0.6f); CHECKF(n.z, 0.8f);
    CHECKF(vec3_length(vec3_new(3.0f, 4.0f, 0.0f)), 5.0f);
}

static void test_mat4(void) {
    mat4 I = mat4_identity();
    for (int r = 0; r < 4; r++)
        for (int c = 0; c < 4; c++)
            CHECKF(I.m[r * 4 + c], r == c ? 1.0f : 0.0f);
}

static void test_aabb(void) {
    AABB a = aabb_new(vec3_new(0,0,0), vec3_new(2,2,2));
    AABB b = aabb_new(vec3_new(1,1,1), vec3_new(3,3,3));
    AABB c = aabb_new(vec3_new(5,5,5), vec3_new(6,6,6));
    CHECK(aabb_intersects(a, b));
    CHECK(!aabb_intersects(a, c));
    CHECK(aabb_contains_point(a, vec3_new(1,1,1)));
    CHECK(!aabb_contains_point(a, vec3_new(4,4,4)));
    vec3 ctr = aabb_center(a);
    CHECKF(ctr.x, 1.0f); CHECKF(ctr.y, 1.0f); CHECKF(ctr.z, 1.0f);
}

int main(void) {
    test_vec3();
    test_mat4();
    test_aabb();
    printf("[conformance] %d checks, %d failures\n", checks, failures);
    return failures ? 1 : 0;
}
