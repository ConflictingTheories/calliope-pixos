/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/**
 * Lua Scripting Manager for Pixos Engine
 * Provides Lua 5.4 integration for trigger scripts and game logic
 */

#ifndef LUA_MANAGER_H
#define LUA_MANAGER_H

#include <stdbool.h>
#include "../vendor/lua-5.4/lua.h"
#include "../vendor/lua-5.4/lualib.h"
#include "../vendor/lua-5.4/lauxlib.h"

// Forward declarations - use GLEngine directly to avoid typedef conflicts
struct GLEngine;
struct Zone;
struct Sprite;

// Script execution context
typedef struct {
    struct GLEngine* engine;    // Reference to engine
    struct Zone* zone;          // Current zone
    struct Sprite* caller;      // Entity that triggered the script
    struct Sprite* subject;     // Subject of interaction (e.g., player)
    void* user_data;            // Optional user data
} ScriptContext;

// Lua manager state
typedef struct LuaManager {
    lua_State* L;           // Lua state
    bool initialized;       // Is manager initialized?
    ScriptContext current_context;  // Current execution context
} LuaManager;

/**
 * Initialize the Lua scripting manager
 * @param engine Pointer to engine
 * @return 0 on success, -1 on failure
 */
int lua_manager_init(LuaManager* lm, struct GLEngine* engine);

/**
 * Shutdown the Lua manager
 * @param lm Pointer to LuaManager
 */
void lua_manager_destroy(LuaManager* lm);

/**
 * Execute a Lua script file
 * @param lm Pointer to LuaManager
 * @param path Path to Lua script file
 * @param ctx Script execution context
 * @return 0 on success, -1 on failure
 */
int lua_manager_run_file(LuaManager* lm, const char* path, ScriptContext* ctx);

/**
 * Execute a Lua script string
 * @param lm Pointer to LuaManager
 * @param script Lua code as string
 * @param ctx Script execution context
 * @return 0 on success, -1 on failure
 */
int lua_manager_run_string(LuaManager* lm, const char* script, ScriptContext* ctx);

/**
 * Call a named Lua function
 * @param lm Pointer to LuaManager
 * @param func_name Name of Lua function
 * @param ctx Script execution context
 * @return 0 on success, -1 on failure
 */
int lua_manager_call_function(LuaManager* lm, const char* func_name, ScriptContext* ctx);

/**
 * Register a C function as a Lua global
 * @param lm Pointer to LuaManager
 * @param name Function name in Lua
 * @param func C function pointer
 */
void lua_manager_register_function(LuaManager* lm, const char* name, lua_CFunction func);

/**
 * Set a global integer in Lua
 */
void lua_manager_set_global_int(LuaManager* lm, const char* name, int value);

/**
 * Set a global number in Lua
 */
void lua_manager_set_global_number(LuaManager* lm, const char* name, double value);

/**
 * Set a global string in Lua
 */
void lua_manager_set_global_string(LuaManager* lm, const char* name, const char* value);

/**
 * Set a global boolean in Lua
 */
void lua_manager_set_global_bool(LuaManager* lm, const char* name, bool value);

/**
 * Get a global integer from Lua
 */
int lua_manager_get_global_int(LuaManager* lm, const char* name, int default_val);

/**
 * Get a global number from Lua
 */
double lua_manager_get_global_number(LuaManager* lm, const char* name, double default_val);

/**
 * Get a global string from Lua
 */
const char* lua_manager_get_global_string(LuaManager* lm, const char* name);

/**
 * Get a global boolean from Lua
 */
bool lua_manager_get_global_bool(LuaManager* lm, const char* name, bool default_val);

// ============================================
// Pixos API Bindings for Lua
// These are automatically registered on init
// ============================================

// Game State API
// pixos.get_flag(key) -> value
// pixos.set_flag(key, value)
// pixos.has_flag(key) -> boolean
// pixos.all_flags() -> table

// Zone/World API
// pixos.get_zone() -> zone table
// pixos.load_zone(zone_name)
// pixos.get_caller() -> entity table
// pixos.get_subject() -> entity table

// Camera API
// pixos.pan_camera(from, to, duration)
// pixos.set_camera_position(x, y, z)
// pixos.look_at(position, target, up)

// Input API
// pixos.is_action_active(action) -> boolean
// pixos.get_action_input(action) -> table

// Audio API
// pixos.play_bgm(path, loop, fade_in)
// pixos.stop_bgm(fade_out)
// pixos.play_sfx(path, volume)
// pixos.set_master_volume(volume)

// Sprite/Entity API
// pixos.move_sprite(sprite_id, x, y, z, running)
// pixos.sprite_dialogue(sprite_id, dialogue)
// pixos.get_sprite(sprite_id) -> sprite table

// Utility API
// pixos.log(message)
// pixos.wait(seconds) - yields coroutine
// pixos.sync(functions) - execute array of async functions sequentially

#endif // LUA_MANAGER_H
