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
    // Set context values as globals prefixed with ctx_
    for (const auto& kv : context) {
        std::string name = "ctx_" + kv.first;
        lua_pushstring(luaState, kv.second.c_str());
        lua_setglobal(luaState, name.c_str());
    }

    // Diagnostic: log length and first line to help debugging
    std::string firstLine;
    std::istringstream iss(script);
    std::getline(iss, firstLine);
    std::cout << "[ScriptInterpreter] executing pixo script (first line): " << firstLine << " (len=" << script.size() << ")" << std::endl;
    bool ok = executeLua(script);
    if (!ok) std::cerr << "[ScriptInterpreter] executePixoScript failed for script (first line): " << firstLine << std::endl;
    return ok;
}

void ScriptInterpreter::registerFunction(const std::string& name, lua_CFunction func) {
    lua_register(luaState, name.c_str(), func);
}

void ScriptInterpreter::registerLibrary(const std::string& name, const luaL_Reg* funcs) {
    luaL_newlib(luaState, funcs);
    lua_setglobal(luaState, name.c_str());
}

void ScriptInterpreter::setGlobal(const std::string& name, const std::string& value) {
    lua_pushstring(luaState, value.c_str());
    lua_setglobal(luaState, name.c_str());
}

std::string ScriptInterpreter::getGlobal(const std::string& name) const {
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
    while (ss >> token) {
        tokens.push_back(token);
    }
    return tokens;
}

std::string ScriptInterpreter::convertToLua(const std::vector<std::string>& tokens, const std::unordered_map<std::string, std::string>& context) {
    // Simple conversion, assume tokens are function calls
    std::string lua = "";
    for (const auto& token : tokens) {
        lua += token + " ";
    }
    return lua;
}

void ScriptInterpreter::bindEngineFunctions() {
    // Create a global table 'pixos' and populate with functions
    lua_newtable(luaState); // pixos table

    // pixos.get_caller()
    lua_pushstring(luaState, "get_caller");
    lua_pushcfunction(luaState, [](lua_State* L) -> int {
        lua_pushstring(L, "avatar"); // placeholder
        return 1;
    });
    lua_settable(luaState, -3);

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
        std::cout << "[pxs log] " << out << std::endl;
        return 0;
    });
    lua_settable(luaState, -3);

    // pixos.set_mode(mode)
    lua_pushstring(luaState, "set_mode");
    lua_pushcfunction(luaState, [](lua_State* L) -> int {
        const char* mode = lua_tostring(L, 1);
        std::cout << "pixos.set_mode(" << (mode?mode:"") << ")" << std::endl;
        return 0;
    });
    lua_settable(luaState, -3);

    // pixos.sync(tbl) - call a function or iterate an array of functions
    lua_pushstring(luaState, "sync");
    lua_pushcfunction(luaState, [](lua_State* L) -> int {
        if (lua_isfunction(L, 1)) {
            lua_pushvalue(L, 1);
            if (lua_pcall(L, 0, 0, 0) != LUA_OK) {
                std::cerr << "pixos.sync error: " << lua_tostring(L, -1) << std::endl;
                lua_pop(L, 1);
            }
            return 0;
        }
        if (lua_istable(L, 1)) {
            int n = (int)lua_rawlen(L, 1);
            for (int i = 1; i <= n; ++i) {
                lua_rawgeti(L, 1, i);
                if (lua_isfunction(L, -1)) {
                    if (lua_pcall(L, 0, 0, 0) != LUA_OK) {
                        std::cerr << "pixos.sync table call error: " << lua_tostring(L, -1) << std::endl;
                        lua_pop(L, 1);
                    }
                }
                lua_pop(L, 1);
            }
        }
        return 0;
    });
    lua_settable(luaState, -3);

    // pixos.play_cutscene(id)
    lua_pushstring(luaState, "play_cutscene");
    lua_pushcfunction(luaState, [](lua_State* L) -> int {
        const char* id = lua_tostring(L, 1);
        std::cout << "pixos.play_cutscene: " << (id? id : "") << std::endl;
        return 0;
    });
    lua_settable(luaState, -3);

    // pixos.move_sprite(id, x,y,z,duration)
    // We'll register a C function that uses the ScriptInterpreter pointer as an upvalue
    lua_pushstring(luaState, "move_sprite");
    // push the C function with 1 upvalue (script interpreter pointer as lightuserdata)
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        // upvalue 1 is ScriptInterpreter*
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp) return 0;
        const char* spriteId = lua_tostring(L, 1);
        double x = lua_tonumber(L, 2);
        double y = lua_tonumber(L, 3);
        double z = lua_tonumber(L, 4);
        double duration = lua_tonumber(L, 5);
        std::string sid = spriteId ? spriteId : "";
        std::cout << "pixos.move_sprite(" << sid << "," << x << "," << y << "," << z << ",dur=" << duration << ")" << std::endl;
        // Find sprite in current world/zones
        if (!interp->engine) return 0;
        World* world = interp->engine->getWorld();
        if (!world) return 0;
        auto sp = world->getSpriteById(sid);
        if (sp) {
            sp->pos.x = static_cast<float>(x);
            sp->pos.y = static_cast<float>(y);
            sp->pos.z = static_cast<float>(z);
        }
        return 0;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.set_flag(key, value)
    lua_pushstring(luaState, "set_flag");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp) return 0;
        const char* key = lua_tostring(L, 1);
        const char* value = lua_tostring(L, 2);
        if (key) {
            interp->flags[std::string(key)] = value ? std::string(value) : std::string("");
            std::cout << "pixos.set_flag(" << key << "," << (value?value:"") << ")" << std::endl;
        }
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

    // pixos.has_flag(key)
    lua_pushstring(luaState, "has_flag");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp) { lua_pushboolean(L, 0); return 1; }
        const char* key = lua_tostring(L, 1);
        if (!key) { lua_pushboolean(L, 0); return 1; }
        bool ok = interp->flags.find(std::string(key)) != interp->flags.end();
        lua_pushboolean(L, ok);
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.all_flags() -> returns a table
    lua_pushstring(luaState, "all_flags");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp) { lua_newtable(L); return 1; }
        lua_newtable(L);
        for (const auto& kv : interp->flags) {
            lua_pushstring(L, kv.second.c_str());
            lua_setfield(L, -2, kv.first.c_str());
        }
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.load_zone_from_zip(zoneId, zipPath)
    lua_pushstring(luaState, "load_zone_from_zip");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp || !interp->engine) { lua_pushboolean(L, 0); return 1; }
        const char* zoneId = lua_tostring(L, 1);
        const char* zipPath = lua_tostring(L, 2);
        std::string zid = zoneId ? zoneId : "";
        std::string zpath = zipPath ? zipPath : "";
        std::cout << "pixos.load_zone_from_zip -> zone=" << zid << " zip=" << zpath << std::endl;
        World* world = interp->engine->getWorld();
        if (!world) { lua_pushboolean(L, 0); return 1; }
        if (!zpath.empty() && std::filesystem::exists(zpath) && std::filesystem::is_directory(zpath)) {
            world->gamePath = zpath;
        }
        if (!zid.empty()) {
            world->loadZonePublic(zid);
            lua_pushboolean(L, 1);
            return 1;
        }
        lua_pushboolean(L, 0);
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.run_cutscene(steps) -> accept string id or table; start via CutsceneManager
    lua_pushstring(luaState, "run_cutscene");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp || !interp->engine) { lua_pushnil(L); return 1; }
        // If first arg is string -> play loaded cutscene by id
        if (lua_isstring(L, 1)) {
            const char* cid = lua_tostring(L, 1);
            if (cid) {
                if (interp->engine->getCutsceneManager()) {
                        interp->engine->getCutsceneManager()->playCutscene(cid);
                    }
            }
            lua_pushboolean(L, 1);
            return 1;
        }
        // If table, convert to JSON-like structure and load as transient cutscene
        if (lua_istable(L, 1)) {
            // Build JSON array from table entries
            nlohmann::json arr = nlohmann::json::array();
            int n = (int)lua_rawlen(L, 1);
            for (int i = 1; i <= n; ++i) {
                lua_rawgeti(L, 1, i);
                if (lua_istable(L, -1)) {
                    nlohmann::json act;
                    // read 'type'
                    lua_getfield(L, -1, "type");
                    if (lua_isstring(L, -1)) act["type"] = std::string(lua_tostring(L, -1));
                    lua_pop(L, 1);
                    // read 'delay'
                    lua_getfield(L, -1, "delay");
                    if (lua_isnumber(L, -1)) act["delay"] = (float)lua_tonumber(L, -1);
                    lua_pop(L, 1);
                    // read params table if present
                    lua_getfield(L, -1, "params");
                    if (lua_istable(L, -1)) {
                        nlohmann::json params = nlohmann::json::object();
                        int m = (int)lua_rawlen(L, -1);
                        // iterate string keys by pushnil / lua_next
                        lua_pushnil(L);
                        while (lua_next(L, -2) != 0) {
                            // key at -2, value at -1
                            if (lua_isstring(L, -2)) {
                                std::string k = lua_tostring(L, -2);
                                if (lua_isstring(L, -1)) params[k] = std::string(lua_tostring(L, -1));
                                else if (lua_isnumber(L, -1)) params[k] = std::to_string(lua_tonumber(L, -1));
                            }
                            lua_pop(L, 1);
                        }
                        act["params"] = params;
                    }
                    lua_pop(L, 1); // pop params

                    arr.push_back(act);
                }
                lua_pop(L, 1); // pop element
            }
            // create an id and load
            static int anonId = 1;
            std::string cid = "anon_cutscene_" + std::to_string(anonId++);
            if (interp->engine->getCutsceneManager()) {
                interp->engine->getCutsceneManager()->loadCutscene(cid, arr);
                interp->engine->getCutsceneManager()->playCutscene(cid);
                lua_pushstring(L, cid.c_str());
                return 1;
            }
            lua_pushnil(L);
            return 1;
        }
        lua_pushnil(L);
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.sprite_dialogue(spriteId, dialogue, options) -> returns a callable action
    lua_pushstring(luaState, "sprite_dialogue");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        // upvalue 1 = ScriptInterpreter*
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp) { lua_pushnil(L); return 1; }
        // Expect args: spriteId (string), dialogue (string or table), options (table)
        const char* spriteId = lua_isstring(L, 1) ? lua_tostring(L, 1) : nullptr;
        // Create registry refs for dialogue and options if present
        int refDialog = LUA_NOREF;
        int refOptions = LUA_NOREF;
        if (lua_gettop(L) >= 2 && !lua_isnil(L, 2)) {
            lua_pushvalue(L, 2);
            refDialog = luaL_ref(L, LUA_REGISTRYINDEX);
        }
        if (lua_gettop(L) >= 3 && !lua_isnil(L, 3)) {
            lua_pushvalue(L, 3);
            refOptions = luaL_ref(L, LUA_REGISTRYINDEX);
        }
        // Prepare upvalues for the returned closure: interp pointer, refDialog, refOptions, spriteId
        lua_pushlightuserdata(L, interp);
        lua_pushinteger(L, refDialog);
        lua_pushinteger(L, refOptions);
        lua_pushstring(L, spriteId ? spriteId : "");
        // create and return the inner function closure (4 upvalues)
        lua_pushcclosure(L, [](lua_State* L_inner) -> int {
            // upvalues: 1=ScriptInterpreter*, 2=refDialog, 3=refOptions, 4=spriteId
            ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L_inner, lua_upvalueindex(1)));
            int refDialog = (int)lua_tointeger(L_inner, lua_upvalueindex(2));
            int refOptions = (int)lua_tointeger(L_inner, lua_upvalueindex(3));
            const char* spriteId = lua_tostring(L_inner, lua_upvalueindex(4));
            if (!interp || !interp->engine) return 0;
            World* world = interp->engine->getWorld();
            if (!world) return 0;
            std::string sid = spriteId ? spriteId : "";
            auto sp = world->getSpriteById(sid);
            std::string text;
            float duration = 3.0f;
            // extract dialogue text
            if (refDialog != LUA_NOREF) {
                lua_rawgeti(L_inner, LUA_REGISTRYINDEX, refDialog);
                if (lua_isstring(L_inner, -1)) {
                    text = lua_tostring(L_inner, -1);
                } else if (lua_istable(L_inner, -1)) {
                    // take first element
                    lua_rawgeti(L_inner, -1, 1);
                    if (lua_isstring(L_inner, -1)) text = lua_tostring(L_inner, -1);
                    lua_pop(L_inner, 1);
                }
                lua_pop(L_inner, 1);
            }
            // extract options.duration
            if (refOptions != LUA_NOREF) {
                lua_rawgeti(L_inner, LUA_REGISTRYINDEX, refOptions);
                if (lua_istable(L_inner, -1)) {
                    lua_getfield(L_inner, -1, "duration");
                    if (lua_isnumber(L_inner, -1)) duration = static_cast<float>(lua_tonumber(L_inner, -1));
                    lua_pop(L_inner, 1);
                }
                lua_pop(L_inner, 1);
            }
            if (!text.empty() && sp) {
                // try to cast to Avatar
                std::shared_ptr<Sprite> spt = sp;
                Avatar* av = dynamic_cast<Avatar*>(spt.get());
                if (av) av->speak(text, duration);
            }
            // cleanup refs
            if (refDialog != LUA_NOREF) luaL_unref(L_inner, LUA_REGISTRYINDEX, refDialog);
            if (refOptions != LUA_NOREF) luaL_unref(L_inner, LUA_REGISTRYINDEX, refOptions);
            return 0;
        }, 4);
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.pan_camera(from, to, duration) -> returns callable that enqueues a CameraEvent
    lua_pushstring(luaState, "pan_camera");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        // capture args and create a closure that when called will enqueue the event
        int refFrom = LUA_NOREF;
        int refTo = LUA_NOREF;
        float duration = 1.0f;
        if (!lua_isnil(L, 1)) { lua_pushvalue(L, 1); refFrom = luaL_ref(L, LUA_REGISTRYINDEX); }
        if (!lua_isnil(L, 2)) { lua_pushvalue(L, 2); refTo = luaL_ref(L, LUA_REGISTRYINDEX); }
        if (lua_isnumber(L, 3)) duration = static_cast<float>(lua_tonumber(L, 3));

        // upvalues: interp ptr, refFrom, refTo, duration
    lua_pushlightuserdata(L, lua_touserdata(L, lua_upvalueindex(1)));
    lua_pushinteger(L, refFrom);
    lua_pushinteger(L, refTo);
    lua_pushnumber(L, duration);
    lua_pushcclosure(L, [](lua_State* L_inner) -> int {
            // upvalues: 1=interp,2=refFrom,3=refTo,4=duration
            ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L_inner, lua_upvalueindex(1)));
            int refFrom = (int)lua_tointeger(L_inner, lua_upvalueindex(2));
            int refTo = (int)lua_tointeger(L_inner, lua_upvalueindex(3));
            float duration = static_cast<float>(lua_tonumber(L_inner, lua_upvalueindex(4)));
            if (!interp || !interp->engine) return 0;
            World* world = interp->engine->getWorld();
            if (!world) return 0;
            glm::vec3 from(0.0f);
            glm::vec3 to(0.0f);
            // read refFrom table
            if (refFrom != LUA_NOREF) {
                lua_rawgeti(L_inner, LUA_REGISTRYINDEX, refFrom);
                if (lua_istable(L_inner, -1)) {
                    lua_rawgeti(L_inner, -1, 1); from.x = static_cast<float>(lua_tonumber(L_inner, -1)); lua_pop(L_inner,1);
                    lua_rawgeti(L_inner, -1, 2); from.y = static_cast<float>(lua_tonumber(L_inner, -1)); lua_pop(L_inner,1);
                    lua_rawgeti(L_inner, -1, 3); from.z = static_cast<float>(lua_tonumber(L_inner, -1)); lua_pop(L_inner,1);
                }
                lua_pop(L_inner,1);
            }
            if (refTo != LUA_NOREF) {
                lua_rawgeti(L_inner, LUA_REGISTRYINDEX, refTo);
                if (lua_istable(L_inner, -1)) {
                    lua_rawgeti(L_inner, -1, 1); to.x = static_cast<float>(lua_tonumber(L_inner, -1)); lua_pop(L_inner,1);
                    lua_rawgeti(L_inner, -1, 2); to.y = static_cast<float>(lua_tonumber(L_inner, -1)); lua_pop(L_inner,1);
                    lua_rawgeti(L_inner, -1, 3); to.z = static_cast<float>(lua_tonumber(L_inner, -1)); lua_pop(L_inner,1);
                }
                lua_pop(L_inner,1);
            }

            auto ev = std::make_shared<CameraEvent>(interp->engine, from, to, duration);
            ev->onComplete = [interp, refFrom, refTo]() {
                if (refFrom != LUA_NOREF) luaL_unref(interp->getLuaState(), LUA_REGISTRYINDEX, refFrom);
                if (refTo != LUA_NOREF) luaL_unref(interp->getLuaState(), LUA_REGISTRYINDEX, refTo);
            };
            world->addEvent(ev);
            return 0;
        }, 4);
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.set_camera()
    lua_pushstring(luaState, "set_camera");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp || !interp->engine) return 0;
        if (interp->engine->getCamera()) {
            interp->engine->getCamera()->updateVectors();
        }
        return 0;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.get_camera_vector() -> returns table {x,y,z}
    lua_pushstring(luaState, "get_camera_vector");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp || !interp->engine) { lua_pushnil(L); return 1; }
        Camera* cam = interp->engine->getCamera();
        if (!cam) { lua_pushnil(L); return 1; }
        lua_newtable(L);
        lua_pushnumber(L, cam->target.x); lua_rawseti(L, -2, 1);
        lua_pushnumber(L, cam->target.y); lua_rawseti(L, -2, 2);
        lua_pushnumber(L, cam->target.z); lua_rawseti(L, -2, 3);
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.look_at(pos, target, up)
    lua_pushstring(luaState, "look_at");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp || !interp->engine) return 0;
        if (!lua_istable(L,1) || !lua_istable(L,2) || !lua_istable(L,3)) return 0;
        glm::vec3 pos(0.0f), tgt(0.0f), up(0.0f);
        lua_rawgeti(L,1,1); pos.x = static_cast<float>(lua_tonumber(L,-1)); lua_pop(L,1);
        lua_rawgeti(L,1,2); pos.y = static_cast<float>(lua_tonumber(L,-1)); lua_pop(L,1);
        lua_rawgeti(L,1,3); pos.z = static_cast<float>(lua_tonumber(L,-1)); lua_pop(L,1);
        lua_rawgeti(L,2,1); tgt.x = static_cast<float>(lua_tonumber(L,-1)); lua_pop(L,1);
        lua_rawgeti(L,2,2); tgt.y = static_cast<float>(lua_tonumber(L,-1)); lua_pop(L,1);
        lua_rawgeti(L,2,3); tgt.z = static_cast<float>(lua_tonumber(L,-1)); lua_pop(L,1);
        lua_rawgeti(L,3,1); up.x = static_cast<float>(lua_tonumber(L,-1)); lua_pop(L,1);
        lua_rawgeti(L,3,2); up.y = static_cast<float>(lua_tonumber(L,-1)); lua_pop(L,1);
        lua_rawgeti(L,3,3); up.z = static_cast<float>(lua_tonumber(L,-1)); lua_pop(L,1);
        Camera* cam = interp->engine->getCamera();
        if (cam) {
            cam->setPosition(pos);
            cam->setTarget(tgt);
            cam->setUp(up);
            cam->updateVectors();
        }
        return 0;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.vector(tbl or numbers...) -> returns table {x,y,z}
    lua_pushstring(luaState, "vector");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        // Accept either a table or individual numbers
        if (lua_istable(L, 1)) {
            lua_pushvalue(L, 1);
            return 1;
        }
        // build a table from numeric args
        int n = lua_gettop(L);
        lua_newtable(L);
        for (int i = 1; i <= n; ++i) {
            if (lua_isnumber(L, i)) lua_pushnumber(L, lua_tonumber(L, i));
            else lua_pushnumber(L, 0);
            lua_rawseti(L, -2, i);
        }
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.vec_sub(a, b) -> returns table a - b elementwise
    lua_pushstring(luaState, "vec_sub");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        // expects two tables or vectors
        glm::vec3 A(0.0f), B(0.0f);
        if (lua_istable(L, 1)) {
            lua_rawgeti(L, 1, 1); A.x = static_cast<float>(lua_tonumber(L, -1)); lua_pop(L,1);
            lua_rawgeti(L, 1, 2); A.y = static_cast<float>(lua_tonumber(L, -1)); lua_pop(L,1);
            lua_rawgeti(L, 1, 3); A.z = static_cast<float>(lua_tonumber(L, -1)); lua_pop(L,1);
        } else {
            A.x = static_cast<float>(lua_tonumber(L, 1));
            A.y = static_cast<float>(lua_tonumber(L, 2));
            A.z = static_cast<float>(lua_tonumber(L, 3));
        }
        if (lua_istable(L, 2)) {
            lua_rawgeti(L, 2, 1); B.x = static_cast<float>(lua_tonumber(L, -1)); lua_pop(L,1);
            lua_rawgeti(L, 2, 2); B.y = static_cast<float>(lua_tonumber(L, -1)); lua_pop(L,1);
            lua_rawgeti(L, 2, 3); B.z = static_cast<float>(lua_tonumber(L, -1)); lua_pop(L,1);
        } else {
            B.x = static_cast<float>(lua_tonumber(L, 2));
            B.y = static_cast<float>(lua_tonumber(L, 3));
            B.z = static_cast<float>(lua_tonumber(L, 4));
        }
        glm::vec3 C = A - B;
        lua_newtable(L);
        lua_pushnumber(L, C.x); lua_rawseti(L, -2, 1);
        lua_pushnumber(L, C.y); lua_rawseti(L, -2, 2);
        lua_pushnumber(L, C.z); lua_rawseti(L, -2, 3);
        return 1;
    }, 1);
    lua_settable(luaState, -3);

    // helpers: as_obj, as_array - passthroughs
    lua_pushstring(luaState, "as_obj");
    lua_pushcfunction(luaState, [](lua_State* L) -> int { lua_pushvalue(L, 1); return 1; });
    lua_settable(luaState, -3);

    // pixos.set_skybox_shader(name)
    lua_pushstring(luaState, "set_skybox_shader");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp || !interp->engine) return 0;
        if (!lua_isstring(L, 1)) return 0;
        const char* name = lua_tostring(L, 1);
        // Render skybox switching is not implemented in the C++ runtime yet.
        // Avoid calling non-existent RenderManager methods (they exist in the JS engine).
        if (interp->engine->getRenderManager()) {
            std::cout << "pixos.set_skybox_shader: not implemented in C++ runtime (no skybox manager) - requested: " << name << std::endl;
        } else {
            std::cout << "pixos.set_skybox_shader: no RenderManager available" << std::endl;
        }
        return 0;
    }, 1);
    lua_settable(luaState, -3);

    // pixos.emit_particles(posTbl, cfgTbl)
    lua_pushstring(luaState, "emit_particles");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp || !interp->engine) return 0;
        // read position table or numbers
        glm::vec3 pos(0.0f);
        if (lua_istable(L, 1)) {
            lua_rawgeti(L, 1, 1); pos.x = static_cast<float>(lua_tonumber(L, -1)); lua_pop(L,1);
            lua_rawgeti(L, 1, 2); pos.y = static_cast<float>(lua_tonumber(L, -1)); lua_pop(L,1);
            lua_rawgeti(L, 1, 3); pos.z = static_cast<float>(lua_tonumber(L, -1)); lua_pop(L,1);
        } else {
            pos.x = static_cast<float>(lua_tonumber(L, 1));
            pos.y = static_cast<float>(lua_tonumber(L, 2));
            pos.z = static_cast<float>(lua_tonumber(L, 3));
        }
        // read cfg table into a simple map
        std::unordered_map<std::string, std::string> cfg;
        if (lua_istable(L, 2)) {
            lua_pushnil(L);
            while (lua_next(L, 2) != 0) {
                if (lua_isstring(L, -2) && lua_isstring(L, -1)) {
                    cfg[lua_tostring(L, -2)] = lua_tostring(L, -1);
                }
                lua_pop(L, 1);
            }
        }
        // Particle emission is not implemented in the C++ runtime yet.
        // Log the request instead of calling into non-existent particle manager APIs.
        if (interp->engine->getRenderManager()) {
            std::cout << "pixos.emit_particles: not implemented in C++ runtime (particle manager missing). Requested pos=("
                      << pos.x << "," << pos.y << "," << pos.z << ") cfg.size=" << cfg.size() << std::endl;
        } else {
            std::cout << "pixos.emit_particles: no RenderManager available" << std::endl;
        }
        return 0;
    }, 1);
    lua_settable(luaState, -3);
    lua_pushstring(luaState, "as_array");
    lua_pushcfunction(luaState, [](lua_State* L) -> int { lua_pushvalue(L, 1); return 1; });
    lua_settable(luaState, -3);

    // pixos.set_backdrop(name)
    lua_pushstring(luaState, "set_backdrop");
    lua_pushlightuserdata(luaState, this);
    lua_pushcclosure(luaState, [](lua_State* L) -> int {
        ScriptInterpreter* interp = static_cast<ScriptInterpreter*>(lua_touserdata(L, lua_upvalueindex(1)));
        if (!interp || !interp->engine) return 0;
        if (!lua_isstring(L, 1)) return 0;
        const char* name = lua_tostring(L, 1);
        if (interp->engine->getCutsceneManager()) {
            interp->engine->getCutsceneManager()->setBackdrop(std::string(name));
        } else {
            std::cout << "pixos.set_backdrop: no CutsceneManager available" << std::endl;
        }
        return 0;
    }, 1);
    lua_settable(luaState, -3);

    // Set pixos global
    lua_setglobal(luaState, "pixos");
}
