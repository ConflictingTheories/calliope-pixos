
cmake_minimum_required(VERSION 3.16)
project(PixospritzOpenGL)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)


# Ensure OpenGL is included before GLEW
find_package(OpenGL REQUIRED)
include_directories(${OPENGL_INCLUDE_DIR} BEFORE)

# Add nlohmann/json
include(FetchContent)
set(CMAKE_POLICY_DEFAULT_CMP0135 NEW)
set(CMAKE_POLICY_VERSION_MINIMUM 3.5)
FetchContent_Declare(
  nlohmann_json
  GIT_REPOSITORY https://github.com/nlohmann/json.git
  GIT_TAG v3.11.2
)
FetchContent_MakeAvailable(nlohmann_json)

# Link directories
link_directories(/opt/homebrew/lib)

# Include directories
include_directories(
  include
  imgui
  imgui/backends
  /opt/homebrew/include
  /usr/local/include
  /opt/homebrew/opt/glfw/include
  /opt/homebrew/opt/glew/include
  /opt/homebrew/opt/sdl2/include
  /opt/homebrew/opt/lua/include
  /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include
  ${GLEW_INCLUDE_DIRS}
  ${OPENGL_INCLUDE_DIRS}
  ${GLFW3_INCLUDE_DIRS}
  ${SDL2_INCLUDE_DIRS}
  ${LUA_INCLUDE_DIRS}
)

# Source files
file(GLOB SOURCES "src/*.cpp" "src/*.h")

# ImGui sources
set(IMGUI_SOURCES
    imgui/imgui.cpp
    imgui/imgui_draw.cpp
    imgui/imgui_tables.cpp
    imgui/imgui_widgets.cpp
    imgui/imgui_impl_glfw.cpp
    imgui/imgui_impl_opengl3.cpp
)




# Executable
add_executable(${PROJECT_NAME} ${SOURCES} ${IMGUI_SOURCES})


# Link libraries after target is created
target_link_libraries(${PROJECT_NAME} PRIVATE
  ${OPENGL_LIBRARIES}
  ${GLEW_LIBRARIES}
  ${GLFW3_LIBRARIES}
  ${SDL2_LIBRARIES}
  ${LUA_LIBRARIES}
  nlohmann_json::nlohmann_json
  "-framework Cocoa"
  "-framework IOKit"
  "-framework CoreFoundation"
  m
)

# ImGui include directories
target_include_directories(${PROJECT_NAME} PRIVATE imgui imgui/backends)

# ImGui backend sources
target_sources(${PROJECT_NAME} PRIVATE
  imgui/imgui_impl_glfw.cpp
  imgui/imgui_impl_opengl3.cpp
  imgui/imgui.cpp
  imgui/imgui_draw.cpp
  imgui/imgui_tables.cpp
  imgui/imgui_widgets.cpp
)

# Copy shaders to build directory
configure_file(shaders/vertex.glsl ${CMAKE_BINARY_DIR}/vertex.glsl COPYONLY)
configure_file(shaders/fragment.glsl ${CMAKE_BINARY_DIR}/fragment.glsl COPYONLY)
configure_file(shaders/picker_vertex.glsl ${CMAKE_BINARY_DIR}/picker_vertex.glsl COPYONLY)
configure_file(shaders/picker_fragment.glsl ${CMAKE_BINARY_DIR}/picker_fragment.glsl COPYONLY)
configure_file(shaders/skybox_vertex.glsl ${CMAKE_BINARY_DIR}/skybox_vertex.glsl COPYONLY)
configure_file(shaders/skybox_fragment.glsl ${CMAKE_BINARY_DIR}/skybox_fragment.glsl COPYONLY)
