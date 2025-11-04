#pragma once
#include "Camera.h"
#include "Grid.h"
#include "Unit.h"
#include <GLFW/glfw3.h>
#include <vector>

struct Ray
{
    Vec3 origin, dir;
};

class InputHandler
{
public:
    InputHandler(GLFWwindow *window, Camera &camera, const Grid &grid, std::vector<Unit> &units, Unit *&selectedUnit);
    void update(float deltaTime);

private:
    GLFWwindow *window;
    Camera &camera;
    const Grid &grid;
    std::vector<Unit> &units;
    Unit *&selectedUnit;

    bool isMouseDown = false;
    bool wasLeftPressed = false;
    double lastMouseX = 0.0, lastMouseY = 0.0;
    int mouseButton = 0;

    Ray getRayFromScreen(double mouseX, double mouseY, const Mat4 &view, const Mat4 &proj, int winWidth, int winHeight) const;
    Vec3 intersectRayPlane(const Ray &ray) const;
    Unit *getUnitAtTile(int col, int row) const;
    void handleMouseClick(double mouseX, double mouseY);
    void handleMouseDrag(double mouseX, double mouseY);
    void handleScroll(double scrollY);
};
