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

#ifndef GLTF_RENDERER_H
#define GLTF_RENDERER_H

#include "gltf_loader.h"
#include <stdbool.h>

#ifdef __APPLE__
#include <OpenGL/gl3.h>
#else
#include <GL/glew.h>
#endif

/**
 * GLTF GPU buffers for a single mesh.
 */
typedef struct GltfGpuMesh {
    GLuint vao;
    GLuint vbo;  // Interleaved: pos(3) + normal(3) + uv(2)
    GLuint ebo;
    int index_count;
    int material_index;
    bool initialized;
} GltfGpuMesh;

/**
 * GLTF renderer: manages GPU buffers for a model.
 */
typedef struct GltfRenderer {
    GltfGpuMesh* meshes;
    int mesh_count;
    GltfMaterial* materials;
    int material_count;
} GltfRenderer;

// Initialize from parsed model (creates GPU buffers)
bool gltf_renderer_init(GltfRenderer* renderer, const GltfModel* model);

// Draw all meshes (assumes shader is bound)
void gltf_renderer_draw(GltfRenderer* renderer);

// Free GPU resources
void gltf_renderer_free(GltfRenderer* renderer);

#endif // GLTF_RENDERER_H
