# CMake Toolchain File for Anbernic RG353V (Rockchip RK3566)
# Cross-compilation from x86_64 to aarch64 ARM

set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR aarch64)

# Toolchain paths - adjust these to your buildroot/cross-compiler location
# Option 1: Use buildroot toolchain
if(EXISTS "$ENV{BUILDROOT_PATH}/output/host/bin/aarch64-buildroot-linux-gnu-gcc")
    set(TOOLCHAIN_PREFIX "$ENV{BUILDROOT_PATH}/output/host/bin/aarch64-buildroot-linux-gnu-")
# Option 2: Use system aarch64 cross-compiler
elseif(EXISTS "/usr/bin/aarch64-linux-gnu-gcc")
    set(TOOLCHAIN_PREFIX "/usr/bin/aarch64-linux-gnu-")
# Option 3: Custom path via environment variable
elseif(DEFINED ENV{ARM_TOOLCHAIN_PREFIX})
    set(TOOLCHAIN_PREFIX "$ENV{ARM_TOOLCHAIN_PREFIX}")
else()
    message(FATAL_ERROR "No ARM cross-compiler found. Set BUILDROOT_PATH or ARM_TOOLCHAIN_PREFIX environment variable.")
endif()

# Cross-compilers
set(CMAKE_C_COMPILER "${TOOLCHAIN_PREFIX}gcc")
set(CMAKE_CXX_COMPILER "${TOOLCHAIN_PREFIX}g++")
set(CMAKE_AR "${TOOLCHAIN_PREFIX}ar")
set(CMAKE_RANLIB "${TOOLCHAIN_PREFIX}ranlib")
set(CMAKE_STRIP "${TOOLCHAIN_PREFIX}strip")

# Target sysroot (for finding libraries)
if(DEFINED ENV{ARM_SYSROOT})
    set(CMAKE_SYSROOT "$ENV{ARM_SYSROOT}")
elseif(EXISTS "$ENV{BUILDROOT_PATH}/output/target")
    set(CMAKE_SYSROOT "$ENV{BUILDROOT_PATH}/output/target")
endif()

# Search paths
set(CMAKE_FIND_ROOT_PATH ${CMAKE_SYSROOT} /usr/aarch64-linux-gnu /usr/lib/aarch64-linux-gnu)
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

# Platform definitions
set(PLATFORM_ARM_LINUX ON)
add_definitions(-DPLATFORM_ARM_LINUX)

# RK3566 / Cortex-A55 specific optimizations
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -march=armv8-a -mtune=cortex-a55")
set(CMAKE_C_FLAGS_RELEASE "-O2 -DNDEBUG")

# Mali G52 GPU - use GLES
set(USE_GLES ON)
add_definitions(-DUSE_GLES -DUSE_EGL_GBM)

# Package config path for cross-compilation
# Ubuntu's multiarch puts arm64 libs in /usr/lib/aarch64-linux-gnu
if(CMAKE_SYSROOT)
    set(ENV{PKG_CONFIG_PATH} "${CMAKE_SYSROOT}/usr/lib/pkgconfig:${CMAKE_SYSROOT}/usr/share/pkgconfig")
    set(ENV{PKG_CONFIG_SYSROOT_DIR} "${CMAKE_SYSROOT}")
else()
    # Docker Ubuntu multiarch setup
    set(ENV{PKG_CONFIG_PATH} "/usr/lib/aarch64-linux-gnu/pkgconfig")
    set(ENV{PKG_CONFIG_LIBDIR} "/usr/lib/aarch64-linux-gnu/pkgconfig")
endif()

# Include paths for ARM64 headers
include_directories(/usr/include/aarch64-linux-gnu)
link_directories(/usr/lib/aarch64-linux-gnu)

message(STATUS "=== ARM Cross-Compilation Toolchain ===")
message(STATUS "Target: aarch64 (RG353V / RK3566 / Cortex-A55)")
message(STATUS "Compiler: ${CMAKE_C_COMPILER}")
message(STATUS "Sysroot: ${CMAKE_SYSROOT}")
message(STATUS "")
