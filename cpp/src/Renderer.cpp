#include "Renderer.h"
#include <vector>
#include <GL/glew.h>
#include <GLFW/glfw3.h>

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

Renderer::Renderer() : shader(nullptr), cube(nullptr) {}

Renderer::~Renderer()
{
    delete shader;
    delete cube;
}

void Renderer::init(GLFWwindow *window)
{
    shader = new Shader("shaders/vertex.glsl", "shaders/fragment.glsl");
    cube = new CubeGeometry();

    // Initialize ImGui
    IMGUI_CHECKVERSION();
    ImGui::CreateContext();
    ImGuiIO &io = ImGui::GetIO();
    (void)io;
    ImGui::StyleColorsDark();
    ImGui_ImplGlfw_InitForOpenGL(window, true);
    ImGui_ImplOpenGL3_Init("#version 330");
}

void Renderer::render(const Camera &camera, const std::vector<Unit> &units, const Grid &grid, const Unit *selectedUnit)
{
    int width, height;
    glfwGetCurrentContext(); // Ensure context is current
    glViewport(0, 0, 920, 720); // Set viewport to left side, leaving space for UI

    glEnable(GL_DEPTH_TEST);
    glClearColor(0.047f, 0.047f, 0.063f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    shader->use();
    shader->setUniform("uView", camera.getViewMatrix());
    shader->setUniform("uProj", camera.getProjectionMatrix(920.0f / 720.0f)); // Aspect ratio for left side
    shader->setUniform("uLightDir", vec3(-0.6f, 0.8f, 0.6f));

    glBindVertexArray(cube->vao);

    // Draw grid tiles
    for (int x = 0; x < grid.cols; ++x)
    {
        for (int z = 0; z < grid.rows; ++z)
        {
            Mat4 model = mat4Translate(x * grid.tileSize, -0.1f, z * grid.tileSize) *
                         mat4Scale(grid.tileSize * 0.98f, 0.18f, grid.tileSize * 0.98f);
            shader->setUniform("uModel", model);
            Vec3 color = ((x + z) % 2 == 0) ? vec3(0.16f, 0.2f, 0.23f) : vec3(0.12f, 0.19f, 0.2f);
            shader->setUniform("uColor", color);
            glDrawArrays(GL_TRIANGLES, 0, cube->vertexCount);
        }
    }

    // Draw units
    for (const auto &unit : units)
    {
        Vec3 pos = unit.displayPos;
        Mat4 model = mat4Translate(pos.x, 0.5f, pos.z) * mat4Scale(0.6f, 1.2f, 0.6f);
        shader->setUniform("uModel", model);
        Vec3 color = unit.color;
        if (&unit == selectedUnit)
        {
            color = vec3(std::min(1.0f, color.x * 1.15f), std::min(1.0f, color.y * 1.15f), std::min(1.0f, color.z * 1.15f));
        }
        shader->setUniform("uColor", color);
        glDrawArrays(GL_TRIANGLES, 0, cube->vertexCount);
    }

    glBindVertexArray(0);
}

void Renderer::renderUI(const Unit *selectedUnit, const std::vector<std::string> &abilities, std::function<void(int)> castCallback)
{
    ImGui_ImplOpenGL3_NewFrame();
    ImGui_ImplGlfw_NewFrame();
    ImGui::NewFrame();

    // Main UI panel on the right side
    ImGui::SetNextWindowPos(ImVec2(920, 10)); // Position for right side in 1280x720
    ImGui::SetNextWindowSize(ImVec2(350, 700));
    ImGui::Begin("Disgaea Prototype - C++ OpenGL", nullptr, ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoCollapse);

    ImGui::Text("Disgaea Prototype - C++ OpenGL");
    ImGui::Text("WebGL2, no libs. Tiles, units, labels, HP/MP, damage pop, abilities, selection.");
    ImGui::Separator();

    if (selectedUnit)
    {
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

        ImGui::Separator();
        ImGui::Text("Abilities:");

        for (size_t i = 0; i < abilities.size(); ++i)
        {
            if (ImGui::Button(abilities[i].c_str()))
            {
                castCallback(i);
            }
        }
    }
    else
    {
        ImGui::Text("No unit selected");
    }

    ImGui::End();

    ImGui::Render();
    ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
}
