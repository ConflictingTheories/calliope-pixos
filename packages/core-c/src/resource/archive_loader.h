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

#ifndef ARCHIVE_LOADER_H
#define ARCHIVE_LOADER_H

#include <stdbool.h>
#include <stddef.h>

// Forward declarations
struct GLEngine;
struct cJSON;

// Maximum values
#define ARCHIVE_MAX_FILES 256
#define ARCHIVE_MAX_PATH 256

// ============================================
// Archive Entry
// ============================================

typedef struct {
    char path[ARCHIVE_MAX_PATH];
    size_t size;
    size_t offset;          // Offset in archive (for memory-mapped access)
    bool is_directory;
} ArchiveEntry;

// ============================================
// Game Package Manifest (from manifest.json)
// ============================================

typedef struct {
    char name[64];
    char version[16];
    char author[64];
    char description[256];
    char entry_zone[64];    // Starting zone
    char entry_position[32]; // Starting position (e.g., "5,5")
    
    // Asset paths
    char sprites_path[64];
    char tilesets_path[64];
    char maps_path[64];
    char audio_path[64];
    char scripts_path[64];
    char textures_path[64];
    
    // Game settings
    int screen_width;
    int screen_height;
    bool fullscreen;
} GameManifest;

// ============================================
// Archive Handle
// ============================================

typedef struct ArchiveHandle {
    void* zip_archive;      // miniz archive handle
    char archive_path[ARCHIVE_MAX_PATH];
    
    // Entry list
    ArchiveEntry entries[ARCHIVE_MAX_FILES];
    int entry_count;
    
    // Manifest data
    GameManifest manifest;
    bool manifest_loaded;
    
    // Extraction directory (for extracted mode)
    char extract_dir[ARCHIVE_MAX_PATH];
    bool use_extraction;    // If true, files are extracted to temp dir
    
    bool loaded;
} ArchiveHandle;

// ============================================
// Archive Loader Functions
// ============================================

/**
 * Open a .pxz archive file
 * @param archive Pointer to archive handle
 * @param path Path to .pxz file
 * @return 0 on success, -1 on failure
 */
int archive_open(ArchiveHandle* archive, const char* path);

/**
 * Close an archive and free resources
 */
void archive_close(ArchiveHandle* archive);

/**
 * Check if a file exists in the archive
 * @param archive Archive handle
 * @param path Path within archive (e.g., "sprites/player.json")
 * @return true if file exists
 */
bool archive_file_exists(ArchiveHandle* archive, const char* path);

/**
 * Read a file from the archive into a buffer
 * @param archive Archive handle
 * @param path Path within archive
 * @param out_buffer Output buffer (allocated by function, caller must free)
 * @param out_size Output size in bytes
 * @return 0 on success, -1 on failure
 */
int archive_read_file(ArchiveHandle* archive, const char* path, 
                      unsigned char** out_buffer, size_t* out_size);

/**
 * Read a text file from the archive as a null-terminated string
 * @param archive Archive handle
 * @param path Path within archive
 * @param out_string Output string (allocated by function, caller must free)
 * @return 0 on success, -1 on failure
 */
int archive_read_text(ArchiveHandle* archive, const char* path, char** out_string);

/**
 * Read and parse a JSON file from the archive
 * @param archive Archive handle
 * @param path Path within archive
 * @return cJSON pointer (caller must free with cJSON_Delete), NULL on failure
 */
struct cJSON* archive_read_json(ArchiveHandle* archive, const char* path);

/**
 * Load the manifest.json from the archive
 * @param archive Archive handle
 * @return 0 on success, -1 on failure
 */
int archive_load_manifest(ArchiveHandle* archive);

/**
 * Get the game manifest
 * @param archive Archive handle
 * @return Pointer to manifest, NULL if not loaded
 */
const GameManifest* archive_get_manifest(ArchiveHandle* archive);

/**
 * List files in a directory within the archive
 * @param archive Archive handle
 * @param dir_path Directory path (e.g., "sprites/")
 * @param out_paths Array of paths (caller provides buffer)
 * @param max_paths Maximum number of paths to return
 * @return Number of files found
 */
int archive_list_directory(ArchiveHandle* archive, const char* dir_path,
                           char out_paths[][ARCHIVE_MAX_PATH], int max_paths);

/**
 * Extract a file to the filesystem
 * @param archive Archive handle
 * @param path Path within archive
 * @param dest_path Destination path on filesystem
 * @return 0 on success, -1 on failure
 */
int archive_extract_file(ArchiveHandle* archive, const char* path, const char* dest_path);

/**
 * Extract all files to a directory
 * @param archive Archive handle
 * @param dest_dir Destination directory
 * @return 0 on success, -1 on failure
 */
int archive_extract_all(ArchiveHandle* archive, const char* dest_dir);

// ============================================
// Game Package Loading (High-Level)
// ============================================

/**
 * Load a game package and initialize the engine with it
 * @param engine Engine handle
 * @param archive_path Path to .pxz file
 * @return 0 on success, -1 on failure
 */
int game_package_load(struct GLEngine* engine, const char* archive_path);

/**
 * Unload the current game package
 * @param engine Engine handle
 */
void game_package_unload(struct GLEngine* engine);

/**
 * Get the currently loaded archive (if any)
 * @param engine Engine handle
 * @return Archive handle, or NULL if no package loaded
 */
ArchiveHandle* game_package_get_archive(struct GLEngine* engine);

#endif // ARCHIVE_LOADER_H
