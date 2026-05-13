# API Documentation Integration

This project integrates API documentation with the Antora documentation site, providing two versions of API docs that are built during the main site build process and served alongside the main documentation.

## Architecture Overview

### Build Process

1. **UI Build**: Antora UI bundle is created
2. **Antora Build**: Main documentation site is generated
3. **API Docs Build**: Both API v1 and v2 documentation are built and integrated

### API Documentation Versions

**API v1** - Static Documentation

- Source: `api-v1/` directory (complete static site)
- Build: Simple file copying
- Output: `build/api/v1/` (preserves all assets: fonts, images, CSS, JS)
- URL: `/api/v1/`

**API v2** - Live Documentation

- Source: Live CircleCI API (`https://circleci.com/api/v2/openapi.json`)
- Build: Sophisticated pipeline with fetching, patching, bundling, and HTML generation
- Output: `build/api/v2/index.html` (Redocly HTML)
- Output: `build/api/v2/specs/` (LLM-optimized markdown + JSON)
- URL: `/api/v2/` (interactive docs)
- URL: `/api/v2/specs/` (agent-friendly docs)

## File Structure

```
project-root/
├── api-v1/                    # Static API v1 documentation
│   ├── index.html            # Main v1 docs (217KB)
│   ├── fonts/                # Font assets
│   ├── images/               # Image assets
│   ├── javascripts/          # JS assets
│   └── stylesheets/          # CSS assets
├── openapi-patch.json        # JSON patches for v2 API customization
├── redocly.yaml             # Redocly config (currently unused in build)
├── gulp.d/tasks/
│   └── build-api-docs.js    # API documentation build pipeline
└── build/                   # Generated output
    └── api/
        ├── v1/              # Complete static v1 site
        └── v2/              # Generated v2 documentation
            ├── index.html   # Single-page API docs (1.6MB, for humans)
            └── specs/       # LLM-optimized documentation (for agents)
                ├── index.json        # Discovery manifest (10KB)
                ├── README.md         # Getting started guide (11KB)
                ├── json/             # Split OpenAPI specs (2.3MB total)
                │   ├── pipeline.json
                │   ├── project.json
                │   ├── full.json     # Complete spec
                │   └── ... (16 more)
                └── markdown/         # LLM-friendly docs (232KB total, 84% reduction)
                    ├── pipeline.md
                    ├── project.md
                    └── ... (17 more)
```

## Build Pipeline Details

### API v1 Build (Simple)

1. Check if `api-v1/` directory exists
2. Copy entire directory structure to `build/api/v1/`
3. Preserve all assets (fonts, images, CSS, JS)

### API v2 Build (Sophisticated)

1. **Fetch**: Download live OpenAPI spec from CircleCI API
2. **Bundle**: Dereference all $ref pointers and optimize
3. **Enrich**: Add code samples (cURL, Node.js, Python, Go, Ruby)
4. **Patch**: Apply JSON patches from `openapi-patch.json` (optional)
5. **Lint**: Quality check the processed spec
6. **Build HTML**: Generate interactive HTML documentation with Redocly CLI
7. **Copy Assets**: Add logo and other static assets
8. **Generate LLM Docs**: Create agent-friendly markdown documentation
   - Split spec by feature tag (19 files)
   - Convert each to markdown (~84% size reduction)
   - Generate discovery manifest and README
   - Update llms.txt with API section (if exists)
9. **Cleanup**: Remove temporary processing files

## LLM-Optimized Documentation

### Overview

The API v2 build automatically generates LLM-optimized markdown documentation alongside the standard Redocly HTML docs. This addresses the challenge of large OpenAPI specs (636KB+) being inefficient for AI agents to process.

### Key Features

- **84% size reduction**: Markdown format is much smaller than JSON (232KB vs 2.3MB)
- **Feature-based splitting**: 19 separate files by tag (Pipeline, Project, Context, etc.)
- **Natural language**: Prose format instead of verbose JSON schemas
- **Discovery manifest**: Machine-readable index for agent navigation
- **Integration with llms.txt**: Automatic updates to site-wide AI documentation

### Generated Files

```
/api/v2/specs/
├── index.json          # Discovery manifest with metadata
│                       # - Feature list with endpoint counts
│                       # - Use cases for each API
│                       # - File sizes and URLs
│
├── README.md           # Getting started guide for agents
│                       # - Quick start instructions
│                       # - Format comparison
│                       # - Authentication details
│
├── json/               # Split OpenAPI specs
│   ├── pipeline.json   # 11 endpoints, 100KB
│   ├── project.json    # 13 endpoints, 109KB
│   ├── context.json    # 10 endpoints, 99KB
│   ├── full.json       # All 114 endpoints, 630KB
│   └── ... (16 more)
│
└── markdown/           # LLM-optimized docs
    ├── pipeline.md     # 11 endpoints, 16KB (84% reduction)
    ├── project.md      # 13 endpoints, 18KB (84% reduction)
    ├── context.md      # 10 endpoints, 12KB (88% reduction)
    └── ... (17 more)
```

### Markdown Format

Each markdown file includes:
- **Endpoint documentation**: Method, path, summary, description
- **Parameters**: Name, type, location, required/optional, descriptions
- **Request bodies**: Schema with types and examples
- **Responses**: Status codes, schemas, error descriptions
- **Code examples**: Working curl commands with realistic values
- **Authentication**: Token requirements and usage
- **Common errors**: Status codes and troubleshooting

Example structure:
```markdown
## POST /pipeline

Trigger a new pipeline for a project.

**Operation ID:** `triggerPipeline`

**Parameters:**
- `project-slug` (path, string, required): Format `vcs/org/repo`

**Request Body:** (application/json, required)
- `branch` (string, optional): Branch to build
- `parameters` (object, optional): Pipeline parameters

**Responses:**
- **201**: Pipeline created successfully
- **400**: Invalid request parameters
- **401**: Unauthorized - invalid API token

**Example:**
```bash
curl -X POST \
  -H "Circle-Token: $CIRCLE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"branch": "main"}' \
  https://circleci.com/api/v2/project/gh/myorg/myrepo/pipeline
```
```

### Discovery Manifest

The `index.json` file provides metadata for agent navigation:

```json
{
  "openapi_version": "3.0.3",
  "total_endpoints": 114,
  "total_features": 19,
  "formats": {
    "markdown": {
      "size_reduction_vs_json": "84%",
      "recommended_for": "AI agents, LLMs, quick reference"
    }
  },
  "features": [
    {
      "tag": "pipeline",
      "name": "Pipeline APIs",
      "endpoints": 11,
      "use_cases": [
        "trigger a new pipeline",
        "check pipeline status",
        "list pipelines for a project"
      ],
      "markdown": "https://circleci.com/docs/api/v2/specs/markdown/pipeline.md",
      "markdown_size_kb": 16,
      "json": "https://circleci.com/docs/api/v2/specs/json/pipeline.json",
      "json_size_kb": 100
    }
  ]
}
```

### Integration with llms.txt

During a full site build (after Antora generates llms.txt), an API section is automatically appended:

```text
## API Reference Documentation

Complete CircleCI API v2 documentation in LLM-optimized markdown format.

### Discovery and Overview
- Discovery manifest: https://circleci.com/docs/api/v2/specs/index.json
- Getting started: https://circleci.com/docs/api/v2/specs/README.md

### API Documentation by Feature
#### Pipeline APIs
**Markdown**: https://circleci.com/docs/api/v2/specs/markdown/pipeline.md (16KB)
- 11 endpoints
- Use cases: trigger pipeline, check status, list pipelines
...
```

### Scripts

The LLM-optimized documentation is generated by five scripts in `scripts/`:

1. **`split-openapi-by-tag.js`**: Splits monolithic spec into feature files
   - Groups endpoints by OpenAPI tags
   - Extracts referenced schemas
   - Creates valid OpenAPI spec per feature

2. **`openapi-to-markdown.js`**: Converts JSON specs to markdown
   - Natural language formatting
   - Inline examples
   - 80-90% size reduction

3. **`generate-discovery-manifest.js`**: Creates index.json
   - Scans all generated files
   - Calculates sizes and statistics
   - Adds use cases and metadata

4. **`generate-specs-readme.js`**: Creates README.md
   - Quick start guide
   - Format comparison
   - Authentication instructions

5. **`update-llms-txt-api-section.js`**: Updates llms.txt
   - Appends API section
   - Preserves Antora-generated content
   - Idempotent (can run multiple times)

### Performance

- **Generation time**: ~5-7 seconds (part of API v2 build)
- **Build impact**: Adds ~20% to API build time (acceptable)
- **Size savings for agents**: 84% reduction (2.3MB → 232KB)
- **Token efficiency**: Agents can load single features (~16KB) instead of full spec (636KB)

### Use Cases

**For AI Agents:**
- Discover available APIs via index.json
- Load only needed features (e.g., just pipeline.md)
- Parse natural language easier than JSON schemas
- Construct API calls from markdown examples

**For API Tooling:**
- JSON specs still available for code generation
- Split specs reduce memory usage
- Easier to process feature-by-feature

**For Humans:**
- Markdown files are readable documentation
- Can be viewed directly in browser
- Quick reference without interactive UI overhead

## Navigation Integration

### Header Dropdown

- "API Reference" button in main site header
- Dropdown shows "API v1" and "API v2" options
- Implemented in `ui/src/partials/header-content.hbs`

### Sidebar Navigation

- API links in component explorer navigation
- Links appear in reference section sidebar
- Implemented in `ui/src/partials/component-explorer-nav.hbs`

### Content Page Links

- Direct links from documentation pages
- Uses relative paths `/api/v1/` and `/api/v2/`
- Implemented in Antora content files

## Build Commands

```bash
# Build everything (UI + Antora + API docs)
npm run build:docs

# Build just API documentation
npm run build:api-docs

# Development server with auto-rebuild
npm run start:dev
```

## Configuration and Customization

### API v1 Customization

- Edit files directly in `api-v1/` directory
- Changes appear immediately on next build
- Maintains complete static site structure

### API v2 Customization

- **Content**: Edit `openapi-patch.json` to modify the API spec
- **Styling**: Modify Redocly CLI build command arguments
- **Processing**: Edit pipeline steps in `gulp.d/tasks/build-api-docs.js`

### JSON Patching System

The `openapi-patch.json` file allows customizing the live CircleCI API spec:

```json
{
  "info": {
    "description": "Custom description override"
  },
  "paths": {
    "/custom-endpoint": {
      "get": {
        "summary": "Added custom endpoint"
      }
    }
  }
}
```

## Dependencies

### Required

- `@redocly/cli`: OpenAPI processing and doc generation
- `jq`: JSON processing (system dependency for patching)
- `curl`: API fetching (system dependency)

### Development

- Redocly CLI automatically rebuilds during development
- File watching triggers rebuilds for both versions
- Browser auto-reloads when documentation changes

## Troubleshooting

### Common Issues

1. **Build failures**: Check network connectivity for v2 API fetching
2. **Missing v1 docs**: Ensure `api-v1/` directory exists with content
3. **Patch errors**: Validate `openapi-patch.json` syntax with `jq`
4. **Navigation issues**: Check relative paths in Antora content files
5. **LLM docs not generated**: Check scripts exist in `scripts/` directory
6. **Markdown conversion failures**: Verify OpenAPI spec is valid and dereferenced
7. **llms.txt not updated**: Only updates during full site build (after Antora runs)
8. **Missing specs files**: Ensure `build/api/v2/specs/` directories are created

### Debug Commands

```bash
# Test API v2 endpoint accessibility
curl -s https://circleci.com/api/v2/openapi.json | head

# Validate patch file syntax
jq . openapi-patch.json

# Lint API specification
npx @redocly/cli lint [path-to-spec]

# Build API docs in isolation
gulp build:api-docs

# Test LLM-optimized doc generation scripts individually
node scripts/split-openapi-by-tag.js [input.json] [output-dir/]
node scripts/openapi-to-markdown.js [input.json] [output.md]
node scripts/generate-discovery-manifest.js [specs-dir] [output.json]

# Check generated files
ls -lh build/api/v2/specs/
du -sh build/api/v2/specs/json/ build/api/v2/specs/markdown/
```

### Build Logs

The build process provides detailed logging:

- ✅ Success indicators for each pipeline step
- ⚠️ Warnings for non-critical issues (continues build)
- ❌ Errors that halt the build process
- 📁 File operation details and sizes

## Development Workflow

### Adding New API Versions

1. Create `buildApiV3()` function in `build-api-docs.js`
2. Add directory creation logic
3. Update main build orchestration
4. Add navigation links to UI templates
5. Update Antora content files

### Modifying Build Pipeline

1. Edit `gulp.d/tasks/build-api-docs.js`
2. Test with `npm run build:api-docs`
3. Verify output in `build/api/` directories
4. Check integration with `npm run start:dev`

### CI/CD Integration

The build integrates with existing CircleCI pipeline:

- No additional CI configuration needed
- API docs build as part of main site build
- Both versions deploy together to production
- Automatic updates when CircleCI API changes (v2)

## Performance Notes

- **API v1**: Fast build (~1 second, file copying)
- **API v2 HTML**: Moderate build (~5-7 seconds, network + processing)
- **API v2 LLM docs**: Fast generation (~2-3 seconds, part of v2 build)
- **Total API v2 time**: ~7-10 seconds for complete build
- **Output sizes**:
  - v1 maintains original assets
  - v2 HTML: 1.6MB (interactive docs)
  - v2 JSON specs: 2.3MB (split by feature)
  - v2 Markdown: 232KB (84% reduction from JSON)
- **Caching**: v2 uses temporary files for efficient rebuilds
- **Development**: Hot reload works for all versions
