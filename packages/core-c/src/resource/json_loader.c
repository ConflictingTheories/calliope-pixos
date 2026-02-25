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

#include "json_loader.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* ============================================
 * File I/O Utilities
 * ============================================ */

char* json_load_file(const char* filepath) {
    FILE* file = fopen(filepath, "rb");
    if (!file) {
        fprintf(stderr, "[JSON] Failed to open file: %s\n", filepath);
        return NULL;
    }
    
    /* Get file size */
    fseek(file, 0, SEEK_END);
    long size = ftell(file);
    fseek(file, 0, SEEK_SET);
    
    if (size <= 0) {
        fclose(file);
        return NULL;
    }
    
    /* Allocate buffer */
    char* buffer = (char*)malloc(size + 1);
    if (!buffer) {
        fclose(file);
        return NULL;
    }
    
    /* Read file */
    size_t read = fread(buffer, 1, size, file);
    fclose(file);
    
    if (read != (size_t)size) {
        free(buffer);
        return NULL;
    }
    
    buffer[size] = '\0';
    return buffer;
}

cJSON* json_parse(const char* json_string) {
    if (!json_string) return NULL;
    
    cJSON* json = cJSON_Parse(json_string);
    if (!json) {
        const char* error = cJSON_GetErrorPtr();
        if (error) {
            fprintf(stderr, "[JSON] Parse error before: %s\n", error);
        }
    }
    return json;
}

cJSON* json_parse_file(const char* filepath) {
    char* content = json_load_file(filepath);
    if (!content) return NULL;
    
    cJSON* json = json_parse(content);
    free(content);
    return json;
}

/* ============================================
 * Helper Functions
 * ============================================ */

const char* json_get_string(cJSON* obj, const char* key, const char* default_value) {
    if (!obj) return default_value;
    cJSON* item = cJSON_GetObjectItemCaseSensitive(obj, key);
    if (cJSON_IsString(item) && item->valuestring) {
        return item->valuestring;
    }
    return default_value;
}

int json_get_int(cJSON* obj, const char* key, int default_value) {
    if (!obj) return default_value;
    cJSON* item = cJSON_GetObjectItemCaseSensitive(obj, key);
    if (cJSON_IsNumber(item)) {
        return item->valueint;
    }
    return default_value;
}

float json_get_float(cJSON* obj, const char* key, float default_value) {
    if (!obj) return default_value;
    cJSON* item = cJSON_GetObjectItemCaseSensitive(obj, key);
    if (cJSON_IsNumber(item)) {
        return (float)item->valuedouble;
    }
    return default_value;
}

bool json_get_bool(cJSON* obj, const char* key, bool default_value) {
    if (!obj) return default_value;
    cJSON* item = cJSON_GetObjectItemCaseSensitive(obj, key);
    if (cJSON_IsBool(item)) {
        return cJSON_IsTrue(item);
    }
    return default_value;
}

vec3 json_get_vec3(cJSON* obj, const char* key, vec3 default_value) {
    if (!obj) return default_value;
    cJSON* item = cJSON_GetObjectItemCaseSensitive(obj, key);
    
    if (cJSON_IsArray(item) && cJSON_GetArraySize(item) >= 3) {
        return vec3_new(
            (float)cJSON_GetArrayItem(item, 0)->valuedouble,
            (float)cJSON_GetArrayItem(item, 1)->valuedouble,
            (float)cJSON_GetArrayItem(item, 2)->valuedouble
        );
    }
    
    if (cJSON_IsObject(item)) {
        return vec3_new(
            json_get_float(item, "x", default_value.x),
            json_get_float(item, "y", default_value.y),
            json_get_float(item, "z", default_value.z)
        );
    }
    
    return default_value;
}

vec2 json_get_vec2(cJSON* obj, const char* key, vec2 default_value) {
    if (!obj) return default_value;
    cJSON* item = cJSON_GetObjectItemCaseSensitive(obj, key);
    
    if (cJSON_IsArray(item) && cJSON_GetArraySize(item) >= 2) {
        return vec2_new(
            (float)cJSON_GetArrayItem(item, 0)->valuedouble,
            (float)cJSON_GetArrayItem(item, 1)->valuedouble
        );
    }
    
    if (cJSON_IsObject(item)) {
        return vec2_new(
            json_get_float(item, "x", default_value.x),
            json_get_float(item, "y", default_value.y)
        );
    }
    
    return default_value;
}

/* ============================================
 * Zone Loading
 * ============================================ */

static char* strdup_safe(const char* str) {
    if (!str) return NULL;
    size_t len = strlen(str);
    char* copy = (char*)malloc(len + 1);
    if (copy) {
        memcpy(copy, str, len + 1);
    }
    return copy;
}

ZoneDefinition* zone_definition_load(const char* filepath) {
    cJSON* json = json_parse_file(filepath);
    if (!json) {
        fprintf(stderr, "[JSON] Failed to load zone: %s\n", filepath);
        return NULL;
    }
    
    ZoneDefinition* def = (ZoneDefinition*)calloc(1, sizeof(ZoneDefinition));
    if (!def) {
        cJSON_Delete(json);
        return NULL;
    }
    
    /* Basic properties */
    def->id = strdup_safe(json_get_string(json, "id", "unknown"));
    def->name = strdup_safe(json_get_string(json, "name", "Unknown Zone"));
    def->tileset = strdup_safe(json_get_string(json, "tileset", "default"));
    def->width = json_get_int(json, "width", 10);
    def->height = json_get_int(json, "height", 10);
    
    /* Parse cells array */
    cJSON* cells = cJSON_GetObjectItemCaseSensitive(json, "cells");
    if (cJSON_IsArray(cells)) {
        def->cells_count = cJSON_GetArraySize(cells);
        def->cells = (int*)malloc(def->cells_count * sizeof(int));
        
        int i = 0;
        cJSON* cell;
        cJSON_ArrayForEach(cell, cells) {
            def->cells[i++] = cJSON_IsNumber(cell) ? cell->valueint : 0;
        }
    }
    
    /* Parse heights array */
    cJSON* heights = cJSON_GetObjectItemCaseSensitive(json, "heights");
    if (cJSON_IsArray(heights)) {
        def->heights_count = cJSON_GetArraySize(heights);
        def->heights = (float*)malloc(def->heights_count * sizeof(float));
        
        int i = 0;
        cJSON* height;
        cJSON_ArrayForEach(height, heights) {
            def->heights[i++] = cJSON_IsNumber(height) ? (float)height->valuedouble : 0.0f;
        }
    }
    
    /* Parse sprites */
    cJSON* sprites = cJSON_GetObjectItemCaseSensitive(json, "sprites");
    if (cJSON_IsArray(sprites)) {
        def->sprites_count = cJSON_GetArraySize(sprites);
        def->sprites = calloc(def->sprites_count, sizeof(def->sprites[0]));
        
        int i = 0;
        cJSON* sprite;
        cJSON_ArrayForEach(sprite, sprites) {
            def->sprites[i].id = strdup_safe(json_get_string(sprite, "id", ""));
            def->sprites[i].type = strdup_safe(json_get_string(sprite, "type", "npc"));
            def->sprites[i].x = json_get_float(sprite, "x", 0.0f);
            def->sprites[i].y = json_get_float(sprite, "y", 0.0f);
            def->sprites[i].z = json_get_float(sprite, "z", 0.0f);
            def->sprites[i].direction = json_get_int(sprite, "direction", 0);
            i++;
        }
    }
    
    /* Parse lights */
    cJSON* lights = cJSON_GetObjectItemCaseSensitive(json, "lights");
    if (cJSON_IsArray(lights)) {
        def->lights_count = cJSON_GetArraySize(lights);
        def->lights = calloc(def->lights_count, sizeof(def->lights[0]));
        
        vec3 default_pos = vec3_new(0, 5, 0);
        vec3 default_color = vec3_new(1, 1, 1);
        vec3 default_atten = vec3_new(1, 0.09f, 0.032f);
        
        int i = 0;
        cJSON* light;
        cJSON_ArrayForEach(light, lights) {
            def->lights[i].id = strdup_safe(json_get_string(light, "id", ""));
            def->lights[i].position = json_get_vec3(light, "position", default_pos);
            def->lights[i].color = json_get_vec3(light, "color", default_color);
            def->lights[i].attenuation = json_get_vec3(light, "attenuation", default_atten);
            def->lights[i].intensity = json_get_float(light, "intensity", 1.0f);
            i++;
        }
    }
    
    /* Parse triggers */
    cJSON* triggers = cJSON_GetObjectItemCaseSensitive(json, "triggers");
    if (cJSON_IsArray(triggers)) {
        def->triggers_count = cJSON_GetArraySize(triggers);
        def->triggers = calloc(def->triggers_count, sizeof(def->triggers[0]));
        
        int i = 0;
        cJSON* trigger;
        cJSON_ArrayForEach(trigger, triggers) {
            def->triggers[i].id = strdup_safe(json_get_string(trigger, "id", ""));
            def->triggers[i].script = strdup_safe(json_get_string(trigger, "script", ""));
            def->triggers[i].x = json_get_int(trigger, "x", 0);
            def->triggers[i].y = json_get_int(trigger, "y", 0);
            def->triggers[i].width = json_get_int(trigger, "width", 1);
            def->triggers[i].height = json_get_int(trigger, "height", 1);
            i++;
        }
    }
    
    cJSON_Delete(json);
    printf("[JSON] Loaded zone: %s (%dx%d)\n", def->id, def->width, def->height);
    return def;
}

void zone_definition_free(ZoneDefinition* def) {
    if (!def) return;
    
    free(def->id);
    free(def->name);
    free(def->tileset);
    free(def->cells);
    free(def->heights);
    
    for (int i = 0; i < def->sprites_count; i++) {
        free(def->sprites[i].id);
        free(def->sprites[i].type);
    }
    free(def->sprites);
    
    for (int i = 0; i < def->lights_count; i++) {
        free(def->lights[i].id);
    }
    free(def->lights);
    
    for (int i = 0; i < def->triggers_count; i++) {
        free(def->triggers[i].id);
        free(def->triggers[i].script);
    }
    free(def->triggers);
    
    free(def);
}

/* ============================================
 * Sprite Loading
 * ============================================ */

SpriteDefinition* sprite_definition_load(const char* filepath) {
    cJSON* json = json_parse_file(filepath);
    if (!json) {
        fprintf(stderr, "[JSON] Failed to load sprite: %s\n", filepath);
        return NULL;
    }
    
    SpriteDefinition* def = (SpriteDefinition*)calloc(1, sizeof(SpriteDefinition));
    if (!def) {
        cJSON_Delete(json);
        return NULL;
    }
    
    /* Basic properties */
    def->id = strdup_safe(json_get_string(json, "id", "unknown"));
    def->type = strdup_safe(json_get_string(json, "type", "npc"));
    def->texture = strdup_safe(json_get_string(json, "texture", ""));
    
    def->sheet_width = json_get_int(json, "sheetWidth", 256);
    def->sheet_height = json_get_int(json, "sheetHeight", 256);
    def->frame_width = json_get_int(json, "frameWidth", 32);
    def->frame_height = json_get_int(json, "frameHeight", 32);
    
    /* Collision box */
    cJSON* collision = cJSON_GetObjectItemCaseSensitive(json, "collision");
    if (collision) {
        def->collision.x = json_get_float(collision, "x", 0);
        def->collision.y = json_get_float(collision, "y", 0);
        def->collision.width = json_get_float(collision, "width", 1);
        def->collision.height = json_get_float(collision, "height", 1);
    }
    
    /* Anchor */
    def->anchor_x = json_get_float(json, "anchorX", 0.5f);
    def->anchor_y = json_get_float(json, "anchorY", 1.0f);
    
    /* Flags */
    def->billboard = json_get_bool(json, "billboard", true);
    def->interactable = json_get_bool(json, "interactable", false);
    def->blocking = json_get_bool(json, "blocking", true);
    
    /* Parse animations */
    cJSON* animations = cJSON_GetObjectItemCaseSensitive(json, "animations");
    if (cJSON_IsObject(animations)) {
        def->animations_count = cJSON_GetArraySize(animations);
        def->animations = calloc(def->animations_count, sizeof(DirectionalAnimation));
        
        int anim_idx = 0;
        cJSON* anim;
        cJSON_ArrayForEach(anim, animations) {
            DirectionalAnimation* da = &def->animations[anim_idx];
            da->name = strdup_safe(anim->string);
            da->loop = json_get_bool(anim, "loop", true);
            
            /* Parse frames for each direction */
            const char* directions[] = {"n", "ne", "e", "se", "s", "sw", "w", "nw"};
            for (int d = 0; d < 8; d++) {
                cJSON* dir_frames = cJSON_GetObjectItemCaseSensitive(anim, directions[d]);
                if (cJSON_IsArray(dir_frames)) {
                    int frame_count = cJSON_GetArraySize(dir_frames);
                    da->frames[d] = calloc(frame_count, sizeof(AnimationFrame));
                    da->frame_counts[d] = frame_count;
                    
                    int f = 0;
                    cJSON* frame;
                    cJSON_ArrayForEach(frame, dir_frames) {
                        da->frames[d][f].x = json_get_int(frame, "x", 0);
                        da->frames[d][f].y = json_get_int(frame, "y", 0);
                        da->frames[d][f].width = json_get_int(frame, "w", def->frame_width);
                        da->frames[d][f].height = json_get_int(frame, "h", def->frame_height);
                        da->frames[d][f].duration = json_get_float(frame, "duration", 0.1f);
                        f++;
                    }
                }
            }
            
            anim_idx++;
        }
    }
    
    cJSON_Delete(json);
    printf("[JSON] Loaded sprite: %s (%s)\n", def->id, def->type);
    return def;
}

void sprite_definition_free(SpriteDefinition* def) {
    if (!def) return;
    
    free(def->id);
    free(def->type);
    free(def->texture);
    
    for (int i = 0; i < def->animations_count; i++) {
        free(def->animations[i].name);
        for (int d = 0; d < 8; d++) {
            free(def->animations[i].frames[d]);
        }
    }
    free(def->animations);
    
    free(def);
}

/* ============================================
 * Tileset Loading
 * ============================================ */

TilesetDefinition* tileset_definition_load(const char* filepath) {
    cJSON* json = json_parse_file(filepath);
    if (!json) {
        fprintf(stderr, "[JSON] Failed to load tileset: %s\n", filepath);
        return NULL;
    }
    
    TilesetDefinition* def = (TilesetDefinition*)calloc(1, sizeof(TilesetDefinition));
    if (!def) {
        cJSON_Delete(json);
        return NULL;
    }
    
    def->id = strdup_safe(json_get_string(json, "id", "unknown"));
    def->texture = strdup_safe(json_get_string(json, "texture", ""));
    
    def->tile_width = json_get_int(json, "tileWidth", 32);
    def->tile_height = json_get_int(json, "tileHeight", 32);
    def->columns = json_get_int(json, "columns", 8);
    def->rows = json_get_int(json, "rows", 8);
    
    /* Parse tiles */
    cJSON* tiles = cJSON_GetObjectItemCaseSensitive(json, "tiles");
    if (cJSON_IsArray(tiles)) {
        def->tiles_count = cJSON_GetArraySize(tiles);
        def->tiles = calloc(def->tiles_count, sizeof(TileInfo));
        
        int i = 0;
        cJSON* tile;
        cJSON_ArrayForEach(tile, tiles) {
            def->tiles[i].id = json_get_int(tile, "id", i);
            def->tiles[i].walkable = json_get_bool(tile, "walkable", true);
            def->tiles[i].animated = json_get_bool(tile, "animated", false);
            def->tiles[i].animation_frames = json_get_int(tile, "animationFrames", 1);
            def->tiles[i].animation_speed = json_get_float(tile, "animationSpeed", 0.2f);
            i++;
        }
    }
    
    cJSON_Delete(json);
    printf("[JSON] Loaded tileset: %s (%dx%d tiles)\n", def->id, def->columns, def->rows);
    return def;
}

void tileset_definition_free(TilesetDefinition* def) {
    if (!def) return;
    
    free(def->id);
    free(def->texture);
    free(def->tiles);
    free(def);
}

/* ============================================
 * Manifest Loading
 * ============================================ */

static char** parse_string_array(cJSON* array, int* count) {
    if (!cJSON_IsArray(array)) {
        *count = 0;
        return NULL;
    }
    
    *count = cJSON_GetArraySize(array);
    char** result = malloc(*count * sizeof(char*));
    
    int i = 0;
    cJSON* item;
    cJSON_ArrayForEach(item, array) {
        result[i++] = strdup_safe(cJSON_IsString(item) ? item->valuestring : "");
    }
    
    return result;
}

GameManifest* manifest_load(const char* filepath) {
    cJSON* json = json_parse_file(filepath);
    if (!json) {
        fprintf(stderr, "[JSON] Failed to load manifest: %s\n", filepath);
        return NULL;
    }
    
    GameManifest* manifest = (GameManifest*)calloc(1, sizeof(GameManifest));
    if (!manifest) {
        cJSON_Delete(json);
        return NULL;
    }
    
    manifest->name = strdup_safe(json_get_string(json, "name", "Untitled"));
    manifest->version = strdup_safe(json_get_string(json, "version", "1.0.0"));
    manifest->author = strdup_safe(json_get_string(json, "author", "Unknown"));
    manifest->initial_zone = strdup_safe(json_get_string(json, "initialZone", ""));
    manifest->initial_mode = strdup_safe(json_get_string(json, "initialMode", "explore"));
    
    /* Parse asset arrays */
    manifest->zones = parse_string_array(
        cJSON_GetObjectItemCaseSensitive(json, "zones"), 
        &manifest->zones_count);
    manifest->sprites = parse_string_array(
        cJSON_GetObjectItemCaseSensitive(json, "sprites"), 
        &manifest->sprites_count);
    manifest->tilesets = parse_string_array(
        cJSON_GetObjectItemCaseSensitive(json, "tilesets"), 
        &manifest->tilesets_count);
    manifest->textures = parse_string_array(
        cJSON_GetObjectItemCaseSensitive(json, "textures"), 
        &manifest->textures_count);
    manifest->audio = parse_string_array(
        cJSON_GetObjectItemCaseSensitive(json, "audio"), 
        &manifest->audio_count);
    manifest->scripts = parse_string_array(
        cJSON_GetObjectItemCaseSensitive(json, "scripts"), 
        &manifest->scripts_count);
    
    cJSON_Delete(json);
    printf("[JSON] Loaded manifest: %s v%s by %s\n", 
           manifest->name, manifest->version, manifest->author);
    return manifest;
}

void manifest_free(GameManifest* manifest) {
    if (!manifest) return;
    
    free(manifest->name);
    free(manifest->version);
    free(manifest->author);
    free(manifest->initial_zone);
    free(manifest->initial_mode);
    
    for (int i = 0; i < manifest->zones_count; i++) free(manifest->zones[i]);
    free(manifest->zones);
    
    for (int i = 0; i < manifest->sprites_count; i++) free(manifest->sprites[i]);
    free(manifest->sprites);
    
    for (int i = 0; i < manifest->tilesets_count; i++) free(manifest->tilesets[i]);
    free(manifest->tilesets);
    
    for (int i = 0; i < manifest->textures_count; i++) free(manifest->textures[i]);
    free(manifest->textures);
    
    for (int i = 0; i < manifest->audio_count; i++) free(manifest->audio[i]);
    free(manifest->audio);
    
    for (int i = 0; i < manifest->scripts_count; i++) free(manifest->scripts[i]);
    free(manifest->scripts);
    
    free(manifest);
}
