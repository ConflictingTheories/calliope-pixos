#!/bin/bash

# Details
declare PWD=$(pwd)
declare BUNDLE="Pixos-$(date +%Y-%m-%d)"

# Source Folder
cd ${PWD}/source/server

# Zip
zip -r ../deployments/${BUNDLE}.zip .
zip ../deployments/${BUNDLE}.zip -d "/node_modules/*" "/bower_components/*" "/.vscode/*" "/dist/*"

# AWS Setup
