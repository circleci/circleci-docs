/**
 * API Documentation Build Task
 *
 * This file builds both API v1 and v2 documentation and integrates them with the Antora site.
 *
 * OVERVIEW:
 * - API v1: Copies static documentation from api-v1/ directory
 * - API v2: Fetches live CircleCI API, applies patches, and builds with Redocly
 *
 * OUTPUT STRUCTURE:
 * build/
 * └── api/
 *     ├── v1/           # Static API v1 docs + assets (fonts, images, etc.)
 *     └── v2/           # Generated API v2 docs from CircleCI API
 *         └── index.html
 *
 * INTEGRATION:
 * - Called after Antora build completes (see gulp.d/tasks/build-site.js)
 * - Accessible via header dropdown and Antora navigation links
 * - URLs: /api/v1/ and /api/v2/
 */

'use strict'
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

/**
 * Main entry point for API docs build
 *
 * Creates directory structure and orchestrates both v1 and v2 builds.
 * V1 is built first (quick), then v2 (slower due to network calls).
 */
module.exports = function buildApiDocs(cb) {
  console.log('Starting API docs build for v1 and v2...')

  // Create the api directories if they don't exist
  // These will contain the final output served by the web server
  const apiV1Dir = path.join('build', 'api', 'v1')
  const apiV2Dir = path.join('build', 'api', 'v2')

  if (!fs.existsSync(apiV1Dir)) {
    fs.mkdirSync(apiV1Dir, { recursive: true })
  }
  if (!fs.existsSync(apiV2Dir)) {
    fs.mkdirSync(apiV2Dir, { recursive: true })
  }

  // Build in sequence: v1 first (fast), then v2 (slower)
  // This ensures users get v1 docs quickly even if v2 build fails
  buildApiV1(() => {
    buildApiV2(cb)
  })
}

/**
 * Build API v1 Documentation
 *
 * STRATEGY: Simple file copying from source directory
 *
 * INPUT: api-v1/ directory containing:
 *   - index.html (main documentation)
 *   - fonts/, images/, includes/, javascripts/, stylesheets/ (assets)
 *
 * OUTPUT: build/api/v1/ with identical structure
 *
 * WHY: v1 docs are static and complete, no processing needed
 */
function buildApiV1(callback) {
  console.log('Building API v1 documentation from api-v1/ directory...')

  // Check if source directory exists
  // If missing, skip v1 build but continue with v2
  if (!fs.existsSync('api-v1')) {
    console.warn('⚠️  api-v1 directory not found, skipping v1 build')
    return callback()
  }

  // Copy entire directory structure recursively
  // This preserves all assets (fonts, images, CSS, JS) needed for the static site
  console.log('📁 Copying API v1 files to build/api/v1/...')
  exec('cp -r api-v1/* build/api/v1/', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Failed to copy API v1 files:', err)
      return callback(err)
    }

    console.log('✅ API v1 docs copied successfully')

    // Log what was copied for debugging
    // Helpful to verify all assets were preserved
    exec('ls -la build/api/v1/', (err, stdout) => {
      if (!err) {
        console.log('📄 API v1 files available:')
        console.log(stdout)
      }
      callback()
    })
  })
}

/**
 * Build API v2 Documentation
 *
 * STRATEGY: Sophisticated pipeline matching original CircleCI build process
 *
 * PIPELINE STEPS:
 * 1. Fetch live OpenAPI spec from CircleCI API
 * 2. Prepare spec (placeholder for future code sample enrichment)
 * 3. Apply JSON patches (customizations/corrections)
 * 4. Bundle and optimize (remove unused components)
 * 5. Lint for quality assurance
 * 6. Generate final HTML with Redocly
 * 7. Cleanup temporary files
 *
 * WHY COMPLEX:
 * - Live API ensures docs are always current
 * - Patches allow customization without modifying source
 * - Bundling optimizes file size and structure
 * - Linting catches issues before publication
 */
function buildApiV2(callback) {
  console.log('Building API v2 documentation with full pipeline...')

  // Create temporary directory for intermediate processing files
  // This keeps the build clean and organized
  const tempDir = path.join('build', 'temp-api-v2')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  // STEP 1: Fetch OpenAPI spec from live CircleCI API
  // This ensures we always have the latest API definition
  console.log('📥 Fetching OpenAPI spec from CircleCI API...')
  exec('curl -s https://circleci.com/api/v2/openapi.json -o build/temp-api-v2/openapi.json', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Failed to fetch OpenAPI spec:', err)
      return callback(err)
    }
    console.log('✅ OpenAPI spec fetched')

    // STEP 2: Prepare spec for processing
    // Add code samples using snippet-enricher-cli
    console.log('📝 Adding code samples to OpenAPI spec...')
    exec('cd build/temp-api-v2 && ../../node_modules/.bin/snippet-enricher-cli --targets="node_request,python_python3,go_native,shell_curl" --input=openapi.json > openapi-with-examples.json', (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Failed to add code samples:', err)
        console.log('ℹ️  Falling back to unprocessed spec...')
        // Fallback: copy unprocessed file if snippet enricher fails
        fs.copyFileSync('build/temp-api-v2/openapi.json', 'build/temp-api-v2/openapi-with-examples.json')
      } else {
        console.log('✅ Code samples added to OpenAPI spec')
      }

      // STEP 3: Apply JSON patches
      // Allows customizing the API spec without modifying the source
      // Patches can fix errors, add descriptions, or customize for documentation
      console.log('🔧 Applying JSON patches...')
      applyJsonPatches(() => {

        // STEP 4: Bundle and remove unused components
        // Optimizes the spec by removing unreferenced schemas, reducing file size
        console.log('📦 Bundling API docs and removing unused components...')
        exec('npx @redocly/cli bundle build/temp-api-v2/openapi-patched.json --remove-unused-components --output build/temp-api-v2/openapi-final.json', (err, stdout, stderr) => {
          if (err) {
            console.error('❌ Failed to bundle API docs:', err)
            return callback(err)
          }
          console.log('✅ API docs bundled')

          // STEP 5: Lint API docs
          // Quality check to catch issues before generating final docs
          // Warnings don't stop the build, but errors would
          console.log('🔍 Linting API docs...')
          exec('npx @redocly/cli lint build/temp-api-v2/openapi-final.json', (err, stdout, stderr) => {
            if (err) {
              console.warn('⚠️  Linting warnings found, but continuing build...')
              console.log(stdout)
            } else {
              console.log('✅ API docs linting passed')
            }

            // STEP 6: Build final HTML documentation
            // Redocly transforms the OpenAPI spec into beautiful, interactive docs
            console.log('🏗️  Building docs with Redocly CLI...')

            // Build options for enhanced customization (all free options):
            // --title: Custom page title
            // --theme.openapi.disableSearch: Disable search (if needed)
            // --theme.openapi.hideDownloadButton: Hide download button
            // --template: Custom template (requires template file)
            // --options.maxDisplayedEnumValues: Limit enum display

            const buildCommand = [
              'npx @redocly/cli build-docs build/temp-api-v2/openapi-final.json',
              '--output build/api/v2/index.html',
              '--config redocly.yaml',
              '--template custom-template.hbs',
              '--title "CircleCI API v2 Documentation"',
              '--disableGoogleFont=false',
              // Additional options for free version:
              // '--theme.openapi.hideDownloadButton=true',
              // '--theme.openapi.disableSearch=true',
              // '--theme.openapi.nativeScrollbars=true'
            ].join(' ')

            exec(buildCommand, (err, stdout, stderr) => {
              if (err) {
                console.error('❌ Failed to build API docs:', err)
                return callback(err)
              }

              console.log('✅ API v2 docs built successfully')

              // STEP 7: Copy logo file for template
              console.log('📋 Copying logo file...')
              exec('cp logo.svg build/api/v2/', (err) => {
                if (err) {
                  console.warn('⚠️  Warning: Could not copy logo file:', err.message)
                } else {
                  console.log('✅ Logo file copied successfully')
                }

                // STEP 8: Cleanup temporary files
                // Remove intermediate files to keep build directory clean
                exec('rm -rf build/temp-api-v2', () => {
                  console.log('🎉 API v2 documentation build completed!')
                  callback()
                })
              })
            })
          })
        })
      })
    })
  })
}

/**
 * Apply JSON Patches to OpenAPI Specification
 *
 * PURPOSE: Customize the CircleCI API spec without modifying the source
 *
 * PATCH FILE: openapi-patch.json (in project root)
 * - Contains JSON merge patches to modify the spec
 * - Can fix errors, add descriptions, customize examples, etc.
 * - Uses 'jq' tool to merge JSON files
 *
 * FALLBACK: If no patch file or jq fails, uses unpatched version
 * This ensures the build continues even without customizations
 */
function applyJsonPatches(callback) {
  const patchFile = 'openapi-patch.json'

  // Check if patch file exists in project root
  if (fs.existsSync(patchFile)) {
    console.log('📝 Applying patches from openapi-patch.json...')

    // Use jq to merge the base spec with the patch file
    // jq -s '.[0] * .[1]' merges two JSON files, with patch overriding base
    exec('jq -s ".[0] * .[1]" build/temp-api-v2/openapi-with-examples.json openapi-patch.json > build/temp-api-v2/openapi-patched.json', (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Failed to apply JSON patches:', err)
        console.log('ℹ️  Using unpatched version...')
        // Fallback: copy unpatched file if jq fails
        fs.copyFileSync('build/temp-api-v2/openapi-with-examples.json', 'build/temp-api-v2/openapi-patched.json')
      } else {
        console.log('✅ JSON patches applied')
      }
      callback()
    })
  } else {
    console.log('ℹ️  No patch file found, using unpatched version...')
    // No patches to apply, just copy the file to next stage
    fs.copyFileSync('build/temp-api-v2/openapi-with-examples.json', 'build/temp-api-v2/openapi-patched.json')
    callback()
  }
}

/**
 * USAGE NOTES:
 *
 * BUILD COMMANDS:
 * - npm run build:api-docs    # Build just API docs
 * - npm run build:docs        # Build everything (UI + Antora + API docs)
 *
 * DEVELOPMENT:
 * - API docs rebuild automatically during development
 * - v1 changes: edit files in api-v1/ directory
 * - v2 changes: edit openapi-patch.json or wait for API updates
 *
 * DEPENDENCIES:
 * - @redocly/cli: OpenAPI processing and doc generation
 * - jq: JSON processing (system dependency)
 * - curl: API fetching (system dependency)
 *
 * CUSTOMIZATION:
 * - Add code samples: Re-enable snippet-enricher-cli in step 2
 * - Modify v2 spec: Edit openapi-patch.json
 * - Add API versions: Create buildApiV3() function and update main build
 * - Change output paths: Modify directory constants at top of functions
 */
