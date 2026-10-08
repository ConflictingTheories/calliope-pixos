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

#include "obj_loader.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Temporary storage for raw OBJ data
typedef struct {
    float* positions;  // 3 floats per vertex
    float* normals;    // 3 floats per normal
    float* uvs;        // 2 floats per uv
    int pos_count, normal_count, uv_count;
} ObjRaw;

static void obj_raw_init(ObjRaw* raw) {
    raw->positions = malloc(sizeof(float) * 3 * MAX_OBJ_VERTICES);
    raw->normals = malloc(sizeof(float) * 3 * MAX_OBJ_VERTICES);
    raw->uvs = malloc(sizeof(float) * 2 * MAX_OBJ_VERTICES);
    raw->pos_count = raw->normal_count = raw->uv_count = 0;
}

static void obj_raw_free(ObjRaw* raw) {
    free(raw->positions);
    free(raw->normals);
    free(raw->uvs);
}

ObjModel* obj_parse(const char* text) {
    ObjModel* model = calloc(1, sizeof(ObjModel));
    if (!model) return NULL;

    ObjRaw raw;
    obj_raw_init(&raw);

    // Single mesh for now (multi-mesh via 'o' or 'g' not yet split)
    ObjMesh mesh = {0};
    mesh.vertices = malloc(sizeof(ObjVertex) * MAX_OBJ_VERTICES);
    mesh.indices = malloc(sizeof(unsigned int) * MAX_OBJ_FACES * 3);
    mesh.material_index = -1;

    char* copy = strdup(text);
    char* line = strtok(copy, "\n");

    while (line) {
        // Skip comments and empty
        if (line[0] == '#' || line[0] == '\0') {
            line = strtok(NULL, "\n");
            continue;
        }

        if (strncmp(line, "v ", 2) == 0) {
            float x, y, z;
            if (sscanf(line + 2, "%f %f %f", &x, &y, &z) == 3) {
                int i = raw.pos_count++;
                raw.positions[i*3] = x;
                raw.positions[i*3+1] = y;
                raw.positions[i*3+2] = z;
            }
        } else if (strncmp(line, "vn ", 3) == 0) {
            float x, y, z;
            if (sscanf(line + 3, "%f %f %f", &x, &y, &z) == 3) {
                int i = raw.normal_count++;
                raw.normals[i*3] = x;
                raw.normals[i*3+1] = y;
                raw.normals[i*3+2] = z;
            }
        } else if (strncmp(line, "vt ", 3) == 0) {
            float u, v;
            if (sscanf(line + 3, "%f %f", &u, &v) >= 1) {
                int i = raw.uv_count++;
                raw.uvs[i*2] = u;
                raw.uvs[i*2+1] = v;
            }
        } else if (strncmp(line, "f ", 2) == 0) {
            // Parse face: v/vt/vn triplets
            int v[4], vt[4], vn[4];
            int n = 0;
            char* p = line + 2;
            while (n < 4 && *p) {
                int vi = 0, vti = 0, vni = 0;
                if (sscanf(p, "%d/%d/%d", &vi, &vti, &vni) == 3) {
                    v[n] = vi - 1; vt[n] = vti - 1; vn[n] = vni - 1;
                } else if (sscanf(p, "%d//%d", &vi, &vni) == 2) {
                    v[n] = vi - 1; vt[n] = -1; vn[n] = vni - 1;
                } else if (sscanf(p, "%d/%d", &vi, &vti) == 2) {
                    v[n] = vi - 1; vt[n] = vti - 1; vn[n] = -1;
                } else if (sscanf(p, "%d", &vi) == 1) {
                    v[n] = vi - 1; vt[n] = -1; vn[n] = -1;
                } else break;
                n++;
                // Advance past this vertex spec
                while (*p && *p != ' ') p++;
                while (*p == ' ') p++;
            }

            // Triangulate: fan from vertex 0
            for (int i = 1; i < n - 1; i++) {
                int tri[3] = {0, i, i + 1};
                for (int j = 0; j < 3; j++) {
                    int idx = tri[j];
                    ObjVertex vert = {0};
                    // Position
                    vert.pos[0] = raw.positions[v[idx]*3];
                    vert.pos[1] = raw.positions[v[idx]*3+1];
                    vert.pos[2] = raw.positions[v[idx]*3+2];
                    // Normal
                    if (vn[idx] >= 0) {
                        vert.normal[0] = raw.normals[vn[idx]*3];
                        vert.normal[1] = raw.normals[vn[idx]*3+1];
                        vert.normal[2] = raw.normals[vn[idx]*3+2];
                    }
                    // UV
                    if (vt[idx] >= 0) {
                        vert.uv[0] = raw.uvs[vt[idx]*2];
                        vert.uv[1] = raw.uvs[vt[idx]*2+1];
                    }
                    mesh.vertices[mesh.vertex_count] = vert;
                    mesh.indices[mesh.index_count++] = mesh.vertex_count++;
                }
            }
        } else if (strncmp(line, "usemtl ", 7) == 0) {
            // Find or note material (actual lookup in obj_parse_mtl)
            // For now, store name for later resolution
        }

        line = strtok(NULL, "\n");
    }

    free(copy);
    obj_raw_free(&raw);

    // Store single mesh
    model->meshes = malloc(sizeof(ObjMesh));
    model->meshes[0] = mesh;
    model->mesh_count = 1;

    return model;
}

bool obj_parse_mtl(ObjModel* model, const char* text) {
    model->materials = calloc(MAX_OBJ_MATERIALS, sizeof(ObjMaterial));

    char* copy = strdup(text);
    char* line = strtok(copy, "\n");
    ObjMaterial* current = NULL;

    while (line) {
        if (strncmp(line, "newmtl ", 7) == 0) {
            if (model->material_count < MAX_OBJ_MATERIALS) {
                current = &model->materials[model->material_count++];
                strncpy(current->name, line + 7, MAX_MATERIAL_NAME - 1);
                // Defaults
                current->diffuse[0] = current->diffuse[1] = current->diffuse[2] = 0.8f;
                current->specular[0] = current->specular[1] = current->specular[2] = 0.0f;
                current->shininess = 0.0f;
                current->texture[0] = '\0';
            }
        } else if (current && strncmp(line, "Kd ", 3) == 0) {
            sscanf(line + 3, "%f %f %f",
                   &current->diffuse[0], &current->diffuse[1], &current->diffuse[2]);
        } else if (current && strncmp(line, "Ks ", 3) == 0) {
            sscanf(line + 3, "%f %f %f",
                   &current->specular[0], &current->specular[1], &current->specular[2]);
        } else if (current && strncmp(line, "Ns ", 3) == 0) {
            sscanf(line + 3, "%f", &current->shininess);
        } else if (current && strncmp(line, "map_Kd ", 7) == 0) {
            strncpy(current->texture, line + 7, 255);
        }
        line = strtok(NULL, "\n");
    }

    free(copy);
    return true;
}

void obj_model_free(ObjModel* model) {
    if (!model) return;
    for (int i = 0; i < model->mesh_count; i++) {
        free(model->meshes[i].vertices);
        free(model->meshes[i].indices);
    }
    free(model->meshes);
    free(model->materials);
    free(model);
}
