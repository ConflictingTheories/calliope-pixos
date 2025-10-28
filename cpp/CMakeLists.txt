cmake_minimum_required(VERSION 3.10)
project(DisgaeaOpenGL)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}")

# Find packages
find_package(OpenGL REQUIRED)
find_package(PkgConfig REQUIRED)
pkg_check_modules(GLFW3 REQUIRED glfw3)
pkg_check_modules(GLEW REQUIRED glew)

# Include directories
include_directories(${OPENGL_INCLUDE_DIRS} ${GLFW3_INCLUDE_DIRS} ${GLEW_INCLUDE_DIRS} include)

# Source files
file(GLOB SOURCES "src/*.cpp")

# Executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Link libraries
target_link_libraries(${PROJECT_NAME} ${OPENGL_LIBRARIES} ${GLFW3_LIBRARIES} ${GLEW_LIBRARIES} m)

# Copy shaders to build directory
configure_file(shaders/vertex.glsl ${CMAKE_BINARY_DIR}/shaders/vertex.glsl COPYONLY)
configure_file(shaders/fragment.glsl ${CMAKE_BINARY_DIR}/shaders/fragment.glsl COPYONLY)
