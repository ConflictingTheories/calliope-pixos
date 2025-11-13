#pragma once
#include "Shader.h"
#include "Camera.h"
#include "Unit.h"
#include "Grid.h"
#include <vector>
#include <functional>
#include "imgui.h"
#include "imgui_impl_glfw.h"
#include "imgui_impl_opengl3.h"

struct CubeGeometry
{
    unsigned int vao, vbo, nbo;
    int vertexCount;
    CubeGeometry();
    ~CubeGeometry();
};

class Renderer
{
public:
    Renderer();
    ~Renderer();

    void init(GLFWwindow *window);
    void render(const Camera &camera, const std::vector<Unit> &units, const Grid &grid, const Unit *selectedUnit, int width, int height);
    void renderUI(const Unit* selectedUnit, const std::vector<std::string>& abilities, std::function<void(int)> castCallback, int width, int height);

private:
    Shader *shader;
    CubeGeometry *cube;

    void drawCube(const Mat4 &model, const Vec3 &color);
};
