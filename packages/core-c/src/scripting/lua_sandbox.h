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

#ifndef LUA_SANDBOX_H
#define LUA_SANDBOX_H

#include <stdbool.h>
#include "../vendor/lua-5.4/lua.h"

/**
 * Lua Sandbox - Restricts Lua environment for untrusted scripts.
 *
 * Sandbox-by-default policy (matches JS ScriptBoundary):
 * - Removes: os.execute, os.remove, os.rename, io.open, io.popen,
 *            load, loadfile, dofile, require (unrestricted)
 * - Keeps: print (redirected), math, string, table (safe subset)
 * - Exposes: pixos.* API (game functions only)
 */

// Apply sandbox to a Lua state (removes dangerous functions)
void lua_sandbox_apply(lua_State* L);

// Check if a function name is allowed in sandbox
bool lua_sandbox_is_allowed(const char* func_name);

// Create a sandboxed Lua state (new state + sandbox applied)
lua_State* lua_sandbox_new(void);

#endif // LUA_SANDBOX_H
