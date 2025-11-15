#pragma once

#ifdef __has_include
#  if __has_include(<lua.hpp>)
#    include <lua.hpp>
#    define PIXO_HAS_LUA 1
#  else
#    define PIXO_HAS_LUA 0
#  endif
#else
#  include <lua.hpp>
#  define PIXO_HAS_LUA 1
#endif
#if !PIXO_HAS_LUA
// Provide minimal fallback types so header compiles without Lua development headers
struct lua_State; // opaque
using lua_CFunction = int(*)(void*);
struct luaL_Reg { const char* name; lua_CFunction func; };
#endif
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
    // Lua state pointer
    lua_State* luaState;

    // PixoScript parsing
    std::vector<std::string> tokenize(const std::string& script);
    std::string convertToLua(const std::vector<std::string>& tokens, const std::unordered_map<std::string, std::string>& context);
};
