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

#ifndef RESOURCE_MANAGER_H
#define RESOURCE_MANAGER_H

#include "texture.h"
#include <stdbool.h>

// Maximum number of cached resources
#define MAX_TEXTURES 256
#define MAX_RESOURCE_PATH 512

// Forward declaration
struct GLEngine;

/**
 * TextureCache entry
 */
typedef struct TextureCacheEntry {
    char path[MAX_RESOURCE_PATH];
    Texture texture;
    bool in_use;
} TextureCacheEntry;

/**
 * ResourceManager - Manages loading and caching of game resources.
 */
typedef struct ResourceManager {
    struct GLEngine* engine;
    TextureCacheEntry texture_cache[MAX_TEXTURES];
    int texture_count;
    char base_path[MAX_RESOURCE_PATH];
} ResourceManager;

/**
 * Initializes the resource manager.
 * @param rm Pointer to ResourceManager
 * @param engine Pointer to the engine
 * @param base_path Base path for resources (e.g., "./assets/")
 */
void resource_manager_init(ResourceManager* rm, struct GLEngine* engine, const char* base_path);

/**
 * Loads a texture, using cache if already loaded.
 * @param rm Pointer to ResourceManager
 * @param path Relative path to the texture file
 * @return Pointer to the loaded texture (cached)
 */
Texture* resource_manager_load_texture(ResourceManager* rm, const char* path);

/**
 * Gets a cached texture by path.
 * @param rm Pointer to ResourceManager
 * @param path Relative path to the texture
 * @return Pointer to the texture or NULL if not found
 */
Texture* resource_manager_get_texture(ResourceManager* rm, const char* path);

/**
 * Preloads multiple textures.
 * @param rm Pointer to ResourceManager
 * @param paths Array of paths
 * @param count Number of paths
 */
void resource_manager_preload_textures(ResourceManager* rm, const char** paths, int count);

/**
 * Clears the texture cache and frees all textures.
 * @param rm Pointer to ResourceManager
 */
void resource_manager_clear_textures(ResourceManager* rm);

/**
 * Destroys the resource manager and frees all resources.
 * @param rm Pointer to ResourceManager
 */
void resource_manager_destroy(ResourceManager* rm);

#endif // RESOURCE_MANAGER_H
