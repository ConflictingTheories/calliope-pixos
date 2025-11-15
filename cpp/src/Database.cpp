#include "Database.h"
#include <iostream>

Database::Database(GLEngine* engine) : engine(engine) {
    // Initialize database tables
    tables = {
        {"tileset", {}},
        {"inventory", {}},
        {"spirits", {}},
        {"abilities", {}},
        {"models", {}},
        {"accounts", {}},
        {"dht", {}},
        {"msg", {}},
        {"tmp", {}}
    };
}

void Database::init() {
    std::cout << "Database initialized" << std::endl;
}

void Database::shutdown() {
    std::cout << "Database shutdown" << std::endl;
}

void Database::loadDatabase(const std::string& path) {
    // TODO: Load database from file
    std::cout << "Loading database from: " << path << std::endl;
}

void Database::loadTable(const std::string& tableName, const nlohmann::json& data) {
    tables[tableName] = data.get<std::unordered_map<std::string, nlohmann::json>>();
}

nlohmann::json Database::getRecord(const std::string& table, const std::string& id) const {
    auto tableIt = tables.find(table);
    if (tableIt != tables.end()) {
        auto recordIt = tableIt->second.find(id);
        if (recordIt != tableIt->second.end()) {
            return recordIt->second;
        }
    }
    return nullptr;
}

std::vector<nlohmann::json> Database::getRecords(const std::string& table, const std::string& field, const std::string& value) const {
    std::vector<nlohmann::json> results;
    auto tableIt = tables.find(table);
    if (tableIt != tables.end()) {
        for (const auto& record : tableIt->second) {
            if (record.second.contains(field) && record.second[field] == value) {
                results.push_back(record.second);
            }
        }
    }
    return results;
}

std::vector<nlohmann::json> Database::getAllRecords(const std::string& table) const {
    std::vector<nlohmann::json> results;
    auto tableIt = tables.find(table);
    if (tableIt != tables.end()) {
        for (const auto& record : tableIt->second) {
            results.push_back(record.second);
        }
    }
    return results;
}

bool Database::hasTable(const std::string& table) const {
    return tables.count(table) > 0;
}

std::vector<std::string> Database::getTableNames() const {
    std::vector<std::string> names;
    for (const auto& table : tables) {
        names.push_back(table.first);
    }
    return names;
}
