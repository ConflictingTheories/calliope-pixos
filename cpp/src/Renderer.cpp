#include "Renderer.h"
#include "Skybox.h"
#include <vector>
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

CubeGeometry::CubeGeometry()
{
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
        0.5f, 0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f, -0.5f, -0.5f, 0.5f, 0.5f, -0.5f, -0.5f, -0.5f, -0.5f, 0.5f, -0.5f, -0.5f};

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
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1};

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

CubeGeometry::~CubeGeometry()
{
    glDeleteBuffers(1, &vbo);
    glDeleteBuffers(1, &nbo);
    glDeleteVertexArrays(1, &vao);
}

Renderer::Renderer() : shader(nullptr), cube(nullptr), skybox(nullptr) {}

Renderer::~Renderer()
{
    delete shader;
    delete cube;
    delete skybox;
}

void Renderer::init(GLFWwindow *window)
{
    shader = new Shader();
    shader->init("shaders/vertex.glsl", "shaders/fragment.glsl");
    cube = new CubeGeometry();

    skybox = new Skybox();
    skybox->init();
    skybox->loadCubemap({
        "textures/skybox/right.jpg",
        "textures/skybox/left.jpg",
        "textures/skybox/top.jpg",
        "textures/skybox/bottom.jpg",
        "textures/skybox/front.jpg",
        "textures/skybox/back.jpg"
    });
}

void Renderer::render(const Camera &camera, const std::vector<Unit> &units, const Grid &grid, const Unit *selectedUnit, int width, int height)
{
    glViewport(0, 0, width, height); // Full viewport, UI overlaid

    glEnable(GL_DEPTH_TEST);
    glClearColor(0.047f, 0.047f, 0.063f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    // Render the skybox
    skybox->render(camera.getViewMatrix(), camera.getProjectionMatrix((float)width / height));

    shader->use();
    shader->setMat4("uView", camera.getViewMatrix());
    shader->setMat4("uProj", camera.getProjectionMatrix((float)width / height)); // Full aspect ratio
    shader->setVec3("uLightDir", glm::vec3(-0.6f, 0.8f, 0.6f));

    glBindVertexArray(cube->vao);

    // Draw grid tiles
    for (int x = 0; x < grid.cols; ++x)
    {
        for (int z = 0; z < grid.rows; ++z)
        {
            glm::mat4 model = glm::translate(glm::mat4(1.0f), glm::vec3(x * grid.tileSize, -0.1f, z * grid.tileSize)) *
                             glm::scale(glm::mat4(1.0f), glm::vec3(grid.tileSize * 0.98f, 0.18f, grid.tileSize * 0.98f));
            shader->setMat4("uModel", model);
            glm::vec3 color = ((x + z) % 2 == 0) ? glm::vec3(0.16f, 0.2f, 0.23f) : glm::vec3(0.12f, 0.19f, 0.2f);
            shader->setVec3("uColor", color);
            glDrawArrays(GL_TRIANGLES, 0, cube->vertexCount);
        }
    }

    // Draw units
    for (const auto &unit : units)
    {
        glm::vec3 pos = glm::vec3(unit.col * grid.tileSize, 0.0f, unit.row * grid.tileSize);
        glm::mat4 model = glm::translate(glm::mat4(1.0f), pos) * glm::scale(glm::mat4(1.0f), glm::vec3(0.6f, 1.2f, 0.6f));
        model = glm::translate(model, glm::vec3(0.0f, 0.5f, 0.0f));
        shader->setMat4("uModel", model);
        glm::vec3 color = glm::vec3(unit.color.x, unit.color.y, unit.color.z);
        if (&unit == selectedUnit)
        {
            color = glm::vec3(std::min(1.0f, color.x * 1.15f), std::min(1.0f, color.y * 1.15f), std::min(1.0f, color.z * 1.15f));
        }
        shader->setVec3("uColor", color);
        glDrawArrays(GL_TRIANGLES, 0, cube->vertexCount);
    }

    // Draw unit labels (simple text overlays using ImGui)
    // Note: This is a simplified version; full text rendering would require a font system
    // For now, we'll use ImGui to draw labels in screen space
    // This will be called after the 3D render, but before UI
    // Actually, we'll handle this in renderUI for simplicity

    glBindVertexArray(0);
}

void Renderer::renderUI(const Unit *selectedUnit, const std::vector<std::string> &abilities, std::function<void(int)> castCallback, int width, int height)
{

    // Draw unit labels in screen space
    // This is a simplified implementation; proper 3D text would require billboarding
    // For now, we'll project unit positions to screen and draw labels
    // Note: This assumes the camera and projection are set up correctly
    // In a full implementation, we'd pass the camera and units here
    // But for simplicity, we'll skip detailed label rendering for now

    // Main UI panel on the right side
    ImGui::PushStyleColor(ImGuiCol_WindowBg, ImVec4(0.0f, 0.0f, 0.0f, 0.0f)); // Transparent background
    ImGui::SetNextWindowPos(ImVec2(width - 360, 10)); // Position for right side
    ImGui::SetNextWindowSize(ImVec2(350, height - 20));
    ImGui::Begin("Disgaea Prototype - C++ OpenGL", nullptr, ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoCollapse);

    // Header panel
    ImGui::PushStyleColor(ImGuiCol_ChildBg, ImVec4(1.0f, 1.0f, 1.0f, 0.02f));
    ImGui::BeginChild("header", ImVec2(0, 50), true);
    ImGui::Text("Disgaea Prototype - C++ OpenGL");
    ImGui::TextColored(ImVec4(0.6f, 0.6f, 0.6f, 1.0f), "WebGL2, no libs. Tiles, units, labels, HP/MP, damage pop, abilities, selection.");
    ImGui::EndChild();
    ImGui::PopStyleColor();

    ImGui::Separator();

    if (selectedUnit)
    {
        // Unit info panel
        ImGui::PushStyleColor(ImGuiCol_ChildBg, ImVec4(1.0f, 1.0f, 1.0f, 0.02f));
        ImGui::BeginChild("unit_info", ImVec2(0, 100), true);
        ImGui::Text("Selected Unit: %s", selectedUnit->name.c_str());
        ImGui::Text("HP: %d/%d", selectedUnit->hp, selectedUnit->maxHp);
        ImGui::Text("MP: %d/%d", selectedUnit->mp, selectedUnit->maxMp);

        // HP bar
        float hpRatio = (float)selectedUnit->hp / selectedUnit->maxHp;
        ImGui::ProgressBar(hpRatio, ImVec2(-1, 20), "");
        ImGui::SameLine();
        ImGui::Text("HP");

        // MP bar
        float mpRatio = (float)selectedUnit->mp / selectedUnit->maxMp;
        ImGui::ProgressBar(mpRatio, ImVec2(-1, 20), "");
        ImGui::SameLine();
        ImGui::Text("MP");
        ImGui::EndChild();
        ImGui::PopStyleColor();

        ImGui::Separator();
        ImGui::Text("Abilities:");

        // Abilities panel
        ImGui::PushStyleColor(ImGuiCol_ChildBg, ImVec4(1.0f, 1.0f, 1.0f, 0.02f));
        ImGui::BeginChild("abilities", ImVec2(0, 0), true);
        for (size_t i = 0; i < abilities.size(); ++i)
        {
            if (ImGui::Button(abilities[i].c_str(), ImVec2(-1, 30)))
            {
                castCallback(i);
            }
        }
        ImGui::EndChild();
        ImGui::PopStyleColor();
    }
    else
    {
        ImGui::Text("No unit selected");
    }

    ImGui::End();
    ImGui::PopStyleColor(); // Pop the window background color

    ImGui::Render();
    ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
}
