#include "Renderer.h"
#include <vector>

CubeGeometry::CubeGeometry() {
    // Cube vertices and normals (same as JS version)
    std::vector<float> positions = {
        // +X
        0.5f, 0.5f, 0.5f, 0.5f, -0.5f, 0.5f, 0.5f, -0.5f, -0.5f, 0.5f, 0.5f, 0.5f, 0.5f, -0.5f, -0.5f, 0.5f, 0.5f, -0.5f,
        // -X
        -0.5f, 0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, 0.5f, -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, 0.5f, 0.5f,
        // +Y
        -0.5f, 0.5f, 0.5f, -0.5f, 0.5f, -0.5f, 0.5f, 0.5f, -0.5f, -0.5f, 0.5f, 0.5f, 0.5f, 0.5f, -0.5f, 0.5f, 0.5f, 0.5f,
        // -Y
        -0.5f, -0.5f, -0.5f, -0.5f, -0.5f, 0.5f, 0.5f, -0.5f, 0.5f, -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, 0.5f, 0.5f, -0.5f, -0.5f,
        // +Z
        -0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f, 0.5f, -0.5f, 0.5f, -0.5f, 0.5f, 0.5f, 0.5f, -0.5f, 0.5f, -0.5f, -0.5f, 0.5f,
        // -Z
        0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, -0.5f, -0.5f, 0.5f, 0.5f, -0.5f, -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f
    };

    std::vector<float> normals = {
        // +X normals
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        // -X
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        // +Y
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        // -Y
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        // +Z
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        // -Z
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
    };

    vertexCount = positions.size() / 3;

    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);

    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, positions.size() * sizeof(float), positions.data(), GL_STATIC_DRAW);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, nullptr);

    glGenBuffers(1, &nbo);
    glBindBuffer(GL_ARRAY_BUFFER, nbo);
    glBufferData(GL_ARRAY_BUFFER, normals.size() * sizeof(float), normals.data(), GL_STATIC_DRAW);
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 0, nullptr);

    glBindVertexArray(0);
}

CubeGeometry::~CubeGeometry() {
    glDeleteBuffers(1, &vbo);
    glDeleteBuffers(1, &nbo);
    glDeleteVertexArrays(1, &vao);
}

Renderer::Renderer() : shader(nullptr), cube(nullptr) {}

Renderer::~Renderer() {
    delete shader;
    delete cube;
}

void Renderer::init() {
    shader = new Shader("shaders/vertex.glsl", "shaders/fragment.glsl");
    cube = new CubeGeometry();
}

void Renderer::render(const Camera& camera, const std::vector<Unit>& units, const Grid& grid, const Unit* selectedUnit) {
    glEnable(GL_DEPTH_TEST);
    glClearColor(0.047f, 0.047f, 0.063f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    shader->use();
    shader->setUniform("uView", camera.getViewMatrix());
    shader->setUniform("uProj", camera.getProjectionMatrix(16.0f / 9.0f)); // Assume aspect ratio
    shader->setUniform("uLightDir", vec3(-0.6f, 0.8f, 0.6f));

    glBindVertexArray(cube->vao);

    // Draw grid tiles
    for (int x = 0; x < grid.cols; ++x) {
        for (int z = 0; z < grid.rows; ++z) {
            Mat4 model = mat4Translate(x * grid.tileSize, -0.1f, z * grid.tileSize) *
                         mat4Scale(grid.tileSize * 0.98f, 0.18f, grid.tileSize * 0.98f);
            shader->setUniform("uModel", model);
            Vec3 color = ((x + z) % 2 == 0) ? vec3(0.16f, 0.2f, 0.23f) : vec3(0.12f, 0.19f, 0.2f);
            shader->setUniform("uColor", color);
            glDrawArrays(GL_TRIANGLES, 0, cube->vertexCount);
        }
    }

    // Draw units
    for (const auto& unit : units) {
        Vec3 pos = unit.displayPos;
        Mat4 model = mat4Translate(pos.x, 0.5f, pos.z) * mat4Scale(0.6f, 1.2f, 0.6f);
        shader->setUniform("uModel", model);
        Vec3 color = unit.color;
        if (&unit == selectedUnit) {
            color = vec3(std::min(1.0f, color.x * 1.15f), std::min(1.0f, color.y * 1.15f), std::min(1.0f, color.z * 1.15f));
        }
        shader->setUniform("uColor", color);
        glDrawArrays(GL_TRIANGLES, 0, cube->vertexCount);
    }

    glBindVertexArray(0);
}
