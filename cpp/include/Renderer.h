#pragma once
#include "Shader.h"
#include "Camera.h"
#include "Unit.h"
#include "Grid.h"
#include <vector>

struct CubeGeometry {
    GLuint vao, vbo, nbo;
    int vertexCount;
    CubeGeometry();
    ~CubeGeometry();
};

class Renderer {
public:
    Renderer();
    ~Renderer();

    void init();
    void render(const Camera& camera, const std::vector<Unit>& units, const Grid& grid, const Unit* selectedUnit);

private:
    Shader* shader;
    CubeGeometry* cube;

    void drawCube(const Mat4& model, const Vec3& color);
};
