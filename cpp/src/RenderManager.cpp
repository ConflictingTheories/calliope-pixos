#include "RenderManager.h"
#include "GLEngine.h"
#include "Shader.h"
#include <glm/gtc/matrix_transform.hpp>
#include <iostream>

RenderManager::RenderManager(GLEngine* engine)
    : engine(engine), VAO(0), VBO(0) {
}

RenderManager::~RenderManager() {
    if (VAO) glDeleteVertexArrays(1, &VAO);
    if (VBO) glDeleteBuffers(1, &VBO);
}

void RenderManager::init() {
    initShaders();
    initBuffers();

    // Set up projection matrix
    glm::vec2 screenSize = engine->screenSize();
    projectionMatrix = glm::ortho(0.0f, screenSize.x, screenSize.y, 0.0f, -1.0f, 1.0f);
}

void RenderManager::render() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glClearColor(0.2f, 0.3f, 0.3f, 1.0f);

    // Render world
    if (engine && engine->getWorld()) {
        engine->getWorld()->render();
    }

    // Ensure rendering is complete
    glFlush();

    // Debug output
    std::cout << "RenderManager::render() called" << std::endl;
}

void RenderManager::setProjectionMatrix(const glm::mat4& proj) {
    projectionMatrix = proj;
}

void RenderManager::initShaders() {
    try {
        defaultShader = std::make_unique<Shader>("../shaders/vertex.glsl", "../shaders/fragment.glsl");
        std::cout << "Shaders loaded successfully" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Failed to load shaders: " << e.what() << std::endl;
        // Create fallback shader
        createFallbackShader();
    }
}

void RenderManager::createFallbackShader() {
    const char* vertexSource = R"(
        #version 330 core
        layout(location = 0) in vec3 aPosition;
        uniform mat4 uProj;
        uniform mat4 uModel;
        void main() {
            gl_Position = uProj * uModel * vec4(aPosition, 1.0);
        }
    )";

    const char* fragmentSource = R"(
        #version 330 core
        out vec4 FragColor;
        uniform vec3 uColor;
        void main() {
            FragColor = vec4(uColor, 1.0);
        }
    )";

    defaultShader = std::make_unique<Shader>();
    defaultShader->compileShaders(vertexSource, fragmentSource);
    std::cout << "Fallback shader created" << std::endl;
}

void Shader::compileShaders(const char* vertexSource, const char* fragmentSource) {
    unsigned int vertexShader = compileShader(std::string(vertexSource), GL_VERTEX_SHADER);
    unsigned int fragmentShader = compileShader(std::string(fragmentSource), GL_FRAGMENT_SHADER);

    id = glCreateProgram();
    glAttachShader(id, vertexShader);
    glAttachShader(id, fragmentShader);
    glLinkProgram(id);

    GLint success;
    glGetProgramiv(id, GL_LINK_STATUS, &success);
    if (!success)
    {
        char infoLog[512];
        glGetProgramInfoLog(id, 512, nullptr, infoLog);
        std::cerr << "Shader program linking failed: " << infoLog << std::endl;
        throw std::runtime_error("Shader linking failed");
    }

    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);
}

void RenderManager::initBuffers() {
    // Create a simple quad for rendering with texture coordinates
    float vertices[] = {
        // positions          // texture coords
        0.0f, 1.0f, 0.0f,    0.0f, 1.0f,  // bottom-left
        1.0f, 0.0f, 0.0f,    1.0f, 0.0f,  // top-right
        0.0f, 0.0f, 0.0f,    0.0f, 0.0f,  // top-left

        0.0f, 1.0f, 0.0f,    0.0f, 1.0f,  // bottom-left
        1.0f, 1.0f, 0.0f,    1.0f, 1.0f,  // bottom-right
        1.0f, 0.0f, 0.0f,    1.0f, 0.0f   // top-right
    };

    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);

    glBindVertexArray(VAO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    // Position attribute
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    // Texture coordinate attribute
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);

    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
}
