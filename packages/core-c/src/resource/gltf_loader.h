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

#ifndef GLTF_LOADER_H
#define GLTF_LOADER_H

#include <stdbool.h>
#include <stdint.h>

#define MAX_GLTF_MESHES 64
#define MAX_GLTF_MATERIALS 64
#define MAX_GLTF_NODES 128

/**
 * GLTF vertex: position, normal, UV.
 */
typedef struct GltfVertex {
    float pos[3];
    float normal[3];
    float uv[2];
} GltfVertex;

/**
 * GLTF material (PBR metallic-roughness).
 */
typedef struct GltfMaterial {
    char name[64];
    float baseColor[4];      // RGBA
    float metallic;
    float roughness;
} GltfMaterial;

/**
 * GLTF mesh primitive.
 */
typedef struct GltfMesh {
    GltfVertex* vertices;
    int vertex_count;
    uint32_t* indices;
    int index_count;
    int material_index;
} GltfMesh;

/**
 * GLTF model.
 */
typedef struct GltfModel {
    GltfMesh* meshes;
    int mesh_count;
    GltfMaterial* materials;
    int material_count;
} GltfModel;

// Parse .gltf JSON text (with embedded base64 buffers)
// Returns NULL on failure, caller must free with gltf_model_free
GltfModel* gltf_parse(const char* json_text);

// Parse .glb binary (data + size)
// Returns NULL on failure
GltfModel* gltf_parse_glb(const uint8_t* data, size_t size);

// Free model
void gltf_model_free(GltfModel* model);

#endif // GLTF_LOADER_H
