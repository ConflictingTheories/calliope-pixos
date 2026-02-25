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

#include "world.h"
#include "../engine.h"
#include "../resource/resource_manager.h"
#include "../render_manager.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int next_world_obj_id = 1;

void world_init(World* world, const char* id, struct GLEngine* engine) {
    memset(world, 0, sizeof(World));
    world->obj_id = next_world_obj_id++;
    strncpy(world->id, id, MAX_WORLD_ID - 1);
    world->engine = engine;
    world->is_paused = true;
    world->last_update_time = 0.0;
    
    printf("World initialized: %s\n", id);
}

Zone* world_create_zone(World* world, const char* zone_id) {
    if (!world || world->zone_count >= MAX_WORLD_ZONES) {
        return NULL;
    }
    
    Zone* zone = (Zone*)malloc(sizeof(Zone));
    if (!zone) {
        fprintf(stderr, "Failed to allocate zone\n");
        return NULL;
    }
    
    zone_init(zone, zone_id, world);
    world->zones[world->zone_count++] = zone;
    
    // Set as active zone if first zone
    if (world->active_zone == NULL) {
        world->active_zone = zone;
    }
    
    return zone;
}

bool world_add_zone(World* world, Zone* zone) {
    if (!world || !zone || world->zone_count >= MAX_WORLD_ZONES) {
        return false;
    }
    
    zone->world = world;
    world->zones[world->zone_count++] = zone;
    
    if (world->active_zone == NULL) {
        world->active_zone = zone;
    }
    
    return true;
}

Zone* world_get_zone(World* world, const char* zone_id) {
    if (!world || !zone_id) return NULL;
    
    for (int i = 0; i < world->zone_count; i++) {
        if (strcmp(world->zones[i]->id, zone_id) == 0) {
            return world->zones[i];
        }
    }
    return NULL;
}

void world_set_active_zone(World* world, Zone* zone) {
    if (!world || !zone) return;
    
    Zone* old_zone = world->active_zone;
    world->active_zone = zone;
    
    if (world->on_zone_change && old_zone != zone) {
        world->on_zone_change(world, old_zone, zone);
    }
    
    printf("Active zone changed: %s -> %s\n", 
           old_zone ? old_zone->id : "none", 
           zone->id);
}

Tileset* world_load_tileset(World* world, const char* texture_path, int tile_size) {
    if (!world || !texture_path || world->tileset_count >= MAX_WORLD_TILESETS) {
        return NULL;
    }
    
    // Check if already loaded
    Tileset* existing = world_get_tileset(world, texture_path);
    if (existing) {
        return existing;
    }
    
    Tileset* tileset = (Tileset*)malloc(sizeof(Tileset));
    if (!tileset) {
        fprintf(stderr, "Failed to allocate tileset\n");
        return NULL;
    }
    
    if (!tileset_load_simple(tileset, texture_path, tile_size, world->engine->resource_manager)) {
        free(tileset);
        return NULL;
    }
    
    world->tilesets[world->tileset_count++] = tileset;
    return tileset;
}

Tileset* world_get_tileset(World* world, const char* texture_path) {
    if (!world || !texture_path) return NULL;
    
    for (int i = 0; i < world->tileset_count; i++) {
        if (world->tilesets[i]->texture.path && 
            strstr(world->tilesets[i]->texture.path, texture_path) != NULL) {
            return world->tilesets[i];
        }
    }
    return NULL;
}

Sprite* world_create_sprite(World* world, SpriteDefinition* def) {
    if (!world || !def || world->sprite_count >= MAX_WORLD_SPRITES) {
        return NULL;
    }
    
    Sprite* sprite = (Sprite*)malloc(sizeof(Sprite));
    if (!sprite) {
        fprintf(stderr, "Failed to allocate sprite\n");
        return NULL;
    }
    
    if (!sprite_create(sprite, def, world->engine->resource_manager)) {
        free(sprite);
        return NULL;
    }
    
    world->sprites[world->sprite_count++] = sprite;
    return sprite;
}

Sprite* world_get_sprite(World* world, const char* sprite_id) {
    if (!world || !sprite_id) return NULL;
    
    for (int i = 0; i < world->sprite_count; i++) {
        if (strcmp(world->sprites[i]->id, sprite_id) == 0) {
            return world->sprites[i];
        }
    }
    return NULL;
}

void world_set_avatar(World* world, Sprite* avatar) {
    if (world) {
        world->avatar = avatar;
    }
}

Sprite* world_get_avatar(World* world) {
    return world ? world->avatar : NULL;
}

Zone* world_zone_containing(World* world, float x, float y) {
    if (!world) return NULL;
    
    for (int i = 0; i < world->zone_count; i++) {
        Zone* zone = world->zones[i];
        if (zone->loaded &&
            x >= zone->bounds[0] && x < zone->bounds[2] &&
            y >= zone->bounds[1] && y < zone->bounds[3]) {
            return zone;
        }
    }
    return NULL;
}

void world_update(World* world, double timestamp) {
    if (!world || world->is_paused) return;
    
    float delta_time = (float)(timestamp - world->last_update_time);
    world->last_update_time = timestamp;
    
    // Update active zone
    if (world->active_zone) {
        zone_update(world->active_zone, delta_time);
    }
    
    // Update avatar (might be in a different zone for transitions)
    if (world->avatar) {
        sprite_update(world->avatar, delta_time);
    }
}

void world_render(World* world, struct RenderManager* render_manager) {
    if (!world || !render_manager) return;
    
    // Render active zone tiles (TODO - Add support for multiple zones ->active_zones)
    if (world->active_zone) {
        zone_draw_tiles(world->active_zone, render_manager);
        zone_draw_sprites(world->active_zone, render_manager);
    }
    
    // Render particles
    particle_manager_render(&render_manager->particle_manager);
}

Zone* world_load_zone(World* world, const char* zone_name) {
    if (!world || !zone_name) return NULL;
    
    // Check if zone is already loaded
    Zone* zone = world_get_zone(world, zone_name);
    if (zone) {
        world_set_active_zone(world, zone);
        return zone;
    }
    
    // If not loaded, create a new one
    // Note: In a real game engine, this would trigger an async load from disk/network
    // For now we create a placeholder and expect data to be loaded later
    zone = world_create_zone(world, zone_name);
    if (zone) {
        world_set_active_zone(world, zone);
    }
    
    return zone;
}

void world_destroy(World* world) {
    if (!world) return;
    
    // Destroy all zones
    for (int i = 0; i < world->zone_count; i++) {
        zone_destroy(world->zones[i]);
        free(world->zones[i]);
    }
    
    // Destroy all tilesets
    for (int i = 0; i < world->tileset_count; i++) {
        tileset_destroy(world->tilesets[i]);
        free(world->tilesets[i]);
    }
    
    // Sprites are owned by zones, so they're already destroyed
    
    memset(world, 0, sizeof(World));
    printf("World destroyed\n");
}
