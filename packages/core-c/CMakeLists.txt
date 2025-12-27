cmake_minimum_required(VERSION 3.10)
project(PixosEngineC VERSION 1.0.0 LANGUAGES C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Set architecture for ARM64 (Apple Silicon)
if(APPLE)
    set(CMAKE_OSX_ARCHITECTURES "arm64")
endif()

# Find packages
find_package(OpenGL REQUIRED)

# Use pkg-config for GLFW on macOS ARM64
find_package(PkgConfig REQUIRED)
pkg_check_modules(GLFW3 REQUIRED glfw3)

# Include directories
include_directories(${OPENGL_INCLUDE_DIRS} ${GLFW3_INCLUDE_DIRS})

# Source files
set(SOURCES
    src/main.c
    src/engine.c
    src/render_manager.c
    src/input_manager.c
)

# Executable
add_executable(pixos_engine ${SOURCES})

# Link libraries
target_link_libraries(pixos_engine ${OPENGL_LIBRARIES} ${GLFW3_LIBRARIES})

# Compiler flags
if(MSVC)
    target_compile_options(pixos_engine PRIVATE /W4)
else()
    target_compile_options(pixos_engine PRIVATE -Wall -Wextra -pedantic)
endif()

# For cross-platform compatibility, especially for Rockchip (Linux ARM)
if(UNIX AND NOT APPLE)
    # Linux specific
    target_compile_definitions(pixos_engine PRIVATE PLATFORM_LINUX)
elseif(APPLE)
    # macOS specific
    target_compile_definitions(pixos_engine PRIVATE PLATFORM_MACOS)
endif()
