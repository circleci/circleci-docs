#!/bin/bash
set -e

# Define paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
UI_DIR="$PROJECT_ROOT/ui"
UI_BUNDLE="$PROJECT_ROOT/ui-bundle.zip"

# Create build directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/build"

# Check if ui-bundle.zip already exists
if [ -f "$UI_BUNDLE" ]; then
    echo "UI bundle already exists at $UI_BUNDLE. Skipping build."
    exit 0
fi

echo "UI bundle not found. Building from source..."

# Check if ui directory exists and not empty
if [ ! -d "$UI_DIR" ] || [ -z "$(ls -A "$UI_DIR")" ]; then
    echo "UI submodule not found. Initializing and updating submodules..."
    git submodule init
    git submodule update --remote --checkout
fi

# Enter UI directory and build
cd "$UI_DIR"

# Install dependencies
echo "Installing npm dependencies in UI module..."
npm ci

# Run gulp bundle
echo "Building UI bundle..."
npx gulp bundle

# Copy the bundle file to the project root
echo "Copying UI bundle to project root..."
if [ -f "$UI_DIR/build/ui-bundle.zip" ]; then
    cp "$UI_DIR/build/ui-bundle.zip" "$UI_BUNDLE"
    echo "UI bundle successfully created at $UI_BUNDLE"
else
    echo "Error: UI bundle was not created at $UI_DIR/build/ui-bundle.zip"
    exit 1
fi