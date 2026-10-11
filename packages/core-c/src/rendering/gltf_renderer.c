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

#include "gltf_renderer.h"
#include <stdlib.h>
#include <string.h>

bool gltf_renderer_init(GltfRenderer* renderer, const GltfModel* model) {
    memset(renderer, 0, sizeof(GltfRenderer));

    renderer->mesh_count = model->mesh_count;
    renderer->meshes = calloc(model->mesh_count, sizeof(GltfGpuMesh));
    if (!renderer->meshes) return false;

    renderer->material_count = model->material_count;
    renderer->materials = model->materials; // Borrow, don't copy

    for (int i = 0; i < model->mesh_count; i++) {
        const GltfMesh* src = &model->meshes[i];
        GltfGpuMesh* dst = &renderer->meshes[i];

        dst->material_index = src->material_index;
        dst->index_count = src->index_count;

        // Create VAO
        glGenVertexArrays(1, &dst->vao);
        glBindVertexArray(dst->vao);

        // Interleaved VBO: pos(3) + normal(3) + uv(2) = 8 floats
        int stride = 8 * sizeof(float);
        float* interleaved = malloc(src->vertex_count * 8 * sizeof(float));
        for (int v = 0; v < src->vertex_count; v++) {
            interleaved[v*8+0] = src->vertices[v].pos[0];
            interleaved[v*8+1] = src->vertices[v].pos[1];
            interleaved[v*8+2] = src->vertices[v].pos[2];
            interleaved[v*8+3] = src->vertices[v].normal[0];
            interleaved[v*8+4] = src->vertices[v].normal[1];
            interleaved[v*8+5] = src->vertices[v].normal[2];
            interleaved[v*8+6] = src->vertices[v].uv[0];
            interleaved[v*8+7] = src->vertices[v].uv[1];
        }

        glGenBuffers(1, &dst->vbo);
        glBindBuffer(GL_ARRAY_BUFFER, dst->vbo);
        glBufferData(GL_ARRAY_BUFFER,
                     src->vertex_count * 8 * sizeof(float),
                     interleaved, GL_STATIC_DRAW);
        free(interleaved);

        // Position attribute (location 0)
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, stride, (void*)0);
        glEnableVertexAttribArray(0);
        // Normal attribute (location 1)
        glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, stride, (void*)(3 * sizeof(float)));
        glEnableVertexAttribArray(1);
        // UV attribute (location 2)
        glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, stride, (void*)(6 * sizeof(float)));
        glEnableVertexAttribArray(2);

        // Index buffer
        if (src->indices && src->index_count > 0) {
            glGenBuffers(1, &dst->ebo);
            glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, dst->ebo);
            glBufferData(GL_ELEMENT_ARRAY_BUFFER,
                         src->index_count * sizeof(uint32_t),
                         src->indices, GL_STATIC_DRAW);
        }

        glBindVertexArray(0);
        dst->initialized = true;
    }

    return true;
}

void gltf_renderer_draw(GltfRenderer* renderer) {
    for (int i = 0; i < renderer->mesh_count; i++) {
        GltfGpuMesh* mesh = &renderer->meshes[i];
        if (!mesh->initialized) continue;

        // Set material uniforms (assumes shader has these uniforms)
        // The calling code should set: uBaseColor, uMetallic, uRoughness
        // For now, we just bind and draw

        glBindVertexArray(mesh->vao);
        if (mesh->ebo) {
            glDrawElements(GL_TRIANGLES, mesh->index_count, GL_UNSIGNED_INT, 0);
        } else {
            // Non-indexed: draw arrays
            // Vertex count = index_count (if no indices, use... hmm)
            // For now, skip non-indexed
        }
        glBindVertexArray(0);
    }
}

void gltf_renderer_free(GltfRenderer* renderer) {
    for (int i = 0; i < renderer->mesh_count; i++) {
        GltfGpuMesh* mesh = &renderer->meshes[i];
        if (mesh->vao) glDeleteVertexArrays(1, &mesh->vao);
        if (mesh->vbo) glDeleteBuffers(1, &mesh->vbo);
        if (mesh->ebo) glDeleteBuffers(1, &mesh->ebo);
    }
    free(renderer->meshes);
    memset(renderer, 0, sizeof(GltfRenderer));
}
