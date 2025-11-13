#pragma once

#include <memory>
#include <string>
#include <unordered_map>
#include <vector>
#include <nlohmann/json.hpp>

class GLEngine;
class Shader;
class Texture;
class Model;
class Sound;

class ResourceManager {
public:
    ResourceManager(GLEngine* engine);
    ~ResourceManager();

    void init();
    void shutdown();

    // Shader management
    std::shared_ptr<Shader> loadShader(const std::string& name, const std::string& vertexPath, const std::string& fragmentPath);
    std::shared_ptr<Shader> getShader(const std::string& name) const;

    // Texture management
    std::shared_ptr<Texture> loadTexture(const std::string& name, const std::string& path);
    std::shared_ptr<Texture> getTexture(const std::string& name) const;

    // Model management
    std::shared_ptr<Model> loadModel(const std::string& name, const std::string& path);
    std::shared_ptr<Model> getModel(const std::string& name) const;

    // Sound management
    std::shared_ptr<Sound> loadSound(const std::string& name, const std::string& path);
    std::shared_ptr<Sound> getSound(const std::string& name) const;

    // Bulk loading
    void loadFromManifest(const nlohmann::json& manifest, const std::string& gamePath);

    // Cleanup
    void unloadUnused();
    void clear();

    GLEngine* engine;

private:
    std::unordered_map<std::string, std::shared_ptr<Shader>> shaders;
    std::unordered_map<std::string, std::shared_ptr<Texture>> textures;
    std::unordered_map<std::string, std::shared_ptr<Model>> models;
    std::unordered_map<std::string, std::shared_ptr<Sound>> sounds;
};
