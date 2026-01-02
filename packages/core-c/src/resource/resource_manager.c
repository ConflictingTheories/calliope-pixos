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

#include "resource_manager.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void resource_manager_init(ResourceManager* rm, struct GLEngine* engine, const char* base_path) {
    rm->engine = engine;
    rm->texture_count = 0;
    
    // Initialize cache
    memset(rm->texture_cache, 0, sizeof(rm->texture_cache));
    
    // Set base path
    if (base_path) {
        strncpy(rm->base_path, base_path, MAX_RESOURCE_PATH - 1);
        rm->base_path[MAX_RESOURCE_PATH - 1] = '\0';
    } else {
        strcpy(rm->base_path, "./");
    }
    
    printf("ResourceManager initialized with base path: %s\n", rm->base_path);
}

Texture* resource_manager_load_texture(ResourceManager* rm, const char* path) {
    // Check if already cached
    Texture* cached = resource_manager_get_texture(rm, path);
    if (cached) {
        return cached;
    }
    
    // Find empty slot in cache
    if (rm->texture_count >= MAX_TEXTURES) {
        fprintf(stderr, "Texture cache full! Cannot load: %s\n", path);
        return NULL;
    }
    
    // Build full path
    char full_path[MAX_RESOURCE_PATH * 2];
    snprintf(full_path, sizeof(full_path), "%s%s", rm->base_path, path);
    
    // Load texture
    Texture tex = texture_load(full_path);
    if (!tex.loaded) {
        return NULL;
    }
    
    // Find empty slot
    int slot = -1;
    for (int i = 0; i < MAX_TEXTURES; i++) {
        if (!rm->texture_cache[i].in_use) {
            slot = i;
            break;
        }
    }
    
    if (slot == -1) {
        fprintf(stderr, "No available texture cache slot\n");
        texture_destroy(&tex);
        return NULL;
    }
    
    // Store in cache
    strncpy(rm->texture_cache[slot].path, path, MAX_RESOURCE_PATH - 1);
    rm->texture_cache[slot].path[MAX_RESOURCE_PATH - 1] = '\0';
    rm->texture_cache[slot].texture = tex;
    rm->texture_cache[slot].in_use = true;
    rm->texture_count++;
    
    return &rm->texture_cache[slot].texture;
}

Texture* resource_manager_get_texture(ResourceManager* rm, const char* path) {
    for (int i = 0; i < MAX_TEXTURES; i++) {
        if (rm->texture_cache[i].in_use && 
            strcmp(rm->texture_cache[i].path, path) == 0) {
            return &rm->texture_cache[i].texture;
        }
    }
    return NULL;
}

void resource_manager_preload_textures(ResourceManager* rm, const char** paths, int count) {
    for (int i = 0; i < count; i++) {
        resource_manager_load_texture(rm, paths[i]);
    }
}

void resource_manager_clear_textures(ResourceManager* rm) {
    for (int i = 0; i < MAX_TEXTURES; i++) {
        if (rm->texture_cache[i].in_use) {
            texture_destroy(&rm->texture_cache[i].texture);
            rm->texture_cache[i].in_use = false;
            memset(rm->texture_cache[i].path, 0, MAX_RESOURCE_PATH);
        }
    }
    rm->texture_count = 0;
}

void resource_manager_destroy(ResourceManager* rm) {
    resource_manager_clear_textures(rm);
    printf("ResourceManager destroyed\n");
}
