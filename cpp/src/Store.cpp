#include "Store.h"
#include <fstream>
#include <iostream>

Store::Store(GLEngine* engine) : engine(engine) {}

Store::~Store() {}

void Store::init() {
    // Initialize store
}

void Store::save() {
    saveToFile("store.json");
}

void Store::load() {
    loadFromFile("store.json");
}

void Store::set(const std::string& key, const nlohmann::json& value) {
    data[key] = value;
}

nlohmann::json Store::get(const std::string& key) const {
    if (data.find(key) != data.end()) {
        return data.at(key);
    }
    return nullptr;
}

bool Store::has(const std::string& key) const {
    return data.find(key) != data.end();
}

void Store::remove(const std::string& key) {
    data.erase(key);
}

void Store::saveToFile(const std::string& filename) {
    std::ofstream file(filename);
    if (file.is_open()) {
        file << nlohmann::json(data).dump(4);
        file.close();
    } else {
        std::cerr << "Failed to open file for saving: " << filename << std::endl;
    }
}

void Store::loadFromFile(const std::string& filename) {
    std::ifstream file(filename);
    if (file.is_open()) {
        nlohmann::json j;
        file >> j;
        data = j.get<std::unordered_map<std::string, nlohmann::json>>();
        file.close();
    } else {
        std::cerr << "Failed to open file for loading: " << filename << std::endl;
    }
}
