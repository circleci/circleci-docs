#!/bin/bash

# Test script for API docs integration setup
set -e

echo "🧪 Testing API Documentation Integration Setup"
echo "=============================================="

# Check if required files exist
echo "📋 Checking required files..."
required_files=("api-spec.yaml" "redocly.yaml" "gulp.d/tasks/build-api-docs.js")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

# Check if dependencies are installed
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Node modules installed"
else
    echo "⚠️  Node modules not found. Running npm install..."
    npm install
fi

# Validate API spec
echo ""
echo "🔍 Validating API specification..."
if npx @redocly/cli lint api-spec.yaml; then
    echo "✅ API specification is valid"
else
    echo "❌ API specification has issues"
    exit 1
fi

# Test build process
echo ""
echo "🔧 Testing build process..."
echo "Building UI..."
npm run build:ui

echo ""
echo "Building API docs..."
npm run build:api-docs

# Check if API docs were generated
if [ -f "build/api/index.html" ]; then
    echo "✅ API docs generated successfully"
    echo "📄 API docs location: build/api/index.html"
    file_size=$(stat -f%z "build/api/index.html" 2>/dev/null || stat -c%s "build/api/index.html" 2>/dev/null)
    echo "📊 File size: ${file_size} bytes"
else
    echo "❌ API docs not generated"
    exit 1
fi

echo ""
echo "🎉 Setup test completed successfully!"
echo "📖 Next steps:"
echo "   1. Replace api-spec.yaml with your actual API specification"
echo "   2. Customize redocly.yaml for your branding"
echo "   3. Run 'npm run build:docs' to build the complete site"
echo "   4. Run 'npm run start:dev' to preview locally"
echo ""
echo "🔗 Your API docs will be available at: <your-site>/api/"