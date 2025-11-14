#pragma once

#include <lua.hpp>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>
#include <nlohmann/json.hpp>

class GLEngine;

class ScriptInterpreter {
public:
    ScriptInterpreter(GLEngine* engine);
    ~ScriptInterpreter();

    void init();
    void shutdown();

    // Lua execution
    bool executeLua(const std::string& script);
    bool executeFile(const std::string& filename);
    lua_State* getLuaState() const;

    // PixoScript execution
    bool executePixoScript(const std::string& script, const std::unordered_map<std::string, std::string>& context = {});

    // Function registration
    void registerFunction(const std::string& name, lua_CFunction func);
    void registerLibrary(const std::string& name, const luaL_Reg* funcs);

    // Variable management
    void setGlobal(const std::string& name, const std::string& value);
    std::string getGlobal(const std::string& name) const;

    // Engine bindings
    void bindEngineFunctions();

    GLEngine* engine;

    // Simple flags store exposed to scripts
    std::unordered_map<std::string, std::string> flags;

private:
    lua_State* luaState;

    // PixoScript parsing
    std::vector<std::string> tokenize(const std::string& script);
    std::string convertToLua(const std::vector<std::string>& tokens, const std::unordered_map<std::string, std::string>& context);
};
