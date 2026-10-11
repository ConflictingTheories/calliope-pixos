/*
 * P6-08 — Native conformance: script (Lua binding) execution.
 *
 * DOCUMENTED TOLERANCE: the native runtime embeds Lua 5.4 while the JS
 * runtime executes pixoscript (a Lua-inspired language, not Lua). These
 * cases therefore pin *binding* behavior — the VM initializes, scripts run,
 * results cross the C/Lua boundary, and errors are reported — not
 * language-level parity with pixoscript. Script *semantics* conformance
 * across runtimes is explicitly out of scope for v1 (see ADR 0005).
 *
 * Build: via CTest (tests/CMakeLists.txt), links the vendored Lua 5.4
 * sources. Returns 0 on success.
 */
#include <stdio.h>
#include <string.h>
#include "lua.h"
#include "lauxlib.h"
#include "lualib.h"

static int failures = 0;
static int checks = 0;

#define CHECK(cond) do { \
    checks++; \
    if (!(cond)) { failures++; printf("FAIL %s:%d: %s\n", __FILE__, __LINE__, #cond); } \
} while (0)

static lua_State *new_vm(void) {
    lua_State *L = luaL_newstate();
    if (L) luaL_openlibs(L);
    return L;
}

static void test_arithmetic_result_crosses_boundary(void) {
    lua_State *L = new_vm();
    CHECK(L != NULL);
    /* Mirrors the JS script-boundary benign fixture shape: compute, return. */
    int rc = luaL_dostring(L, "result = (1 + 2) * 10");
    CHECK(rc == LUA_OK);
    lua_getglobal(L, "result");
    CHECK(lua_isinteger(L, -1) && lua_tointeger(L, -1) == 30);
    lua_close(L);
}

static void test_table_state_roundtrip(void) {
    lua_State *L = new_vm();
    int rc = luaL_dostring(L,
        "save = { hp = 87, zone = 'zone-1' }\n"
        "save.hp = save.hp - 12");
    CHECK(rc == LUA_OK);
    lua_getglobal(L, "save");
    CHECK(lua_istable(L, -1));
    lua_getfield(L, -1, "hp");
    CHECK(lua_tointeger(L, -1) == 75);
    lua_pop(L, 1);
    lua_getfield(L, -1, "zone");
    CHECK(strcmp(lua_tostring(L, -1), "zone-1") == 0);
    lua_close(L);
}

static void test_syntax_error_reported_not_fatal(void) {
    lua_State *L = new_vm();
    int rc = luaL_dostring(L, "this is not valid lua {{{");
    CHECK(rc != LUA_OK);
    /* Error message left on the stack; VM still usable afterwards. */
    CHECK(lua_isstring(L, -1));
    lua_pop(L, 1);
    rc = luaL_dostring(L, "ok = true");
    CHECK(rc == LUA_OK);
    lua_getglobal(L, "ok");
    CHECK(lua_toboolean(L, -1));
    lua_close(L);
}

static void test_runtime_error_reported(void) {
    lua_State *L = new_vm();
    /* Calling nil: deterministic runtime error, must not crash the host. */
    int rc = luaL_dostring(L, "nil_fn()");
    CHECK(rc != LUA_OK);
    lua_close(L);
}

static void test_sandbox_flags_visible(void) {
    /* The C boundary exposes the same default-deny posture as the JS
     * ScriptBoundary: dangerous stdlib surface is what the host chooses
     * to open. Here we pin that `os` date functions exist iff the host
     * opened the os lib (luaL_openlibs opens all) — the *policy* of which
     * libs a published script receives lives in script-policy.js. */
    lua_State *L = new_vm();
    lua_getglobal(L, "os");
    CHECK(lua_istable(L, -1)); /* openlibs present in this harness */
    lua_close(L);
}

int main(void) {
    test_arithmetic_result_crosses_boundary();
    test_table_state_roundtrip();
    test_syntax_error_reported_not_fatal();
    test_runtime_error_reported();
    test_sandbox_flags_visible();
    printf("script_conformance: %d checks, %d failures\n", checks, failures);
    return failures ? 1 : 0;
}
