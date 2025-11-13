#pragma once

#include <memory>
#include <string>
#include <unordered_map>
#include <nlohmann/json.hpp>

class GLEngine;

class Store {
public:
    Store(GLEngine* engine);
    ~Store();

    void init();
    void save();
    void load();

    // Data management
    void set(const std::string& key, const nlohmann::json& value);
    nlohmann::json get(const std::string& key) const;
    bool has(const std::string& key) const;
    void remove(const std::string& key);

    // Persistence
    void saveToFile(const std::string& filename);
    void loadFromFile(const std::string& filename);

    GLEngine* engine;

private:
    std::unordered_map<std::string, nlohmann::json> data;
    std::string savePath;
};
