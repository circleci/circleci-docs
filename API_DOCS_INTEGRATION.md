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
- Output:
  - `build/api/v2/index.html` (full interactive documentation)
  - `build/api/v2/specs/` (split specifications for LLM consumption)
- URL: `/api/v2/`

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
            ├── index.html   # Single-page API docs (1.6MB)
            └── specs/       # Split API specs for LLM consumption
                ├── manifest.json    # Index of all chunks
                ├── paths/           # Endpoint definitions by tag
                ├── components/      # Shared schemas and components
                └── openapi.yaml     # Main spec with references
```

## Build Pipeline Details

### API v1 Build (Simple)

1. Check if `api-v1/` directory exists
2. Copy entire directory structure to `build/api/v1/`
3. Preserve all assets (fonts, images, CSS, JS)

### API v2 Build (Sophisticated)

1. **Fetch**: Download live OpenAPI spec from CircleCI API
2. **Bundle**: Resolve references and optimize spec
3. **Code Samples**: Add code examples for multiple languages
4. **Patch**: Apply JSON patches from `openapi-patch.json` (optional)
5. **Lint**: Quality check the processed spec
6. **Build HTML**: Generate interactive documentation with Redocly CLI
7. **Split**: Create LLM-friendly chunks by tag/resource
8. **Manifest**: Generate index file for all chunks
9. **Cleanup**: Remove temporary processing files

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
- **API v2**: Slower build (~30 seconds, network + processing)
- **Output sizes**: v1 maintains original assets, v2 generates 1.6MB HTML
- **Caching**: v2 uses temporary files for efficient rebuilds
- **Development**: Hot reload works for both versions

## LLM-Friendly API Specifications

The build pipeline automatically generates split API specifications optimized for LLM consumption.

### Why Split Specifications?

The complete CircleCI API specification is too large to fit in most LLM context windows. Splitting the spec into smaller chunks allows:

- LLMs to process individual API resources without hitting context limits
- Faster processing and more accurate responses
- Better focus on specific API areas
- Easier navigation for automated tools

### What Gets Generated

**Directory Structure:**
```
build/api/v2/specs/
├── manifest.json           # Index of all chunks with metadata
├── openapi.yaml           # Main spec file with $ref pointers
├── paths/                 # Endpoint definitions organized by tag
│   ├── context.yaml
│   ├── pipeline.yaml
│   ├── project.yaml
│   └── ...
└── components/            # Shared schemas and components
    ├── schemas/
    ├── parameters/
    └── responses/
```

**Manifest File (`manifest.json`):**

Contains metadata about all chunks:
- List of all split files
- File sizes in KB
- Relative paths for downloading
- Generation timestamp
- Usage instructions

Example manifest:
```json
{
  "description": "Split OpenAPI specification chunks for LLM consumption",
  "generated": "2026-03-26T10:30:00Z",
  "totalChunks": 15,
  "chunks": [
    {
      "name": "paths/context",
      "file": "paths/context.yaml",
      "sizeKB": 45.2,
      "path": "/api/v2/specs/paths/context.yaml"
    }
  ],
  "usage": "Each chunk contains a subset of the full API specification..."
}
```

### Using Split Specifications

**For LLMs:**
1. Fetch `manifest.json` to see available chunks
2. Download specific chunks relevant to the query
3. Process individual chunks within context limits

**For Developers:**
- Chunks are served alongside the main API docs
- Access via `/api/v2/specs/` URL path
- Can be used with OpenAPI tools that support $ref resolution

**For Documentation:**
- Link to specific chunks from documentation pages
- Provide targeted API references
- Reduce download sizes for focused use cases

### Customization

The splitting behavior is controlled by Redocly CLI's `split` command:

```bash
npx @redocly/cli split openapi.json --outDir specs/
```

Options can be configured in `redocly.yaml` or via command-line flags in `gulp.d/tasks/build-api-docs.js`.
