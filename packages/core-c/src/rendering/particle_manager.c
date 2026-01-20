#include "particle_manager.h"
#include "../engine.h"
#include "../render_manager.h"
#include <stdlib.h>
#include <string.h>
#include <math.h>

static float random_float(float min, float max) {
    return min + (float)rand() / (float)RAND_MAX * (max - min);
}

void particle_manager_init(ParticleManager* pm, struct GLEngine* engine) {
    memset(pm, 0, sizeof(ParticleManager));
    pm->engine = engine;
    pm->render_manager = engine->render_manager;
    pm->initialized = true;
}

void particle_manager_update(ParticleManager* pm, double delta_time) {
    if (!pm || !pm->initialized) return;

    float dt = (float)delta_time;
    pm->particle_count = 0;

    for (int i = 0; i < MAX_PARTICLES; i++) {
        Particle* p = &pm->particles[i];
        if (!p->active) continue;

        p->age += dt;
        if (p->age >= p->life) {
            p->active = false;
            continue;
        }

        // Apply physics
        p->vel.x += p->gravity.x * dt;
        p->vel.y += p->gravity.y * dt;
        p->vel.z += p->gravity.z * dt;

        p->vel.x *= powf(p->drag, dt * 60.0f);
        p->vel.y *= powf(p->drag, dt * 60.0f);
        p->vel.z *= powf(p->drag, dt * 60.0f);

        p->pos.x += p->vel.x * dt;
        p->pos.y += p->vel.y * dt;
        p->pos.z += p->vel.z * dt;

        pm->particle_count++;
    }
}

void particle_manager_emit(ParticleManager* pm, vec3 pos, ParticleConfig config) {
    if (!pm || !pm->initialized) return;

    int emitted = 0;
    for (int i = 0; i < MAX_PARTICLES && emitted < config.count; i++) {
        Particle* p = &pm->particles[i];
        if (p->active) continue;

        p->active = true;
        p->pos = pos;
        
        float sx = random_float(-1.0f, 1.0f) * config.spread;
        float sy = random_float(-1.0f, 1.0f) * config.spread;
        float sz = random_float(-1.0f, 1.0f) * config.spread;
        
        float speed = config.speed * random_float(0.5f, 1.5f);
        p->vel = vec3_new(sx * speed, sy * speed, sz * speed);
        
        p->gravity = config.gravity;
        p->drag = config.drag;
        p->life = config.life / 1000.0f;
        p->age = 0;
        p->size = config.size * random_float(0.8f, 1.2f);
        p->color = config.color;

        emitted++;
    }
}

ParticleConfig particle_get_preset(const char* name) {
    ParticleConfig c = {0};
    c.count = 8;
    c.life = 1000;
    c.speed = 2.0f;
    c.spread = 0.5f;
    c.size = 0.2f;
    c.color = HUD_COLOR_WHITE;
    c.gravity = vec3_new(0, -9.8f, 0);
    c.drag = 0.99f;

    if (strcmp(name, "sparks") == 0) {
        c.count = 12; c.life = 700; c.speed = 5.0f; c.spread = 1.2f; c.size = 0.1f;
        c.color = (HudColor){1.0f, 0.8f, 0.2f, 1.0f};
        c.gravity = vec3_new(0, -15.0f, 0);
    } else if (strcmp(name, "flame") == 0) {
        c.count = 50; c.life = 1500; c.speed = 1.0f; c.spread = 0.5f; c.size = 0.15f;
        c.color = (HudColor){1.0f, 0.4f, 0.1f, 0.8f};
        c.gravity = vec3_new(0, 2.0f, 0); // Rises
        c.drag = 0.95f;
    }
    
    return c;
}

void particle_manager_render(ParticleManager* pm) {
    if (!pm || !pm->initialized || pm->particle_count == 0 || !pm->render_manager) return;

    RenderManager* rm = pm->render_manager;
    render_manager_activate_sprite_shader(rm);

    // BATCH DRAWING (Simplistic for now)
    // In a real high-perf engine we'd use instancing or a dynamic mesh
    for (int i = 0; i < MAX_PARTICLES; i++) {
        Particle* p = &pm->particles[i];
        if (!p->active) continue;

        float life_ratio = p->age / p->life;
        float alpha = p->color.a * (1.0f - life_ratio * life_ratio);
        
        render_manager_push_matrix(rm);
        render_manager_translate(rm, p->pos);
        render_manager_scale(rm, vec3_new(p->size, p->size, p->size));
        
        // TODO: Update shader uniforms for color/alpha
        // shader_set_vec4(rm->current_shader, "uColor", p->color.r, p->color.g, p->color.b, alpha);
        
        // Use a 1x1 white texture or default sprite quad
        // sprite_draw_raw_quad(rm); 
        
        render_manager_pop_matrix(rm);
    }
}

void particle_manager_destroy(ParticleManager* pm) {
    if (!pm) return;
    pm->initialized = false;
}
