# P6-07 / P6-08 — Native conformance tests (CTest).
#
# Scope decided (ADR 0005, P6-06): the native runtime is maintained for the
# initial major version. The conformance subset pins math, package
# manifest/load, script (Lua binding), and save behavior against the JS
# implementation's golden fixtures. Math cases are scope-independent (pure
# functions, no GL context). Manifest/save/script cases use only vendored
# sources (cJSON, Lua 5.4) — no GL context required.

# --- math (P6-07) ---
add_executable(test_math_conformance
    test_math_conformance.c
    ../src/math/vector.c
    ../src/math/matrix4.c
    ../src/math/frustum.c
)
target_include_directories(test_math_conformance PRIVATE ../src)
target_link_libraries(test_math_conformance PRIVATE m)
add_test(NAME math_conformance COMMAND test_math_conformance)

# --- manifest/load (P6-08) ---
add_executable(test_manifest_conformance
    test_manifest_conformance.c
    ../src/vendor/cJSON.c
)
target_include_directories(test_manifest_conformance PRIVATE ../src)
add_test(NAME manifest_conformance COMMAND test_manifest_conformance)

# --- save roundtrip (P6-08) ---
add_executable(test_save_conformance
    test_save_conformance.c
    ../src/vendor/cJSON.c
)
target_include_directories(test_save_conformance PRIVATE ../src)
add_test(NAME save_conformance COMMAND test_save_conformance)

# --- script / Lua binding (P6-08) ---
# Vendored Lua 5.4 sources (mirrors the top-level ENABLE_LUA list).
# NOTE: lua.c and luac.c are the standalone interpreter/compiler mains and
# must be excluded from test executables.
file(GLOB LUA_SOURCES ../src/vendor/lua-5.4/*.c)
list(REMOVE_ITEM LUA_SOURCES
  "${CMAKE_CURRENT_SOURCE_DIR}/../src/vendor/lua-5.4/lua.c"
  "${CMAKE_CURRENT_SOURCE_DIR}/../src/vendor/lua-5.4/luac.c")
add_executable(test_script_conformance
    test_script_conformance.c
    ${LUA_SOURCES}
)
target_include_directories(test_script_conformance PRIVATE ../src ../src/vendor/lua-5.4)
target_link_libraries(test_script_conformance PRIVATE m)
add_test(NAME script_conformance COMMAND test_script_conformance)
