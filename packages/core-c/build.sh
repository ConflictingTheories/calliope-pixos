#!/bin/bash

# This script builds the project using CMake.

# Stop on first error
set -e

# Get the directory where the script is located
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# The directory where CMakeLists.txt is located
PROJECT_DIR=$SCRIPT_DIR

# The directory where the build will happen
BUILD_DIR="$PROJECT_DIR/build"

# Create a build directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Navigate into the build directory
cd "$BUILD_DIR"

# Configure the project with CMake
# The argument points CMake to the directory containing CMakeLists.txt
cmake "$PROJECT_DIR"

# Compile the project using the generated Makefile
make