# CircleCI API Markdown Generator

A Go tool that converts OpenAPI specifications into LLM-friendly markdown documentation with per-endpoint files and a structured index.

## Purpose

This tool processes the CircleCI API v2 OpenAPI specification and generates markdown documentation that is:

- **Agent-accessible**: Plain text markdown, no JavaScript required
- **Chunked**: One file per endpoint for fast loading
- **Indexed**: Structured `llms.txt` for easy navigation
- **Complete**: Includes schemas, parameters, examples, and descriptions

## Usage

```bash
# From project root
go run ./scripts/generate-api-markdown/cmd/generate-api-markdown <input-spec> <output-dir>

# Example
go run ./scripts/generate-api-markdown/cmd/generate-api-markdown \
  openapi-bundled.json \
  build/api/v2
```

### Arguments

- `<input-spec>`: Path to bundled OpenAPI JSON specification
- `<output-dir>`: Directory where markdown files will be generated

### Output Structure

```
<output-dir>/
├── llms.txt                      # Main index for LLMs/agents
├── operations/                   # Per-endpoint markdown files
│   ├── get-project-by-slug.md
│   ├── list-pipelines.md
│   ├── trigger-pipeline.md
│   ├── ...
│   └── index.json                # Machine-readable operation index
```

## Integration with Build Pipeline

This tool is invoked during the API docs build process via `gulp.d/tasks/build-api-docs.js`:

1. Fetch OpenAPI spec from live API
2. Bundle and dereference with Redocly
3. Generate code samples
4. Apply JSON patches
5. **→ Generate markdown chunks (this tool)**
6. Lint the spec
7. Build HTML with Redocly
8. Copy assets

## Features

### Per-Operation Markdown Files

Each API endpoint gets its own markdown file with:

- Operation summary and description
- HTTP method and path
- Parameters (path, query, header) with types and descriptions
- Request body schema with nested structure
- Response schemas for all status codes
- Synthesized JSON examples

**Example output** (`operations/trigger-pipeline.md`):

```markdown
# Trigger a New Pipeline

`POST /project/{project-slug}/pipeline`

Triggers a new pipeline on the project.

## Parameters

- **`project-slug`** (in: path) (required) — Project slug in the form vcs-slug/org-name/repo-name

## Request Body

**`application/json`**

- **`branch`** `string` — The branch where the pipeline ran
- **`parameters`** `object` — Pipeline parameters (optional)

**Example:**

{
  "branch": "main",
  "parameters": {
    "deploy-env": "staging"
  }
}
```

### Structured llms.txt Index

The `llms.txt` file provides:

- API title and description
- Special instructions (authentication, rate limits, base URL)
- Tag-grouped operation list with links
- Method and path for each operation

**Example**:

```
# CircleCI API v2

> The CircleCI API v2 provides programmatic access to...

## Special Instructions

- Base URL: `https://circleci.com/api/v2`
- Authentication: send a personal API token in the `Circle-Token` header
- Rate limiting: 5000 requests per hour per token

## Pipeline

- [Trigger a New Pipeline](/api/v2/operations/trigger-pipeline.md): `POST /project/{project-slug}/pipeline`
- [Get Pipeline by ID](/api/v2/operations/get-pipeline-by-id.md): `GET /pipeline/{pipeline-id}`
```

### JSON Index

The `operations/index.json` file provides a machine-readable index:

```json
{
  "version": "2.0",
  "baseUrl": "https://circleci.com/api/v2",
  "operations": [
    {
      "operationId": "trigger-pipeline",
      "summary": "Trigger a New Pipeline",
      "method": "POST",
      "path": "/project/{project-slug}/pipeline",
      "tag": "Pipeline",
      "markdownUrl": "/api/v2/operations/trigger-pipeline.md"
    }
  ],
  "tags": ["Pipeline", "Project", "Workflow", "Job", ...]
}
```

## Schema Rendering

The tool handles complex OpenAPI schema features:

### Nested Objects

```markdown
- **`user`** `object` (required)
  - **`id`** `string` `format: uuid` (required)
  - **`email`** `string` `format: email`
  - **`metadata`** `object`
    - **`created_at`** `string` `format: date-time`
```

### Arrays

```markdown
- **`items`** array of:
  - **`name`** `string` (required)
  - **`value`** `string`
```

### Composition (oneOf/anyOf/allOf)

```markdown
- *one of:*
  - **option 1**
    - **`branch`** `string` (required)
  - **option 2**
    - **`tag`** `string` (required)
```

### Enums

```markdown
- **`status`** `string`, enum: [`success`, `failed`, `canceled`] (required)
```

## Example Synthesis

The tool automatically generates JSON examples from schemas:

- Respects `example` and `default` values in the spec
- Handles composition (oneOf/anyOf/allOf)
- Provides sensible placeholders for common formats:
  - UUIDs: `00000000-0000-0000-0000-000000000000`
  - Dates: `2024-01-01`
  - Date-times: `2024-01-01T00:00:00Z`
  - Emails: `user@example.com`
  - URLs: `https://example.com`

Trivial schemas (single primitive field) skip examples to avoid redundancy.

## Error Handling

The tool includes robust error handling:

- **Missing operationId**: Skips operation with warning, continues
- **Recursive schemas**: Detects and stops infinite recursion
- **Deep nesting**: Limits depth to 10 levels
- **File write errors**: Returns clear error messages
- **Malformed spec**: Reports parsing errors with context

## Development

### Dependencies

- `github.com/getkin/kin-openapi/openapi3` - OpenAPI 3.0 parser

### Install Dependencies

```bash
cd scripts/generate-api-markdown
go mod download
```

### Run Tests

```bash
go test ./...
```

### Build Binary

```bash
go build -o generate-api-markdown ./cmd/generate-api-markdown
```

### Local Testing

```bash
# Download CircleCI OpenAPI spec
curl -o test-spec.json https://circleci.com/api/v2/openapi.json

# Generate markdown
go run ./cmd/generate-api-markdown test-spec.json test-output

# Check output
ls -la test-output/operations/
head test-output/llms.txt
```

## Design Decisions

### Why Go?

- Fast execution (~2-5 seconds for full API)
- Strong OpenAPI library ecosystem
- Easy CI integration
- Type safety for schema processing

### Why Per-Endpoint Files?

- **Fast loading**: Agents fetch only what they need
- **No timeouts**: Small files (<10KB each) load reliably
- **Clear URLs**: `/operations/trigger-pipeline.md` is intuitive
- **Easy updates**: Change one endpoint without regenerating all

### Why llms.txt?

- **Discoverability**: Well-known pattern for LLM documentation
- **Human-readable**: Easy to verify and debug
- **Structured**: Tag grouping helps agents navigate
- **Lightweight**: Plain text, no parsing required

## Contributing

When modifying this tool:

1. **Test locally** with the live CircleCI API spec
2. **Verify examples** synthesize correctly
3. **Check markdown formatting** renders properly
4. **Ensure no breaking changes** to output structure
5. **Update README** with new features

## Related Documentation

- Implementation Plan: `/API_DOCS_LLM_ACCESS_PLAN.md`
- API Docs Integration: `/API_DOCS_INTEGRATION.md`
- Build Pipeline: `/gulp.d/tasks/build-api-docs.js`
- Main llms.txt Generator: `/extensions/llms-txt-generator-extension.js`
