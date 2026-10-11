/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

#ifndef PIXOZINE_LOADER_H
#define PIXOZINE_LOADER_H

#include <stdbool.h>
#include <stdint.h>

#define MAX_PXZ_TITLE 128
#define MAX_PXZ_VERSION 16
#define MAX_PXZ_ID 64

/**
 * Pixozine manifest (from manifest.json).
 * Matches spec §2.
 */
typedef struct PixozineManifest {
    char id[MAX_PXZ_ID];
    char title[MAX_PXZ_TITLE];
    char version[MAX_PXZ_VERSION];
    char description[512];
    // Initial zones
    char initialZones[16][MAX_PXZ_ID];
    int initialZoneCount;
    // Format version for migrate-on-load
    int formatVersionMajor;
    int formatVersionMinor;
} PixozineManifest;

/**
 * Loaded pixozine package.
 */
typedef struct Pixozine {
    PixozineManifest manifest;
    // ZIP archive handle (opaque)
    void* archive;
    // Validation status
    bool valid;
    char error[256];
} Pixozine;

// Load pixozine from .pxz file path
// Returns NULL on failure
Pixozine* pixozine_load(const char* path);

// Load from memory buffer
Pixozine* pixozine_load_from_memory(const uint8_t* data, size_t size);

// Validate manifest (returns true if valid)
bool pixozine_validate(Pixozine* pxz);

// Migrate manifest to current version (migrate-on-load)
bool pixozine_migrate(Pixozine* pxz);

// Get file from archive (returns malloc'd buffer, caller frees)
uint8_t* pixozine_get_file(Pixozine* pxz, const char* path, size_t* out_size);

// Free pixozine
void pixozine_free(Pixozine* pxz);

#endif // PIXOZINE_LOADER_H
