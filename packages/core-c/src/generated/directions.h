/*
 * ---------------------------------------------------------------
 *        Calliope - Pixos Engine - GENERATED FILE
 * ---------------------------------------------------------------
 * THIS FILE IS AUTO-GENERATED FROM specs/*.json
 * DO NOT EDIT MANUALLY - Changes will be overwritten!
 * 
 * Direction constants for 8-directional movement
 * 
 * Generated: 2026-01-09T23:04:58.067Z
 * ---------------------------------------------------------------
 */

#ifndef PIXOS_GENERATED_DIRECTIONS_H
#define PIXOS_GENERATED_DIRECTIONS_H

#include <math.h>

/* Direction indices */
typedef enum {
    DIR_N = 0,
    DIR_NE = 1,
    DIR_E = 2,
    DIR_SE = 3,
    DIR_S = 4,
    DIR_SW = 5,
    DIR_W = 6,
    DIR_NW = 7
} Direction;

#define DIR_COUNT 8

/* Direction unit vectors (x, y) */
static const float DIR_VECTORS[DIR_COUNT][2] = {
    { 0.000000f, -1.000000f },  /* N */
    { 0.707107f, -0.707107f },  /* NE */
    { 1.000000f, 0.000000f },  /* E */
    { 0.707107f, 0.707107f },  /* SE */
    { 0.000000f, 1.000000f },  /* S */
    { -0.707107f, 0.707107f },  /* SW */
    { -1.000000f, 0.000000f },  /* W */
    { -0.707107f, -0.707107f }  /* NW */
};

/* Direction angles in radians */
static const float DIR_ANGLES[DIR_COUNT] = {
    0.0000f,  /* N */
    0.7854f,  /* NE */
    1.5708f,  /* E */
    2.3562f,  /* SE */
    3.1416f,  /* S */
    3.9270f,  /* SW */
    4.7124f,  /* W */
    5.4978f  /* NW */
};

/* Opposite direction lookup */
static const Direction DIR_OPPOSITE[DIR_COUNT] = {
    DIR_S,  /* N -> S */
    DIR_SW,  /* NE -> SW */
    DIR_W,  /* E -> W */
    DIR_NW,  /* SE -> NW */
    DIR_N,  /* S -> N */
    DIR_NE,  /* SW -> NE */
    DIR_E,  /* W -> E */
    DIR_SE  /* NW -> SE */
};

/* Clockwise rotation lookup */
static const Direction DIR_CLOCKWISE[DIR_COUNT] = {
    DIR_NE,  /* N -> NE */
    DIR_E,  /* NE -> E */
    DIR_SE,  /* E -> SE */
    DIR_S,  /* SE -> S */
    DIR_SW,  /* S -> SW */
    DIR_W,  /* SW -> W */
    DIR_NW,  /* W -> NW */
    DIR_N  /* NW -> N */
};

/* Counter-clockwise rotation lookup */
static const Direction DIR_COUNTER_CLOCKWISE[DIR_COUNT] = {
    DIR_NW,  /* N -> NW */
    DIR_N,  /* NE -> N */
    DIR_NE,  /* E -> NE */
    DIR_E,  /* SE -> E */
    DIR_SE,  /* S -> SE */
    DIR_S,  /* SW -> S */
    DIR_SW,  /* W -> SW */
    DIR_W  /* NW -> W */
};

/* Convert facing index to direction */
static inline Direction direction_from_facing(int facing) {
    return (Direction)((facing % DIR_COUNT + DIR_COUNT) % DIR_COUNT);
}

/* Get opposite direction */
static inline Direction direction_opposite(Direction dir) {
    return DIR_OPPOSITE[dir];
}

/* Rotate direction clockwise */
static inline Direction direction_rotate_cw(Direction dir) {
    return DIR_CLOCKWISE[dir];
}

/* Rotate direction counter-clockwise */
static inline Direction direction_rotate_ccw(Direction dir) {
    return DIR_COUNTER_CLOCKWISE[dir];
}

/* Get direction vector */
static inline void direction_get_vector(Direction dir, float* x, float* y) {
    *x = DIR_VECTORS[dir][0];
    *y = DIR_VECTORS[dir][1];
}

/* Get direction angle in radians */
static inline float direction_get_angle(Direction dir) {
    return DIR_ANGLES[dir];
}

/* Convert angle (radians) to nearest direction */
static inline Direction direction_from_angle(float angle) {
    /* Normalize to [0, 2π) */
    const float TWO_PI = 6.28318530718f;
    while (angle < 0) angle += TWO_PI;
    while (angle >= TWO_PI) angle -= TWO_PI;
    /* Divide by sector size (2π/8) and round */
    int sector = (int)((angle + 0.39269908f) / 0.78539816f) % 8;
    return (Direction)sector;
}

#endif /* PIXOS_GENERATED_DIRECTIONS_H */
