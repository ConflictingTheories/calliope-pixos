#ifndef LOD_MANAGER_H
#define LOD_MANAGER_H

#include "math/vector.h"
#include <stdbool.h>

#define MAX_LOD_LEVELS 4

typedef struct {
    float distance;
    float detail_factor;
} LodLevel;

typedef struct {
    LodLevel levels[MAX_LOD_LEVELS];
    int level_count;
    float hysteresis;
} LodConfig;

typedef struct {
    struct GLEngine* engine;
    LodLevel default_levels[MAX_LOD_LEVELS];
    int default_count;
    bool enabled;
} LodManager;

/**
 * Initializes the LOD manager.
 */
void lod_manager_init(LodManager* lm, struct GLEngine* engine);

/**
 * Gets the detail factor (0-1) for a position relative to the camera.
 */
float lod_get_detail_factor(LodManager* lm, vec3 pos);

/**
 * Gets the current LOD index for a position.
 */
int lod_get_level_index(LodManager* lm, vec3 pos, LodConfig* config);

/**
 * Creates a default LOD config.
 */
LodConfig lod_get_default_config(void);

#endif // LOD_MANAGER_H
