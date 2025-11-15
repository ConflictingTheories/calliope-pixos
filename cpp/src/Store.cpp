#include "Store.h"
#include <unordered_map>
#include <string>
#include <vector>

Store* Store::_instance = nullptr;

Store::Store() {
    if (!_instance) {
        _instance = this;
    }
}

Store* Store::getInstance() {
    if (!_instance) {
        _instance = new Store();
    }
    return _instance;
}

std::unordered_map<std::string, std::string> Store::all() const {
    return store;
}

std::vector<std::string> Store::keys() const {
    std::vector<std::string> keys;
    for (const auto& pair : store) {
        keys.push_back(pair.first);
    }
    return keys;
}

std::vector<std::string> Store::values() const {
    std::vector<std::string> values;
    for (const auto& pair : store) {
        values.push_back(pair.second);
    }
    return values;
}