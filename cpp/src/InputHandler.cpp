#include "InputHandler.h"
#include "MathUtils.h"
#include <iostream>

InputHandler::InputHandler(GLFWwindow *window, Camera &camera, const Grid &grid, std::vector<Unit> &units, Unit *&selectedUnit)
    : window(window), camera(camera), grid(grid), units(units), selectedUnit(selectedUnit)
{
    glfwSetWindowUserPointer(window, this);
    glfwSetMouseButtonCallback(window, [](GLFWwindow *w, int button, int action, int mods)
                               {
        auto* handler = static_cast<InputHandler*>(glfwGetWindowUserPointer(w));
        if (action == GLFW_PRESS) {
            handler->isMouseDown = true;
            handler->mouseButton = button;
            glfwGetCursorPos(w, &handler->lastMouseX, &handler->lastMouseY);
        } else if (action == GLFW_RELEASE) {
            handler->isMouseDown = false;
        } });
    glfwSetCursorPosCallback(window, [](GLFWwindow *w, double x, double y)
                             {
        auto* handler = static_cast<InputHandler*>(glfwGetWindowUserPointer(w));
        if (handler->isMouseDown) {
            handler->handleMouseDrag(x, y);
        }
        handler->lastMouseX = x;
        handler->lastMouseY = y; });
    glfwSetScrollCallback(window, [](GLFWwindow *w, double x, double y)
                          {
        auto* handler = static_cast<InputHandler*>(glfwGetWindowUserPointer(w));
        handler->handleScroll(y); });
}

void InputHandler::update(float deltaTime)
{
    // Handle clicks
    bool leftPressed = glfwGetMouseButton(window, GLFW_MOUSE_BUTTON_LEFT) == GLFW_PRESS;
    if (leftPressed && !wasLeftPressed)
    {
        double x, y;
        glfwGetCursorPos(window, &x, &y);
        handleMouseClick(x, y);
        isMouseDown = true;
        mouseButton = GLFW_MOUSE_BUTTON_LEFT;
    }
    if (!leftPressed)
    {
        isMouseDown = false;
    }
    wasLeftPressed = leftPressed;
}

void InputHandler::handleMouseClick(double mouseX, double mouseY)
{
    int winWidth, winHeight;
    glfwGetWindowSize(window, &winWidth, &winHeight);
    // Check if click is in the UI area
    if (mouseX > winWidth - 360) return; // UI area

    int fbWidth, fbHeight;
    glfwGetFramebufferSize(window, &fbWidth, &fbHeight);
    Mat4 view = camera.getViewMatrix();
    Mat4 proj = camera.getProjectionMatrix((float)fbWidth / fbHeight); // Full aspect ratio
    Ray ray = getRayFromScreen(mouseX, mouseY, view, proj, winWidth, winHeight);
    Vec3 hit = intersectRayPlane(ray);
    if (hit.y == 1) // No hit (y=1 indicates no intersection)
        return;
    int gx = static_cast<int>(std::floor(hit.x / grid.tileSize + 0.5f));
    int gz = static_cast<int>(std::floor(hit.z / grid.tileSize + 0.5f));
    if (!grid.isValidTile(gx, gz))
        return;
    Unit *unit = getUnitAtTile(gx, gz);
    if (unit)
    {
        selectedUnit = unit;
    }
    else if (selectedUnit)
    {
        // Move
        int dx = std::abs(selectedUnit->col - gx);
        int dz = std::abs(selectedUnit->row - gz);
        if (dx + dz <= 6)
        {
            selectedUnit->col = gx;
            selectedUnit->row = gz;
            selectedUnit->displayPos = vec3(gx * grid.tileSize, 0.0f, gz * grid.tileSize);
        }
    }
}

void InputHandler::handleMouseDrag(double mouseX, double mouseY)
{
    double dx = mouseX - lastMouseX;
    double dy = mouseY - lastMouseY;
    if (mouseButton == GLFW_MOUSE_BUTTON_LEFT)
    {
        camera.update(-dx * 0.005f, -dy * 0.005f, 0.0f);
    }
    else if (mouseButton == GLFW_MOUSE_BUTTON_RIGHT)
    {
        // Pan (simplified)
        camera.target.x -= dx * 0.005f * camera.distance;
        camera.target.z -= dy * 0.005f * camera.distance;
    }
    else if (mouseButton == GLFW_MOUSE_BUTTON_MIDDLE)
    {
        // Pan with middle mouse
        camera.target.x -= dx * 0.005f * camera.distance;
        camera.target.z -= dy * 0.005f * camera.distance;
    }
}

void InputHandler::handleScroll(double scrollY)
{
    camera.update(0.0f, 0.0f, -scrollY * camera.distance * 0.001f);
}

Ray InputHandler::getRayFromScreen(double mouseX, double mouseY, const Mat4 &view, const Mat4 &proj, int winWidth, int winHeight) const
{
    float ndcX = (2.0f * mouseX) / winWidth - 1.0f;
    float ndcY = 1.0f - (2.0f * mouseY) / winHeight;
    Mat4 invVP = mat4Inverse(proj * view);
    Vec3 near = transformPoint(invVP, vec3(ndcX, ndcY, -1.0f));
    Vec3 far = transformPoint(invVP, vec3(ndcX, ndcY, 1.0f));
    Vec3 dir = normalize(sub(far, near));
    return {near, dir};
}

Vec3 InputHandler::intersectRayPlane(const Ray &ray) const
{
    float oy = ray.origin.y, dy = ray.dir.y;
    if (std::abs(dy) < 1e-6f)
        return vec3(0, 1, 0); // No hit
    float t = -oy / dy;
    if (t < 0)
        return vec3(0, 1, 0);
    return add(ray.origin, mulS(ray.dir, t));
}

Unit *InputHandler::getUnitAtTile(int col, int row) const
{
    for (auto &unit : units)
    {
        if (unit.col == col && unit.row == row)
            return &unit;
    }
    return nullptr;
}
