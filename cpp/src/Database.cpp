#include "Database.h"
#include <iostream>

Database::Database() {
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

std::optional<std::string> Database::dbGet(const std::string& store, const std::string& key) {
    auto it = tables.find(store);
    if (it != tables.end()) {
        auto& table = it->second;
        auto valueIt = table.find(key);
        if (valueIt != table.end()) {
            return valueIt->second;
        }
    }
    return std::nullopt;
}

bool Database::dbAdd(const std::string& store, const std::string& key, const std::string& value) {
    auto it = tables.find(store);
    if (it != tables.end()) {
        it->second[key] = value;
        return true;
    }
    return false;
}