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

#ifndef SPRITE_H
#define SPRITE_H

#include "../resource/texture.h"
#include "../math/vector.h"
#include <stdbool.h>
#include <GL/glew.h>

// Maximum frames per animation
#define MAX_ANIM_FRAMES 32
#define MAX_SPRITE_ID 64
#define MAX_ANIMATIONS 16

// Direction enumeration
typedef enum Direction {
    DIR_N = 0,      // North
    DIR_NE,         // North-East
    DIR_E,          // East
    DIR_SE,         // South-East
    DIR_S,          // South
    DIR_SW,         // South-West
    DIR_W,          // West
    DIR_NW,         // North-West
    DIR_COUNT
} Direction;

/**
 * AnimationFrame - A single frame of animation.
 */
typedef struct AnimationFrame {
    int x;          // X position in spritesheet (pixels)
    int y;          // Y position in spritesheet (pixels)
} AnimationFrame;

/**
 * Animation - An animation sequence for a direction.
 */
typedef struct Animation {
    AnimationFrame frames[MAX_ANIM_FRAMES];
    int frame_count;
    float frame_duration;   // Time per frame in seconds
} Animation;

/**
 * SpriteDefinition - Template for creating sprites.
 */
typedef struct SpriteDefinition {
    char id[MAX_SPRITE_ID];
    char texture_path[256];
    int sheet_width;        // Spritesheet width in pixels
    int sheet_height;       // Spritesheet height in pixels
    int tile_width;         // Single sprite width in pixels
    int tile_height;        // Single sprite height in pixels
    Animation animations[DIR_COUNT];  // One animation per direction
    vec3 hotspot_offset;    // Offset for collision/position
    vec3 draw_offset;       // Offset for rendering
    bool is_lit;            // Emits light?
    float light_color[3];   // Light color if is_lit
    float attenuation[3];   // Light attenuation
} SpriteDefinition;

/**
 * Sprite - An instance of a sprite in the game world.
 */
typedef struct Sprite {
    int obj_id;             // Unique object ID for picking
    char id[MAX_SPRITE_ID];
    
    // Definition reference
    SpriteDefinition* definition;
    
    // Position and state
    vec3 pos;
    vec3 scale;
    Direction facing;
    int anim_frame;
    float anim_timer;
    bool is_selected;
    bool blocking;
    bool loaded;
    
    // Zone reference (forward declared)
    struct Zone* zone;
    
    // OpenGL resources
    Texture* texture;
    GLuint vao;
    GLuint vbo_position;
    GLuint vbo_texcoord;
    
    // Light index if lit
    int light_index;
    
    // State machine
    char current_state[64];
    
    // Callbacks (function pointers)
    void (*on_interact)(struct Sprite* self, struct Sprite* other);
    void (*on_step)(struct Sprite* self, struct Sprite* other);
    void (*on_select)(struct Sprite* self);
} Sprite;

// Forward declarations
struct Zone;
struct ResourceManager;
struct RenderManager;

/**
 * Creates a default sprite definition.
 * @return SpriteDefinition with default values
 */
SpriteDefinition sprite_definition_create(void);

/**
 * Initializes a sprite with default values.
 * @param sprite Pointer to the sprite
 */
void sprite_init(Sprite* sprite);

/**
 * Creates a sprite from a definition.
 * @param sprite Pointer to the sprite
 * @param def Pointer to the sprite definition
 * @param rm ResourceManager for loading textures
 * @return true on success
 */
bool sprite_create(Sprite* sprite, SpriteDefinition* def, struct ResourceManager* rm);

/**
 * Loads a sprite into a zone with specific instance data.
 * @param sprite Pointer to the sprite
 * @param zone The zone the sprite belongs to
 * @param id Unique ID for this sprite instance
 * @param pos Initial position
 * @param facing Initial facing direction
 */
void sprite_load(Sprite* sprite, struct Zone* zone, const char* id, vec3 pos, Direction facing);

/**
 * Updates sprite animation and state.
 * @param sprite Pointer to the sprite
 * @param delta_time Time since last update in seconds
 */
void sprite_update(Sprite* sprite, float delta_time);

/**
 * Gets the current texture coordinates for the sprite.
 * @param sprite Pointer to the sprite
 * @param camera_dir Camera facing direction (for billboarding)
 * @param out_coords Output array for 6 vec2s (2 triangles)
 */
void sprite_get_tex_coords(Sprite* sprite, Direction camera_dir, float* out_coords);

/**
 * Draws the sprite.
 * @param sprite Pointer to the sprite
 * @param render_manager Pointer to the render manager
 */
void sprite_draw(Sprite* sprite, struct RenderManager* render_manager);

/**
 * Converts a picking ID to RGBA color.
 * @param sprite Pointer to the sprite
 * @param out_color Output array for RGBA (4 floats)
 */
void sprite_get_picking_id(Sprite* sprite, float* out_color);

/**
 * Moves the sprite in a direction.
 * @param sprite Pointer to the sprite
 * @param direction Direction to move
 * @param speed Movement speed
 * @param delta_time Time delta
 */
void sprite_move(Sprite* sprite, Direction direction, float speed, float delta_time);

/**
 * Sets the sprite's facing direction.
 * @param sprite Pointer to the sprite
 * @param direction New facing direction
 */
void sprite_set_facing(Sprite* sprite, Direction direction);

/**
 * Destroys a sprite and frees its resources.
 * @param sprite Pointer to the sprite
 */
void sprite_destroy(Sprite* sprite);

/**
 * Gets the direction vector for a given direction enum.
 * @param dir Direction enum
 * @return Normalized direction vector
 */
vec3 direction_to_vector(Direction dir);

/**
 * Gets the direction enum from a movement vector.
 * @param movement Movement vector
 * @return Closest direction enum
 */
Direction vector_to_direction(vec3 movement);

/**
 * Gets the sprite sequence for rendering based on facing and camera direction.
 * @param facing Sprite facing direction
 * @param camera_dir Camera direction
 * @return The animation direction to use
 */
Direction sprite_get_render_direction(Direction facing, Direction camera_dir);

#endif // SPRITE_H
