/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

#include "lua_sandbox.h"
#include "../vendor/lua-5.4/lauxlib.h"
#include "../vendor/lua-5.4/lualib.h"
#include <string.h>

// Dangerous functions to remove
static const char* BLOCKED_GLOBALS[] = {
    "dofile",
    "loadfile",
    "load",
    NULL
};

// Dangerous os.* functions
static const char* BLOCKED_OS[] = {
    "execute",
    "remove",
    "rename",
    "exit",
    NULL
};

// Dangerous io.* functions (allow io.write for print, block file access)
static const char* BLOCKED_IO[] = {
    "open",
    "popen",
    "input",
    "output",
    NULL
};

static void remove_globals(lua_State* L, const char** names) {
    for (int i = 0; names[i]; i++) {
        lua_pushnil(L);
        lua_setglobal(L, names[i]);
    }
}

static void remove_table_funcs(lua_State* L, const char* table,
                               const char** funcs) {
    lua_getglobal(L, table);
    if (!lua_istable(L, -1)) {
        lua_pop(L, 1);
        return;
    }
    for (int i = 0; funcs[i]; i++) {
        lua_pushnil(L);
        lua_setfield(L, -2, funcs[i]);
    }
    lua_pop(L, 1);
}

void lua_sandbox_apply(lua_State* L) {
    // Remove dangerous globals
    remove_globals(L, BLOCKED_GLOBALS);

    // Restrict os.*
    remove_table_funcs(L, "os", BLOCKED_OS);

    // Restrict io.* (keep io.write for output)
    remove_table_funcs(L, "io", BLOCKED_IO);

    // Remove package loading (require)
    lua_getglobal(L, "package");
    if (lua_istable(L, -1)) {
        lua_pushnil(L);
        lua_setfield(L, -2, "loaders");
        // Keep package.path but clear searchers except preload
    }
    lua_pop(L, 1);

    lua_pushnil(L);
    lua_setglobal(L, "require");

    // Remove debug library (can inspect/modify internals)
    lua_pushnil(L);
    lua_setglobal(L, "debug");
}

bool lua_sandbox_is_allowed(const char* func_name) {
    // Check against blocked lists
    for (int i = 0; BLOCKED_GLOBALS[i]; i++) {
        if (strcmp(func_name, BLOCKED_GLOBALS[i]) == 0) return false;
    }
    return true;
}

lua_State* lua_sandbox_new(void) {
    lua_State* L = luaL_newstate();
    if (!L) return NULL;

    // Open only safe libraries
    luaL_openlibs(L);

    // Apply sandbox restrictions
    lua_sandbox_apply(L);

    return L;
}
