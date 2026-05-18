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
 * Generate LLM-Friendly Markdown Documentation
 *
 * PURPOSE: Create per-operation markdown files for agent/LLM consumption
 *
 * STRATEGY: Uses Go tool to parse OpenAPI spec and generate markdown chunks
 *
 * OUTPUT:
 * - build/api/v2/operations/*.md - One file per API endpoint
 * - build/api/v2/llms.txt - Structured index for agents
 * - build/api/v2/operations/index.json - Machine-readable index
 *
 * ERROR HANDLING: Non-blocking - if generation fails, build continues
 * This ensures human-readable docs are still built even if agent docs fail
 */
function generateApiMarkdown(callback) {
  console.log('📝 Generating markdown chunks for LLMs/agents...')

  // Run Go tool to generate markdown from bundled OpenAPI spec
  // Use absolute paths since we're changing directory
  const projectRoot = process.cwd()
  const inputSpec = path.join(projectRoot, 'build/temp-api-v2/openapi-final.json')
  const outputDir = path.join(projectRoot, 'build/api/v2')

  const command = `cd scripts/generate-api-markdown && go run ./cmd/generate-api-markdown ${inputSpec} ${outputDir}`

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error('⚠️  Failed to generate markdown chunks:', err.message)
      if (stderr) console.error(stderr)
      console.log('ℹ️  Continuing build without LLM-friendly markdown...')
      // Non-blocking: continue even if markdown generation fails
      return callback()
    }

    console.log('✅ Markdown chunks generated successfully')
    if (stdout) console.log(stdout)
    callback()
  })
}

/**
 * Build API v2 Documentation
 *
 * STRATEGY: Sophisticated pipeline for generating API documentation with code samples
 *
 * PIPELINE STEPS:
 * 1. Fetch live OpenAPI spec from CircleCI API
 * 2. Bundle and resolve all $ref pointers (using Redocly)
 * 3. Generate code samples with httpsnippet (for cURL, Node.js, Python, Go, Ruby)
 * 4. Apply JSON patches - CURRENTLY DISABLED for simplicity
 * 4.5. Generate markdown chunks for LLMs/agents
 * 5. Lint for quality assurance
 * 6. Generate final HTML with Redocly
 * 7. Copy logo and OpenAPI spec
 * 8. Cleanup temporary files
 *
 * WHY THIS ORDER:
 * - Bundling first resolves $ref pointers, making parameters accessible
 * - Code samples need resolved parameters to generate valid snippets
 * - Markdown generation needs final spec with code samples
 * - Linting catches issues before final HTML generation
 * - Live API ensures docs are always current
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

    // STEP 2: Bundle, dereference, and optimize
    // --dereferenced: Resolves ALL $ref pointers so snippet generation can access definitions
    // --remove-unused-components: Removes unreferenced schemas to reduce file size
    console.log('📦 Bundling and dereferencing API spec...')
    exec('npx @redocly/cli bundle build/temp-api-v2/openapi.json --dereferenced --remove-unused-components --output build/temp-api-v2/openapi-bundled.json', (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Failed to bundle API docs:', err)
        return callback(err)
      }
      console.log('✅ API docs bundled, dereferenced, and optimized')

      // STEP 3: Add code samples using our custom script with Kong's httpsnippet
      // This runs AFTER bundling so all $ref pointers are resolved
      console.log('📝 Adding code samples to OpenAPI spec...')
      exec('node scripts/generate-api-snippets.js build/temp-api-v2/openapi-bundled.json build/temp-api-v2/openapi-with-examples.json', (err, stdout, stderr) => {
        if (err) {
          console.error('❌ Failed to add code samples:', err)
          if (stderr) console.error(stderr)
          console.log('ℹ️  Falling back to bundled spec without examples...')
          // Fallback: copy bundled file if snippet generation fails
          fs.copyFileSync('build/temp-api-v2/openapi-bundled.json', 'build/temp-api-v2/openapi-with-examples.json')
        } else {
          console.log('✅ Code samples added to OpenAPI spec')
          if (stdout) console.log(stdout)
        }

        // STEP 4: Apply JSON patches
        // Allows customizing the API spec without modifying the source
        // This applies externalDocs and any other customizations from openapi-patch.json
        console.log('🔧 Applying JSON patches...')
        applyJsonPatches(() => {
          // Copy patched file to final location
          fs.copyFileSync('build/temp-api-v2/openapi-patched.json', 'build/temp-api-v2/openapi-final.json')

          // STEP 4.5: Generate markdown chunks for LLMs/agents
          // Creates per-operation markdown files and llms.txt index
          generateApiMarkdown(() => {

          // STEP 5: Lint API docs
        // Quality check to catch issues before generating final docs
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

            const buildCommand = [
              'npx @redocly/cli build-docs build/temp-api-v2/openapi-final.json',
              '--output build/api/v2/index.html',
              '--config redocly.yaml',
              '--template custom-template.hbs',
              '--title "CircleCI API v2 Documentation"',
              '--disableGoogleFont=false',
            ].join(' ')

            exec(buildCommand, (err, stdout, stderr) => {
              if (err) {
                console.error('❌ Failed to build API docs:', err)
                return callback(err)
              }

              console.log('✅ API v2 docs built successfully')

                // STEP 7: Copy logo and OpenAPI spec
              console.log('📋 Copying logo and OpenAPI spec...')
              exec('cp logo.svg build/api/v2/ && cp build/temp-api-v2/openapi-final.json build/api/v2/openapi.json', (err) => {
                if (err) {
                  console.warn('⚠️  Warning: Could not copy files:', err.message)
                } else {
                  console.log('✅ Logo and OpenAPI spec copied successfully')
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
 * - Go 1.25+: Markdown generation for LLMs (scripts/generate-api-markdown/)
 *
 * OUTPUT STRUCTURE (v2):
 * build/api/v2/
 * ├── index.html              # Human-readable Redocly documentation
 * ├── openapi.json            # Full OpenAPI specification
 * ├── llms.txt                # LLM/agent index
 * └── operations/             # Per-endpoint markdown files
 *     ├── get-project.md
 *     ├── trigger-pipeline.md
 *     └── index.json
 *
 * CUSTOMIZATION:
 * - Add code samples: Re-enable snippet-enricher-cli in step 2
 * - Modify v2 spec: Edit openapi-patch.json
 * - Add API versions: Create buildApiV3() function and update main build
 * - Change output paths: Modify directory constants at top of functions
 */
