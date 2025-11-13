#include <iostream>
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <nlohmann/json.hpp>
#include <fstream>
#include "GLEngine.h"

int main(int argc, char* argv[]) {
    // Check for game package argument
    std::string gamePath = "example/spritz"; // Default path
    if (argc > 1) {
        gamePath = argv[1];
    }

    // Load manifest
    std::ifstream manifestFile(gamePath + "/manifest.json");
    if (!manifestFile.is_open()) {
        std::cerr << "Failed to open manifest.json from " << gamePath << std::endl;
        return -1;
    }

    nlohmann::json manifest;
    manifestFile >> manifest;
    manifestFile.close();

    std::cout << "Loaded game package: " << gamePath << std::endl;

    try {
        GLEngine engine(gamePath, manifest);
        engine.init(1280, 720, "Pixospritz OpenGL");
        engine.run();
        engine.shutdown();
    } catch (const std::exception &e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
