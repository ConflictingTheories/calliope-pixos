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

#include "tileset.h"
#include "../resource/resource_manager.h"
#include <GL/glew.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void tileset_init(Tileset* tileset) {
    memset(tileset, 0, sizeof(Tileset));
    tileset->tile_size = 32;
    tileset->loaded = false;
}

bool tileset_load_simple(Tileset* tileset, const char* texture_path, int tile_size, struct ResourceManager* rm) {
    tileset_init(tileset);
    tileset->tile_size = tile_size;
    
    // Load the texture
    Texture* tex = resource_manager_load_texture(rm, texture_path);
    if (!tex) {
        fprintf(stderr, "Failed to load tileset texture: %s\n", texture_path);
        return false;
    }
    
    tileset->texture = *tex;
    tileset->sheet_width = tex->width / tile_size;
    tileset->sheet_height = tex->height / tile_size;
    
    // Generate default tile definitions
    int total_tiles = tileset->sheet_width * tileset->sheet_height;
    if (total_tiles > MAX_TILESET_TILES) {
        total_tiles = MAX_TILESET_TILES;
    }
    
    for (int i = 0; i < total_tiles; i++) {
        TileDefinition* tile = &tileset->tiles[i];
        snprintf(tile->name, MAX_TILESET_NAME, "tile_%d", i);
        tile->shape = SHAPE_FLAT_ALL;
        tile->type = TILE_FLOOR;
        tile->frame_index = i;
        tile->blocking = false;
        tile->height = 0.0f;
        tile->animated = false;
        tile->anim_frames = 1;
        tile->anim_speed = 1.0f;
    }
    
    tileset->tile_count = total_tiles;
    tileset->loaded = true;
    
    // Generate mesh data
    tileset_generate_mesh_data(tileset);
    
    printf("Tileset loaded: %s (%dx%d tiles)\n", texture_path, tileset->sheet_width, tileset->sheet_height);
    return true;
}

void tileset_get_tile_uvs(Tileset* tileset, int tile_index, float* out_coords) {
    if (!tileset || !tileset->loaded || !out_coords) return;
    
    int col = tile_index % tileset->sheet_width;
    int row = tile_index / tileset->sheet_width;
    
    float tile_u = 1.0f / (float)tileset->sheet_width;
    float tile_v = 1.0f / (float)tileset->sheet_height;
    
    float u0 = col * tile_u;
    float v0 = 1.0f - (row + 1) * tile_v;  // Flip V for OpenGL
    float u1 = (col + 1) * tile_u;
    float v1 = 1.0f - row * tile_v;
    
    // BL, BR, TR, TL order
    out_coords[0] = u0; out_coords[1] = v0;  // BL
    out_coords[2] = u1; out_coords[3] = v0;  // BR
    out_coords[4] = u1; out_coords[5] = v1;  // TR
    out_coords[6] = u0; out_coords[7] = v1;  // TL
}

TileDefinition* tileset_get_tile(Tileset* tileset, int index) {
    if (!tileset || index < 0 || index >= tileset->tile_count) {
        return NULL;
    }
    return &tileset->tiles[index];
}

TileDefinition* tileset_get_tile_by_name(Tileset* tileset, const char* name) {
    if (!tileset || !name) return NULL;
    
    for (int i = 0; i < tileset->tile_count; i++) {
        if (strcmp(tileset->tiles[i].name, name) == 0) {
            return &tileset->tiles[i];
        }
    }
    return NULL;
}

void tileset_generate_mesh_data(Tileset* tileset) {
    if (!tileset) return;
    
    // Generate a simple quad for flat tiles
    // 6 vertices (2 triangles), each with position (3), normal (3), and texcoord (2)
    tileset->flat_vertex_count = 6;
    
    // Positions for a 1x1 quad on the XZ plane
    static float flat_positions[] = {
        // Triangle 1
        0.0f, 0.0f, 0.0f,
        1.0f, 0.0f, 0.0f,
        1.0f, 0.0f, 1.0f,
        // Triangle 2
        0.0f, 0.0f, 0.0f,
        1.0f, 0.0f, 1.0f,
        0.0f, 0.0f, 1.0f
    };
    
    // Normals (pointing up)
    static float flat_normals[] = {
        0.0f, 1.0f, 0.0f,
        0.0f, 1.0f, 0.0f,
        0.0f, 1.0f, 0.0f,
        0.0f, 1.0f, 0.0f,
        0.0f, 1.0f, 0.0f,
        0.0f, 1.0f, 0.0f
    };
    
    // Base texture coordinates (will be modified per-tile)
    static float flat_texcoords[] = {
        // Triangle 1
        0.0f, 0.0f,
        1.0f, 0.0f,
        1.0f, 1.0f,
        // Triangle 2
        0.0f, 0.0f,
        1.0f, 1.0f,
        0.0f, 1.0f
    };
    
    // Create VAO and VBOs
    glGenVertexArrays(1, &tileset->vao);
    glGenBuffers(1, &tileset->vbo_position);
    glGenBuffers(1, &tileset->vbo_normal);
    glGenBuffers(1, &tileset->vbo_texcoord);
    
    glBindVertexArray(tileset->vao);
    
    // Position buffer
    glBindBuffer(GL_ARRAY_BUFFER, tileset->vbo_position);
    glBufferData(GL_ARRAY_BUFFER, sizeof(flat_positions), flat_positions, GL_STATIC_DRAW);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(0);
    
    // Normal buffer
    glBindBuffer(GL_ARRAY_BUFFER, tileset->vbo_normal);
    glBufferData(GL_ARRAY_BUFFER, sizeof(flat_normals), flat_normals, GL_STATIC_DRAW);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(1);
    
    // Texcoord buffer
    glBindBuffer(GL_ARRAY_BUFFER, tileset->vbo_texcoord);
    glBufferData(GL_ARRAY_BUFFER, sizeof(flat_texcoords), flat_texcoords, GL_DYNAMIC_DRAW);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(2);
    
    glBindVertexArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    
    // Store pointer to static data
    tileset->flat_vertices = flat_positions;
    tileset->flat_normals = flat_normals;
    tileset->flat_texcoords = flat_texcoords;
}

// JSON loading would require a JSON parser library (e.g., cJSON)
// For now, using the simple loader above
bool tileset_load(Tileset* tileset, const char* json_path, struct ResourceManager* rm) {
    // TODO: Implement JSON parsing with cJSON or similar
    // For now, just return false and use tileset_load_simple
    (void)tileset;
    (void)json_path;
    (void)rm;
    fprintf(stderr, "JSON tileset loading not yet implemented. Use tileset_load_simple.\n");
    return false;
}

void tileset_destroy(Tileset* tileset) {
    if (!tileset) return;
    
    // Don't destroy texture here - it's managed by ResourceManager
    
    if (tileset->vao) {
        glDeleteVertexArrays(1, &tileset->vao);
    }
    if (tileset->vbo_position) {
        glDeleteBuffers(1, &tileset->vbo_position);
    }
    if (tileset->vbo_normal) {
        glDeleteBuffers(1, &tileset->vbo_normal);
    }
    if (tileset->vbo_texcoord) {
        glDeleteBuffers(1, &tileset->vbo_texcoord);
    }
    
    memset(tileset, 0, sizeof(Tileset));
}
