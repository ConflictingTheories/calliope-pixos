/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

#include "light_manager.h"
#include "shader.h"
#include <stdio.h>
#include <string.h>

void light_manager_init(LightManager* lm) {
    memset(lm, 0, sizeof(LightManager));
    lm->ambient_strength = 0.3f;
    
    // Initialize all lights as disabled
    for (int i = 0; i < MAX_LIGHTS; i++) {
        lm->lights[i].enabled = false;
    }
    
    printf("LightManager initialized\n");
}

int light_manager_add_light(LightManager* lm, const char* id,
                            vec3 position, vec3 color, vec3 attenuation,
                            vec3 direction, float density, vec3 scattering,
                            bool enabled) {
    if (!lm) return -1;
    
    // Find an empty slot
    int slot = -1;
    for (int i = 0; i < MAX_LIGHTS; i++) {
        if (!lm->lights[i].enabled && strlen(lm->lights[i].id) == 0) {
            slot = i;
            break;
        }
    }
    
    if (slot == -1) {
        fprintf(stderr, "No available light slots\n");
        return -1;
    }
    
    PointLight* light = &lm->lights[slot];
    strncpy(light->id, id ? id : "", 63);
    light->id[63] = '\0';
    light->position = position;
    light->color = color;
    light->attenuation = attenuation;
    light->direction = direction;
    light->density = density;
    light->scattering_coefficients = scattering;
    light->enabled = enabled;
    
    lm->light_count++;
    
    printf("Light added: %s (slot %d)\n", light->id, slot);
    return slot;
}

void light_manager_update_position(LightManager* lm, int index, vec3 position) {
    if (!lm || index < 0 || index >= MAX_LIGHTS) return;
    lm->lights[index].position = position;
}

void light_manager_update_color(LightManager* lm, int index, vec3 color) {
    if (!lm || index < 0 || index >= MAX_LIGHTS) return;
    lm->lights[index].color = color;
}

void light_manager_set_enabled(LightManager* lm, int index, bool enabled) {
    if (!lm || index < 0 || index >= MAX_LIGHTS) return;
    lm->lights[index].enabled = enabled;
}

void light_manager_remove_light(LightManager* lm, int index) {
    if (!lm || index < 0 || index >= MAX_LIGHTS) return;
    
    memset(&lm->lights[index], 0, sizeof(PointLight));
    lm->light_count--;
}

int light_manager_get_light_by_id(LightManager* lm, const char* id) {
    if (!lm || !id) return -1;
    
    for (int i = 0; i < MAX_LIGHTS; i++) {
        if (strcmp(lm->lights[i].id, id) == 0) {
            return i;
        }
    }
    return -1;
}

void light_manager_set_ambient(LightManager* lm, float strength) {
    if (lm) {
        lm->ambient_strength = strength;
    }
}

void light_manager_set_uniforms(LightManager* lm, Shader* shader) {
    if (!lm || !shader) return;
    
    char uniform_name[128];
    
    // Set ambient strength
    shader_set_float(shader, "uAmbientStrength", lm->ambient_strength);
    
    // Set each light's uniforms
    for (int i = 0; i < MAX_LIGHTS; i++) {
        PointLight* light = &lm->lights[i];
        
        snprintf(uniform_name, sizeof(uniform_name), "uLights[%d].enabled", i);
        shader_set_int(shader, uniform_name, light->enabled ? 1 : 0);
        
        if (light->enabled) {
            snprintf(uniform_name, sizeof(uniform_name), "uLights[%d].position", i);
            shader_set_vec3(shader, uniform_name, light->position.x, light->position.y, light->position.z);
            
            snprintf(uniform_name, sizeof(uniform_name), "uLights[%d].color", i);
            shader_set_vec3(shader, uniform_name, light->color.x, light->color.y, light->color.z);
            
            snprintf(uniform_name, sizeof(uniform_name), "uLights[%d].attenuation", i);
            shader_set_vec3(shader, uniform_name, light->attenuation.x, light->attenuation.y, light->attenuation.z);
            
            snprintf(uniform_name, sizeof(uniform_name), "uLights[%d].density", i);
            shader_set_float(shader, uniform_name, light->density);
        }
    }
}

void light_manager_clear(LightManager* lm) {
    if (!lm) return;
    
    for (int i = 0; i < MAX_LIGHTS; i++) {
        memset(&lm->lights[i], 0, sizeof(PointLight));
    }
    lm->light_count = 0;
}
