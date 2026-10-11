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

#include "pixozine_loader.h"
#include "../vendor/cJSON.h"
#include "../vendor/miniz.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Current format version
#define PXZ_CURRENT_MAJOR 1
#define PXZ_CURRENT_MINOR 1

static bool parse_manifest(Pixozine* pxz, const char* json_text) {
    cJSON* root = cJSON_Parse(json_text);
    if (!root) {
        strncpy(pxz->error, "Invalid manifest JSON", 255);
        return false;
    }

    cJSON* id = cJSON_GetObjectItem(root, "id");
    cJSON* title = cJSON_GetObjectItem(root, "title");
    cJSON* version = cJSON_GetObjectItem(root, "version");

    if (!id || !title || !version) {
        strncpy(pxz->error, "Manifest missing id/title/version", 255);
        cJSON_Delete(root);
        return false;
    }

    strncpy(pxz->manifest.id, id->valuestring, MAX_PXZ_ID - 1);
    strncpy(pxz->manifest.title, title->valuestring, MAX_PXZ_TITLE - 1);
    strncpy(pxz->manifest.version, version->valuestring, MAX_PXZ_VERSION - 1);

    cJSON* desc = cJSON_GetObjectItem(root, "description");
    if (desc) strncpy(pxz->manifest.description, desc->valuestring, 511);

    // Initial zones
    cJSON* zones = cJSON_GetObjectItem(root, "initialZones");
    if (zones && cJSON_IsArray(zones)) {
        int n = cJSON_GetArraySize(zones);
        pxz->manifest.initialZoneCount = n > 16 ? 16 : n;
        for (int i = 0; i < pxz->manifest.initialZoneCount; i++) {
            cJSON* z = cJSON_GetArrayItem(zones, i);
            strncpy(pxz->manifest.initialZones[i], z->valuestring, MAX_PXZ_ID - 1);
        }
    }

    // Format version (for migrate-on-load)
    cJSON* fmt = cJSON_GetObjectItem(root, "formatVersion");
    if (fmt && cJSON_IsString(fmt)) {
        sscanf(fmt->valuestring, "%d.%d",
               &pxz->manifest.formatVersionMajor,
               &pxz->manifest.formatVersionMinor);
    } else {
        // Default to 1.0 if not specified
        pxz->manifest.formatVersionMajor = 1;
        pxz->manifest.formatVersionMinor = 0;
    }

    cJSON_Delete(root);
    return true;
}

bool pixozine_validate(Pixozine* pxz) {
    if (!pxz) return false;

    // Required fields
    if (!pxz->manifest.id[0]) {
        strncpy(pxz->error, "Missing id", 255);
        return false;
    }
    if (!pxz->manifest.title[0]) {
        strncpy(pxz->error, "Missing title", 255);
        return false;
    }
    if (pxz->manifest.initialZoneCount == 0) {
        strncpy(pxz->error, "No initial zones", 255);
        return false;
    }

    pxz->valid = true;
    return true;
}

bool pixozine_migrate(Pixozine* pxz) {
    if (!pxz) return false;

    int major = pxz->manifest.formatVersionMajor;
    int minor = pxz->manifest.formatVersionMinor;

    // v1.0 -> v1.1: additive only, no changes needed
    // (playables array is optional)
    if (major == 1 && minor == 0) {
        pxz->manifest.formatVersionMinor = 1;
        // No data changes needed
    }

    // Future migrations go here

    return true;
}

Pixozine* pixozine_load(const char* path) {
    FILE* f = fopen(path, "rb");
    if (!f) return NULL;

    fseek(f, 0, SEEK_END);
    size_t size = ftell(f);
    fseek(f, 0, SEEK_SET);

    uint8_t* data = malloc(size);
    fread(data, 1, size, f);
    fclose(f);

    Pixozine* pxz = pixozine_load_from_memory(data, size);
    free(data);
    return pxz;
}

Pixozine* pixozine_load_from_memory(const uint8_t* data, size_t size) {
    Pixozine* pxz = calloc(1, sizeof(Pixozine));
    if (!pxz) return NULL;

    // Open ZIP archive
    mz_zip_archive* zip = calloc(1, sizeof(mz_zip_archive));
    if (!mz_zip_reader_init_mem(zip, data, size, 0)) {
        strncpy(pxz->error, "Invalid ZIP archive", 255);
        free(zip);
        free(pxz);
        return NULL;
    }
    pxz->archive = zip;

    // Read manifest.json
    size_t manifest_size;
    void* manifest_data = mz_zip_reader_extract_file_to_heap(
        zip, "manifest.json", &manifest_size, 0);
    if (!manifest_data) {
        strncpy(pxz->error, "Missing manifest.json", 255);
        mz_zip_reader_end(zip);
        free(zip);
        free(pxz);
        return NULL;
    }

    char* manifest_text = malloc(manifest_size + 1);
    memcpy(manifest_text, manifest_data, manifest_size);
    manifest_text[manifest_size] = '\0';
    mz_free(manifest_data);

    if (!parse_manifest(pxz, manifest_text)) {
        free(manifest_text);
        mz_zip_reader_end(zip);
        free(zip);
        free(pxz);
        return NULL;
    }
    free(manifest_text);

    // Migrate on load
    pixozine_migrate(pxz);

    // Validate
    if (!pixozine_validate(pxz)) {
        mz_zip_reader_end(zip);
        free(zip);
        free(pxz);
        return NULL;
    }

    return pxz;
}

uint8_t* pixozine_get_file(Pixozine* pxz, const char* path, size_t* out_size) {
    if (!pxz || !pxz->archive) return NULL;

    mz_zip_archive* zip = (mz_zip_archive*)pxz->archive;
    size_t size;
    void* data = mz_zip_reader_extract_file_to_heap(zip, path, &size, 0);
    if (!data) return NULL;

    if (out_size) *out_size = size;
    return (uint8_t*)data; // Caller must mz_free()
}

void pixozine_free(Pixozine* pxz) {
    if (!pxz) return;
    if (pxz->archive) {
        mz_zip_reader_end((mz_zip_archive*)pxz->archive);
        free(pxz->archive);
    }
    free(pxz);
}
