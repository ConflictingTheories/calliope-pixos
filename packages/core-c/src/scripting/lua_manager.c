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
 * Lua Scripting Manager Implementation
 * Provides Lua 5.4 integration for trigger scripts and game logic
 */

#include "lua_manager.h"
#include "../engine.h"
#include "../input_manager.h"
#include <stdio.h>
#include <string.h>

#ifdef ENABLE_AUDIO
#include "../audio/audio_manager.h"
#endif

// Typedef for convenience since we use struct GLEngine
typedef struct GLEngine Engine;

// Global pointer to current lua manager for C callbacks
static LuaManager* g_current_lua_manager = NULL;

// ============================================
// Internal Helper Functions
// ============================================

// Get engine from Lua state upvalue
static Engine* get_engine(lua_State* L) {
    if (g_current_lua_manager && g_current_lua_manager->current_context.engine) {
        return g_current_lua_manager->current_context.engine;
    }
    return NULL;
}

// ============================================
// Pixos API: Game State
// ============================================

// pixos.log(message)
static int l_log(lua_State* L) {
    const char* msg = luaL_checkstring(L, 1);
    printf("[Lua] %s\n", msg);
    return 0;
}

// pixos.get_flag(key) -> value
static int l_get_flag(lua_State* L) {
    const char* key = luaL_checkstring(L, 1);
    Engine* engine = get_engine(L);
    
    if (engine && engine->game_flags) {
        // TODO: Implement flag storage in engine
        // For now, return nil
        lua_pushnil(L);
    } else {
        lua_pushnil(L);
    }
    return 1;
}

// pixos.set_flag(key, value)
static int l_set_flag(lua_State* L) {
    const char* key = luaL_checkstring(L, 1);
    // Value is at index 2 - can be any type
    Engine* engine = get_engine(L);
    
    if (engine && engine->game_flags) {
        // TODO: Implement flag storage in engine
        printf("[Lua] set_flag: %s\n", key);
    }
    return 0;
}

// pixos.has_flag(key) -> boolean
static int l_has_flag(lua_State* L) {
    const char* key = luaL_checkstring(L, 1);
    Engine* engine = get_engine(L);
    
    if (engine && engine->game_flags) {
        // TODO: Check if flag exists
        lua_pushboolean(L, 0);
    } else {
        lua_pushboolean(L, 0);
    }
    return 1;
}

// ============================================
// Pixos API: Zone/World
// ============================================

// pixos.get_caller() -> entity userdata
static int l_get_caller(lua_State* L) {
    if (g_current_lua_manager) {
        Sprite* caller = g_current_lua_manager->current_context.caller;
        if (caller) {
            // Push as light userdata
            lua_pushlightuserdata(L, caller);
            return 1;
        }
    }
    lua_pushnil(L);
    return 1;
}

// pixos.get_subject() -> entity userdata
static int l_get_subject(lua_State* L) {
    if (g_current_lua_manager) {
        Sprite* subject = g_current_lua_manager->current_context.subject;
        if (subject) {
            lua_pushlightuserdata(L, subject);
            return 1;
        }
    }
    lua_pushnil(L);
    return 1;
}

// pixos.get_zone() -> zone userdata
static int l_get_zone(lua_State* L) {
    if (g_current_lua_manager) {
        Zone* zone = g_current_lua_manager->current_context.zone;
        if (zone) {
            lua_pushlightuserdata(L, zone);
            return 1;
        }
    }
    lua_pushnil(L);
    return 1;
}

// ============================================
// Pixos API: Camera
// ============================================

// pixos.set_camera_position(x, y, z)
static int l_set_camera_position(lua_State* L) {
    float x = (float)luaL_checknumber(L, 1);
    float y = (float)luaL_checknumber(L, 2);
    float z = (float)luaL_checknumber(L, 3);
    
    Engine* engine = get_engine(L);
    if (engine) {
        // TODO: Implement camera position setting
        printf("[Lua] set_camera_position: %.2f, %.2f, %.2f\n", x, y, z);
    }
    return 0;
}

// pixos.look_at(px, py, pz, tx, ty, tz, ux, uy, uz)
static int l_look_at(lua_State* L) {
    float px = (float)luaL_checknumber(L, 1);
    float py = (float)luaL_checknumber(L, 2);
    float pz = (float)luaL_checknumber(L, 3);
    float tx = (float)luaL_checknumber(L, 4);
    float ty = (float)luaL_checknumber(L, 5);
    float tz = (float)luaL_checknumber(L, 6);
    float ux = (float)luaL_optnumber(L, 7, 0.0);
    float uy = (float)luaL_optnumber(L, 8, 1.0);
    float uz = (float)luaL_optnumber(L, 9, 0.0);
    
    Engine* engine = get_engine(L);
    if (engine) {
        // TODO: Set camera look at
        printf("[Lua] look_at: pos(%.2f, %.2f, %.2f) target(%.2f, %.2f, %.2f)\n", 
               px, py, pz, tx, ty, tz);
    }
    return 0;
}

// ============================================
// Pixos API: Input
// ============================================

// pixos.is_action_active(action_name) -> boolean
static int l_is_action_active(lua_State* L) {
    const char* action_name = luaL_checkstring(L, 1);
    Engine* engine = get_engine(L);
    
    // Map string to action enum
    ActionType action = ACTION_NONE;
    if (strcmp(action_name, "move_north") == 0 || strcmp(action_name, "up") == 0) {
        action = ACTION_MOVE_UP;
    } else if (strcmp(action_name, "move_south") == 0 || strcmp(action_name, "down") == 0) {
        action = ACTION_MOVE_DOWN;
    } else if (strcmp(action_name, "move_east") == 0 || strcmp(action_name, "right") == 0) {
        action = ACTION_MOVE_RIGHT;
    } else if (strcmp(action_name, "move_west") == 0 || strcmp(action_name, "left") == 0) {
        action = ACTION_MOVE_LEFT;
    } else if (strcmp(action_name, "interact") == 0 || strcmp(action_name, "action") == 0) {
        action = ACTION_INTERACT;
    } else if (strcmp(action_name, "select") == 0) {
        action = ACTION_SELECT;
    } else if (strcmp(action_name, "menu") == 0) {
        action = ACTION_MENU;
    } else if (strcmp(action_name, "run") == 0 || strcmp(action_name, "sprint") == 0) {
        action = ACTION_RUN;
    } else if (strcmp(action_name, "escape") == 0) {
        action = ACTION_ESCAPE;
    }
    
    bool active = false;
    if (engine && engine->input_manager) {
        active = input_manager_is_action_held(engine->input_manager, action);
    }
    lua_pushboolean(L, active);
    return 1;
}

// ============================================
// Pixos API: Audio
// ============================================

#ifdef ENABLE_AUDIO
// pixos.play_bgm(path, loop, fade_in)
static int l_play_bgm(lua_State* L) {
    const char* path = luaL_checkstring(L, 1);
    bool loop = lua_toboolean(L, 2);
    float fade_in = (float)luaL_optnumber(L, 3, 0.0);
    
    Engine* engine = get_engine(L);
    if (engine && engine->audio) {
        audio_manager_play_bgm(engine->audio, path, loop, fade_in);
    }
    return 0;
}

// pixos.stop_bgm(fade_out)
static int l_stop_bgm(lua_State* L) {
    float fade_out = (float)luaL_optnumber(L, 1, 0.0);
    
    Engine* engine = get_engine(L);
    if (engine && engine->audio) {
        audio_manager_stop_bgm(engine->audio, fade_out);
    }
    return 0;
}

// pixos.play_sfx(path, volume)
static int l_play_sfx(lua_State* L) {
    const char* path = luaL_checkstring(L, 1);
    float volume = (float)luaL_optnumber(L, 2, 1.0);
    
    Engine* engine = get_engine(L);
    if (engine && engine->audio) {
        audio_manager_play_sfx(engine->audio, path, volume);
    }
    return 0;
}

// pixos.set_master_volume(volume)
static int l_set_master_volume(lua_State* L) {
    float volume = (float)luaL_checknumber(L, 1);
    
    Engine* engine = get_engine(L);
    if (engine && engine->audio) {
        audio_manager_set_master_volume(engine->audio, volume);
    }
    return 0;
}

// pixos.set_bgm_volume(volume)
static int l_set_bgm_volume(lua_State* L) {
    float volume = (float)luaL_checknumber(L, 1);
    
    Engine* engine = get_engine(L);
    if (engine && engine->audio) {
        audio_manager_set_bgm_volume(engine->audio, volume);
    }
    return 0;
}

// pixos.set_sfx_volume(volume)
static int l_set_sfx_volume(lua_State* L) {
    float volume = (float)luaL_checknumber(L, 1);
    
    Engine* engine = get_engine(L);
    if (engine && engine->audio) {
        audio_manager_set_sfx_volume(engine->audio, volume);
    }
    return 0;
}
#endif // ENABLE_AUDIO

// ============================================
// Pixos API: Sprite/Entity
// ============================================

// pixos.move_sprite(sprite_id, x, y, z, running)
static int l_move_sprite(lua_State* L) {
    const char* sprite_id = luaL_checkstring(L, 1);
    float x = (float)luaL_checknumber(L, 2);
    float y = (float)luaL_checknumber(L, 3);
    float z = (float)luaL_optnumber(L, 4, 0.0);
    bool running = lua_toboolean(L, 5);
    
    Engine* engine = get_engine(L);
    if (engine) {
        // TODO: Implement sprite movement
        printf("[Lua] move_sprite: %s to (%.2f, %.2f, %.2f) running=%d\n", 
               sprite_id, x, y, z, running);
    }
    return 0;
}

// pixos.sprite_dialogue(sprite_id, dialogue_key)
static int l_sprite_dialogue(lua_State* L) {
    const char* sprite_id = luaL_checkstring(L, 1);
    const char* dialogue = luaL_checkstring(L, 2);
    
    Engine* engine = get_engine(L);
    if (engine) {
        // TODO: Implement dialogue system
        printf("[Lua] sprite_dialogue: %s says '%s'\n", sprite_id, dialogue);
    }
    return 0;
}

// ============================================
// Pixos API: Utility
// ============================================

// pixos.wait(seconds)
// Returns a coroutine yield, caller should handle timing
static int l_wait(lua_State* L) {
    float seconds = (float)luaL_checknumber(L, 1);
    
    // Store wait time and yield
    lua_pushnumber(L, seconds);
    return lua_yield(L, 1);
}

// ============================================
// Library Registration
// ============================================

static const luaL_Reg pixos_lib[] = {
    // Game State
    {"log", l_log},
    {"get_flag", l_get_flag},
    {"set_flag", l_set_flag},
    {"has_flag", l_has_flag},
    
    // Zone/World
    {"get_caller", l_get_caller},
    {"get_subject", l_get_subject},
    {"get_zone", l_get_zone},
    
    // Camera
    {"set_camera_position", l_set_camera_position},
    {"look_at", l_look_at},
    
    // Input
    {"is_action_active", l_is_action_active},
    
#ifdef ENABLE_AUDIO
    // Audio
    {"play_bgm", l_play_bgm},
    {"stop_bgm", l_stop_bgm},
    {"play_sfx", l_play_sfx},
    {"set_master_volume", l_set_master_volume},
    {"set_bgm_volume", l_set_bgm_volume},
    {"set_sfx_volume", l_set_sfx_volume},
#endif
    
    // Sprite/Entity
    {"move_sprite", l_move_sprite},
    {"sprite_dialogue", l_sprite_dialogue},
    
    // Utility
    {"wait", l_wait},
    
    {NULL, NULL}
};

// Register the pixos table as a global
static int luaopen_pixos(lua_State* L) {
    luaL_newlib(L, pixos_lib);
    return 1;
}

// ============================================
// Public API Implementation
// ============================================

int lua_manager_init(LuaManager* lm, Engine* engine) {
    if (lm == NULL) {
        return -1;
    }
    
    memset(lm, 0, sizeof(LuaManager));
    
    // Create Lua state
    lm->L = luaL_newstate();
    if (lm->L == NULL) {
        fprintf(stderr, "[Lua] Failed to create Lua state\n");
        return -1;
    }
    
    // Open standard libraries
    luaL_openlibs(lm->L);
    
    // Register pixos library
    luaL_requiref(lm->L, "pixos", luaopen_pixos, 1);
    lua_pop(lm->L, 1);  // Remove lib from stack
    
    // Store engine reference in context
    lm->current_context.engine = engine;
    lm->initialized = true;
    
    // Set global pointer for C callbacks
    g_current_lua_manager = lm;
    
    printf("[Lua] Lua manager initialized (Lua %s)\n", LUA_VERSION);
    return 0;
}

void lua_manager_destroy(LuaManager* lm) {
    if (lm == NULL || !lm->initialized) {
        return;
    }
    
    if (lm->L != NULL) {
        lua_close(lm->L);
        lm->L = NULL;
    }
    
    if (g_current_lua_manager == lm) {
        g_current_lua_manager = NULL;
    }
    
    lm->initialized = false;
    printf("[Lua] Lua manager destroyed\n");
}

int lua_manager_run_file(LuaManager* lm, const char* path, ScriptContext* ctx) {
    if (lm == NULL || !lm->initialized || path == NULL) {
        return -1;
    }
    
    // Update context if provided
    if (ctx != NULL) {
        lm->current_context = *ctx;
    }
    
    // Load and run file
    int result = luaL_dofile(lm->L, path);
    if (result != LUA_OK) {
        const char* error = lua_tostring(lm->L, -1);
        fprintf(stderr, "[Lua] Error in file '%s': %s\n", path, error);
        lua_pop(lm->L, 1);
        return -1;
    }
    
    return 0;
}

int lua_manager_run_string(LuaManager* lm, const char* script, ScriptContext* ctx) {
    if (lm == NULL || !lm->initialized || script == NULL) {
        return -1;
    }
    
    // Update context if provided
    if (ctx != NULL) {
        lm->current_context = *ctx;
    }
    
    // Load and run string
    int result = luaL_dostring(lm->L, script);
    if (result != LUA_OK) {
        const char* error = lua_tostring(lm->L, -1);
        fprintf(stderr, "[Lua] Error in script: %s\n", error);
        lua_pop(lm->L, 1);
        return -1;
    }
    
    return 0;
}

int lua_manager_call_function(LuaManager* lm, const char* func_name, ScriptContext* ctx) {
    if (lm == NULL || !lm->initialized || func_name == NULL) {
        return -1;
    }
    
    // Update context if provided
    if (ctx != NULL) {
        lm->current_context = *ctx;
    }
    
    // Get function from global
    lua_getglobal(lm->L, func_name);
    if (!lua_isfunction(lm->L, -1)) {
        fprintf(stderr, "[Lua] '%s' is not a function\n", func_name);
        lua_pop(lm->L, 1);
        return -1;
    }
    
    // Call function with no arguments, no return values
    int result = lua_pcall(lm->L, 0, 0, 0);
    if (result != LUA_OK) {
        const char* error = lua_tostring(lm->L, -1);
        fprintf(stderr, "[Lua] Error calling '%s': %s\n", func_name, error);
        lua_pop(lm->L, 1);
        return -1;
    }
    
    return 0;
}

void lua_manager_register_function(LuaManager* lm, const char* name, lua_CFunction func) {
    if (lm == NULL || !lm->initialized || name == NULL || func == NULL) {
        return;
    }
    
    lua_pushcfunction(lm->L, func);
    lua_setglobal(lm->L, name);
}

void lua_manager_set_global_int(LuaManager* lm, const char* name, int value) {
    if (lm == NULL || !lm->initialized || name == NULL) {
        return;
    }
    lua_pushinteger(lm->L, value);
    lua_setglobal(lm->L, name);
}

void lua_manager_set_global_number(LuaManager* lm, const char* name, double value) {
    if (lm == NULL || !lm->initialized || name == NULL) {
        return;
    }
    lua_pushnumber(lm->L, value);
    lua_setglobal(lm->L, name);
}

void lua_manager_set_global_string(LuaManager* lm, const char* name, const char* value) {
    if (lm == NULL || !lm->initialized || name == NULL) {
        return;
    }
    if (value == NULL) {
        lua_pushnil(lm->L);
    } else {
        lua_pushstring(lm->L, value);
    }
    lua_setglobal(lm->L, name);
}

void lua_manager_set_global_bool(LuaManager* lm, const char* name, bool value) {
    if (lm == NULL || !lm->initialized || name == NULL) {
        return;
    }
    lua_pushboolean(lm->L, value);
    lua_setglobal(lm->L, name);
}

int lua_manager_get_global_int(LuaManager* lm, const char* name, int default_val) {
    if (lm == NULL || !lm->initialized || name == NULL) {
        return default_val;
    }
    lua_getglobal(lm->L, name);
    if (lua_isinteger(lm->L, -1)) {
        int val = (int)lua_tointeger(lm->L, -1);
        lua_pop(lm->L, 1);
        return val;
    }
    lua_pop(lm->L, 1);
    return default_val;
}

double lua_manager_get_global_number(LuaManager* lm, const char* name, double default_val) {
    if (lm == NULL || !lm->initialized || name == NULL) {
        return default_val;
    }
    lua_getglobal(lm->L, name);
    if (lua_isnumber(lm->L, -1)) {
        double val = lua_tonumber(lm->L, -1);
        lua_pop(lm->L, 1);
        return val;
    }
    lua_pop(lm->L, 1);
    return default_val;
}

const char* lua_manager_get_global_string(LuaManager* lm, const char* name) {
    if (lm == NULL || !lm->initialized || name == NULL) {
        return NULL;
    }
    lua_getglobal(lm->L, name);
    if (lua_isstring(lm->L, -1)) {
        const char* val = lua_tostring(lm->L, -1);
        lua_pop(lm->L, 1);
        return val;
    }
    lua_pop(lm->L, 1);
    return NULL;
}

bool lua_manager_get_global_bool(LuaManager* lm, const char* name, bool default_val) {
    if (lm == NULL || !lm->initialized || name == NULL) {
        return default_val;
    }
    lua_getglobal(lm->L, name);
    if (lua_isboolean(lm->L, -1)) {
        bool val = lua_toboolean(lm->L, -1);
        lua_pop(lm->L, 1);
        return val;
    }
    lua_pop(lm->L, 1);
    return default_val;
}
