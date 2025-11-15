#include "RenderManager.h"
#include "GLEngine.h"
#include "Camera.h"
#include "Shader.h"
#include <glm/gtc/matrix_inverse.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <iostream>
#include <string>

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
    // Prefer the engine camera's perspective projection when available so
    // the native C++ renderer matches the WebGL renderer (3D perspective).
    if (engine && engine->getCamera()) {
        float aspect = screenSize.x / screenSize.y;
        projectionMatrix = engine->getCamera()->getProjectionMatrix(aspect);
    } else {
        // Fallback to an orthographic projection for 2D/HUD rendering
        projectionMatrix = glm::ortho(0.0f, screenSize.x, screenSize.y, 0.0f, -1.0f, 1.0f);
    }

    // Enable depth testing and alpha blending (match typical WebGL defaults)
    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_LESS);
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);

    glClearColor(0.0f, 1.0f, 0.0f, 1.0f);
}

void RenderManager::render() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glClearColor(0.2f, 0.3f, 0.3f, 1.0f);

    // Render world
    if (engine && engine->getWorld()) {
        engine->getWorld()->render();
    }

    // Render HUD
    if (engine && engine->getHud()) {
        engine->getHud()->render();
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
        // Strictly load shader sources from the repository `shaders/` folder.
        defaultShader = std::make_unique<Shader>("shaders/vertex.glsl", "shaders/fragment.glsl");
        std::cout << "Shaders loaded successfully from shaders/" << std::endl;
        applySceneDefaults(defaultShader.get());
    } catch (const std::exception& e) {
        std::cerr << "Failed to load shaders from shaders/: " << e.what() << std::endl;
        // Create fallback shader (GL-only color shader) so the engine can still run.
        createFallbackShader();
    }
}

void RenderManager::createFallbackShader() {
    const char* vertexSource = R"(
        #version 330 core
        layout(location = 0) in vec3 aVertexPosition;
        layout(location = 1) in vec3 aVertexNormal;
        layout(location = 2) in vec2 aTextureCoord;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        out vec2 vTextureCoord;
        void main() {
            vTextureCoord = aTextureCoord;
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
        }
    )";

    const char* fragmentSource = R"(
        #version 330 core
        in vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform vec3 uColor;
        out vec4 FragColor;
        void main() {
            vec4 tex = texture(uSampler, vTextureCoord);
            FragColor = tex * vec4(uColor, 1.0);
        }
    )";

    defaultShader = std::make_unique<Shader>();
    defaultShader->compileShaders(vertexSource, fragmentSource);
    std::cout << "Fallback shader created" << std::endl;
    applySceneDefaults(defaultShader.get());
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
        // positions         // normals         // texture coords
         0.0f, 1.0f, 0.0f,   0.0f, 0.0f, 1.0f,   0.0f, 1.0f,
         1.0f, 0.0f, 0.0f,   0.0f, 0.0f, 1.0f,   1.0f, 0.0f,
         0.0f, 0.0f, 0.0f,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f,

         0.0f, 1.0f, 0.0f,   0.0f, 0.0f, 1.0f,   0.0f, 1.0f,
         1.0f, 1.0f, 0.0f,   0.0f, 0.0f, 1.0f,   1.0f, 1.0f,
         1.0f, 0.0f, 0.0f,   0.0f, 0.0f, 1.0f,   1.0f, 0.0f
    };

    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);

    glBindVertexArray(VAO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    // Position attribute
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    // Normal attribute
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);

    // Texture coordinate attribute
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6 * sizeof(float)));
    glEnableVertexAttribArray(2);

    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);
}

void RenderManager::applySceneDefaults(Shader* shader) {
    if (!shader) return;

    Camera* cam = engine ? engine->getCamera() : nullptr;
    glm::vec3 camPos = cam ? cam->getPosition() : glm::vec3(0.0f, 0.0f, 10.0f);
    glm::vec3 camDir = cam ? glm::normalize(cam->getTarget() - camPos) : glm::normalize(glm::vec3(0.0f, 0.0f, -1.0f));

    shader->use();
    shader->setInt("uSampler", 0);
    shader->setInt("uDiffuseMap", 1);
    shader->setFloat("useSampler", 1.0f);
    shader->setFloat("useDiffuse", 0.0f);
    shader->setFloat("runTransition", 0.0f);
    shader->setFloat("isSelected", 0.0f);
    shader->setVec4("uColorMultiplier", glm::vec4(1.0f));
    shader->setVec3("uDiffuse", glm::vec3(0.9f));
    shader->setVec3("uSpecular", glm::vec3(0.2f));
    shader->setFloat("uSpecularExponent", 16.0f);
    shader->setVec3("uLightColor", glm::vec3(1.0f));
    shader->setVec3("uLightDirection", camDir);
    shader->setVec3("u_scale", glm::vec3(1.0f));

    shader->setVec3("uCameraPosition", camPos);
    shader->setVec3("uLights[0].color", glm::vec3(1.0f));
    shader->setVec3("uLights[0].position", camPos);
    shader->setVec3("uLights[0].direction", camDir);
    shader->setVec3("uLights[0].attenuation", glm::vec3(1.0f, 0.045f, 0.0075f));
    shader->setVec3("uLights[0].scatteringCoefficients", glm::vec3(0.05f));
    shader->setFloat("uLights[0].density", 0.02f);
    shader->setFloat("uLights[0].enabled", 1.0f);

    for (int i = 1; i < 32; ++i) {
        shader->setFloat("uLights[" + std::to_string(i) + "].enabled", 0.0f);
    }

    shader->unuse();
}

GLuint RenderManager::createBuffer(const std::vector<float>& data, GLenum usage, int components) {
    GLuint buffer;
    glGenBuffers(1, &buffer);
    glBindBuffer(GL_ARRAY_BUFFER, buffer);
    glBufferData(GL_ARRAY_BUFFER, data.size() * sizeof(float), data.data(), usage);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    return buffer;
}
