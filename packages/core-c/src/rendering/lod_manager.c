#include "lod_manager.h"
#include "../engine.h"
#include "../render_manager.h"
#include <math.h>
#include <string.h>

void lod_manager_init(LodManager* lm, struct GLEngine* engine) {
    memset(lm, 0, sizeof(LodManager));
    lm->engine = engine;
    lm->enabled = true;
    
    // Default levels
    lm->default_count = 3;
    lm->default_levels[0] = (LodLevel){10.0f, 1.0f};  // High
    lm->default_levels[1] = (LodLevel){30.0f, 0.5f};  // Medium
    lm->default_levels[2] = (LodLevel){100.0f, 0.1f}; // Low
}

LodConfig lod_get_default_config(void) {
    LodConfig c = {0};
    c.level_count = 3;
    c.levels[0] = (LodLevel){10.0f, 1.0f};
    c.levels[1] = (LodLevel){30.0f, 0.5f};
    c.levels[2] = (LodLevel){100.0f, 0.1f};
    c.hysteresis = 0.1f;
    return c;
}

float lod_get_detail_factor(LodManager* lm, vec3 pos) {
    if (!lm || !lm->enabled || !lm->engine) return 1.0f;
    
    RenderManager* rm = lm->engine->render_manager;
    if (!rm) return 1.0f;
    
    vec3 cam_pos = rm->camera.position;
    float dx = pos.x - cam_pos.x;
    float dy = pos.y - cam_pos.y;
    float dz = pos.z - cam_pos.z;
    float distance = sqrtf(dx * dx + dy * dy + dz * dz);
    
    for (int i = 0; i < lm->default_count; i++) {
        if (distance <= lm->default_levels[i].distance) {
            return lm->default_levels[i].detail_factor;
        }
    }
    
    return 0.05f; // Absolute minimum
}

int lod_get_level_index(LodManager* lm, vec3 pos, LodConfig* config) {
    if (!lm || !lm->enabled || !lm->engine) return 0;
    
    RenderManager* rm = lm->engine->render_manager;
    if (!rm) return 0;
    
    vec3 cam_pos = rm->camera.position;
    float dx = pos.x - cam_pos.x;
    float dy = pos.y - cam_pos.y;
    float dz = pos.z - cam_pos.z;
    float distance = sqrtf(dx * dx + dy * dy + dz * dz);
    
    const LodConfig* c = config ? config : (const LodConfig*)&lm->default_levels; // This cast is a bit dirty but works for default
    // Wait, let's just use a pointer to the levels array
    const LodLevel* levels = config ? config->levels : lm->default_levels;
    int count = config ? config->level_count : lm->default_count;
    
    for (int i = 0; i < count; i++) {
        if (distance <= levels[i].distance) {
            return i;
        }
    }
    
    return count - 1;
}
