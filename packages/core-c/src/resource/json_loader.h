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

#ifndef JSON_LOADER_H
#define JSON_LOADER_H

#include <stdbool.h>
#include "../vendor/cJSON.h"
#include "../math/vector.h"

/* Forward declarations */
struct Zone;
struct Sprite;
struct Tileset;
struct World;
struct GLEngine;

/* ============================================
 * File I/O Utilities
 * ============================================ */

/**
 * Read entire file into a string.
 * Caller must free the returned pointer.
 */
char* json_load_file(const char* filepath);

/**
 * Parse JSON string into cJSON object.
 * Caller must call cJSON_Delete when done.
 */
cJSON* json_parse(const char* json_string);

/**
 * Parse JSON file into cJSON object.
 * Caller must call cJSON_Delete when done.
 */
cJSON* json_parse_file(const char* filepath);

/* ============================================
 * Helper Functions for JSON Parsing
 * ============================================ */

/**
 * Get string value from JSON object, with default.
 */
const char* json_get_string(cJSON* obj, const char* key, const char* default_value);

/**
 * Get integer value from JSON object, with default.
 */
int json_get_int(cJSON* obj, const char* key, int default_value);

/**
 * Get float value from JSON object, with default.
 */
float json_get_float(cJSON* obj, const char* key, float default_value);

/**
 * Get boolean value from JSON object, with default.
 */
bool json_get_bool(cJSON* obj, const char* key, bool default_value);

/**
 * Get vec3 from JSON object (expects {x, y, z} or [x, y, z]).
 */
vec3 json_get_vec3(cJSON* obj, const char* key, vec3 default_value);

/**
 * Get vec2 from JSON object (expects {x, y} or [x, y]).
 */
vec2 json_get_vec2(cJSON* obj, const char* key, vec2 default_value);

/* ============================================
 * Zone Loading
 * ============================================ */

/**
 * Zone definition from JSON matching packages/specs/formats/zone.schema.json
 */
typedef struct ZoneDefinition {
    char* id;
    char* name;
    char* tileset;
    int width;
    int height;
    
    /* Cells array */
    int* cells;          /* Flattened 2D array of tile indices */
    int cells_count;
    
    /* Height map */
    float* heights;      /* Flattened 2D array of heights */
    int heights_count;
    
    /* Sprites in zone */
    struct ZoneSpriteRef {
        char* id;
        char* type;
        float x, y, z;
        int direction;
    }* sprites;
    int sprites_count;
    
    /* Lights */
    struct ZoneLightDef {
        char* id;
        vec3 position;
        vec3 color;
        vec3 attenuation;
        float intensity;
    }* lights;
    int lights_count;
    
    /* Triggers */
    struct ZoneTriggerDef {
        char* id;
        char* script;
        int x, y;
        int width, height;
    }* triggers;
    int triggers_count;
    
} ZoneDefinition;

/**
 * Load zone definition from JSON file.
 * Caller must call zone_definition_free when done.
 */
ZoneDefinition* zone_definition_load(const char* filepath);

/**
 * Free zone definition.
 */
void zone_definition_free(ZoneDefinition* def);

/* ============================================
 * Sprite Loading
 * ============================================ */

/**
 * Animation frame definition
 */
typedef struct AnimationFrame {
    int x, y;           /* Position in spritesheet */
    int width, height;  /* Frame size */
    float duration;     /* Frame duration in seconds */
} AnimationFrame;

/**
 * Directional animation
 */
typedef struct DirectionalAnimation {
    char* name;         /* Animation name (e.g., "walk", "idle") */
    AnimationFrame* frames[8];  /* Frames for each direction (N, NE, E, SE, S, SW, W, NW) */
    int frame_counts[8];
    bool loop;
} DirectionalAnimation;

/**
 * Sprite definition from JSON matching packages/specs/formats/sprite.schema.json
 */
typedef struct SpriteDefinition {
    char* id;
    char* type;         /* "npc", "object", "player", etc. */
    char* texture;      /* Texture path */
    
    int sheet_width;    /* Spritesheet dimensions */
    int sheet_height;
    int frame_width;    /* Single frame dimensions */
    int frame_height;
    
    /* Animations */
    DirectionalAnimation* animations;
    int animations_count;
    
    /* Collision box (relative to sprite origin) */
    struct {
        float x, y;
        float width, height;
    } collision;
    
    /* Anchor point (0-1, relative to sprite size) */
    float anchor_x, anchor_y;
    
    /* Flags */
    bool billboard;     /* Face camera */
    bool interactable;
    bool blocking;      /* Blocks movement */
    
} SpriteDefinition;

/**
 * Load sprite definition from JSON file.
 * Caller must call sprite_definition_free when done.
 */
SpriteDefinition* sprite_definition_load(const char* filepath);

/**
 * Free sprite definition.
 */
void sprite_definition_free(SpriteDefinition* def);

/* ============================================
 * Tileset Loading
 * ============================================ */

/**
 * Tile definition
 */
typedef struct TileInfo {
    int id;
    bool walkable;
    bool animated;
    int animation_frames;
    float animation_speed;
} TileInfo;

/**
 * Tileset definition from JSON
 */
typedef struct TilesetDefinition {
    char* id;
    char* texture;
    
    int tile_width;
    int tile_height;
    int columns;
    int rows;
    
    TileInfo* tiles;
    int tiles_count;
    
} TilesetDefinition;

/**
 * Load tileset definition from JSON file.
 */
TilesetDefinition* tileset_definition_load(const char* filepath);

/**
 * Free tileset definition.
 */
void tileset_definition_free(TilesetDefinition* def);

/* ============================================
 * Manifest Loading
 * ============================================ */

/**
 * Game manifest structure
 */
typedef struct GameManifest {
    char* name;
    char* version;
    char* author;
    char* initial_zone;
    char* initial_mode;
    
    /* Asset lists */
    char** zones;
    int zones_count;
    
    char** sprites;
    int sprites_count;
    
    char** tilesets;
    int tilesets_count;
    
    char** textures;
    int textures_count;
    
    char** audio;
    int audio_count;
    
    char** scripts;
    int scripts_count;
    
} GameManifest;

/**
 * Load game manifest from JSON file.
 */
GameManifest* manifest_load(const char* filepath);

/**
 * Free game manifest.
 */
void manifest_free(GameManifest* manifest);

#endif /* JSON_LOADER_H */
