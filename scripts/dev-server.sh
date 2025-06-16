#!/bin/bash

echo "Starting CircleCI Docs development server..."

# Build the UI bundle
echo "Building UI bundle..."
npm run build:ui

# Build the documentation site (without Algolia extension to avoid credential issues)
echo "Building documentation..."
npx antora antora-playbook.yml --extension ./extensions/page-metadata-extension.js

# Start the development server
echo "Starting development server on http://localhost:3000..."
echo "Press Ctrl+C to stop the server"
cd build && python3 -m http.server 3000 