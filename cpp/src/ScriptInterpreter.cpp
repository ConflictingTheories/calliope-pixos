#include "ScriptInterpreter.h"
#include "GLEngine.h"
#include "World.h"
#include "Zone.h"
#include "Avatar.h"
#include "CameraEvent.h"
#include <glm/glm.hpp>
#include "Camera.h"
#include <iostream>
#include <sstream>
#include <filesystem>

#if PIXO_HAS_LUA

ScriptInterpreter::ScriptInterpreter(GLEngine* engine) : engine(engine), luaState(nullptr) {}

ScriptInterpreter::~ScriptInterpreter() {
    shutdown();
}

void ScriptInterpreter::init() {
    luaState = luaL_newstate();
    luaL_openlibs(luaState);
    bindEngineFunctions();
}

void ScriptInterpreter::shutdown() {
    if (luaState) {
        lua_close(luaState);
        luaState = nullptr;
    }
}

bool ScriptInterpreter::executeLua(const std::string& script) {
    if (!luaState) return false;
    int result = luaL_dostring(luaState, script.c_str());
    if (result != LUA_OK) {
        std::cerr << "Lua error: " << lua_tostring(luaState, -1) << std::endl;
        lua_pop(luaState, 1);
        return false;
    }
    return true;
}

bool ScriptInterpreter::executeFile(const std::string& filename) {
    if (!luaState) return false;
    int result = luaL_dofile(luaState, filename.c_str());
    if (result != LUA_OK) {
        std::cerr << "Lua file error: " << lua_tostring(luaState, -1) << std::endl;
        lua_pop(luaState, 1);
        return false;
    }
    return true;
}

lua_State* ScriptInterpreter::getLuaState() const {
    return luaState;
}

bool ScriptInterpreter::executePixoScript(const std::string& script, const std::unordered_map<std::string, std::string>& context) {
    if (!luaState) return false;
    for (const auto& kv : context) {
        std::string name = "ctx_" + kv.first;
        lua_pushstring(luaState, kv.second.c_str());
        lua_setglobal(luaState, name.c_str());
    }
    std::istringstream iss(script);
    std::string first;
    std::getline(iss, first);
    std::cout << "[ScriptInterpreter] executing pixo script: " << first << "..." << std::endl;
    return executeLua(script);
}

void ScriptInterpreter::registerFunction(const std::string& name, lua_CFunction func) {
    if (!luaState) return;
    lua_register(luaState, name.c_str(), func);
}

void ScriptInterpreter::registerLibrary(const std::string& name, const luaL_Reg* funcs) {
    if (!luaState) return;
    luaL_newlib(luaState, funcs);
    lua_setglobal(luaState, name.c_str());
}

void ScriptInterpreter::setGlobal(const std::string& name, const std::string& value) {
    if (!luaState) return;
    lua_pushstring(luaState, value.c_str());
    lua_setglobal(luaState, name.c_str());
}

std::string ScriptInterpreter::getGlobal(const std::string& name) const {
    if (!luaState) return "";
    lua_getglobal(luaState, name.c_str());
    if (lua_isstring(luaState, -1)) {
        std::string value = lua_tostring(luaState, -1);
        lua_pop(luaState, 1);
        return value;
    }
    lua_pop(luaState, 1);
    return "";
}

std::vector<std::string> ScriptInterpreter::tokenize(const std::string& script) {
    std::vector<std::string> tokens;
    std::stringstream ss(script);
    std::string token;
    while (ss >> token) tokens.push_back(token);
    return tokens;
}

std::string ScriptInterpreter::convertToLua(const std::vector<std::string>& tokens, const std::unordered_map<std::string, std::string>& /*context*/) {
    std::string lua;
    for (const auto& t : tokens) lua += t + " ";
    return lua;
}

void ScriptInterpreter::bindEngineFunctions() {
    if (!luaState) return;
    lua_newtable(luaState); // pixos

    // pixos.log(...)
    lua_pushstring(luaState, "log");
    lua_pushcfunction(luaState, [](lua_State* L) -> int {
        int nargs = lua_gettop(L);
        std::string out;
        for (int i = 1; i <= nargs; ++i) {
            if (lua_isstring(L, i)) out += lua_tostring(L, i);
            else out += "[non-string]";
            if (i < nargs) out += " ";
        }
        std::cout << "[pixos.log] " << out << std::endl;
        return 0;
    });
    lua_settable(luaState, -3);

    // pixos.set_flag(key, value)
    lua_pushstring(luaState, "set_flag");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp) return 0;
        const char* key = lua_tostring(L, 1);
        const char* value = lua_tostring(L, 2);
        if (key) interp->flags[std::string(key)] = value ? std::string(value) : std::string("");
        return 0;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.get_flag(key)
    lua_pushstring(luaState, "get_flag");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp) { lua_pushnil(L); return 1; }
        const char* key = lua_tostring(L, 1);
        if (!key) { lua_pushnil(L); return 1; }
        auto it = interp->flags.find(std::string(key));
        if (it != interp->flags.end()) lua_pushstring(L, it->second.c_str());
        else lua_pushnil(L);
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.load_zone_from_zip(zoneId, zipPath)
    lua_pushstring(luaState, "load_zone_from_zip");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp || !interp->engine) { lua_pushboolean(L, 0); return 1; }
        const char* zid = lua_tostring(L, 1);
        const char* zpath = lua_tostring(L, 2);
        if (zpath && std::filesystem::exists(std::string(zpath))) {
            interp->engine->getWorld()->gamePath = std::string(zpath);
        }
        if (zid) interp->engine->getWorld()->loadZonePublic(std::string(zid));
        lua_pushboolean(L, 1);
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.set_backdrop(name)
    lua_pushstring(luaState, "set_backdrop");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp || !interp->engine) return 0;
        const char* name = lua_tostring(L, 1);
        if (name && interp->engine->getCutsceneManager()) interp->engine->getCutsceneManager()->setBackdrop(std::string(name));
        return 0;
    }, 1);
    lua_settable(luaState, -3);

    lua_setglobal(luaState, "pixos");
}

#else

// No-Lua fallback: provide safe no-op implementations so engine builds without Lua.
ScriptInterpreter::ScriptInterpreter(GLEngine* engine) : engine(engine), luaState(nullptr) {}

ScriptInterpreter::~ScriptInterpreter() { shutdown(); }

void ScriptInterpreter::init() { std::cout << "ScriptInterpreter: Lua not available; scripting disabled." << std::endl; }
void ScriptInterpreter::shutdown() {}
bool ScriptInterpreter::executeLua(const std::string& /*script*/) { return false; }
bool ScriptInterpreter::executeFile(const std::string& /*filename*/) { return false; }
lua_State* ScriptInterpreter::getLuaState() const { return nullptr; }
bool ScriptInterpreter::executePixoScript(const std::string& /*script*/, const std::unordered_map<std::string, std::string>& /*context*/) { return false; }
void ScriptInterpreter::registerFunction(const std::string& /*name*/, lua_CFunction /*func*/) {}
void ScriptInterpreter::registerLibrary(const std::string& /*name*/, const luaL_Reg* /*funcs*/) {}
void ScriptInterpreter::setGlobal(const std::string& /*name*/, const std::string& /*value*/) {}
std::string ScriptInterpreter::getGlobal(const std::string& /*name*/) const { return ""; }
std::vector<std::string> ScriptInterpreter::tokenize(const std::string& script) {
    std::vector<std::string> tokens;
    std::stringstream ss(script);
    std::string token;
    while (ss >> token) tokens.push_back(token);
    return tokens;
}
std::string ScriptInterpreter::convertToLua(const std::vector<std::string>& tokens, const std::unordered_map<std::string, std::string>& /*context*/) {
    std::string lua;
    for (const auto& t : tokens) lua += t + " ";
    return lua;
}
void ScriptInterpreter::bindEngineFunctions() { /* no-op without Lua */ }

#endif
