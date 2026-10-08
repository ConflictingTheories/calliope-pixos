#ifndef PARTICLE_MANAGER_H
#define PARTICLE_MANAGER_H

#include "math/vector.h"
#include "rendering/gles_compat.h"
#include "hud/hud_manager.h"
#include <stdbool.h>

#define MAX_PARTICLES 1000

typedef struct {
    vec3 pos;
    vec3 vel;
    vec3 gravity;
    float drag;
    float life;
    float age;
    float size;
    HudColor color;
    bool active;
} Particle;

typedef struct {
    int count;
    float life;
    float speed;
    float spread;
    float size;
    HudColor color;
    vec3 gravity;
    float drag;
} ParticleConfig;

typedef struct {
    struct GLEngine* engine;
    struct RenderManager* render_manager;
    Particle particles[MAX_PARTICLES];
    int particle_count;
    
    // Rendering resources
    GLuint vao;
    GLuint vbo_pos;
    GLuint vbo_color;
    GLuint vbo_size;
    
    bool initialized;
} ParticleManager;

/**
 * Initializes the particle manager.
 */
void particle_manager_init(ParticleManager* pm, struct GLEngine* engine);

/**
 * Updates all active particles.
 */
void particle_manager_update(ParticleManager* pm, double delta_time);

/**
 * Renders all active particles.
 */
void particle_manager_render(ParticleManager* pm);

/**
 * Emits particles at a position with a given configuration.
 */
void particle_manager_emit(ParticleManager* pm, vec3 pos, ParticleConfig config);

/**
 * Gets a preset configuration by name.
 */
ParticleConfig particle_get_preset(const char* name);

/**
 * Destroys the particle manager.
 */
void particle_manager_destroy(ParticleManager* pm);

#endif // PARTICLE_MANAGER_H
