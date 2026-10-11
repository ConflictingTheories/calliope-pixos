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

#include "gltf_loader.h"
#include "../vendor/cJSON.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Base64 decode table
static const char b64_table[] =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

static int b64_decode_char(char c) {
    const char* p = strchr(b64_table, c);
    return p ? (p - b64_table) : -1;
}

// Decode base64 to binary. Returns size, or 0 on failure.
static size_t b64_decode(const char* input, uint8_t** output) {
    size_t len = strlen(input);
    // Skip data: prefix if present
    const char* data_start = strstr(input, "base64,");
    if (data_start) {
        input = data_start + 7;
        len = strlen(input);
    }

    size_t out_len = (len * 3) / 4;
    *output = malloc(out_len);
    if (!*output) return 0;

    size_t out_pos = 0;
    for (size_t i = 0; i < len; i += 4) {
        int a = b64_decode_char(input[i]);
        int b = b64_decode_char(input[i+1]);
        int c = (i+2 < len && input[i+2] != '=') ? b64_decode_char(input[i+2]) : 0;
        int d = (i+3 < len && input[i+3] != '=') ? b64_decode_char(input[i+3]) : 0;
        if (a < 0 || b < 0) break;

        (*output)[out_pos++] = (a << 2) | (b >> 4);
        if (input[i+2] != '=' && i+2 < len) {
            (*output)[out_pos++] = ((b & 0xF) << 4) | (c >> 2);
        }
        if (input[i+3] != '=' && i+3 < len) {
            (*output)[out_pos++] = ((c & 0x3) << 6) | d;
        }
    }
    return out_pos;
}

// Get float from accessor (handles VEC3, VEC2, SCALAR)
static void accessor_get_vec3(cJSON* accessors, cJSON* bufferViews,
                               uint8_t* bin_data, int accessor_idx, float* out) {
    cJSON* acc = cJSON_GetArrayItem(accessors, accessor_idx);
    if (!acc) return;
    cJSON* bv_idx = cJSON_GetObjectItem(acc, "bufferView");
    cJSON* count = cJSON_GetObjectItem(acc, "count");
    cJSON* type = cJSON_GetObjectItem(acc, "type");
    if (!bv_idx || !count || !type) return;

    cJSON* bv = cJSON_GetArrayItem(bufferViews, bv_idx->valueint);
    cJSON* byteOffset = cJSON_GetObjectItem(bv, "byteOffset");
    int offset = byteOffset ? byteOffset->valueint : 0;

    cJSON* accOffset = cJSON_GetObjectItem(acc, "byteOffset");
    if (accOffset) offset += accOffset->valueint;

    // For now, assume float data (componentType 5126)
    float* data = (float*)(bin_data + offset);
    out[0] = data[0];
    out[1] = data[1];
    out[2] = data[2];
}

GltfModel* gltf_parse(const char* json_text) {
    cJSON* root = cJSON_Parse(json_text);
    if (!root) return NULL;

    GltfModel* model = calloc(1, sizeof(GltfModel));
    if (!model) {
        cJSON_Delete(root);
        return NULL;
    }

    // Load binary buffer (first buffer, base64 embedded)
    cJSON* buffers = cJSON_GetObjectItem(root, "buffers");
    uint8_t* bin_data = NULL;
    size_t bin_size = 0;

    if (buffers && cJSON_GetArraySize(buffers) > 0) {
        cJSON* buf0 = cJSON_GetArrayItem(buffers, 0);
        cJSON* uri = cJSON_GetObjectItem(buf0, "uri");
        if (uri && uri->valuestring) {
            bin_size = b64_decode(uri->valuestring, &bin_data);
        }
    }

    if (!bin_data) {
        // No embedded buffer — can't load external .bin without filesystem context
        // For now, return empty model
        cJSON_Delete(root);
        return model;
    }

    cJSON* bufferViews = cJSON_GetObjectItem(root, "bufferViews");
    cJSON* accessors = cJSON_GetObjectItem(root, "accessors");
    cJSON* meshes = cJSON_GetObjectItem(root, "meshes");
    cJSON* materials = cJSON_GetObjectItem(root, "materials");

    // Parse materials
    if (materials) {
        int n = cJSON_GetArraySize(materials);
        model->materials = calloc(n, sizeof(GltfMaterial));
        model->material_count = n;
        for (int i = 0; i < n; i++) {
            cJSON* mat = cJSON_GetArrayItem(materials, i);
            GltfMaterial* m = &model->materials[i];
            cJSON* name = cJSON_GetObjectItem(mat, "name");
            if (name) strncpy(m->name, name->valuestring, 63);
            // Defaults
            m->baseColor[0] = m->baseColor[1] = m->baseColor[2] = 1.0f;
            m->baseColor[3] = 1.0f;
            m->metallic = 0.0f;
            m->roughness = 1.0f;
            // PBR
            cJSON* pbr = cJSON_GetObjectItem(mat, "pbrMetallicRoughness");
            if (pbr) {
                cJSON* bc = cJSON_GetObjectItem(pbr, "baseColorFactor");
                if (bc && cJSON_GetArraySize(bc) >= 3) {
                    for (int j = 0; j < 4 && j < cJSON_GetArraySize(bc); j++) {
                        m->baseColor[j] = (float)cJSON_GetArrayItem(bc, j)->valuedouble;
                    }
                }
                cJSON* met = cJSON_GetObjectItem(pbr, "metallicFactor");
                if (met) m->metallic = (float)met->valuedouble;
                cJSON* rough = cJSON_GetObjectItem(pbr, "roughnessFactor");
                if (rough) m->roughness = (float)rough->valuedouble;
            }
        }
    }

    // Parse meshes (first primitive of each mesh)
    if (meshes && accessors && bufferViews) {
        int n = cJSON_GetArraySize(meshes);
        model->meshes = calloc(n, sizeof(GltfMesh));
        model->mesh_count = n;

        for (int i = 0; i < n; i++) {
            cJSON* mesh = cJSON_GetArrayItem(meshes, i);
            cJSON* prims = cJSON_GetObjectItem(mesh, "primitives");
            if (!prims || cJSON_GetArraySize(prims) == 0) continue;

            cJSON* prim = cJSON_GetArrayItem(prims, 0);
            GltfMesh* m = &model->meshes[i];

            cJSON* attrs = cJSON_GetObjectItem(prim, "attributes");
            cJSON* indices = cJSON_GetObjectItem(prim, "indices");
            cJSON* mat_idx = cJSON_GetObjectItem(prim, "material");

            if (mat_idx) m->material_index = mat_idx->valueint;

            if (attrs) {
                cJSON* pos_acc = cJSON_GetObjectItem(attrs, "POSITION");
                cJSON* norm_acc = cJSON_GetObjectItem(attrs, "NORMAL");
                cJSON* uv_acc = cJSON_GetObjectItem(attrs, "TEXCOORD_0");

                if (pos_acc) {
                    cJSON* acc = cJSON_GetArrayItem(accessors, pos_acc->valueint);
                    cJSON* count = cJSON_GetObjectItem(acc, "count");
                    int vc = count->valueint;

                    m->vertices = calloc(vc, sizeof(GltfVertex));
                    m->vertex_count = vc;

                    // Load positions, normals, UVs
                    for (int v = 0; v < vc; v++) {
                        // Position
                        cJSON* bv_idx = cJSON_GetObjectItem(acc, "bufferView");
                        cJSON* bv = cJSON_GetArrayItem(bufferViews, bv_idx->valueint);
                        cJSON* byteOffset = cJSON_GetObjectItem(bv, "byteOffset");
                        int offset = (byteOffset ? byteOffset->valueint : 0);
                        cJSON* accOff = cJSON_GetObjectItem(acc, "byteOffset");
                        if (accOff) offset += accOff->valueint;
                        float* pos_data = (float*)(bin_data + offset);
                        m->vertices[v].pos[0] = pos_data[v*3];
                        m->vertices[v].pos[1] = pos_data[v*3+1];
                        m->vertices[v].pos[2] = pos_data[v*3+2];

                        // Normal (if present)
                        if (norm_acc) {
                            cJSON* nacc = cJSON_GetArrayItem(accessors, norm_acc->valueint);
                            cJSON* nbv_idx = cJSON_GetObjectItem(nacc, "bufferView");
                            cJSON* nbv = cJSON_GetArrayItem(bufferViews, nbv_idx->valueint);
                            cJSON* nbo = cJSON_GetObjectItem(nbv, "byteOffset");
                            int noff = (nbo ? nbo->valueint : 0);
                            cJSON* naoff = cJSON_GetObjectItem(nacc, "byteOffset");
                            if (naoff) noff += naoff->valueint;
                            float* ndata = (float*)(bin_data + noff);
                            m->vertices[v].normal[0] = ndata[v*3];
                            m->vertices[v].normal[1] = ndata[v*3+1];
                            m->vertices[v].normal[2] = ndata[v*3+2];
                        }

                        // UV (if present)
                        if (uv_acc) {
                            cJSON* uacc = cJSON_GetArrayItem(accessors, uv_acc->valueint);
                            cJSON* ubv_idx = cJSON_GetObjectItem(uacc, "bufferView");
                            cJSON* ubv = cJSON_GetArrayItem(bufferViews, ubv_idx->valueint);
                            cJSON* ubo = cJSON_GetObjectItem(ubv, "byteOffset");
                            int uoff = (ubo ? ubo->valueint : 0);
                            cJSON* uooff = cJSON_GetObjectItem(uacc, "byteOffset");
                            if (uooff) uoff += uooff->valueint;
                            float* udata = (float*)(bin_data + uoff);
                            m->vertices[v].uv[0] = udata[v*2];
                            m->vertices[v].uv[1] = udata[v*2+1];
                        }
                    }
                }
            }

            // Indices
            if (indices) {
                cJSON* acc = cJSON_GetArrayItem(accessors, indices->valueint);
                cJSON* count = cJSON_GetObjectItem(acc, "count");
                cJSON* compType = cJSON_GetObjectItem(acc, "componentType");
                int ic = count->valueint;

                m->indices = malloc(sizeof(uint32_t) * ic);
                m->index_count = ic;

                cJSON* bv_idx = cJSON_GetObjectItem(acc, "bufferView");
                cJSON* bv = cJSON_GetArrayItem(bufferViews, bv_idx->valueint);
                cJSON* byteOffset = cJSON_GetObjectItem(bv, "byteOffset");
                int offset = (byteOffset ? byteOffset->valueint : 0);
                cJSON* accOff = cJSON_GetObjectItem(acc, "byteOffset");
                if (accOff) offset += accOff->valueint;

                int ctype = compType->valueint;
                if (ctype == 5123) { // UNSIGNED_SHORT
                    uint16_t* data = (uint16_t*)(bin_data + offset);
                    for (int j = 0; j < ic; j++) m->indices[j] = data[j];
                } else if (ctype == 5125) { // UNSIGNED_INT
                    uint32_t* data = (uint32_t*)(bin_data + offset);
                    for (int j = 0; j < ic; j++) m->indices[j] = data[j];
                } else if (ctype == 5121) { // UNSIGNED_BYTE
                    uint8_t* data = (uint8_t*)(bin_data + offset);
                    for (int j = 0; j < ic; j++) m->indices[j] = data[j];
                }
            }
        }
    }

    free(bin_data);
    cJSON_Delete(root);
    return model;
}

GltfModel* gltf_parse_glb(const uint8_t* data, size_t size) {
    // GLB header: magic(4) + version(4) + length(4)
    if (size < 12) return NULL;
    uint32_t magic = *(uint32_t*)data;
    if (magic != 0x46546C67) return NULL; // "glTF"

    // JSON chunk: chunkLength(4) + chunkType(4) + data
    uint32_t json_len = *(uint32_t*)(data + 12);
    uint32_t json_type = *(uint32_t*)(data + 16);
    if (json_type != 0x4E4F534A) return NULL; // "JSON"

    char* json_text = malloc(json_len + 1);
    memcpy(json_text, data + 20, json_len);
    json_text[json_len] = '\0';

    GltfModel* model = gltf_parse(json_text);
    free(json_text);
    return model;
}

void gltf_model_free(GltfModel* model) {
    if (!model) return;
    for (int i = 0; i < model->mesh_count; i++) {
        free(model->meshes[i].vertices);
        free(model->meshes[i].indices);
    }
    free(model->meshes);
    free(model->materials);
    free(model);
}
