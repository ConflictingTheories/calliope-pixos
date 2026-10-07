# P6-07 — Native conformance tests (CTest).
# Scope is provisional pending P6-06; math cases are scope-independent.

add_executable(test_math_conformance
    test_math_conformance.c
    ../src/math/vector.c
    ../src/math/matrix4.c
    ../src/math/frustum.c
)
target_include_directories(test_math_conformance PRIVATE ../src)
target_link_libraries(test_math_conformance PRIVATE m)

add_test(NAME math_conformance COMMAND test_math_conformance)
