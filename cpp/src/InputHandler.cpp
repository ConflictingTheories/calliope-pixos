#include "InputHandler.h"
#include "MathUtils.h"
#include <iostream>
#include <imgui.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

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
    // Check if ImGui wants the click
    if (ImGui::GetIO().WantCaptureMouse)
        return;

    int winWidth, winHeight;
    glfwGetWindowSize(window, &winWidth, &winHeight);
    // Check if click is in the UI area (right side)
    if (mouseX > winWidth - 360) return; // UI area

    int fbWidth, fbHeight;
    glfwGetFramebufferSize(window, &fbWidth, &fbHeight);
    glm::mat4 view = camera.getViewMatrix();
    glm::mat4 proj = camera.getProjectionMatrix((float)fbWidth / fbHeight); // Full aspect ratio
    Ray ray = getRayFromScreen(mouseX, mouseY, view, proj, winWidth, winHeight);
    Vec3 hit = intersectRayPlane(ray);
    if (hit.y == 1) // No hit (y=1 indicates no intersection)
        return;
    int gx = static_cast<int>(std::floor(hit.x / grid.tileSize));
    int gz = static_cast<int>(std::floor(hit.z / grid.tileSize));
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
        }
    }
}

void InputHandler::handleMouseDrag(double mouseX, double mouseY)
{
    double dx = mouseX - lastMouseX;
    double dy = mouseY - lastMouseY;
    if (mouseButton == GLFW_MOUSE_BUTTON_LEFT)
    {
        // Rotate camera
        camera.yaw += dx * camera.mouseSensitivity;
        camera.pitch += dy * camera.mouseSensitivity;
        camera.pitch = glm::clamp(camera.pitch, -89.0f, 89.0f);
        camera.updateVectors();
    }
    else if (mouseButton == GLFW_MOUSE_BUTTON_RIGHT)
    {
        // Pan camera
        glm::vec3 right = glm::normalize(glm::cross(camera.front, camera.up));
        camera.position -= right * (float)dx * camera.movementSpeed * 0.01f;
        camera.position += camera.up * (float)dy * camera.movementSpeed * 0.01f;
    }
    else if (mouseButton == GLFW_MOUSE_BUTTON_MIDDLE)
    {
        // Pan with middle mouse
        glm::vec3 right = glm::normalize(glm::cross(camera.front, camera.up));
        camera.position -= right * (float)dx * camera.movementSpeed * 0.01f;
        camera.position += camera.up * (float)dy * camera.movementSpeed * 0.01f;
    }
}

void InputHandler::handleScroll(double scrollY)
{
    camera.position += camera.front * (float)scrollY * camera.movementSpeed;
}

Ray InputHandler::getRayFromScreen(double mouseX, double mouseY, const glm::mat4 &view, const glm::mat4 &proj, int winWidth, int winHeight) const
{
    float ndcX = (2.0f * mouseX) / winWidth - 1.0f;
    float ndcY = 1.0f - (2.0f * mouseY) / winHeight;
    glm::mat4 invVP = glm::inverse(proj * view);
    glm::vec4 near4 = invVP * glm::vec4(ndcX, ndcY, -1.0f, 1.0f);
    glm::vec4 far4 = invVP * glm::vec4(ndcX, ndcY, 1.0f, 1.0f);
    glm::vec3 near = glm::vec3(near4) / near4.w;
    glm::vec3 far = glm::vec3(far4) / far4.w;
    glm::vec3 dir = glm::normalize(far - near);
    return {vec3(near.x, near.y, near.z), vec3(dir.x, dir.y, dir.z)};
}

Vec3 InputHandler::intersectRayPlane(const Ray &ray) const
{
    float oy = ray.origin.y, dy = ray.dir.y;
    if (std::abs(dy) < 1e-6f)
        return vec3(0, 1, 0); // No hit
    float t = -oy / dy;
    if (t < 0)
        return vec3(0, 1, 0);
    Vec3 hit = add(ray.origin, mulS(ray.dir, t));
    // Debug: print hit position
    std::cout << "Hit: " << hit.x << ", " << hit.y << ", " << hit.z << std::endl;
    return hit;
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
