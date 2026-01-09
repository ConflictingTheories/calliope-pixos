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

#include "archive_loader.h"
#include "../engine.h"
#include "../hud/hud_manager.h"
#include "../vendor/cJSON.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>

// Include miniz for ZIP handling
#define MINIZ_NO_STDIO
#define MINIZ_NO_TIME
#define MINIZ_NO_ARCHIVE_WRITING_APIS
#include "../vendor/miniz.h"

// ============================================
// Helper Functions
// ============================================

static int ensure_directory_exists(const char* path) {
    char tmp[ARCHIVE_MAX_PATH];
    char* p = NULL;
    size_t len;
    
    snprintf(tmp, sizeof(tmp), "%s", path);
    len = strlen(tmp);
    
    // Remove trailing slash
    if (tmp[len - 1] == '/') {
        tmp[len - 1] = '\0';
    }
    
    for (p = tmp + 1; *p; p++) {
        if (*p == '/') {
            *p = '\0';
#ifdef _WIN32
            mkdir(tmp);
#else
            mkdir(tmp, 0755);
#endif
            *p = '/';
        }
    }
    
#ifdef _WIN32
    return mkdir(tmp);
#else
    return mkdir(tmp, 0755);
#endif
}

static bool starts_with(const char* str, const char* prefix) {
    size_t prefix_len = strlen(prefix);
    size_t str_len = strlen(str);
    
    if (str_len < prefix_len) return false;
    return strncmp(str, prefix, prefix_len) == 0;
}

// ============================================
// Archive Functions Implementation
// ============================================

int archive_open(ArchiveHandle* archive, const char* path) {
    if (!archive || !path) return -1;
    
    memset(archive, 0, sizeof(ArchiveHandle));
    strncpy(archive->archive_path, path, ARCHIVE_MAX_PATH - 1);
    
    printf("Opening archive: %s\n", path);
    
    // Read the entire file into memory
    FILE* file = fopen(path, "rb");
    if (!file) {
        fprintf(stderr, "Failed to open archive file: %s\n", path);
        return -1;
    }
    
    fseek(file, 0, SEEK_END);
    size_t file_size = ftell(file);
    fseek(file, 0, SEEK_SET);
    
    unsigned char* file_data = (unsigned char*)malloc(file_size);
    if (!file_data) {
        fprintf(stderr, "Failed to allocate memory for archive\n");
        fclose(file);
        return -1;
    }
    
    if (fread(file_data, 1, file_size, file) != file_size) {
        fprintf(stderr, "Failed to read archive file\n");
        free(file_data);
        fclose(file);
        return -1;
    }
    fclose(file);
    
    // Initialize miniz archive
    mz_zip_archive* zip = (mz_zip_archive*)malloc(sizeof(mz_zip_archive));
    if (!zip) {
        fprintf(stderr, "Failed to allocate miniz archive\n");
        free(file_data);
        return -1;
    }
    
    memset(zip, 0, sizeof(mz_zip_archive));
    
    if (!mz_zip_reader_init_mem(zip, file_data, file_size, 0)) {
        fprintf(stderr, "Failed to initialize ZIP reader: %s\n", 
                mz_zip_get_error_string(mz_zip_get_last_error(zip)));
        free(zip);
        free(file_data);
        return -1;
    }
    
    archive->zip_archive = zip;
    
    // Build entry list
    int num_files = (int)mz_zip_reader_get_num_files(zip);
    archive->entry_count = 0;
    
    for (int i = 0; i < num_files && archive->entry_count < ARCHIVE_MAX_FILES; i++) {
        mz_zip_archive_file_stat file_stat;
        if (!mz_zip_reader_file_stat(zip, i, &file_stat)) {
            continue;
        }
        
        ArchiveEntry* entry = &archive->entries[archive->entry_count];
        strncpy(entry->path, file_stat.m_filename, ARCHIVE_MAX_PATH - 1);
        entry->size = (size_t)file_stat.m_uncomp_size;
        entry->offset = i;  // Store file index
        entry->is_directory = mz_zip_reader_is_file_a_directory(zip, i);
        
        archive->entry_count++;
    }
    
    printf("Archive opened: %d files\n", archive->entry_count);
    
    // Load manifest
    if (archive_load_manifest(archive) == 0) {
        printf("Manifest loaded: %s v%s\n", 
               archive->manifest.name, 
               archive->manifest.version);
    }
    
    archive->loaded = true;
    return 0;
}

void archive_close(ArchiveHandle* archive) {
    if (!archive || !archive->loaded) return;
    
    if (archive->zip_archive) {
        mz_zip_archive* zip = (mz_zip_archive*)archive->zip_archive;
        
        // miniz manages the memory buffer internally, just end the reader
        mz_zip_reader_end(zip);
        free(zip);
        
        archive->zip_archive = NULL;
    }
    
    archive->loaded = false;
    archive->entry_count = 0;
    
    printf("Archive closed\n");
}

bool archive_file_exists(ArchiveHandle* archive, const char* path) {
    if (!archive || !archive->loaded || !path) return false;
    
    mz_zip_archive* zip = (mz_zip_archive*)archive->zip_archive;
    return mz_zip_reader_locate_file(zip, path, NULL, 0) >= 0;
}

int archive_read_file(ArchiveHandle* archive, const char* path, 
                      unsigned char** out_buffer, size_t* out_size) {
    if (!archive || !archive->loaded || !path || !out_buffer || !out_size) {
        return -1;
    }
    
    mz_zip_archive* zip = (mz_zip_archive*)archive->zip_archive;
    
    int file_index = mz_zip_reader_locate_file(zip, path, NULL, 0);
    if (file_index < 0) {
        fprintf(stderr, "File not found in archive: %s\n", path);
        return -1;
    }
    
    mz_zip_archive_file_stat file_stat;
    if (!mz_zip_reader_file_stat(zip, file_index, &file_stat)) {
        fprintf(stderr, "Failed to get file stats: %s\n", path);
        return -1;
    }
    
    size_t size = (size_t)file_stat.m_uncomp_size;
    unsigned char* buffer = (unsigned char*)malloc(size);
    if (!buffer) {
        fprintf(stderr, "Failed to allocate buffer for file: %s\n", path);
        return -1;
    }
    
    if (!mz_zip_reader_extract_to_mem(zip, file_index, buffer, size, 0)) {
        fprintf(stderr, "Failed to extract file: %s\n", path);
        free(buffer);
        return -1;
    }
    
    *out_buffer = buffer;
    *out_size = size;
    
    return 0;
}

int archive_read_text(ArchiveHandle* archive, const char* path, char** out_string) {
    unsigned char* buffer = NULL;
    size_t size = 0;
    
    if (archive_read_file(archive, path, &buffer, &size) != 0) {
        return -1;
    }
    
    // Allocate string with null terminator
    char* str = (char*)malloc(size + 1);
    if (!str) {
        free(buffer);
        return -1;
    }
    
    memcpy(str, buffer, size);
    str[size] = '\0';
    
    free(buffer);
    *out_string = str;
    
    return 0;
}

cJSON* archive_read_json(ArchiveHandle* archive, const char* path) {
    char* json_str = NULL;
    
    if (archive_read_text(archive, path, &json_str) != 0) {
        return NULL;
    }
    
    cJSON* json = cJSON_Parse(json_str);
    free(json_str);
    
    if (!json) {
        fprintf(stderr, "Failed to parse JSON: %s\n", path);
        fprintf(stderr, "Parse error: %s\n", cJSON_GetErrorPtr());
        return NULL;
    }
    
    return json;
}

int archive_load_manifest(ArchiveHandle* archive) {
    if (!archive || !archive->loaded) return -1;
    
    // Try different manifest names
    const char* manifest_names[] = {
        "manifest.json",
        "manifest.local.json",
        "package.json",
        NULL
    };
    
    cJSON* manifest_json = NULL;
    for (int i = 0; manifest_names[i] && !manifest_json; i++) {
        manifest_json = archive_read_json(archive, manifest_names[i]);
    }
    
    if (!manifest_json) {
        fprintf(stderr, "No manifest found in archive\n");
        return -1;
    }
    
    GameManifest* m = &archive->manifest;
    
    // Parse basic info
    cJSON* name = cJSON_GetObjectItem(manifest_json, "name");
    if (name && cJSON_IsString(name)) {
        strncpy(m->name, name->valuestring, sizeof(m->name) - 1);
    } else {
        strcpy(m->name, "Untitled Game");
    }
    
    cJSON* version = cJSON_GetObjectItem(manifest_json, "version");
    if (version && cJSON_IsString(version)) {
        strncpy(m->version, version->valuestring, sizeof(m->version) - 1);
    } else {
        strcpy(m->version, "1.0.0");
    }
    
    cJSON* author = cJSON_GetObjectItem(manifest_json, "author");
    if (author && cJSON_IsString(author)) {
        strncpy(m->author, author->valuestring, sizeof(m->author) - 1);
    }
    
    cJSON* desc = cJSON_GetObjectItem(manifest_json, "description");
    if (desc && cJSON_IsString(desc)) {
        strncpy(m->description, desc->valuestring, sizeof(m->description) - 1);
    }
    
    // Parse entry point
    cJSON* entry = cJSON_GetObjectItem(manifest_json, "entry");
    if (entry) {
        cJSON* zone = cJSON_GetObjectItem(entry, "zone");
        if (zone && cJSON_IsString(zone)) {
            strncpy(m->entry_zone, zone->valuestring, sizeof(m->entry_zone) - 1);
        }
        
        cJSON* pos = cJSON_GetObjectItem(entry, "position");
        if (pos && cJSON_IsString(pos)) {
            strncpy(m->entry_position, pos->valuestring, sizeof(m->entry_position) - 1);
        }
    }
    
    // Parse asset paths
    cJSON* paths = cJSON_GetObjectItem(manifest_json, "paths");
    if (paths) {
        cJSON* sprites = cJSON_GetObjectItem(paths, "sprites");
        if (sprites && cJSON_IsString(sprites)) {
            strncpy(m->sprites_path, sprites->valuestring, sizeof(m->sprites_path) - 1);
        } else {
            strcpy(m->sprites_path, "sprites/");
        }
        
        cJSON* tilesets = cJSON_GetObjectItem(paths, "tilesets");
        if (tilesets && cJSON_IsString(tilesets)) {
            strncpy(m->tilesets_path, tilesets->valuestring, sizeof(m->tilesets_path) - 1);
        } else {
            strcpy(m->tilesets_path, "tilesets/");
        }
        
        cJSON* maps = cJSON_GetObjectItem(paths, "maps");
        if (maps && cJSON_IsString(maps)) {
            strncpy(m->maps_path, maps->valuestring, sizeof(m->maps_path) - 1);
        } else {
            strcpy(m->maps_path, "maps/");
        }
        
        cJSON* audio = cJSON_GetObjectItem(paths, "audio");
        if (audio && cJSON_IsString(audio)) {
            strncpy(m->audio_path, audio->valuestring, sizeof(m->audio_path) - 1);
        } else {
            strcpy(m->audio_path, "audio/");
        }
        
        cJSON* scripts = cJSON_GetObjectItem(paths, "scripts");
        if (scripts && cJSON_IsString(scripts)) {
            strncpy(m->scripts_path, scripts->valuestring, sizeof(m->scripts_path) - 1);
        } else {
            strcpy(m->scripts_path, "scripts/");
        }
        
        cJSON* textures = cJSON_GetObjectItem(paths, "textures");
        if (textures && cJSON_IsString(textures)) {
            strncpy(m->textures_path, textures->valuestring, sizeof(m->textures_path) - 1);
        } else {
            strcpy(m->textures_path, "textures/");
        }
    } else {
        // Default paths
        strcpy(m->sprites_path, "sprites/");
        strcpy(m->tilesets_path, "tilesets/");
        strcpy(m->maps_path, "maps/");
        strcpy(m->audio_path, "audio/");
        strcpy(m->scripts_path, "scripts/");
        strcpy(m->textures_path, "textures/");
    }
    
    // Parse display settings
    cJSON* display = cJSON_GetObjectItem(manifest_json, "display");
    if (display) {
        cJSON* width = cJSON_GetObjectItem(display, "width");
        if (width && cJSON_IsNumber(width)) {
            m->screen_width = width->valueint;
        } else {
            m->screen_width = 800;
        }
        
        cJSON* height = cJSON_GetObjectItem(display, "height");
        if (height && cJSON_IsNumber(height)) {
            m->screen_height = height->valueint;
        } else {
            m->screen_height = 600;
        }
        
        cJSON* fullscreen = cJSON_GetObjectItem(display, "fullscreen");
        m->fullscreen = fullscreen && cJSON_IsTrue(fullscreen);
    } else {
        m->screen_width = 800;
        m->screen_height = 600;
        m->fullscreen = false;
    }
    
    cJSON_Delete(manifest_json);
    archive->manifest_loaded = true;
    
    return 0;
}

const GameManifest* archive_get_manifest(ArchiveHandle* archive) {
    if (!archive || !archive->manifest_loaded) return NULL;
    return &archive->manifest;
}

int archive_list_directory(ArchiveHandle* archive, const char* dir_path,
                           char out_paths[][ARCHIVE_MAX_PATH], int max_paths) {
    if (!archive || !archive->loaded || !dir_path || !out_paths) return 0;
    
    int count = 0;
    size_t dir_len = strlen(dir_path);
    
    for (int i = 0; i < archive->entry_count && count < max_paths; i++) {
        ArchiveEntry* entry = &archive->entries[i];
        
        if (starts_with(entry->path, dir_path) && !entry->is_directory) {
            // Check that it's a direct child (no additional slashes)
            const char* rest = entry->path + dir_len;
            const char* slash = strchr(rest, '/');
            
            if (!slash || slash[1] == '\0') {
                strncpy(out_paths[count], entry->path, ARCHIVE_MAX_PATH - 1);
                count++;
            }
        }
    }
    
    return count;
}

int archive_extract_file(ArchiveHandle* archive, const char* path, const char* dest_path) {
    if (!archive || !archive->loaded || !path || !dest_path) return -1;
    
    unsigned char* buffer = NULL;
    size_t size = 0;
    
    if (archive_read_file(archive, path, &buffer, &size) != 0) {
        return -1;
    }
    
    // Ensure directory exists
    char dir_path[ARCHIVE_MAX_PATH];
    strncpy(dir_path, dest_path, ARCHIVE_MAX_PATH - 1);
    char* last_slash = strrchr(dir_path, '/');
    if (last_slash) {
        *last_slash = '\0';
        ensure_directory_exists(dir_path);
    }
    
    // Write file
    FILE* file = fopen(dest_path, "wb");
    if (!file) {
        fprintf(stderr, "Failed to create file: %s\n", dest_path);
        free(buffer);
        return -1;
    }
    
    fwrite(buffer, 1, size, file);
    fclose(file);
    free(buffer);
    
    return 0;
}

int archive_extract_all(ArchiveHandle* archive, const char* dest_dir) {
    if (!archive || !archive->loaded || !dest_dir) return -1;
    
    ensure_directory_exists(dest_dir);
    strncpy(archive->extract_dir, dest_dir, ARCHIVE_MAX_PATH - 1);
    
    for (int i = 0; i < archive->entry_count; i++) {
        ArchiveEntry* entry = &archive->entries[i];
        
        if (entry->is_directory) continue;
        
        char dest_path[ARCHIVE_MAX_PATH * 2];
        snprintf(dest_path, sizeof(dest_path), "%s/%s", dest_dir, entry->path);
        
        if (archive_extract_file(archive, entry->path, dest_path) != 0) {
            fprintf(stderr, "Failed to extract: %s\n", entry->path);
        }
    }
    
    archive->use_extraction = true;
    printf("Extracted %d files to: %s\n", archive->entry_count, dest_dir);
    
    return 0;
}

// ============================================
// Game Package Loading (High-Level)
// ============================================

// Global archive handle (one game at a time)
static ArchiveHandle g_current_archive = {0};

int game_package_load(struct GLEngine* engine, const char* archive_path) {
    if (!engine || !archive_path) return -1;
    
    // Close any existing package
    if (g_current_archive.loaded) {
        game_package_unload(engine);
    }
    
    // Open the archive
    if (archive_open(&g_current_archive, archive_path) != 0) {
        return -1;
    }
    
    // Get manifest
    const GameManifest* manifest = archive_get_manifest(&g_current_archive);
    if (!manifest) {
        fprintf(stderr, "Package has no valid manifest\n");
        archive_close(&g_current_archive);
        return -1;
    }
    
    printf("Loading game: %s v%s\n", manifest->name, manifest->version);
    printf("  Author: %s\n", manifest->author);
    printf("  Entry zone: %s at %s\n", manifest->entry_zone, manifest->entry_position);
    
    // TODO: Load entry zone into engine->world
    // TODO: Set up resource manager to use archive for asset loading
    
    // Hide main menu if HUD is available
    if (engine->hud && engine->hud->active_menu) {
        engine->hud->active_menu->visible = false;
        engine->hud->active_menu = NULL;
    }
    
    return 0;
}

void game_package_unload(struct GLEngine* engine) {
    if (!engine) return;
    
    if (g_current_archive.loaded) {
        archive_close(&g_current_archive);
    }
    
    // Show main menu again
    if (engine->hud) {
        engine->hud->active_menu = &engine->hud->main_menu;
        engine->hud->main_menu.visible = true;
    }
}

ArchiveHandle* game_package_get_archive(struct GLEngine* engine) {
    (void)engine;  // Currently unused, but kept for API consistency
    
    if (!g_current_archive.loaded) return NULL;
    return &g_current_archive;
}
