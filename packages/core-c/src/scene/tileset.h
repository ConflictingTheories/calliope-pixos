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

#ifndef TILESET_H
#define TILESET_H

#include "../resource/texture.h"
#include "../math/vector.h"
#include <stdbool.h>

// Maximum number of tiles in a tileset
#define MAX_TILESET_TILES 256
#define MAX_TILESET_NAME 128

// Tile types (matching the JS engine)
typedef enum TileType {
    TILE_FLOOR = 0,
    TILE_WALL,
    TILE_RAMP,
    TILE_STAIRS,
    TILE_WATER,
    TILE_LAVA,
    TILE_BRIDGE,
    TILE_DOOR,
    TILE_CUSTOM
} TileType;

// Tile shape for 3D representation
typedef enum TileShape {
    SHAPE_FLAT_ALL = 0,     // Flat ground tile
    SHAPE_WALL_N,           // Wall facing north
    SHAPE_WALL_S,           // Wall facing south
    SHAPE_WALL_E,           // Wall facing east
    SHAPE_WALL_W,           // Wall facing west
    SHAPE_RAMP_N,           // Ramp going north
    SHAPE_RAMP_S,           // Ramp going south
    SHAPE_RAMP_E,           // Ramp going east
    SHAPE_RAMP_W,           // Ramp going west
    SHAPE_CORNER_NE,        // Corner piece
    SHAPE_CORNER_NW,
    SHAPE_CORNER_SE,
    SHAPE_CORNER_SW,
    SHAPE_CUBE              // Full cube
} TileShape;

/**
 * TileDefinition - Defines a single tile type in the tileset.
 */
typedef struct TileDefinition {
    char name[MAX_TILESET_NAME];
    TileShape shape;
    TileType type;
    int frame_index;        // Index in the tileset texture
    bool blocking;          // Can sprites walk through?
    float height;           // Base height of the tile
    bool animated;          // Is this tile animated?
    int anim_frames;        // Number of animation frames
    float anim_speed;       // Animation speed
} TileDefinition;

/**
 * Tileset - A collection of tiles with shared texture.
 */
typedef struct Tileset {
    char name[MAX_TILESET_NAME];
    Texture texture;
    int tile_size;          // Size of each tile in pixels (e.g., 32)
    int sheet_width;        // Width of spritesheet in tiles
    int sheet_height;       // Height of spritesheet in tiles
    TileDefinition tiles[MAX_TILESET_TILES];
    int tile_count;
    bool loaded;
    
    // Vertex data for tile meshes (generated once)
    float* flat_vertices;   // Flat tile vertices
    float* flat_normals;
    float* flat_texcoords;
    int flat_vertex_count;
    
    // OpenGL buffers
    unsigned int vao;
    unsigned int vbo_position;
    unsigned int vbo_normal;
    unsigned int vbo_texcoord;
} Tileset;

// Forward declaration
struct ResourceManager;

/**
 * Initializes a tileset structure.
 * @param tileset Pointer to the tileset
 */
void tileset_init(Tileset* tileset);

/**
 * Loads a tileset from a JSON definition file.
 * @param tileset Pointer to the tileset
 * @param json_path Path to the tileset JSON definition
 * @param rm ResourceManager for loading textures
 * @return true on success
 */
bool tileset_load(Tileset* tileset, const char* json_path, struct ResourceManager* rm);

/**
 * Loads a tileset from a texture path with default tile definitions.
 * @param tileset Pointer to the tileset
 * @param texture_path Path to the tileset texture
 * @param tile_size Size of each tile in pixels
 * @param rm ResourceManager for loading textures
 * @return true on success
 */
bool tileset_load_simple(Tileset* tileset, const char* texture_path, int tile_size, struct ResourceManager* rm);

/**
 * Gets the texture coordinates for a specific tile.
 * @param tileset Pointer to the tileset
 * @param tile_index Index of the tile
 * @param out_coords Output array for UV coordinates (4 vec2s: BL, BR, TR, TL)
 */
void tileset_get_tile_uvs(Tileset* tileset, int tile_index, float* out_coords);

/**
 * Gets the tile definition by index.
 * @param tileset Pointer to the tileset
 * @param index Tile index
 * @return Pointer to the tile definition or NULL
 */
TileDefinition* tileset_get_tile(Tileset* tileset, int index);

/**
 * Gets the tile definition by name.
 * @param tileset Pointer to the tileset
 * @param name Tile name
 * @return Pointer to the tile definition or NULL
 */
TileDefinition* tileset_get_tile_by_name(Tileset* tileset, const char* name);

/**
 * Generates vertex data for tile meshes.
 * @param tileset Pointer to the tileset
 */
void tileset_generate_mesh_data(Tileset* tileset);

/**
 * Destroys a tileset and frees resources.
 * @param tileset Pointer to the tileset
 */
void tileset_destroy(Tileset* tileset);

#endif // TILESET_H
