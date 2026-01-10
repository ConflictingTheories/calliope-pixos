cmake_minimum_required(VERSION 3.10)
project(PixosEngineC VERSION 1.0.0 LANGUAGES C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# ============================================
# Platform Detection and Configuration
# ============================================

option(PLATFORM_ARM_LINUX "Build for ARM Linux (RG353V, etc.)" OFF)
option(USE_GLES3 "Use OpenGL ES 3.0 instead of 2.0" OFF)
option(NETWORK_SUPPORT "Enable optional network support" ON)
option(ENABLE_AUDIO "Enable audio support via miniaudio" ON)
option(ENABLE_LUA "Enable Lua scripting support" ON)

# Determine platform
# Note: PLATFORM_ARM_LINUX must be explicitly set for cross-compilation
# Apple Silicon is NOT treated as ARM Linux
if(PLATFORM_ARM_LINUX)
    set(BUILD_ARM TRUE)
    add_definitions(-DPLATFORM_ARM_LINUX)
    add_definitions(-DUSE_GLES)
    add_definitions(-DUSE_EGL_GBM)
    if(USE_GLES3)
        add_definitions(-DUSE_GLES3)
    endif()
    message(STATUS "Building for ARM Linux with OpenGL ES")
elseif(APPLE)
    set(BUILD_DESKTOP TRUE)
    set(CMAKE_OSX_ARCHITECTURES "arm64")
    add_definitions(-DPLATFORM_MACOS -DGL_SILENCE_DEPRECATION)
    add_definitions(-DUSE_DESKTOP_GL -DUSE_GLFW)
    message(STATUS "Building for macOS with desktop OpenGL")
elseif(UNIX)
    set(BUILD_DESKTOP TRUE)
    add_definitions(-DPLATFORM_LINUX)
    add_definitions(-DUSE_DESKTOP_GL -DUSE_GLFW)
    message(STATUS "Building for Linux with desktop OpenGL")
elseif(WIN32)
    set(BUILD_DESKTOP TRUE)
    add_definitions(-DPLATFORM_WINDOWS)
    add_definitions(-DUSE_DESKTOP_GL -DUSE_GLFW)
    message(STATUS "Building for Windows with desktop OpenGL")
endif()

# Network support
if(NETWORK_SUPPORT)
    add_definitions(-DNETWORK_SUPPORT)
    message(STATUS "Network support enabled")
else()
    message(STATUS "Network support disabled")
endif()

# Audio support
if(ENABLE_AUDIO)
    add_definitions(-DENABLE_AUDIO)
    message(STATUS "Audio support enabled (miniaudio)")
else()
    message(STATUS "Audio support disabled")
endif()

# Lua scripting support
if(ENABLE_LUA)
    add_definitions(-DENABLE_LUA)
    message(STATUS "Lua scripting enabled")
else()
    message(STATUS "Lua scripting disabled")
endif()

# ============================================
# Find Dependencies
# ============================================

if(BUILD_ARM)
    # ARM Linux: Use EGL + GLES + GBM + DRM
    find_package(PkgConfig REQUIRED)
    
    # Try to find libraries via pkg-config
    pkg_check_modules(EGL REQUIRED egl)
    pkg_check_modules(GLES2 REQUIRED glesv2)
    pkg_check_modules(GBM REQUIRED gbm)
    pkg_check_modules(DRM REQUIRED libdrm)
    
    set(GRAPHICS_INCLUDE_DIRS
        ${EGL_INCLUDE_DIRS}
        ${GLES2_INCLUDE_DIRS}
        ${GBM_INCLUDE_DIRS}
        ${DRM_INCLUDE_DIRS}
    )
    set(GRAPHICS_LIBRARIES
        ${EGL_LIBRARIES}
        ${GLES2_LIBRARIES}
        ${GBM_LIBRARIES}
        ${DRM_LIBRARIES}
    )
    set(GRAPHICS_LIBRARY_DIRS
        ${EGL_LIBRARY_DIRS}
        ${GLES2_LIBRARY_DIRS}
        ${GBM_LIBRARY_DIRS}
        ${DRM_LIBRARY_DIRS}
    )
else()
    # Desktop: Use GLFW + GLEW + OpenGL
    find_package(OpenGL REQUIRED)
    find_package(GLEW REQUIRED)
    find_package(PkgConfig REQUIRED)
    pkg_check_modules(GLFW3 REQUIRED glfw3)
    
    set(GRAPHICS_INCLUDE_DIRS
        ${OPENGL_INCLUDE_DIRS}
        ${GLEW_INCLUDE_DIRS}
        ${GLFW3_INCLUDE_DIRS}
    )
    set(GRAPHICS_LIBRARIES
        ${OPENGL_LIBRARIES}
        GLEW::GLEW
        ${GLFW3_LIBRARIES}
    )
    set(GRAPHICS_LIBRARY_DIRS
        ${GLFW3_LIBRARY_DIRS}
    )
endif()

# Math library (needed on Linux)
if(UNIX AND NOT APPLE)
    list(APPEND GRAPHICS_LIBRARIES m)
endif()

# ============================================
# Include Directories
# ============================================

include_directories(
    ${GRAPHICS_INCLUDE_DIRS}
    src
    src/audio
    src/cutscene
    src/generated
    src/hud
    src/input
    src/math
    src/platform
    src/rendering
    src/resource
    src/scene
    src/scripting
    src/vendor
    src/vendor/lua-5.4
)
link_directories(${GRAPHICS_LIBRARY_DIRS})

# ============================================
# Source Files
# ============================================

set(CORE_SOURCES
    src/engine.c
    src/render_manager.c
    src/input_manager.c
    src/camera.c
    src/game_loader.c
    src/cutscene/cutscene_manager.c
    src/hud/hud_manager.c
    src/input/input_actions.c
    src/math/vector.c
    src/math/matrix4.c
    src/rendering/shader.c
    src/rendering/light_manager.c
    src/resource/texture.c
    src/resource/resource_manager.c
    src/resource/json_loader.c
    src/resource/archive_loader.c
    src/scene/tileset.c
    src/scene/sprite.c
    src/scene/zone.c
    src/scene/world.c
    src/vendor/cJSON.c
    src/vendor/miniz.c
    src/vendor/miniz_tdef.c
    src/vendor/miniz_tinfl.c
    src/vendor/miniz_zip.c
)

# Audio sources (miniaudio)
if(ENABLE_AUDIO)
    list(APPEND CORE_SOURCES src/audio/audio_manager.c)
endif()

# Lua scripting sources
if(ENABLE_LUA)
    list(APPEND CORE_SOURCES
        src/scripting/lua_manager.c
        # Lua 5.4 core sources
        src/vendor/lua-5.4/lapi.c
        src/vendor/lua-5.4/lauxlib.c
        src/vendor/lua-5.4/lbaselib.c
        src/vendor/lua-5.4/lcode.c
        src/vendor/lua-5.4/lcorolib.c
        src/vendor/lua-5.4/lctype.c
        src/vendor/lua-5.4/ldblib.c
        src/vendor/lua-5.4/ldebug.c
        src/vendor/lua-5.4/ldo.c
        src/vendor/lua-5.4/ldump.c
        src/vendor/lua-5.4/lfunc.c
        src/vendor/lua-5.4/lgc.c
        src/vendor/lua-5.4/linit.c
        src/vendor/lua-5.4/liolib.c
        src/vendor/lua-5.4/llex.c
        src/vendor/lua-5.4/lmathlib.c
        src/vendor/lua-5.4/lmem.c
        src/vendor/lua-5.4/loadlib.c
        src/vendor/lua-5.4/lobject.c
        src/vendor/lua-5.4/lopcodes.c
        src/vendor/lua-5.4/loslib.c
        src/vendor/lua-5.4/lparser.c
        src/vendor/lua-5.4/lstate.c
        src/vendor/lua-5.4/lstring.c
        src/vendor/lua-5.4/lstrlib.c
        src/vendor/lua-5.4/ltable.c
        src/vendor/lua-5.4/ltablib.c
        src/vendor/lua-5.4/ltm.c
        src/vendor/lua-5.4/lundump.c
        src/vendor/lua-5.4/lutf8lib.c
        src/vendor/lua-5.4/lvm.c
        src/vendor/lua-5.4/lzio.c
    )
endif()

# Platform-specific sources
if(BUILD_ARM)
    list(APPEND CORE_SOURCES src/platform/platform_arm.c)
else()
    list(APPEND CORE_SOURCES src/platform/platform_desktop.c)
endif()

# Main executable
set(SOURCES
    src/main.c
    ${CORE_SOURCES}
)

# ============================================
# Executable
# ============================================

add_executable(pixos_engine ${SOURCES})
target_link_libraries(pixos_engine ${GRAPHICS_LIBRARIES})

# ============================================
# Compiler Flags
# ============================================

if(MSVC)
    target_compile_options(pixos_engine PRIVATE /W4)
else()
    target_compile_options(pixos_engine PRIVATE -Wall -Wextra -pedantic)
    
    # Optimization for release builds
    if(CMAKE_BUILD_TYPE STREQUAL "Release")
        target_compile_options(pixos_engine PRIVATE -O2)
    endif()
    
    # ARM-specific optimizations
    if(BUILD_ARM)
        target_compile_options(pixos_engine PRIVATE 
            -march=armv8-a
            -mtune=cortex-a55
        )
    endif()
endif()

# ============================================
# Installation
# ============================================

install(TARGETS pixos_engine DESTINATION bin)

# Copy assets to build directory
if(EXISTS ${CMAKE_SOURCE_DIR}/assets)
    file(COPY ${CMAKE_SOURCE_DIR}/assets DESTINATION ${CMAKE_BINARY_DIR})
endif()

# ============================================
# Print Configuration Summary
# ============================================

message(STATUS "")
message(STATUS "=== Pixos Engine C Build Configuration ===")
message(STATUS "Platform: ${CMAKE_SYSTEM_NAME} ${CMAKE_SYSTEM_PROCESSOR}")
message(STATUS "Build Type: ${CMAKE_BUILD_TYPE}")
message(STATUS "ARM Build: ${BUILD_ARM}")
message(STATUS "OpenGL ES 3.0: ${USE_GLES3}")
message(STATUS "Network Support: ${NETWORK_SUPPORT}")
message(STATUS "")
