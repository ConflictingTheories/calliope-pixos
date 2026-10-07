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

#ifndef OBJ_LOADER_H
#define OBJ_LOADER_H

#include <stdbool.h>

#define MAX_OBJ_VERTICES 65536
#define MAX_OBJ_FACES 65536
#define MAX_OBJ_MATERIALS 64
#define MAX_MATERIAL_NAME 64

/**
 * OBJ vertex: position, normal, UV.
 */
typedef struct ObjVertex {
    float pos[3];
    float normal[3];
    float uv[2];
} ObjVertex;

/**
 * OBJ material (from MTL).
 */
typedef struct ObjMaterial {
    char name[MAX_MATERIAL_NAME];
    float diffuse[3];
    float specular[3];
    float shininess;
    char texture[256];  // Diffuse texture path
} ObjMaterial;

/**
 * OBJ mesh: vertices, indices, material.
 */
typedef struct ObjMesh {
    ObjVertex* vertices;
    int vertex_count;
    unsigned int* indices;
    int index_count;
    int material_index;  // -1 if none
} ObjMesh;

/**
 * OBJ model: meshes + materials.
 */
typedef struct ObjModel {
    ObjMesh* meshes;
    int mesh_count;
    ObjMaterial* materials;
    int material_count;
} ObjModel;

// Parse OBJ text (returns NULL on failure, caller must free with obj_model_free)
ObjModel* obj_parse(const char* text);

// Parse MTL text into model materials
bool obj_parse_mtl(ObjModel* model, const char* text);

// Free model memory
void obj_model_free(ObjModel* model);

#endif // OBJ_LOADER_H
