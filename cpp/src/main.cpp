#include <iostream>
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <nlohmann/json.hpp>
#include <fstream>
#include <string>
#include "GLEngine.h"

int main(int argc, char* argv[]) {
    // Check for game package argument
    std::string gamePath = "example/spritz"; // Default path
    std::string zipPath = "";

    if (argc > 1) {
        std::string arg = argv[1];
        // Check if it's a .zip file
        if (arg.find(".zip") != std::string::npos) {
            zipPath = arg;
            // Extract directory path for gamePath
            size_t lastSlash = arg.find_last_of("/");
            if (lastSlash != std::string::npos) {
                gamePath = arg.substr(0, lastSlash);
            } else {
                gamePath = ".";
            }
        } else {
            gamePath = arg;
        }
    }

    // Try to load manifest from provided path
    std::ifstream manifestFile(gamePath + "/manifest.json");
    if (!manifestFile.is_open()) {
        std::cout << "No game package found at: " << gamePath << std::endl;
        std::cout << "Checking for Archive.zip..." << std::endl;
        // Check for Archive.zip in the gamePath
        std::string archivePath = gamePath + "/Archive.zip";
        std::ifstream archiveFile(archivePath);
        if (archiveFile.is_open()) {
            std::cout << "Found Archive.zip, extracting..." << std::endl;
            // Extract Archive.zip to gamePath
            std::string extractCmd = "unzip -o -q \"" + archivePath + "\" -d \"" + gamePath + "\"";
            int result = system(extractCmd.c_str());
            if (result == 0) {
                std::cout << "Archive.zip extracted successfully." << std::endl;
                // Try loading manifest again
                manifestFile.open(gamePath + "/manifest.json");
                if (manifestFile.is_open()) {
                    std::cout << "Manifest loaded after extraction." << std::endl;
                } else {
                    std::cout << "Manifest not found after extraction." << std::endl;
                }
            } else {
                std::cout << "Failed to extract Archive.zip." << std::endl;
            }
        } else {
            std::cout << "Archive.zip not found." << std::endl;
        }
        if (!zipPath.empty()) {
            std::cout << "Attempting to load ZIP file: " << zipPath << std::endl;
            // Extract ZIP file to temporary directory
            std::string extractCmd = "unzip -o -q \"" + zipPath + "\" -d \"" + gamePath + "/temp_extracted\"";
            int result = system(extractCmd.c_str());
            if (result == 0) {
                std::cout << "ZIP file extracted successfully." << std::endl;
                // Copy manifest.json to gamePath
                std::string copyCmd = "cp \"" + gamePath + "/temp_extracted/manifest.json\" \"" + gamePath + "/\"";
                system(copyCmd.c_str());
                std::cout << "Manifest copied. Please restart the application to load the game." << std::endl;
            } else {
                std::cout << "Failed to extract ZIP file." << std::endl;
            }
        } else {
            std::cout << "Please select a .zip game file..." << std::endl;
        }

        // Start with empty manifest and gamePath so ImGui picker is shown
        try {
            GLEngine engine;
            engine.init(1280, 720, "Pixospritz OpenGL");
            engine.run();
            engine.shutdown();
        } catch (const std::exception &e) {
            std::cerr << "Error: " << e.what() << std::endl;
            return 1;
        }
        return 0;
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
