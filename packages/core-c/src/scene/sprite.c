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

#include "sprite.h"
#include "zone.h"
#include "../resource/resource_manager.h"
#include "../render_manager.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// Direction vectors
static vec3 DIR_VECTORS[DIR_COUNT] = {
    { 0.0f, -1.0f, 0.0f },   // N
    { 0.707f, -0.707f, 0.0f }, // NE
    { 1.0f, 0.0f, 0.0f },    // E
    { 0.707f, 0.707f, 0.0f }, // SE
    { 0.0f, 1.0f, 0.0f },    // S
    { -0.707f, 0.707f, 0.0f }, // SW
    { -1.0f, 0.0f, 0.0f },   // W
    { -0.707f, -0.707f, 0.0f } // NW
};

static int next_obj_id = 100;

SpriteDefinition sprite_definition_create(void) {
    SpriteDefinition def = {0};
    strcpy(def.id, "default");
    def.sheet_width = 128;
    def.sheet_height = 128;
    def.tile_width = 32;
    def.tile_height = 32;
    def.hotspot_offset = vec3_new(0.5f, 0.0f, 0.0f);
    def.draw_offset = vec3_new(0.0f, 0.0f, 0.0f);
    def.is_lit = false;
    def.light_color[0] = 1.0f;
    def.light_color[1] = 1.0f;
    def.light_color[2] = 1.0f;
    def.attenuation[0] = 0.01f;
    def.attenuation[1] = 0.01f;
    def.attenuation[2] = 0.01f;
    
    // Default animation: single frame per direction
    for (int d = 0; d < DIR_COUNT; d++) {
        def.animations[d].frame_count = 1;
        def.animations[d].frames[0].x = 0;
        def.animations[d].frames[0].y = d * 32;  // Assuming each row is a direction
        def.animations[d].frame_duration = 0.1f;
    }
    
    return def;
}

void sprite_init(Sprite* sprite) {
    memset(sprite, 0, sizeof(Sprite));
    sprite->obj_id = next_obj_id++;
    sprite->scale = vec3_new(1.0f, 1.0f, 1.0f);
    sprite->facing = DIR_S;
    sprite->blocking = true;
    sprite->loaded = false;
    sprite->light_index = -1;
    strcpy(sprite->current_state, "idle");
}

bool sprite_create(Sprite* sprite, SpriteDefinition* def, struct ResourceManager* rm) {
    sprite_init(sprite);
    sprite->definition = def;
    strncpy(sprite->id, def->id, MAX_SPRITE_ID - 1);
    
    // Load texture
    if (def->texture_path[0] != '\0') {
        sprite->texture = resource_manager_load_texture(rm, def->texture_path);
        if (!sprite->texture) {
            fprintf(stderr, "Failed to load sprite texture: %s\n", def->texture_path);
            return false;
        }
    }
    
    // Create vertex buffers
    // Sprite is rendered as a billboard quad
    float quad_size_x = (float)def->tile_width / 32.0f;  // Normalize to tile units
    float quad_size_y = (float)def->tile_height / 32.0f;
    
    float positions[] = {
        // Triangle 1
        0.0f, 0.0f, 0.0f,
        quad_size_x, 0.0f, 0.0f,
        quad_size_x, 0.0f, quad_size_y,
        // Triangle 2
        0.0f, 0.0f, 0.0f,
        quad_size_x, 0.0f, quad_size_y,
        0.0f, 0.0f, quad_size_y
    };
    
    // Initial texture coordinates (will be updated per frame)
    float texcoords[] = {
        0.0f, 0.0f,
        1.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 1.0f
    };
    
    glGenVertexArrays(1, &sprite->vao);
    glGenBuffers(1, &sprite->vbo_position);
    glGenBuffers(1, &sprite->vbo_texcoord);
    
    glBindVertexArray(sprite->vao);
    
    glBindBuffer(GL_ARRAY_BUFFER, sprite->vbo_position);
    glBufferData(GL_ARRAY_BUFFER, sizeof(positions), positions, GL_STATIC_DRAW);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(0);
    
    glBindBuffer(GL_ARRAY_BUFFER, sprite->vbo_texcoord);
    glBufferData(GL_ARRAY_BUFFER, sizeof(texcoords), texcoords, GL_DYNAMIC_DRAW);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(2);
    
    glBindVertexArray(0);
    
    sprite->loaded = true;
    printf("Sprite created: %s (obj_id=%d)\n", sprite->id, sprite->obj_id);
    return true;
}

void sprite_load(Sprite* sprite, struct Zone* zone, const char* id, vec3 pos, Direction facing) {
    sprite->zone = zone;
    strncpy(sprite->id, id, MAX_SPRITE_ID - 1);
    sprite->pos = pos;
    sprite->facing = facing;
}

void sprite_update(Sprite* sprite, float delta_time) {
    if (!sprite || !sprite->loaded || !sprite->definition) return;
    
    Animation* anim = &sprite->definition->animations[sprite->facing];
    if (anim->frame_count <= 0) return;
    
    sprite->anim_timer += delta_time;
    
    if (sprite->anim_timer >= anim->frame_duration) {
        sprite->anim_timer -= anim->frame_duration;
        sprite->anim_frame = (sprite->anim_frame + 1) % anim->frame_count;
    }
}

void sprite_get_tex_coords(Sprite* sprite, Direction camera_dir, float* out_coords) {
    if (!sprite || !sprite->definition || !out_coords) return;
    
    SpriteDefinition* def = sprite->definition;
    Direction render_dir = sprite_get_render_direction(sprite->facing, camera_dir);
    Animation* anim = &def->animations[render_dir];
    
    int frame_idx = sprite->anim_frame % anim->frame_count;
    AnimationFrame* frame = &anim->frames[frame_idx];
    
    float u0 = (float)frame->x / (float)def->sheet_width;
    float v0 = (float)frame->y / (float)def->sheet_height;
    float u1 = (float)(frame->x + def->tile_width) / (float)def->sheet_width;
    float v1 = (float)(frame->y + def->tile_height) / (float)def->sheet_height;
    
    // Flip V for OpenGL
    float temp = v0;
    v0 = 1.0f - v1;
    v1 = 1.0f - temp;
    
    // 6 vertices (2 triangles)
    // Triangle 1: BL, BR, TR
    out_coords[0] = u0; out_coords[1] = v0;
    out_coords[2] = u1; out_coords[3] = v0;
    out_coords[4] = u1; out_coords[5] = v1;
    // Triangle 2: BL, TR, TL
    out_coords[6] = u0; out_coords[7] = v0;
    out_coords[8] = u1; out_coords[9] = v1;
    out_coords[10] = u0; out_coords[11] = v1;
}

void sprite_draw(Sprite* sprite, struct RenderManager* render_manager) {
    if (!sprite || !sprite->loaded) return;
    
    // TODO: Implement actual drawing using render_manager
    // This will be filled in when we integrate with the render system
}

void sprite_get_picking_id(Sprite* sprite, float* out_color) {
    if (!sprite || !out_color) return;
    
    int id = sprite->obj_id;
    out_color[0] = (float)(id & 0xFF) / 255.0f;
    out_color[1] = (float)((id >> 8) & 0xFF) / 255.0f;
    out_color[2] = (float)((id >> 16) & 0xFF) / 255.0f;
    out_color[3] = 1.0f;
}

void sprite_move(Sprite* sprite, Direction direction, float speed, float delta_time) {
    if (!sprite) return;
    
    vec3 dir_vec = direction_to_vector(direction);
    sprite->pos.x += dir_vec.x * speed * delta_time;
    sprite->pos.y += dir_vec.y * speed * delta_time;
    sprite->facing = direction;
}

void sprite_set_facing(Sprite* sprite, Direction direction) {
    if (sprite) {
        sprite->facing = direction;
    }
}

void sprite_destroy(Sprite* sprite) {
    if (!sprite) return;
    
    if (sprite->vao) {
        glDeleteVertexArrays(1, &sprite->vao);
    }
    if (sprite->vbo_position) {
        glDeleteBuffers(1, &sprite->vbo_position);
    }
    if (sprite->vbo_texcoord) {
        glDeleteBuffers(1, &sprite->vbo_texcoord);
    }
    
    // Don't free texture - managed by ResourceManager
    
    memset(sprite, 0, sizeof(Sprite));
}

vec3 direction_to_vector(Direction dir) {
    if (dir >= 0 && dir < DIR_COUNT) {
        return DIR_VECTORS[dir];
    }
    return vec3_new(0.0f, 0.0f, 0.0f);
}

Direction vector_to_direction(vec3 movement) {
    if (movement.x == 0.0f && movement.y == 0.0f) {
        return DIR_S;  // Default
    }
    
    float angle = atan2f(movement.y, movement.x);
    // Convert to degrees and normalize to 0-360
    float degrees = angle * 180.0f / 3.14159f + 180.0f;
    
    // Map to 8 directions
    int sector = (int)((degrees + 22.5f) / 45.0f) % 8;
    
    // Map sector to Direction enum
    Direction dirs[] = {DIR_W, DIR_SW, DIR_S, DIR_SE, DIR_E, DIR_NE, DIR_N, DIR_NW};
    return dirs[sector];
}

Direction sprite_get_render_direction(Direction facing, Direction camera_dir) {
    // Calculate the relative direction based on camera angle
    // This creates a billboarding effect where sprites appear to face the camera
    int relative = (facing - camera_dir + DIR_COUNT) % DIR_COUNT;
    return (Direction)relative;
}
