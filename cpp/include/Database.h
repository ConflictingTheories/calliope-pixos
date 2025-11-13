#pragma once

#include <memory>
#include <string>
#include <unordered_map>
#include <vector>
#include <nlohmann/json.hpp>

class GLEngine;

class Database {
public:
    Database(GLEngine* engine);
    ~Database();

    void init();
    void shutdown();

    // Data loading
    void loadDatabase(const std::string& path);
    void loadTable(const std::string& tableName, const nlohmann::json& data);

    // Queries
    nlohmann::json getRecord(const std::string& table, const std::string& id) const;
    std::vector<nlohmann::json> getRecords(const std::string& table, const std::string& field, const std::string& value) const;
    std::vector<nlohmann::json> getAllRecords(const std::string& table) const;

    // Table management
    bool hasTable(const std::string& table) const;
    std::vector<std::string> getTableNames() const;

    GLEngine* engine;

private:
    std::unordered_map<std::string, std::unordered_map<std::string, nlohmann::json>> tables;
};
