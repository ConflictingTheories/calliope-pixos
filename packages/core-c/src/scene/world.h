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

#ifndef WORLD_H
#define WORLD_H

#include "zone.h"
#include "sprite.h"
#include "tileset.h"
#include <stdbool.h>

// Maximum entities in the world
#define MAX_WORLD_ZONES 32
#define MAX_WORLD_SPRITES 512
#define MAX_WORLD_TILESETS 16
#define MAX_WORLD_ID 64

// Forward declarations
struct GLEngine;
struct ResourceManager;
struct RenderManager;

/**
 * World - Container for all game zones, sprites, and tilesets.
 */
typedef struct World {
    int obj_id;
    char id[MAX_WORLD_ID];
    
    // Engine reference
    struct GLEngine* engine;
    
    // Zones
    Zone* zones[MAX_WORLD_ZONES];
    int zone_count;
    Zone* active_zone;
    
    // All sprites (global list)
    Sprite* sprites[MAX_WORLD_SPRITES];
    int sprite_count;
    
    // Tilesets
    Tileset* tilesets[MAX_WORLD_TILESETS];
    int tileset_count;
    
    // Player avatar
    Sprite* avatar;
    
    // Game state
    bool is_paused;
    double last_update_time;
    
    // Callbacks
    void (*on_zone_change)(struct World* world, Zone* old_zone, Zone* new_zone);
} World;

/**
 * Initializes a world.
 * @param world Pointer to the world
 * @param id World identifier
 * @param engine Pointer to the engine
 */
void world_init(World* world, const char* id, struct GLEngine* engine);

/**
 * Creates and adds a new zone to the world.
 * @param world Pointer to the world
 * @param zone_id Zone identifier
 * @return Pointer to the new zone or NULL
 */
Zone* world_create_zone(World* world, const char* zone_id);

/**
 * Adds an existing zone to the world.
 * @param world Pointer to the world
 * @param zone Pointer to the zone
 * @return true on success
 */
bool world_add_zone(World* world, Zone* zone);

/**
 * Gets a zone by ID.
 * @param world Pointer to the world
 * @param zone_id Zone identifier
 * @return Pointer to the zone or NULL
 */
Zone* world_get_zone(World* world, const char* zone_id);

/**
 * Sets the active zone.
 * @param world Pointer to the world
 * @param zone Pointer to the zone to activate
 */
void world_set_active_zone(World* world, Zone* zone);

/**
 * Loads a zone from file and sets it as active.
 * @param world Pointer to the world
 * @param zone_name Name of the zone to load
 * @return Pointer to the loaded zone or NULL
 */
Zone* world_load_zone(World* world, const char* zone_name);

/**
 * Loads and adds a tileset to the world.
 * @param world Pointer to the world
 * @param texture_path Path to tileset texture
 * @param tile_size Tile size in pixels
 * @return Pointer to the loaded tileset or NULL
 */
Tileset* world_load_tileset(World* world, const char* texture_path, int tile_size);

/**
 * Gets a tileset by texture path.
 * @param world Pointer to the world
 * @param texture_path Path to the tileset texture
 * @return Pointer to the tileset or NULL
 */
Tileset* world_get_tileset(World* world, const char* texture_path);

/**
 * Creates a sprite from a definition and adds it to the world.
 * @param world Pointer to the world
 * @param def Sprite definition
 * @return Pointer to the created sprite or NULL
 */
Sprite* world_create_sprite(World* world, SpriteDefinition* def);

/**
 * Gets a sprite by ID.
 * @param world Pointer to the world
 * @param sprite_id Sprite identifier
 * @return Pointer to the sprite or NULL
 */
Sprite* world_get_sprite(World* world, const char* sprite_id);

/**
 * Sets the player avatar.
 * @param world Pointer to the world
 * @param avatar Pointer to the avatar sprite
 */
void world_set_avatar(World* world, Sprite* avatar);

/**
 * Gets the avatar.
 * @param world Pointer to the world
 * @return Pointer to the avatar or NULL
 */
Sprite* world_get_avatar(World* world);

/**
 * Finds which zone contains a world position.
 * @param world Pointer to the world
 * @param x World X coordinate
 * @param y World Y coordinate
 * @return Pointer to the zone or NULL
 */
Zone* world_zone_containing(World* world, float x, float y);

/**
 * Updates the world state.
 * @param world Pointer to the world
 * @param timestamp Current time in seconds
 */
void world_update(World* world, double timestamp);

/**
 * Renders the world.
 * @param world Pointer to the world
 * @param render_manager Pointer to the render manager
 */
void world_render(World* world, struct RenderManager* render_manager);

/**
 * Destroys the world and frees all resources.
 * @param world Pointer to the world
 */
void world_destroy(World* world);

#endif // WORLD_H
