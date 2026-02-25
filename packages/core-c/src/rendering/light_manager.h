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

#ifndef LIGHT_MANAGER_H
#define LIGHT_MANAGER_H

#include "../math/vector.h"
#include "shader.h"
#include <stdbool.h>

// Maximum number of point lights
#define MAX_LIGHTS 32

/**
 * PointLight - A point light source in the scene.
 */
typedef struct PointLight {
    bool enabled;
    char id[64];
    vec3 position;
    vec3 color;
    vec3 attenuation;       // constant, linear, quadratic
    vec3 direction;         // For directional/spot lights
    float density;          // For volumetric effects
    vec3 scattering_coefficients;
} PointLight;

/**
 * LightManager - Manages all lights in the scene.
 */
typedef struct LightManager {
    PointLight lights[MAX_LIGHTS];
    int light_count;
    float ambient_strength;
} LightManager;

// Forward declaration
struct RenderManager;
struct Shader;

/**
 * Initializes the light manager.
 * @param lm Pointer to the light manager
 */
void light_manager_init(LightManager* lm);

/**
 * Adds a point light to the scene.
 * @param lm Pointer to the light manager
 * @param id Light identifier
 * @param position Light position
 * @param color Light color (RGB)
 * @param attenuation Attenuation factors (constant, linear, quadratic)
 * @param direction Light direction (for spot/directional)
 * @param density Density for volumetric effects
 * @param scattering Scattering coefficients
 * @param enabled Whether the light is enabled
 * @return Light index or -1 on failure
 */
int light_manager_add_light(LightManager* lm, const char* id, 
                            vec3 position, vec3 color, vec3 attenuation,
                            vec3 direction, float density, vec3 scattering,
                            bool enabled);

/**
 * Updates a light's position.
 * @param lm Pointer to the light manager
 * @param index Light index
 * @param position New position
 */
void light_manager_update_position(LightManager* lm, int index, vec3 position);

/**
 * Updates a light's color.
 * @param lm Pointer to the light manager
 * @param index Light index
 * @param color New color
 */
void light_manager_update_color(LightManager* lm, int index, vec3 color);

/**
 * Enables or disables a light.
 * @param lm Pointer to the light manager
 * @param index Light index
 * @param enabled Whether to enable the light
 */
void light_manager_set_enabled(LightManager* lm, int index, bool enabled);

/**
 * Removes a light.
 * @param lm Pointer to the light manager
 * @param index Light index
 */
void light_manager_remove_light(LightManager* lm, int index);

/**
 * Gets a light by ID.
 * @param lm Pointer to the light manager
 * @param id Light identifier
 * @return Light index or -1 if not found
 */
int light_manager_get_light_by_id(LightManager* lm, const char* id);

/**
 * Sets the ambient light strength.
 * @param lm Pointer to the light manager
 * @param strength Ambient strength (0-1)
 */
void light_manager_set_ambient(LightManager* lm, float strength);

/**
 * Uploads light uniforms to a shader.
 * @param lm Pointer to the light manager
 * @param shader Pointer to the shader
 */
void light_manager_set_uniforms(LightManager* lm, Shader* shader);

/**
 * Clears all lights.
 * @param lm Pointer to the light manager
 */
void light_manager_clear(LightManager* lm);

#endif // LIGHT_MANAGER_H
