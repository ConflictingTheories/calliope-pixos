#include "ResourceManager.h"
#include "Shader.h"
#include "Texture.h"
#include "GLEngine.h"
#include "AudioManager.h"

#include <iostream>

ResourceManager::ResourceManager(GLEngine* engine) : engine(engine) {
}

ResourceManager::~ResourceManager() {
    clear();
}

void ResourceManager::init() {
    // no-op for now
}

void ResourceManager::shutdown() {
    clear();
}

std::shared_ptr<Shader> ResourceManager::loadShader(const std::string& name, const std::string& vertexPath, const std::string& fragmentPath) {
    if (shaders.find(name) != shaders.end()) return shaders[name];
    auto s = std::make_shared<Shader>(vertexPath, fragmentPath);
    shaders[name] = s;
    return s;
}

std::shared_ptr<Shader> ResourceManager::getShader(const std::string& name) const {
    if (shaders.find(name) != shaders.end()) return shaders.at(name);
    return nullptr;
}

std::shared_ptr<Texture> ResourceManager::loadTexture(const std::string& name, const std::string& path) {
    if (textures.find(name) != textures.end()) return textures.at(name);
    auto t = std::make_shared<Texture>(engine, name);
    // try loading as a texture
    textures[name] = t;
    return t;
}

std::shared_ptr<Texture> ResourceManager::getTexture(const std::string& name) const {
    if (textures.find(name) != textures.end()) return textures.at(name);
    return nullptr;
}

std::shared_ptr<Model> ResourceManager::loadModel(const std::string& name, const std::string& path) {
    // TODO: implement model loader
    return nullptr;
}

std::shared_ptr<Model> ResourceManager::getModel(const std::string& name) const {
    // TODO: implement
    return nullptr;
}

std::shared_ptr<Sound> ResourceManager::loadSound(const std::string& name, const std::string& path) {
    if (sounds.find(name) != sounds.end()) return sounds.at(name);
    if (!engine) return nullptr;
    auto am = engine->getAudioManager();
    if (!am) return nullptr;
    auto s = am->loadSound(name, path);
    sounds[name] = s;
    return s;
}

std::shared_ptr<Sound> ResourceManager::getSound(const std::string& name) const {
    if (sounds.find(name) != sounds.end()) return sounds.at(name);
    return nullptr;
}

void ResourceManager::loadFromManifest(const nlohmann::json& manifest, const std::string& gamePath) {
    // iterate shaders
    if (manifest.contains("shaders")) {
        for (auto& s : manifest["shaders"]) {
            if (s.contains("id") && s.contains("vs") && s.contains("fs")) {
                try {
                    loadShader(s["id"].get<std::string>(), gamePath + "/" + s["vs"].get<std::string>(), gamePath + "/" + s["fs"].get<std::string>());
                } catch (...) {
                    std::cerr << "Failed to load shader: " << s.dump() << std::endl;
                }
            }
        }
    }

    // Load textures
    if (manifest.contains("tilesets")) {
        for (auto& t : manifest["tilesets"]) {
            if (t.contains("id") && t.contains("path")) {
                loadTexture(t["id"].get<std::string>(), gamePath + "/" + t["path"].get<std::string>());
            }
        }
    }
}

void ResourceManager::unloadUnused() {
    // TODO: implement reference checks
}

void ResourceManager::clear() {
    shaders.clear();
    textures.clear();
    models.clear();
    sounds.clear();
}
