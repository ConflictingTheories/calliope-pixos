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

#include "zone.h"
#include "world.h"
#include "../render_manager.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

static int next_zone_obj_id = 1;

void zone_init(Zone* zone, const char* id, struct World* world) {
    memset(zone, 0, sizeof(Zone));
    zone->obj_id = next_zone_obj_id++;
    strncpy(zone->id, id, MAX_ZONE_ID - 1);
    zone->world = world;
    zone->loaded = false;
    zone->has_heights = false;
}

bool zone_load_data(Zone* zone, int bounds[4], int* cells, float* heights, Tileset* tileset) {
    if (!zone || !bounds || !cells || !tileset) {
        return false;
    }
    
    memcpy(zone->bounds, bounds, sizeof(int) * 4);
    zone->width = bounds[2] - bounds[0];
    zone->height = bounds[3] - bounds[1];
    
    if (zone->width > MAX_ZONE_WIDTH || zone->height > MAX_ZONE_HEIGHT) {
        fprintf(stderr, "Zone too large: %dx%d (max %dx%d)\n", 
                zone->width, zone->height, MAX_ZONE_WIDTH, MAX_ZONE_HEIGHT);
        return false;
    }
    
    zone->tileset = tileset;
    zone->cell_count = zone->width * zone->height;
    
    // Copy cell data
    for (int i = 0; i < zone->cell_count; i++) {
        Cell* cell = &zone->cells[i];
        cell->tile_index = cells[i];
        
        // Get tile definition if available
        TileDefinition* tile_def = tileset_get_tile(tileset, cells[i]);
        if (tile_def) {
            cell->shape = tile_def->shape;
            cell->type = tile_def->type;
            cell->blocking = tile_def->blocking;
            cell->height = tile_def->height;
        } else {
            cell->shape = SHAPE_FLAT_ALL;
            cell->type = TILE_FLOOR;
            cell->blocking = false;
            cell->height = 0.0f;
        }
    }
    
    // Copy height data if provided
    if (heights) {
        memcpy(zone->heights, heights, sizeof(float) * zone->cell_count);
        zone->has_heights = true;
        
        // Override cell heights
        for (int i = 0; i < zone->cell_count; i++) {
            zone->cells[i].height = heights[i];
        }
    }
    
    // Generate mesh
    zone_generate_mesh(zone);
    
    zone->loaded = true;
    printf("Zone loaded: %s (%dx%d cells)\n", zone->id, zone->width, zone->height);
    return true;
}

void zone_generate_mesh(Zone* zone) {
    if (!zone || !zone->tileset) return;
    
    // Calculate total vertices needed
    // Each cell is a quad (2 triangles, 6 vertices)
    int max_vertices = zone->cell_count * 6;
    
    // Allocate temporary buffers
    float* positions = (float*)malloc(max_vertices * 3 * sizeof(float));
    float* normals = (float*)malloc(max_vertices * 3 * sizeof(float));
    float* texcoords = (float*)malloc(max_vertices * 2 * sizeof(float));
    
    if (!positions || !normals || !texcoords) {
        free(positions);
        free(normals);
        free(texcoords);
        fprintf(stderr, "Failed to allocate zone mesh buffers\n");
        return;
    }
    
    int vertex_idx = 0;
    
    for (int row = 0; row < zone->height; row++) {
        for (int col = 0; col < zone->width; col++) {
            int cell_idx = row * zone->width + col;
            Cell* cell = &zone->cells[cell_idx];
            
            float x = (float)(zone->bounds[0] + col);
            float y = (float)(zone->bounds[1] + row);
            float h = cell->height;
            
            // Get tile UVs
            float uvs[8];
            tileset_get_tile_uvs(zone->tileset, cell->tile_index, uvs);
            
            // Generate quad vertices (2 triangles)
            // Triangle 1
            int vi = vertex_idx * 3;
            int ti = vertex_idx * 2;
            
            // Vertex 0 (0,0)
            positions[vi + 0] = x; positions[vi + 1] = h; positions[vi + 2] = y;
            normals[vi + 0] = 0; normals[vi + 1] = 1; normals[vi + 2] = 0;
            texcoords[ti + 0] = uvs[0]; texcoords[ti + 1] = uvs[1];
            vertex_idx++;
            vi += 3; ti += 2;
            
            // Vertex 1 (1,0)
            positions[vi + 0] = x+1; positions[vi + 1] = h; positions[vi + 2] = y;
            normals[vi + 0] = 0; normals[vi + 1] = 1; normals[vi + 2] = 0;
            texcoords[ti + 0] = uvs[2]; texcoords[ti + 1] = uvs[3];
            vertex_idx++;
            vi += 3; ti += 2;
            
            // Vertex 2 (1,1)
            positions[vi + 0] = x+1; positions[vi + 1] = h; positions[vi + 2] = y+1;
            normals[vi + 0] = 0; normals[vi + 1] = 1; normals[vi + 2] = 0;
            texcoords[ti + 0] = uvs[4]; texcoords[ti + 1] = uvs[5];
            vertex_idx++;
            vi += 3; ti += 2;
            
            // Triangle 2
            // Vertex 3 (0,0)
            positions[vi + 0] = x; positions[vi + 1] = h; positions[vi + 2] = y;
            normals[vi + 0] = 0; normals[vi + 1] = 1; normals[vi + 2] = 0;
            texcoords[ti + 0] = uvs[0]; texcoords[ti + 1] = uvs[1];
            vertex_idx++;
            vi += 3; ti += 2;
            
            // Vertex 4 (1,1)
            positions[vi + 0] = x+1; positions[vi + 1] = h; positions[vi + 2] = y+1;
            normals[vi + 0] = 0; normals[vi + 1] = 1; normals[vi + 2] = 0;
            texcoords[ti + 0] = uvs[4]; texcoords[ti + 1] = uvs[5];
            vertex_idx++;
            vi += 3; ti += 2;
            
            // Vertex 5 (0,1)
            positions[vi + 0] = x; positions[vi + 1] = h; positions[vi + 2] = y+1;
            normals[vi + 0] = 0; normals[vi + 1] = 1; normals[vi + 2] = 0;
            texcoords[ti + 0] = uvs[6]; texcoords[ti + 1] = uvs[7];
            vertex_idx++;
        }
    }
    
    zone->vertex_count = vertex_idx;
    
    // Create OpenGL buffers
    glGenVertexArrays(1, &zone->vao);
    glGenBuffers(1, &zone->vbo_position);
    glGenBuffers(1, &zone->vbo_normal);
    glGenBuffers(1, &zone->vbo_texcoord);
    
    glBindVertexArray(zone->vao);
    
    glBindBuffer(GL_ARRAY_BUFFER, zone->vbo_position);
    glBufferData(GL_ARRAY_BUFFER, vertex_idx * 3 * sizeof(float), positions, GL_STATIC_DRAW);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(0);
    
    glBindBuffer(GL_ARRAY_BUFFER, zone->vbo_normal);
    glBufferData(GL_ARRAY_BUFFER, vertex_idx * 3 * sizeof(float), normals, GL_STATIC_DRAW);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(1);
    
    glBindBuffer(GL_ARRAY_BUFFER, zone->vbo_texcoord);
    glBufferData(GL_ARRAY_BUFFER, vertex_idx * 2 * sizeof(float), texcoords, GL_STATIC_DRAW);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 0, NULL);
    glEnableVertexAttribArray(2);
    
    glBindVertexArray(0);
    
    // Free temporary buffers
    free(positions);
    free(normals);
    free(texcoords);
    
    printf("Zone mesh generated: %d vertices\n", vertex_idx);
}

float zone_get_height(Zone* zone, float x, float y) {
    if (!zone || !zone->loaded) return 0.0f;
    
    // Convert world coordinates to cell coordinates
    int col = (int)(x - zone->bounds[0]);
    int row = (int)(y - zone->bounds[1]);
    
    // Clamp to bounds
    if (col < 0) col = 0;
    if (col >= zone->width) col = zone->width - 1;
    if (row < 0) row = 0;
    if (row >= zone->height) row = zone->height - 1;
    
    Cell* cell = zone_get_cell(zone, row, col);
    if (cell) {
        return cell->height;
    }
    
    return 0.0f;
}

Cell* zone_get_cell(Zone* zone, int row, int col) {
    if (!zone || row < 0 || row >= zone->height || col < 0 || col >= zone->width) {
        return NULL;
    }
    return &zone->cells[row * zone->width + col];
}

bool zone_is_walkable(Zone* zone, float x, float y) {
    if (!zone || !zone->loaded) return false;
    
    // Convert world coordinates to cell coordinates
    int col = (int)(x - zone->bounds[0]);
    int row = (int)(y - zone->bounds[1]);
    
    // Out of bounds is not walkable
    if (col < 0 || col >= zone->width || row < 0 || row >= zone->height) {
        return false;
    }
    
    Cell* cell = zone_get_cell(zone, row, col);
    if (cell && !cell->blocking) {
        return true;
    }
    
    return false;
}

bool zone_add_sprite(Zone* zone, Sprite* sprite) {
    if (!zone || !sprite || zone->sprite_count >= MAX_ZONE_SPRITES) {
        return false;
    }
    
    sprite->zone = zone;
    zone->sprites[zone->sprite_count++] = sprite;
    return true;
}

bool zone_remove_sprite(Zone* zone, Sprite* sprite) {
    if (!zone || !sprite) return false;
    
    for (int i = 0; i < zone->sprite_count; i++) {
        if (zone->sprites[i] == sprite) {
            // Shift remaining sprites
            for (int j = i; j < zone->sprite_count - 1; j++) {
                zone->sprites[j] = zone->sprites[j + 1];
            }
            zone->sprite_count--;
            sprite->zone = NULL;
            return true;
        }
    }
    return false;
}

Sprite* zone_get_sprite(Zone* zone, const char* id) {
    if (!zone || !id) return NULL;
    
    for (int i = 0; i < zone->sprite_count; i++) {
        if (strcmp(zone->sprites[i]->id, id) == 0) {
            return zone->sprites[i];
        }
    }
    return NULL;
}

void zone_update(Zone* zone, float delta_time) {
    if (!zone || !zone->loaded) return;
    
    for (int i = 0; i < zone->sprite_count; i++) {
        sprite_update(zone->sprites[i], delta_time);
    }
}

void zone_draw_tiles(Zone* zone, struct RenderManager* render_manager) {
    if (!zone || !zone->loaded || !zone->tileset) return;
    
    // Bind tileset texture
    texture_bind(&zone->tileset->texture, 0);
    
    // Draw zone mesh
    glBindVertexArray(zone->vao);
    glDrawArrays(GL_TRIANGLES, 0, zone->vertex_count);
    glBindVertexArray(0);
    
    // Increment draw count
    if (render_manager && render_manager->debug_tiles_drawn) {
        (*render_manager->debug_tiles_drawn) += zone->cell_count;
    }
}

void zone_draw_sprites(Zone* zone, struct RenderManager* render_manager) {
    if (!zone || !zone->loaded) return;
    
    for (int i = 0; i < zone->sprite_count; i++) {
        sprite_draw(zone->sprites[i], render_manager);
    }
}

void zone_destroy(Zone* zone) {
    if (!zone) return;
    
    // Destroy sprites
    for (int i = 0; i < zone->sprite_count; i++) {
        sprite_destroy(zone->sprites[i]);
        free(zone->sprites[i]);
    }
    
    // Delete OpenGL buffers
    if (zone->vao) {
        glDeleteVertexArrays(1, &zone->vao);
    }
    if (zone->vbo_position) {
        glDeleteBuffers(1, &zone->vbo_position);
    }
    if (zone->vbo_normal) {
        glDeleteBuffers(1, &zone->vbo_normal);
    }
    if (zone->vbo_texcoord) {
        glDeleteBuffers(1, &zone->vbo_texcoord);
    }
    
    // Don't free tileset - managed elsewhere
    
    memset(zone, 0, sizeof(Zone));
}
