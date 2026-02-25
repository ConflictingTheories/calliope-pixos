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

#ifndef ZONE_H
#define ZONE_H

#include "tileset.h"
#include "sprite.h"
#include "../math/vector.h"
#include <stdbool.h>

// Maximum zone dimensions and entities
#define MAX_ZONE_ID 64
#define MAX_ZONE_WIDTH 256
#define MAX_ZONE_HEIGHT 256
#define MAX_ZONE_SPRITES 128
#define MAX_ZONE_LIGHTS 32

// Forward declarations
struct World;
struct ResourceManager;
struct RenderManager;

/**
 * Cell - A single map cell containing tile and height information.
 */
typedef struct Cell {
    int tile_index;         // Index into tileset
    TileShape shape;        // Shape override
    TileType type;          // Type override
    float height;           // Height at this cell
    bool blocking;          // Is this cell blocking?
} Cell;

/**
 * Zone - A map area with tiles, sprites, and game objects.
 */
typedef struct Zone {
    int obj_id;             // Unique object ID for picking
    char id[MAX_ZONE_ID];
    
    // Bounds and size
    int bounds[4];          // [x1, y1, x2, y2]
    int width;
    int height;
    
    // Tileset
    Tileset* tileset;
    
    // Cell data
    Cell cells[MAX_ZONE_WIDTH * MAX_ZONE_HEIGHT];
    int cell_count;
    
    // Height map for variable terrain
    float heights[MAX_ZONE_WIDTH * MAX_ZONE_HEIGHT];
    bool has_heights;
    
    // Sprites in this zone
    Sprite* sprites[MAX_ZONE_SPRITES];
    int sprite_count;
    
    // Reference to world
    struct World* world;
    
    // Loading state
    bool loaded;
    
    // OpenGL resources for batch rendering
    unsigned int vao;
    unsigned int vbo_position;
    unsigned int vbo_normal;
    unsigned int vbo_texcoord;
    int vertex_count;
    
    // Select trigger callback
    void (*on_select)(struct Zone* zone, int row, int cell);
} Zone;

/**
 * Initializes a zone with default values.
 * @param zone Pointer to the zone
 * @param id Zone identifier
 * @param world Pointer to the parent world
 */
void zone_init(Zone* zone, const char* id, struct World* world);

/**
 * Loads zone data from arrays.
 * @param zone Pointer to the zone
 * @param bounds Zone bounds [x1, y1, x2, y2]
 * @param cells Array of cell tile indices
 * @param heights Array of height values (can be NULL)
 * @param tileset Pointer to the tileset to use
 * @return true on success
 */
bool zone_load_data(Zone* zone, int bounds[4], int* cells, float* heights, Tileset* tileset);

/**
 * Generates the zone's vertex buffers for rendering.
 * @param zone Pointer to the zone
 */
void zone_generate_mesh(Zone* zone);

/**
 * Gets the height at a specific world position.
 * @param zone Pointer to the zone
 * @param x World X coordinate
 * @param y World Y coordinate
 * @return Height at the position
 */
float zone_get_height(Zone* zone, float x, float y);

/**
 * Gets the cell at a specific grid position.
 * @param zone Pointer to the zone
 * @param row Grid row
 * @param col Grid column
 * @return Pointer to the cell or NULL
 */
Cell* zone_get_cell(Zone* zone, int row, int col);

/**
 * Checks if a position is walkable.
 * @param zone Pointer to the zone
 * @param x World X coordinate
 * @param y World Y coordinate
 * @return true if walkable
 */
bool zone_is_walkable(Zone* zone, float x, float y);

/**
 * Adds a sprite to the zone.
 * @param zone Pointer to the zone
 * @param sprite Pointer to the sprite
 * @return true on success
 */
bool zone_add_sprite(Zone* zone, Sprite* sprite);

/**
 * Removes a sprite from the zone.
 * @param zone Pointer to the zone
 * @param sprite Pointer to the sprite
 * @return true if removed
 */
bool zone_remove_sprite(Zone* zone, Sprite* sprite);

/**
 * Gets a sprite by ID.
 * @param zone Pointer to the zone
 * @param id Sprite ID
 * @return Pointer to the sprite or NULL
 */
Sprite* zone_get_sprite(Zone* zone, const char* id);

/**
 * Updates all sprites in the zone.
 * @param zone Pointer to the zone
 * @param delta_time Time since last update
 */
void zone_update(Zone* zone, float delta_time);

/**
 * Draws the zone tiles.
 * @param zone Pointer to the zone
 * @param render_manager Pointer to the render manager
 */
void zone_draw_tiles(Zone* zone, struct RenderManager* render_manager);

/**
 * Draws all sprites in the zone.
 * @param zone Pointer to the zone
 * @param render_manager Pointer to the render manager
 */
void zone_draw_sprites(Zone* zone, struct RenderManager* render_manager);

/**
 * Destroys a zone and frees its resources.
 * @param zone Pointer to the zone
 */
void zone_destroy(Zone* zone);

#endif // ZONE_H
